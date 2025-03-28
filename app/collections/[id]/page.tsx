import { Suspense } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { fetchTMDBApi } from '@/lib/tmdb';
import { getTMDBImageUrl } from '@/lib/tmdb';
import { Loader2, PlayCircle } from 'lucide-react';
import { Collection, MovieDetails, Movie } from '@/types/tmdb';
import { MovieGrid } from '@/components/movie-grid';
import { TimelineVisualization } from '@/components/timeline-visualization';
import { CollectionStats } from '@/components/collection-stats';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Metadata } from 'next';

interface CollectionDetailPageProps {
  params: {
    id: string;
  }
}

export async function generateMetadata({ params }: CollectionDetailPageProps): Promise<Metadata> {
  try {
    const collection = await fetchTMDBApi<Collection>(`/collection/${params.id}`);
    return {
      title: `${collection.name} | CineVerse Collections`,
      description: collection.overview || `Explore the ${collection.name} collection on CineVerse`,
    };
  } catch (error) {
    return {
      title: 'Collection | CineVerse',
      description: 'Browse collections on CineVerse',
    };
  }
}

export default async function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  try {
    const collection = await fetchTMDBApi<Collection>(`/collection/${params.id}`);
    
    // Enhance collection parts with movie details where needed
    const enhancedMovies = await Promise.all(collection.parts.map(async (movie) => {
      try {
        // Get details but don't spread directly to avoid property conflicts
        const details = await fetchTMDBApi<MovieDetails>(`/movie/${movie.id}`);
        
        // Create a proper Movie object with additional details
        return {
          ...movie,
          // Don't need to explicitly set media_type as it's already in Movie type
          // and will be preserved when spreading movie
          runtime: details.runtime,
          budget: details.budget,
          revenue: details.revenue,
          genres: details.genres,
          status: details.status,
          tagline: details.tagline,
          credits: details.credits,
          production_companies: details.production_companies
        } as Movie; // Explicitly cast to Movie type
      } catch (error) {
        console.error(`Failed to fetch details for movie ${movie.id}:`, error);
        return movie; // Return original movie from collection
      }
    }));
    
    // Sort movies by release date
    const sortedMovies = [...enhancedMovies].sort((a, b) => {
      return new Date(a.release_date).getTime() - new Date(b.release_date).getTime();
    });
    
    // Find the first movie to use as "start watching" option
    const firstMovie = sortedMovies.length > 0 ? sortedMovies[0] : null;
    
    return (
      <div>
        {/* Hero Banner */}
        <div className="relative w-full h-[200px] xs:h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px] xl:h-[650px] 2xl:h-[700px] overflow-hidden">
          <Image
            src={getTMDBImageUrl(collection.backdrop_path || collection.poster_path)}
            alt={collection.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-background/40" />
          
          {/* Content Overlay */}
          <div className="container relative z-10 h-full flex flex-col justify-end pb-4 xs:pb-6 sm:pb-8 px-2 xs:px-4 sm:px-6">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 xs:mb-3 sm:mb-4 max-w-4xl">
              {collection.name}
            </h1>
            
            {collection.overview && (
              <p className="text-xs xs:text-sm sm:text-base text-white/80 max-w-3xl mb-3 xs:mb-4 sm:mb-6 line-clamp-2 xs:line-clamp-3 sm:line-clamp-none">
                {collection.overview}
              </p>
            )}
            
            {firstMovie && (
              <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
                <Button size="sm" className="px-3 py-1.5 xs:px-4 xs:py-2 sm:px-6 sm:py-3" asChild>
                  <Link href={`/movie/${firstMovie.id}`}>
                    <PlayCircle className="mr-1 xs:mr-2 h-4 w-4 xs:h-5 xs:w-5" />
                    Start Watching
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="container px-2 xs:px-4 sm:px-6 py-4 xs:py-6 sm:py-8 space-y-6 xs:space-y-8 sm:space-y-10">
          {/* Collection Stats */}
          <Suspense fallback={<Loader2 className="h-6 w-6 xs:h-8 xs:w-8 animate-spin mx-auto" />}>
            <CollectionStats movies={enhancedMovies} />
          </Suspense>
          
          {/* Timeline */}
          <Suspense fallback={<Loader2 className="h-6 w-6 xs:h-8 xs:w-8 animate-spin mx-auto" />}>
            <TimelineVisualization movies={sortedMovies} />
          </Suspense>
          
          {/* Movies Grid */}
          <div className="space-y-4">
            <h2 className="text-xl xs:text-2xl font-semibold px-2 xs:px-4 sm:px-6 md:px-8 lg:px-10">Movies in Collection</h2>
            <Suspense fallback={<Loader2 className="h-6 w-6 xs:h-8 xs:w-8 animate-spin mx-auto" />}>
              <MovieGrid items={enhancedMovies} />
            </Suspense>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch collection details:', error);
    notFound();
  }
}