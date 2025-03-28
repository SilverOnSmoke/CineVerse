'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getTMDBImageUrl } from '@/lib/tmdb';
import { Collection } from '@/types/tmdb';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarRange, Film, Star } from 'lucide-react';

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  // Calculate year span and movie count
  const movies = collection.parts || [];
  const movieCount = movies.length;
  
  // Sort movies by release date and extract years
  const sortedMovies = [...movies].sort((a, b) => {
    return new Date(a.release_date).getTime() - new Date(b.release_date).getTime();
  });
  
  const firstYear = sortedMovies.length > 0 && sortedMovies[0].release_date 
    ? new Date(sortedMovies[0].release_date).getFullYear() 
    : null;
    
  const lastYear = sortedMovies.length > 0 && sortedMovies[sortedMovies.length - 1].release_date 
    ? new Date(sortedMovies[sortedMovies.length - 1].release_date).getFullYear() 
    : null;
    
  const yearSpan = firstYear && lastYear 
    ? (firstYear === lastYear ? `${firstYear}` : `${firstYear} - ${lastYear}`) 
    : 'N/A';
    
  // Calculate average rating excluding unreleased movies
  const currentDate = new Date();
  const releasedMovies = movies.filter(movie => 
    movie.release_date && new Date(movie.release_date) < currentDate && movie.vote_average > 0
  );
  
  const averageRating = releasedMovies.length 
    ? (releasedMovies.reduce((sum, movie) => sum + movie.vote_average, 0) / releasedMovies.length).toFixed(1)
    : 'N/A';

  return (
    <Link href={`/collections/${collection.id}`}>
      <Card className="overflow-hidden h-full transition-all hover:shadow-lg hover:scale-[1.02]">
        <div className="aspect-[2/3] relative">
          {collection.poster_path ? (
            <Image
              src={getTMDBImageUrl(collection.poster_path, 'w500')}
              alt={collection.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Film className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4">
            <h3 className="font-bold text-white line-clamp-2 text-sm xs:text-base sm:text-lg">{collection.name}</h3>
          </div>
        </div>
        <CardContent className="p-3 xs:p-4 sm:p-5 space-y-2 xs:space-y-3">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <Film className="h-4 w-4 xs:h-5 xs:w-5 text-muted-foreground flex-shrink-0" />
              <span className="text-xs xs:text-sm sm:text-base">{movieCount} Movies</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4 xs:h-5 xs:w-5 text-muted-foreground flex-shrink-0" />
              <span className="text-xs xs:text-sm sm:text-base">{yearSpan}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 xs:h-5 xs:w-5 text-yellow-500 flex-shrink-0" />
              <span className="text-xs xs:text-sm sm:text-base">{averageRating}</span>
            </div>
          </div>
          <p className="text-xs xs:text-sm sm:text-base text-muted-foreground line-clamp-3 mt-2">{collection.overview || 'No overview available'}</p>
        </CardContent>
      </Card>
    </Link>
  );
}