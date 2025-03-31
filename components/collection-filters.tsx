'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Collection } from '@/types/tmdb';
import { CollectionCard } from './collection-card';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { fetchTMDBApi } from '@/lib/tmdb';
import { Badge } from './ui/badge';

// Using client-side filtering approach without function props
export function CollectionFilters({ 
  initialCollections 
}: { 
  initialCollections: Collection[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Initialize state from URL parameters
  const queryParam = searchParams.get('query') || '';
  const sortParam = searchParams.get('sort') || 'popularity';
  
  // State for filters and collections
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [sortOption, setSortOption] = useState<'popularity' | 'name' | 'newest' | 'movies'>(sortParam as any || 'popularity');
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>(initialCollections);
  const [isLoading, setIsLoading] = useState(false);
  const [showClearSearch, setShowClearSearch] = useState(false);
  
  // Debounce the search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  // Check if search is active
  const hasActiveSearch = useMemo(() => {
    return debouncedSearchQuery !== '';
  }, [debouncedSearchQuery]);
  
  // Filter and sort collections
  useEffect(() => {
    const filterAndSortCollections = async () => {
      setIsLoading(true);
      
      try {
        let results = [...initialCollections];
        
        // Search query filtering
        if (debouncedSearchQuery) {
          // If search doesn't match any existing collections, fetch from API
          const matchesLocalResults = results.some(
            collection => collection.name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
          );
          
          if (!matchesLocalResults) {
            try {
              const searchResponse = await fetchTMDBApi<{ results: Collection[] }>('/search/collection', {
                query: debouncedSearchQuery,
                include_adult: 'false'
              });
              
              // Fetch full details for each collection
              const searchResults = await Promise.all(
                searchResponse.results.map(async (collection) => {
                  try {
                    return await fetchTMDBApi<Collection>(`/collection/${collection.id}`);
                  } catch (error) {
                    return collection;
                  }
                })
              );
              
              results = [...searchResults];
            } catch (error) {
              console.error('Search error:', error);
            }
          } else {
            // Filter locally
            results = results.filter(collection => 
              collection.name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
            );
          }
        }
        
        // Apply sorting
        switch (sortOption) {
          case 'popularity':
            results.sort((a, b) => {
              // Sort by popularity score if available, otherwise by number of parts
              const aScore = (a as any).popularityScore || 0;
              const bScore = (b as any).popularityScore || 0;
              if (aScore !== bScore) return bScore - aScore;
              return (b.parts?.length || 0) - (a.parts?.length || 0);
            });
            break;
          case 'name':
            results.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            break;
          case 'newest':
            results.sort((a, b) => {
              const aNewest = a.parts ? Math.max(...a.parts.map(m => new Date(m.release_date || '1900-01-01').getTime())) : 0;
              const bNewest = b.parts ? Math.max(...b.parts.map(m => new Date(m.release_date || '1900-01-01').getTime())) : 0;
              return bNewest - aNewest;
            });
            break;
          case 'movies':
            results.sort((a, b) => (b.parts?.length || 0) - (a.parts?.length || 0));
            break;
        }
        
        setFilteredCollections(results);
        setShowClearSearch(hasActiveSearch);
      } catch (error) {
        console.error('Filter error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    filterAndSortCollections();
  }, [debouncedSearchQuery, sortOption, initialCollections, hasActiveSearch]);
  
  // Update URL params without refreshing the page
  useEffect(() => {
    // Create new URLSearchParams object from current params
    const params = new URLSearchParams(searchParams.toString());
    
    // Update search query param
    if (debouncedSearchQuery) {
      params.set('query', debouncedSearchQuery);
    } else {
      params.delete('query');
    }
    
    // Update sort param
    if (sortOption !== 'popularity') {
      params.set('sort', sortOption);
    } else {
      params.delete('sort');
    }
    
    // Preserve page param
    const page = searchParams.get('page');
    if (page) {
      params.set('page', page);
    }
    
    // Update URL without refreshing page, using replaceState
    const newUrl = `${pathname}?${params.toString()}`;
    window.history.replaceState({ path: newUrl }, '', newUrl);
  }, [debouncedSearchQuery, sortOption, pathname, searchParams]);
  
  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
  };
  
  // Handle sort option change
  const handleSortChange = (option: 'popularity' | 'name' | 'newest' | 'movies') => {
    setSortOption(option);
  };
  
  return (
    <div className="space-y-8">
      {/* Filter controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3 px-3 sm:px-6 md:px-8 lg:px-10">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search collections..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-9 pr-10 w-full"
            />
            {searchQuery && (
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {/* Sort dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden xs:inline">Sort by:</span> 
                <span className="font-medium">
                  {sortOption === 'popularity' && 'Popularity'}
                  {sortOption === 'name' && 'Name'}
                  {sortOption === 'newest' && 'Newest'}
                  {sortOption === 'movies' && 'Most Movies'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Sort Collections</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem 
                checked={sortOption === 'popularity'}
                onCheckedChange={() => handleSortChange('popularity')}
              >
                Popularity
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem 
                checked={sortOption === 'movies'}
                onCheckedChange={() => handleSortChange('movies')}
              >
                Most Movies
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem 
                checked={sortOption === 'newest'}
                onCheckedChange={() => handleSortChange('newest')}
              >
                Newest Releases
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem 
                checked={sortOption === 'name'}
                onCheckedChange={() => handleSortChange('name')}
              >
                Alphabetical
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Clear search button */}
          {showClearSearch && (
            <Button variant="ghost" onClick={clearSearch} className="sm:ml-auto">
              <X className="h-4 w-4 mr-2" />
              Clear Search
            </Button>
          )}
        </div>
        
        {/* Active search badge */}
        {searchQuery && (
          <div className="flex flex-wrap gap-2 px-3 sm:px-6 md:px-8 lg:px-10">
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {searchQuery}
              <button onClick={clearSearch} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </div>
        )}
      </div>
      
      {/* Collection grid */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredCollections.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh]">
          <p className="text-muted-foreground mb-2">No collections match your search</p>
          <p className="text-sm text-muted-foreground">Try different search terms</p>
          {hasActiveSearch && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={clearSearch}
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 xs:gap-4 sm:gap-5 md:gap-6 p-2 xs:p-3 sm:p-6 md:p-8 lg:p-10 pb-16">
          {filteredCollections.map((collection) => (
            <div key={collection.id}>
              <CollectionCard collection={collection} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}