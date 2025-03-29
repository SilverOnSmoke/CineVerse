'use client';

import { Film, DollarSign, Calendar, Clock } from 'lucide-react';
import { Progress } from './ui/progress';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { type Movie, type MovieDetails } from '@/types/tmdb';

// We have two different components with the same name but different props
// This one is used on the collection details page
interface CollectionDetailsStatsProps {
  movies: Movie[];
}

export function CollectionStats({ movies }: CollectionDetailsStatsProps) {
  // Calculate statistics
  const totalMovies = movies.length;
  
  // Calculate total box office (revenue)
  const totalRevenue = movies.reduce((total, movie) => {
    // Check if the movie is MovieDetails type with revenue property
    return total + ((movie as MovieDetails).revenue || 0);
  }, 0);
  
  // Calculate average runtime
  const moviesWithRuntime = movies.filter(movie => (movie as MovieDetails).runtime);
  const averageRuntime = moviesWithRuntime.length 
    ? Math.round(moviesWithRuntime.reduce((total, movie) => total + ((movie as MovieDetails).runtime || 0), 0) / moviesWithRuntime.length) 
    : 0;
  
  // Get release years span
  const releaseYears = movies
    .filter(movie => movie.release_date)
    .map(movie => new Date(movie.release_date).getFullYear());
  
  const firstYear = releaseYears.length ? Math.min(...releaseYears) : null;
  const lastYear = releaseYears.length ? Math.max(...releaseYears) : null;
  const yearsSpan = firstYear && lastYear ? (firstYear === lastYear ? firstYear : `${firstYear} - ${lastYear}`) : 'N/A';
  
  return (
    <div className="bg-card/60 backdrop-blur-sm border rounded-lg p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-semibold mb-4">Collection Overview</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-2 p-4 bg-muted/30 rounded-lg border border-border/50"
        >
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-2 rounded-full">
              <Film className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium">Total Movies</span>
          </div>
          <div>
            <span className="text-2xl font-bold">{totalMovies}</span>
          </div>
          <Progress value={(totalMovies / 30) * 100} className="h-1.5" />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-2 p-4 bg-muted/30 rounded-lg border border-border/50"
        >
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-2 rounded-full">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium">Box Office</span>
          </div>
          <div>
            <span className="text-2xl font-bold">{formatCurrency(totalRevenue)}</span>
          </div>
          <Progress value={Math.min((totalRevenue / 5000000000) * 100, 100)} className="h-1.5" />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-2 p-4 bg-muted/30 rounded-lg border border-border/50"
        >
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-2 rounded-full">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium">Years</span>
          </div>
          <div>
            <span className="text-2xl font-bold">{yearsSpan}</span>
          </div>
          <Progress 
            value={releaseYears.length ? 100 : 0} 
            className="h-1.5" 
          />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-2 p-4 bg-muted/30 rounded-lg border border-border/50"
        >
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-2 rounded-full">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium">Avg. Runtime</span>
          </div>
          <div>
            <span className="text-2xl font-bold">{averageRuntime}</span>
            <span className="text-sm text-muted-foreground ml-1">min</span>
          </div>
          <Progress value={Math.min((averageRuntime / 180) * 100, 100)} className="h-1.5" />
        </motion.div>
      </div>
    </div>
  );
}

// Original component used in collection list pages
interface CollectionListStatsProps {
  collectionsCount: number;
  moviesCount: number;
  filterActive: boolean;
}

export function CollectionListStats({
  collectionsCount,
  moviesCount,
  filterActive
}: CollectionListStatsProps) {
  // Calculate some interesting stats
  const avgMoviesPerCollection = moviesCount / (collectionsCount || 1);
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Collection Statistics</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-2 p-3 bg-muted/30 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-2 rounded-full">
              <Film className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium">Collections</span>
          </div>
          <div>
            <span className="text-2xl font-bold">{collectionsCount}</span>
            {filterActive && (
              <span className="text-xs text-muted-foreground ml-2">filtered</span>
            )}
          </div>
          <Progress value={filterActive ? (collectionsCount / 100) * 100 : 100} className="h-1" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-2 p-3 bg-muted/30 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-2 rounded-full">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium">Total Movies</span>
          </div>
          <div>
            <span className="text-2xl font-bold">{moviesCount}</span>
          </div>
          <Progress value={Math.min((moviesCount / 1000) * 100, 100)} className="h-1" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-2 p-3 bg-muted/30 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-2 rounded-full">
              <Film className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium">Avg. Movies Per Collection</span>
          </div>
          <div>
            <span className="text-2xl font-bold">{avgMoviesPerCollection.toFixed(1)}</span>
          </div>
          <Progress value={Math.min((avgMoviesPerCollection / 10) * 100, 100)} className="h-1" />
        </motion.div>
      </div>
    </div>
  );
}