import { fetchTMDBApi } from '@/lib/tmdb';
import { getTMDBImageUrl } from '@/lib/tmdb';
import Image from 'next/image';
import { ScrollToTopLink } from './scroll-to-top-link';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface MediaRecommendationsProps {
  mediaId: string;
  mediaType: 'movie' | 'tv';
}

interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
}

interface RecommendationsResponse {
  results: MediaItem[];
}

async function getRecommendations(mediaType: string, mediaId: string) {
  return fetchTMDBApi<RecommendationsResponse>(`/${mediaType}/${mediaId}/similar`);
}

export async function MediaRecommendations({ mediaId, mediaType }: MediaRecommendationsProps) {
  const recommendations = await getRecommendations(mediaType, mediaId);

  if (!recommendations?.results?.length) {
    return null;
  }

  return (
    <div className="container py-12">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold mb-8 px-2">Recommended for You</h2>
        
        <div className="relative">
          {/* Scrollable container */}
          <div className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
            {recommendations.results.slice(0, 10).map((item) => {
              const title = item.title || item.name;
              const date = item.release_date || item.first_air_date;
              const year = date ? new Date(date).getFullYear() : null;
              
              return (
                <ScrollToTopLink
                  key={item.id}
                  href={`/${mediaType}/${item.id}/details`}
                  className="snap-start"
                >
                  <Card className="w-[160px] sm:w-[200px] hover:scale-105 transition-transform duration-200">
                    <div className="aspect-[2/3] relative overflow-hidden rounded-t-lg">
                      <Image
                        src={getTMDBImageUrl(item.poster_path, 'w500')}
                        alt={title || ''}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <h3 className="font-medium leading-tight line-clamp-1">{title}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {year || 'TBA'}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(item.vote_average * 10)}%
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </ScrollToTopLink>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
