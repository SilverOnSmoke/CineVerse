'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MovieGrid } from '@/components/movie-grid';
import { fetchTMDBApi } from '@/lib/tmdb';
import type { SearchResult } from '@/types/tmdb';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (debouncedSearch) {
      setIsLoading(true);
      router.push(`/search?q=${encodeURIComponent(debouncedSearch)}`, { scroll: false });
      
      fetchTMDBApi<SearchResult>('/search/multi', {
        query: debouncedSearch,
        include_adult: 'false',
      })
        .then(data => {
          setResults(data);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setResults(null);
      router.push('/search', { scroll: false });
    }
  }, [debouncedSearch, router]);

  const filteredResults = results?.results.filter(
    item => item.media_type === 'movie' || item.media_type === 'tv'
  );

  return (
    <div className="min-h-screen pt-4 md:pt-8 pb-24 md:pb-16">
      <div className="container max-w-6xl mx-auto px-4">
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
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : search ? (
            filteredResults && filteredResults.length > 0 ? (
              <>
                <div className="flex items-center justify-between px-4 md:px-0">
                  <h2 className="text-lg md:text-xl font-semibold">
                    Search Results for &quot;{search}&quot;
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {filteredResults.length} results found
                  </p>
                </div>
                <Suspense fallback={<div>Loading results...</div>}>
                  <MovieGrid items={filteredResults} />
                </Suspense>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No results found for &quot;{search}&quot;</p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Search className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground text-lg text-center px-4">
                Start typing to search for movies and TV shows
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}