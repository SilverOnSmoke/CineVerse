import { Suspense } from 'react';
import { fetchTMDBApi } from '@/lib/tmdb';
import { Loader2, Film } from 'lucide-react';
import { CollectionFilters } from '@/components/collection-filters';
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
    query?: string;
  };
}

export default async function CollectionsPage({ searchParams }: CollectionsPageProps) {
  // Ensure current page is a valid integer between 1 and 500
  const pageParam = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : Math.min(pageParam, 500);
  const searchQuery = searchParams.query || '';
  
  return (
    <div>
      {/* Hero Section */}
      <div className="relative w-full bg-gradient-to-r from-primary/20 via-primary/10 to-background mb-8">
        <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Movie Collections
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              Explore complete film franchises and series. From epic sagas to beloved trilogies,
              discover comprehensive collections with timelines, statistics, and more.
            </p>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 hidden md:block">
          <Film className="w-64 h-64" />
        </div>
      </div>
      
      <div className="container mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8">
        <Suspense 
          key={`collections-page-${currentPage}-${searchQuery}`}
          fallback={
            <div className="flex items-center justify-center min-h-[50vh]">
              <Loader2 className="h-6 w-6 xs:h-8 xs:w-8 animate-spin text-primary" />
            </div>
          }
        >
          <CollectionsList page={currentPage} searchQuery={searchQuery} />
        </Suspense>
      </div>
    </div>
  );
}

async function CollectionsList({ page, searchQuery }: { page: number; searchQuery: string }) {
  const ITEMS_PER_PAGE = 24;
  let totalCollections = 0;
  let totalPages = 1;
  
  // Add popularity weights for different factors
  const POPULARITY_WEIGHTS = {
    PARTS_COUNT: 2,
    HAS_POSTER: 1.5,
    HAS_BACKDROP: 1.2,
    OVERVIEW_LENGTH: 0.5,
    SPECIFIC_COLLECTION: 3,
    RECENT_MOVIE: 1.8,
    TMDB_POPULARITY: 1.5 // New weight for TMDB's own popularity score
  };
  
  try {
    // 1. Fetch collections using discover endpoint to get a broader range
    const discoverCollections = await fetchTMDBApi<CollectionSearchResponse>('/discover/movie', {
      sort_by: 'popularity.desc',
      'page': String(Math.min(page, 500)), // Ensure page never exceeds 500 (TMDB limit)
      'include_adult': 'false',
      'include_video': 'false',
      'with_original_language': 'en',
      'with_collection': 'true'
    }).catch(() => ({ results: [], total_pages: 0, total_results: 0 }));

    // 2. Keep the specific collections (verified ones)
    const specificCollectionIds = [
      86311,  // Marvel Cinematic Universe
      10,     // Star Wars Collection
      1241,   // Harry Potter Collection
      9485,   // Fast & Furious Collection
      328,    // Jurassic Park Collection
      119,    // The Lord of the Rings Collection
      645,    // James Bond Collection
      87359,  // Mission: Impossible Collection
      2980,   // Toy Story Collection
      8650,   // Transformers Collection
      295,    // Pirates of the Caribbean Collection
      8091,   // The Hunger Games Collection
      8945,   // The Avengers Collection
      531241, // Spider-Man (MCU) Collection
      131292, // Spider-Man Collection
      573436, // The Amazing Spider-Man Collection
      573693, // Venom Collection
      131295, // DC Extended Universe Collection
      264,    // The Terminator Collection
      33514,  // Shrek Collection
      31562,  // Ice Age Collection
      1575,   // Rocky Collection
      1570,   // Die Hard Collection
      115575, // Star Trek: The Original Series Collection
      313086, // Twilight Collection
    ];
    
    // 3. Keep the popular queries for additional collections
    const popularQueries = [
      'Matrix Collection',  // Added specific Matrix collection query
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
      'The Amazing Spider-Man',
      'Spider-Man Home',
      'Venom',
      'DC',
      'Superman',
      'Wonder Woman',
      'Aquaman',
      'Toy Story',
      'Transformers',
      'Pirates of the Caribbean',
      'The Hunger Games',
      'Twilight',
      'Matrix',
      'Rocky',
      'Alien',
      'Predator',
      'Indiana Jones',
      'Terminator',
      'Star Trek',
      'Bourne',
      'Planet of the Apes',
      'Die Hard',
      'Resident Evil',
      'Underworld',
      'Shrek',
      'Ice Age',
      'Despicable Me',
      'Minions',
      'John Wick',
      'Hobbit',
      'Godfather',
      'Guardians of the Galaxy',
      'Captain America',
      'Thor',
      'Iron Man',
      'Black Panther',
      'Doctor Strange',
      'Ant-Man',
      'Deadpool',
      'Fantastic Four',
      'Incredibles',
      'Kingsman',
      'Mad Max',
      'Maze Runner',
      'Men in Black',
      'Mummy',
      'National Treasure',
      'Ocean',
      'Rambo',
      'Saw',
      'Taken',
      'Conjuring',
      'Insidious',
      'Halloween',
      'Friday the 13th',
      'Final Destination'
    ];
    
    // Fetch collections from all sources in parallel
    const [
      specificCollectionsResults,
      queryCollectionsResults
    ] = await Promise.all([
      // Fetch specific collections with better error handling
      Promise.all(specificCollectionIds.map(async (id) => {
        try {
          const collection = await fetchTMDBApi<Collection>(`/collection/${id}`);
          return collection;
        } catch (error) {
          // Only log 404 errors once to reduce console noise
          if (!(error instanceof Error && error.message.includes('404'))) {
            console.error(`Failed to fetch collection ID ${id}:`, error);
          }
          return null;
        }
      })),
      
      // Fetch collections from popular queries with better error handling
      Promise.all(popularQueries.map(async (query) => {
        try {
          const response = await fetchTMDBApi<CollectionSearchResponse>('/search/collection', { query });
          return response.results || [];
        } catch (error) {
          console.error(`Failed to search collections for query "${query}":`, error);
          return [];
        }
      }))
    ]);

    // Combine all collections
    const allCollections = [
      ...discoverCollections.results,
      ...specificCollectionsResults.filter((c): c is Collection => c !== null),
      ...queryCollectionsResults.flat()
    ];

    // Deduplicate collections
    let uniqueCollections = Array.from(
      new Map(allCollections.map(collection => [collection.id, collection])).values()
    );

    // If we have a search query from URL, fetch additional collections to ensure we find matches
    if (searchQuery) {
      try {
        // Directly search for the query using TMDB's search endpoint
        const searchResults = await fetchTMDBApi<CollectionSearchResponse>('/search/collection', { 
          query: searchQuery
        });
        
        // Add search results to our collections
        if (searchResults.results?.length > 0) {
          // Combine with existing collections and deduplicate
          const combinedResults = [
            ...uniqueCollections,
            ...searchResults.results
          ];
          
          uniqueCollections = Array.from(
            new Map(combinedResults.map(collection => [collection.id, collection])).values()
          );
        }
      } catch (error) {
        console.error('Failed to fetch search results:', error);
      }
    }

    // Calculate popularity scores (now including TMDB's own popularity metric)
    const collectionsWithScores = uniqueCollections.map(collection => {
      let popularityScore = 0;
      
      // Base score from number of movies
      popularityScore += (collection.parts?.length || 0) * POPULARITY_WEIGHTS.PARTS_COUNT;
      
      // Media presence score (but don't exclude if missing)
      if (collection.poster_path) popularityScore += POPULARITY_WEIGHTS.HAS_POSTER;
      if (collection.backdrop_path) popularityScore += POPULARITY_WEIGHTS.HAS_BACKDROP;
      
      // Content quality score
      if (collection.overview) {
        popularityScore += (collection.overview.length / 100) * POPULARITY_WEIGHTS.OVERVIEW_LENGTH;
      }
      
      // Specific collection bonus
      if (specificCollectionIds.includes(collection.id)) {
        popularityScore += POPULARITY_WEIGHTS.SPECIFIC_COLLECTION;
      }
      
      // TMDB's own popularity score (from the movie's popularity)
      const moviePopularity = collection.parts?.[0]?.popularity || 0;
      popularityScore += (moviePopularity / 100) * POPULARITY_WEIGHTS.TMDB_POPULARITY;
      
      // Recent movies bonus
      const mostRecentMovie = collection.parts?.reduce((latest, movie) => {
        const movieDate = new Date(movie.release_date || '1900-01-01');
        const latestDate = new Date(latest.release_date || '1900-01-01');
        return movieDate > latestDate ? movie : latest;
      }, collection.parts?.[0]);
      
      if (mostRecentMovie) {
        const movieYear = new Date(mostRecentMovie.release_date).getFullYear();
        const currentYear = new Date().getFullYear();
        if (movieYear >= currentYear - 2) {
          popularityScore += POPULARITY_WEIGHTS.RECENT_MOVIE;
        }
      }
      
      return {
        ...collection,
        popularityScore
      };
    });

    // Sort by popularity score
    collectionsWithScores.sort((a, b) => b.popularityScore - a.popularityScore);
    
    totalCollections = collectionsWithScores.length;
    
    // Calculate total pages - limit to a reasonable maximum (50 pages of content is reasonable)
    // This prevents unrealistic pagination with thousands of pages
    const calculatedPages = Math.ceil(totalCollections / ITEMS_PER_PAGE);
    const maxReasonablePages = 50; // 50 pages with 24 items per page = 1,200 collections
    
    totalPages = Math.min(
      calculatedPages,
      maxReasonablePages,
      discoverCollections.total_pages || 1
    );
    
    // Get current page slice
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentPageCollections = collectionsWithScores.slice(startIndex, endIndex);
    
    // Fetch full details for collections that need it
    const enhancedCollections = await Promise.all(
      currentPageCollections.map(async (collection) => {
        // If we already have parts info, use the collection as is
        if (collection.parts?.length > 0) {
          return collection;
        }
        
        try {
          // Fetch full collection details
          const fullCollection = await fetchTMDBApi<Collection>(`/collection/${collection.id}`);
          return {
            ...fullCollection,
            popularityScore: collection.popularityScore
          };
        } catch (error) {
          // If we fail to get details, still show the collection with what we have
          return collection;
        }
      })
    );

    // Return collections to the component
    return (
      <>
        <CollectionFilters initialCollections={enhancedCollections} />
        
        <div className="flex justify-center pb-10">
          <PaginationControl currentPage={page} totalPages={totalPages} />
        </div>
      </>
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