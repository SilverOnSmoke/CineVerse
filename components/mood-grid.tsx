'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { fetchTMDBApi } from '@/lib/tmdb';
import { getTMDBImageUrl } from '@/lib/tmdb';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Play, Info, Star, Filter, Film, Tv } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BookmarkIcon } from '@/components/bookmark-icon';
import { type Mood } from '@/app/moods/page';

// Cache for genre mappings
const genreCache: Record<string, Record<number, string>> = {
  movie: {},
  tv: {}
};

interface MoodGridProps {
  mood: Mood | null;
  mediaType: 'movie' | 'tv';
}

async function getGenreMap(mediaType: 'movie' | 'tv') {
  if (Object.keys(genreCache[mediaType]).length > 0) {
    return genreCache[mediaType];
  }

  try {
    const response = await fetchTMDBApi<{ genres: Array<{ id: number; name: string }> }>(`/genre/${mediaType}/list`);
    const genreMap: Record<number, string> = {};
    
    response.genres.forEach(genre => {
      genreMap[genre.id] = genre.name;
    });
    
    genreCache[mediaType] = genreMap;
    return genreMap;
  } catch (error) {
    console.error(`Failed to fetch ${mediaType} genres:`, error);
    return {};
  }
}

export function MoodGrid({ mood, mediaType }: MoodGridProps) {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<any[]>([]);
  const [genreMap, setGenreMap] = useState<Record<number, string>>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Fetch content based on mood and media type
  useEffect(() => {
    const fetchMoodBasedContent = async () => {
      setLoading(true);
      try {
        // Get the genre mapping
        const genres = await getGenreMap(mediaType);
        setGenreMap(genres);

        let params: Record<string, string> = {
          page: page.toString(),
          include_adult: 'false',
          sort_by: 'popularity.desc',
        };

        // Add mood-specific parameters if a mood is selected
        if (mood) {
          params = { ...params, ...mood.params };
        }

        // Fetch content from TMDB API
        const endpoint = `/discover/${mediaType}`;
        const response = await fetchTMDBApi<{ results: any[], total_pages: number }>(endpoint, params);
        
        // Process and set the content data
        const results = response.results
          .filter(item => item.poster_path || item.backdrop_path) // Filter out items without images
          .map(item => ({
            ...item,
            media_type: mediaType
          }));
        
        setContent(results);
        setTotalPages(Math.min(response.total_pages, 500));
        setLoading(false);
      } catch (error) {
        console.error(`Error fetching mood-based ${mediaType}:`, error);
        setLoading(false);
        setContent([]);
      }
    };

    fetchMoodBasedContent();
  }, [mood, mediaType, page]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    
    // Scroll to top of grid with animation
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Get content type label (Movie/TV Show)
  const contentTypeLabel = mediaType === 'movie' ? 'Movies' : 'TV Shows';

  return (
    <div ref={gridRef}>
      {/* Mood header with animation */}
      {mood && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className={`p-6 md:p-8 rounded-2xl ${mood.color} bg-opacity-10 backdrop-blur-sm border border-${mood.color.split('from-')[1].split(' ')[0]}/10`}>
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
              <div className={`w-16 h-16 rounded-xl ${mood.color} flex items-center justify-center shadow-lg`}>
                <mood.icon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">
                  {mood.name} {contentTypeLabel}
                </h2>
                <p className="text-muted-foreground mt-1">{mood.description}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Content type indicator */}
      {!mood && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-6 flex items-center gap-2"
        >
          <div className="bg-primary/10 p-3 rounded-full">
            {mediaType === 'movie' ? (
              <Film className="h-5 w-5 text-primary" />
            ) : (
              <Tv className="h-5 w-5 text-primary" />
            )}
          </div>
          <h2 className="text-2xl font-bold">
            Top {contentTypeLabel}
          </h2>
        </motion.div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 rounded-xl border border-dashed p-8">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Finding the perfect {mediaType === 'movie' ? 'movies' : 'shows'} for you...</p>
        </div>
      ) : content.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-xl bg-background/50 backdrop-blur-sm">
          <h3 className="text-xl font-semibold mb-2">No {contentTypeLabel.toLowerCase()} found</h3>
          <p className="text-muted-foreground mb-6">Try selecting a different mood or adjusting your filters.</p>
          <Button onClick={() => setPage(1)} variant="outline">Reset Filters</Button>
        </div>
      ) : (
        <>
          {/* Content grid with animations */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={`${mood?.id}-${mediaType}-${page}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
            >
              {content.map((item) => (
                <MoodContentCard 
                  key={item.id} 
                  item={item} 
                  genreMap={genreMap} 
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="flex justify-center mt-10"
            >
              <div className="flex items-center gap-2 bg-background/80 backdrop-blur px-4 py-2 rounded-full border shadow-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  Previous
                </Button>
                
                <div className="px-3 py-1 rounded-md bg-muted">
                  <span className="text-sm font-medium">
                    Page {page} of {totalPages}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next
                </Button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

function MoodContentCard({ item, genreMap }: { item: any, genreMap: Record<number, string> }) {
  // Get content details
  const title = item.title || item.name || "";
  const date = item.release_date || item.first_air_date;
  const year = date ? new Date(date).getFullYear() : null;
  const rating = Math.round(item.vote_average * 10);
  const mediaType = item.media_type;
  
  // Get up to 2 genres
  const genres = item.genre_ids
    .slice(0, 2)
    .map((id: number) => genreMap[id])
    .filter(Boolean);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300">
        <div className="relative aspect-[2/3] overflow-hidden">
          <BookmarkIcon item={item} />
          
          <Image
            src={getTMDBImageUrl(item.poster_path || item.backdrop_path, 'w500')}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105 duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
            <h3 className="font-bold text-white text-base line-clamp-1 mb-1">{title}</h3>
            <div className="flex items-center space-x-1 text-xs text-white/80 mb-3">
              {year && <span>{year}</span>}
              {year && genres.length > 0 && <span>•</span>}
              {genres.length > 0 && <span>{genres.join(', ')}</span>}
            </div>
            
            <div className="flex space-x-2">
              <Button size="sm" className="flex-1" asChild>
                <Link href={`/${mediaType}/${item.id}${mediaType === 'tv' ? '?season=1&episode=1' : ''}`}>
                  <Play className="h-3 w-3 mr-2" />
                  Watch
                </Link>
              </Button>
              <Button size="sm" variant="secondary" className="flex-1" asChild>
                <Link href={`/${mediaType}/${item.id}/details`}>
                  <Info className="h-3 w-3 mr-2" />
                  Details
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Media type badge */}
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/60 text-white">
            {mediaType === 'movie' ? 'MOVIE' : 'TV'}
          </div>
        </div>
        
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-sm line-clamp-1 flex-1">{title}</h3>
            <div className="flex items-center bg-primary/10 rounded px-1.5 py-0.5 ml-2">
              <Star className="h-3 w-3 text-yellow-400 mr-0.5 fill-yellow-400" />
              <span className="text-xs font-medium">{rating}%</span>
            </div>
          </div>
          <div className="flex items-center mt-1">
            <span className="text-xs text-muted-foreground">
              {year || 'TBA'} {genres[0] && `• ${genres[0]}`}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}