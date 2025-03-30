'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Collection } from '@/types/tmdb';
import { CollectionCard } from './collection-card';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';

// Using client-side filtering approach without function props
export function CollectionFilters({ 
  initialCollections 
}: { 
  initialCollections: Collection[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInitialMount = useRef(true);
  
  // Initialize search query from URL
  const queryParam = searchParams.get('query') || '';
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [sortOption, setSortOption] = useState<'popularity' | 'name' | 'newest'>('popularity');
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>(initialCollections);
  
  // Debounce the search query to prevent rapid URL updates
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  // Define applyFilters function before it's used
  const applyFilters = useCallback((query: string, sort: string) => {
    // First filter by search query
    let filtered = [...initialCollections];
    
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(collection => 
        (collection.name?.toLowerCase().includes(lowerQuery)) || 
        (collection.overview?.toLowerCase().includes(lowerQuery))
      );
    }
    
    // Then sort based on the selected option
    switch (sort) {
      case 'popularity':
        // Use the popularityScore if available, otherwise fallback to parts count
        filtered.sort((a, b) => {
          const aScore = (a as any).popularityScore || (a.parts?.length || 0);
          const bScore = (b as any).popularityScore || (b.parts?.length || 0);
          return bScore - aScore;
        });
        break;
      case 'name':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'newest':
        filtered.sort((a, b) => {
          const aNewest = a.parts ? Math.max(...a.parts.map(m => new Date(m.release_date || '1900-01-01').getTime())) : 0;
          const bNewest = b.parts ? Math.max(...b.parts.map(m => new Date(m.release_date || '1900-01-01').getTime())) : 0;
          return bNewest - aNewest;
        });
        break;
    }
    
    setFilteredCollections(filtered);
  }, [initialCollections]);
  
  // Sync search query with URL when component mounts
  useEffect(() => {
    if (queryParam) {
      setSearchQuery(queryParam);
      applyFilters(queryParam, sortOption);
    }
  }, [queryParam, sortOption, applyFilters]);
  
  // Update the URL but only when user explicitly submits search or on initial load
  // This prevents refreshes during regular typing
  useEffect(() => {
    // Skip on first render
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Don't update URL if the debounced value matches the URL parameter
    // This prevents unnecessary URL updates/refreshes
    if (debouncedSearchQuery === queryParam) return;
    
    // Use replace instead of push to avoid adding to browser history
    // This prevents back button from going through every search keystroke
    const params = new URLSearchParams(searchParams);
    if (debouncedSearchQuery) {
      params.set('query', debouncedSearchQuery);
    } else {
      params.delete('query');
    }
    
    // Keep the current page if it exists
    const currentPage = searchParams.get('page');
    if (currentPage) {
      params.set('page', currentPage);
    }
    
    // Update the URL using replace (doesn't add to history and is less "refreshy")
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [debouncedSearchQuery, pathname, router, searchParams, queryParam]);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Only apply local filters immediately (no URL update here)
    applyFilters(query, sortOption);
  };
  
  const handleSortChange = (option: 'popularity' | 'name' | 'newest') => {
    setSortOption(option);
    applyFilters(searchQuery, option);
  };
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-3 mb-6 px-3 sm:px-6 md:px-8 lg:px-10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search collections..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-9 w-full"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="hidden xs:inline">Sort by:</span> 
              <span className="font-medium">
                {sortOption === 'popularity' && 'Popularity'}
                {sortOption === 'name' && 'Name'}
                {sortOption === 'newest' && 'Newest'}
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
              checked={sortOption === 'name'}
              onCheckedChange={() => handleSortChange('name')}
            >
              Name
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem 
              checked={sortOption === 'newest'}
              onCheckedChange={() => handleSortChange('newest')}
            >
              Newest Releases
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {filteredCollections.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh]">
          <p className="text-muted-foreground mb-2">No collections match your search</p>
          <p className="text-sm text-muted-foreground">Try different search terms</p>
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