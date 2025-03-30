import { fetchTMDBApi } from '@/lib/tmdb';
import { getTMDBImageUrl } from '@/lib/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import { ScrollToTopLink } from './scroll-to-top-link';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Info, Play, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaRecommendationsProps {
  mediaId: string;
  mediaType: 'movie' | 'tv';
}

interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  overview: string;
}

interface RecommendationsResponse {
  results: MediaItem[];
}

// Cache for genre mappings
const genreCache: Record<string, Record<number, string>> = {
  movie: {},
  tv: {}
};

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

async function getRecommendations(mediaType: string, mediaId: string) {
  // First try to get recommendations, fallback to similar if no recommendations
  const recommendations = await fetchTMDBApi<RecommendationsResponse>(`/${mediaType}/${mediaId}/recommendations`);
  
  if (recommendations?.results?.length > 0) {
    return recommendations;
  }
  
  // Fallback to similar titles
  return fetchTMDBApi<RecommendationsResponse>(`/${mediaType}/${mediaId}/similar`);
}

export async function MediaRecommendations({ mediaId, mediaType }: MediaRecommendationsProps) {
  const recommendations = await getRecommendations(mediaType, mediaId);
  const genreMap = await getGenreMap(mediaType as 'movie' | 'tv');

  if (!recommendations?.results?.length) {
    return null;
  }

  // Get up to 12 recommendations with valid posters
  const validRecommendations = recommendations.results
    .filter(item => item.poster_path || item.backdrop_path)
    .slice(0, 12);

  if (validRecommendations.length === 0) {
    return null;
  }
  
  return (
    <section className="py-12 bg-background/50">
      <div className="container max-w-[2000px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Recommended for You</h2>
        </div>
        
        {/* Desktop Grid Layout (hidden on mobile) */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 lg:gap-6">
          {validRecommendations.map((item) => (
            <RecommendationCard 
              key={item.id} 
              item={item} 
              mediaType={mediaType} 
              genreMap={genreMap} 
            />
          ))}
        </div>
        
        {/* Mobile Carousel (hidden on desktop) */}
        <div className="md:hidden relative">
          <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory flex space-x-4 pb-6">
            {validRecommendations.map((item) => (
              <div key={item.id} className="snap-start flex-shrink-0 w-[75vw] sm:w-[45vw]">
                <RecommendationCard 
                  item={item} 
                  mediaType={mediaType} 
                  genreMap={genreMap} 
                  isMobile={true} 
                />
              </div>
            ))}
          </div>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
            <div className="h-1 w-16 bg-primary/20 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-primary rounded-full animate-scroll-indicator"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Separate card component for recommendations
function RecommendationCard({ 
  item, 
  mediaType, 
  genreMap,
  isMobile = false
}: { 
  item: MediaItem; 
  mediaType: string; 
  genreMap: Record<number, string>;
  isMobile?: boolean;
}) {
  const title = item.title || item.name || "";
  const date = item.release_date || item.first_air_date;
  const year = date ? new Date(date).getFullYear() : null;
  const rating = Math.round(item.vote_average * 10);
  
  // Get up to 2 genres
  const genres = item.genre_ids
    .slice(0, 2)
    .map(id => genreMap[id])
    .filter(Boolean);
  
  return (
    <Card className={cn(
      "h-full overflow-hidden group border-0 rounded-xl shadow-md hover:shadow-xl transition-all duration-300",
      isMobile ? "w-full" : ""
    )}>
      <div className="relative w-full aspect-[2/3]">
        <Image
          src={getTMDBImageUrl(item.poster_path || item.backdrop_path || '', 'w500')}
          alt={title}
          fill
          sizes={isMobile ? "(max-width: 640px) 75vw, 45vw" : "(max-width: 1280px) 33vw, 25vw, 16vw"}
          className="object-cover transition-transform group-hover:scale-105 duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 space-y-2">
            <h3 className="font-bold text-white text-lg line-clamp-1">{title}</h3>
            <div className="flex items-center space-x-1 text-xs text-white/80">
              {year && <span>{year}</span>}
              {year && genres.length > 0 && <span>•</span>}
              {genres.length > 0 && <span>{genres.join(', ')}</span>}
            </div>
            <div className="flex space-x-2 pt-2">
              <Button 
                asChild 
                size="sm" 
                variant="default" 
                className="flex-1 h-8"
              >
                <Link href={`/${mediaType}/${item.id}${mediaType === 'tv' ? '?season=1&episode=1' : ''}`}>
                  <Play className="h-3 w-3 mr-1" /> 
                  Watch
                </Link>
              </Button>
              <Button 
                asChild
                size="sm" 
                variant="secondary" 
                className="flex-1 h-8"
              >
                <Link href={`/${mediaType}/${item.id}/details`}>
                  <Info className="h-3 w-3 mr-1" /> 
                  Details
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute top-2 right-2 bg-black/60 rounded-md px-1.5 py-0.5 flex items-center">
          <Star className="h-3 w-3 text-yellow-400 mr-1 fill-yellow-400" />
          <span className="text-xs font-medium text-white">{rating}%</span>
        </div>
      </div>
      <CardContent className="p-3 md:hidden">
        <h3 className="font-medium leading-tight line-clamp-1">{title}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground">
            {year || 'TBA'} {genres[0] && `• ${genres[0]}`}
          </span>
          <Badge variant="secondary" className="text-xs">
            {rating}%
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
