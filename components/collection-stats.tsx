'use client';

import { Movie } from '@/types/tmdb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Star, TrendingUp, Ticket } from 'lucide-react';
import { formatCurrency, formatRuntime } from '@/lib/utils';

interface CollectionStatsProps {
  movies: Movie[];
}

export function CollectionStats({ movies }: CollectionStatsProps) {
  if (!movies?.length) {
    return null;
  }
  
  // Calculate statistics
  const totalMovies = movies.length;
  
  // Total runtime (assuming we have runtime in minutes for each movie)
  const totalRuntime = movies.reduce((total, movie) => {
    const runtime = (movie as any).runtime || 0;
    return total + runtime;
  }, 0);
  
  // Average rating
  const validRatings = movies.filter(movie => movie.vote_average > 0);
  const averageRating = validRatings.length 
    ? (validRatings.reduce((sum, movie) => sum + movie.vote_average, 0) / validRatings.length).toFixed(1)
    : 'N/A';
  
  // Box office (if available)
  const totalBoxOffice = movies.reduce((total, movie) => {
    const revenue = (movie as any).revenue || 0;
    return total + revenue;
  }, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Movies</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center">
          <Ticket className="h-4 w-4 xs:h-5 xs:w-5 mr-2 text-primary flex-shrink-0" />
          <span className="text-xl xs:text-2xl font-bold">{totalMovies}</span>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Runtime</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center">
          <Clock className="h-4 w-4 xs:h-5 xs:w-5 mr-2 text-primary flex-shrink-0" />
          <span className="text-xl xs:text-2xl font-bold">{formatRuntime(totalRuntime)}</span>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center">
          <Star className="h-4 w-4 xs:h-5 xs:w-5 mr-2 text-primary flex-shrink-0" />
          <span className="text-xl xs:text-2xl font-bold">{averageRating}</span>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Box Office</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center">
          <TrendingUp className="h-4 w-4 xs:h-5 xs:w-5 mr-2 text-primary flex-shrink-0" />
          <span className="text-base xs:text-xl sm:text-2xl font-bold truncate">{formatCurrency(totalBoxOffice)}</span>
        </CardContent>
      </Card>
    </div>
  );
}