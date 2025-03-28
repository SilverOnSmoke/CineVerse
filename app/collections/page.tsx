import { Suspense } from 'react';
import { fetchTMDBApi } from '@/lib/tmdb';
import { Loader2 } from 'lucide-react';
import { CollectionGrid } from '@/components/collection-grid';
import { CollectionSearchResponse, Collection } from '@/types/tmdb';
import { PaginationControl } from '@/components/pagination-control';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Collections | CineVerse",
  description: "Browse movie collections and franchises"
};

interface CollectionsPageProps {
  searchParams: {
    page?: string;
  };
}

export default async function CollectionsPage({ searchParams }: CollectionsPageProps) {
  const currentPage = Number(searchParams.page) || 1;
  
  return (
    <div className="container mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8">
      <h1 className="text-2xl xs:text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3 sm:mb-4 mt-3 xs:mt-4 sm:mt-6 lg:mt-8 pl-2 xs:pl-4 sm:pl-6 md:pl-8 lg:pl-10">
        Collections
      </h1>
      <Suspense 
        key={`collections-page-${currentPage}`}
        fallback={
          <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="h-6 w-6 xs:h-8 xs:w-8 animate-spin text-primary" />
          </div>
        }
      >
        <CollectionsList page={currentPage} />
      </Suspense>
    </div>
  );
}

async function CollectionsList({ page }: { page: number }) {
  // Extended list of popular queries to get more collections
  const popularQueries = [
    'Marvel',
    'Star Wars',
    'Harry Potter',
    'Fast and Furious',
    'Jurassic Park',
    'Batman',
    'Lord of the Rings',
    'Mission Impossible',
    'James Bond',
    'Avengers',
    'X-Men',
    'Spider-Man',
    'Toy Story',
    'Transformers',
    'Pirates of the Caribbean',
    'The Hunger Games',
    'Twilight',
    'Matrix',
    'Rocky',
    'Alien',
    'Indiana Jones',
    'Terminator',
    'Star Trek',
    'Bourne',
    'Planet of the Apes',
    'Die Hard',
    'Resident Evil',
    'Underworld',
    'Shrek',
    'Ice Age'
  ];
  
  const ITEMS_PER_PAGE = 20;
  let totalCollections = 0;
  let totalPages = 1;
  
  try {
    // Fetch collections for all queries
    const collectionsPromises = popularQueries.map(query => 
      fetchTMDBApi<CollectionSearchResponse>('/search/collection', { query })
    );
    
    const collectionsResults = await Promise.all(collectionsPromises);
    
    // Flatten and deduplicate results
    const allCollections = collectionsResults.flatMap(result => result.results || []);
    const uniqueCollections = Array.from(new Map(
      allCollections.map(collection => [collection.id, collection])
    ).values());
    
    totalCollections = uniqueCollections.length;
    totalPages = Math.ceil(totalCollections / ITEMS_PER_PAGE);
    
    // Determine slice for current page
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentPageCollections = uniqueCollections.slice(startIndex, endIndex);
    
    // Enhance collections with details (only for current page)
    const knownValidCollections = new Set([
      86311,   // Marvel Cinematic Universe
      10,      // Star Wars
      1241,    // Harry Potter
      9485,    // Fast & Furious 
      328,     // Jurassic Park
      120,     // The Lord of the Rings
      645,     // James Bond
      87359,   // Mission: Impossible
      2980,    // Toy Story
      8650,    // Transformers
      295,     // Pirates of the Caribbean
      2739,    // Twilight
      528,     // The Matrix
      1575,    // Rocky
      8091,    // The Hunger Games
      8945,    // The Avengers
      453993,  // Spider-Man
      1570,    // Die Hard
      87800,   // Star Trek
      4494,    // Shrek
      8354,    // Ice Age
      263,     // The Terminator
    ]);
    
    // Pre-filter collections to those we know exist or are likely to exist
    const likelyValidCollections = currentPageCollections.filter(collection => {
      // Keep collections with IDs we know are valid
      if (knownValidCollections.has(collection.id)) {
        return true;
      }
      
      // Keep collections with names that match our queries and have consistent IDs
      const nameLower = collection.name.toLowerCase();
      for (const query of popularQueries) {
        if (nameLower.includes(query.toLowerCase()) && collection.id < 1000000) {
          return true;
        }
      }
      
      // Skip collections that are likely to be invalid based on patterns we've observed
      // (Very high IDs often don't exist in the details endpoint)
      return collection.id < 500000;
    });
    
    // Enhance collections with details (only for current page)
    const collectionDetailsPromises = likelyValidCollections.map(async (collection) => {
      try {
        const fullCollection = await fetchTMDBApi<Collection>(`/collection/${collection.id}`);
        return {
          success: true,
          collection: fullCollection
        };
      } catch (error) {
        // Reduce console noise by not logging expected 404 errors
        if (!(error instanceof Error) || !error.message.includes('404')) {
          console.error(`Failed to fetch details for collection ${collection.id}:`, error);
        }
        return {
          success: false,
          collection: null
        };
      }
    });
    
    const collectionDetailsResults = await Promise.all(collectionDetailsPromises);
    
    // Filter out failed requests
    const enhancedCollections = collectionDetailsResults
      .filter(result => result.success)
      .map(result => result.collection as Collection);
    
    if (enhancedCollections.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground mb-2">No valid collections found</p>
          <p className="text-sm text-muted-foreground">Try again later or check your API connection</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-8">
        <CollectionGrid collections={enhancedCollections} />
        
        {/* Pagination */}
        <div className="flex justify-center pb-10">
          <PaginationControl currentPage={page} totalPages={totalPages} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch collections:', error);
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Failed to load collections</p>
      </div>
    );
  }
}