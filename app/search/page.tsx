'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MovieGrid } from '@/components/movie-grid';
import { fetchTMDBApi } from '@/lib/tmdb';
import type { SearchResult, Genre, TVShow, Movie } from '@/types/tmdb';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, X } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  // Fetch genres on component mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const movieGenres = await fetchTMDBApi<{ genres: Genre[] }>('/genre/movie/list');
        const tvGenres = await fetchTMDBApi<{ genres: Genre[] }>('/genre/tv/list');
        
        // Combine and deduplicate genres
        const allGenres = Array.from(new Map(
          [...movieGenres.genres, ...tvGenres.genres]
            .map(genre => [genre.id, genre])
        ).values());
        
        setGenres(allGenres);
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      }
    };

    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      // Only proceed if we have either a search query or active filters
      if (!debouncedSearch && !selectedGenre && !selectedYear) {
        setResults(null);
        router.push('/search', { scroll: false });
        return;
      }

      setIsLoading(true);
      
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.append('q', debouncedSearch);
        if (selectedGenre) params.append('genre', selectedGenre);
        if (selectedYear) params.append('year', selectedYear);
        router.push(`/search?${params.toString()}`, { scroll: false });

        let movieResults: SearchResult;
        let tvResults: SearchResult;

        const commonParams = {
          include_adult: 'false',
          ...(selectedGenre && { with_genres: selectedGenre })
        };

        if (debouncedSearch) {
          // Use search endpoints when there's a text query
          movieResults = await fetchTMDBApi<SearchResult>('/search/movie', {
            ...commonParams,
            query: debouncedSearch,
            ...(selectedYear && { year: selectedYear })
          });

          tvResults = await fetchTMDBApi<SearchResult>('/search/tv', {
            ...commonParams,
            query: debouncedSearch,
            ...(selectedYear && { first_air_date_year: selectedYear })
          });
        } else {
          // Use discover endpoints when only using filters
          movieResults = await fetchTMDBApi<SearchResult>('/discover/movie', {
            ...commonParams,
            sort_by: 'popularity.desc',
            ...(selectedYear && { primary_release_year: selectedYear })
          });

          tvResults = await fetchTMDBApi<SearchResult>('/discover/tv', {
            ...commonParams,
            sort_by: 'popularity.desc',
            ...(selectedYear && { first_air_date_year: selectedYear })
          });
        }

        const combinedResults: SearchResult = {
          page: 1,
          results: [
            ...movieResults.results.map(item => ({
              id: item.id,
              title: (item as any).title || '',
              overview: item.overview,
              poster_path: item.poster_path,
              backdrop_path: item.backdrop_path,
              vote_average: item.vote_average,
              release_date: (item as any).release_date || '',
              genre_ids: item.genre_ids,
              media_type: 'movie' as const
            }) satisfies Movie),
            ...tvResults.results.map(item => ({
              id: item.id,
              name: (item as any).name || '',
              overview: item.overview,
              poster_path: item.poster_path,
              backdrop_path: item.backdrop_path,
              vote_average: item.vote_average,
              first_air_date: (item as any).first_air_date || '',
              genre_ids: item.genre_ids,
              media_type: 'tv' as const
            }) satisfies TVShow)
          ],
          total_pages: Math.max(movieResults.total_pages, tvResults.total_pages),
          total_results: movieResults.total_results + tvResults.total_results
        };

        setResults(combinedResults);
      } catch (error) {
        console.error('Error fetching results:', error);
        setResults(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedSearch, selectedGenre, selectedYear, router]);

  const filteredResults = results?.results || [];

  const resetFilters = () => {
    setSelectedGenre('');
    setSelectedYear('');
    router.push(`/search?q=${encodeURIComponent(search)}`, { scroll: false });
  };

  const hasActiveFilters = selectedGenre || selectedYear;

  return (
    <div className="min-h-screen pt-4 md:pt-8 pb-20 md:pb-16">
      <div className="container max-w-6xl mx-auto px-3 sm:px-4">
        {/* Search Header */}
        <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Search</h1>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search movies & TV shows..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 text-base md:text-lg bg-background/50 backdrop-blur-sm border-2 focus:border-primary/50 rounded-xl"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-3 items-start lg:items-center">
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select Genre" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {genres.map((genre) => (
                  <SelectItem key={genre.id} value={genre.id.toString()}>
                    {genre.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <X className="h-4 w-4" />
                Reset Filters
              </Button>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[200px] py-8 sm:py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredResults && filteredResults.length > 0 ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 sm:px-4 md:px-0">
                <div className="space-y-1">
                  <h2 className="text-lg md:text-xl font-semibold">
                    {search ? `Search Results for "${search}"` : 'Popular Movies & TV Shows'}
                  </h2>
                  {hasActiveFilters && (
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      {selectedGenre && (
                        <span className="inline-flex items-center bg-muted/50 rounded-full px-2.5 py-0.5">
                          {genres.find(g => g.id.toString() === selectedGenre)?.name}
                        </span>
                      )}
                      {selectedYear && (
                        <span className="inline-flex items-center bg-muted/50 rounded-full px-2.5 py-0.5">
                          {selectedYear}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground whitespace-nowrap">
                  {filteredResults.length} results found
                </p>
              </div>
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              }>
                <MovieGrid items={filteredResults} />
              </Suspense>
            </>
          ) : hasActiveFilters ? (
            <div className="flex flex-col items-center justify-center min-h-[200px] py-8 sm:py-12 px-4">
              <div className="max-w-md text-center">
                <p className="text-muted-foreground text-sm sm:text-base">
                  No results found
                  {search && <span className="font-medium"> for "{search}"</span>}
                  {selectedGenre && <span> in {genres.find(g => g.id.toString() === selectedGenre)?.name}</span>}
                  {selectedYear && <span> from {selectedYear}</span>}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[200px] py-8 sm:py-12 space-y-4">
              <Search className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground text-base sm:text-lg text-center max-w-md px-4">
                Search for movies and TV shows, or use filters to explore
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}