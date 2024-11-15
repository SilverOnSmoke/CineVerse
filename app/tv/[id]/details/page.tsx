import { Suspense } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { fetchTMDBApi } from '@/lib/tmdb';
import { getTMDBImageUrl } from '@/lib/tmdb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { TVCredits } from '@/components/tv-credits';
import type { TVShowDetails } from '@/types/tmdb';
import { Button } from '@/components/ui/button';
import { Play, Youtube } from 'lucide-react';
import Link from 'next/link';

interface TVShowDetailsPageProps {
  params: { id: string };
}

interface TVListResponse {
  results: Array<{
    id: number;
  }>;
}

interface VideoResult {
  results: Array<{
    key: string;
    site: string;
    type: string;
  }>;
}

export async function generateStaticParams() {
  try {
    const popularShows = await fetchTMDBApi<TVListResponse>('/tv/popular');
    
    // Take only first 5 shows for initial build to reduce build time
    const showIds = popularShows.results.slice(0, 5).map(show => show.id);

    return showIds.map((id) => ({
      id: id.toString(),
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export default async function TVShowDetailsPage({ params }: TVShowDetailsPageProps) {
  const [show, videos] = await Promise.all([
    fetchTMDBApi<TVShowDetails>(`/tv/${params.id}`).catch(() => null),
    fetchTMDBApi<VideoResult>(`/tv/${params.id}/videos`).catch(() => ({ results: [] })),
  ]);

  if (!show) {
    notFound();
  }

  const trailer = videos.results.find(
    video => video.site === 'YouTube' && video.type === 'Trailer'
  );

  return (
    <div className="space-y-6">
      {/* Hero Section - Updated layout */}
      <div className="relative min-h-[600px] flex items-end">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={getTMDBImageUrl(show.backdrop_path || show.poster_path)}
            alt={show.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
        </div>

        {/* Content Container */}
        <div className="container relative z-10 pb-10">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Poster */}
            <div className="shrink-0 w-[200px] md:w-[300px] mx-auto md:mx-0">
              <div className="aspect-[2/3] relative rounded-lg overflow-hidden">
                <Image
                  src={getTMDBImageUrl(show.poster_path)}
                  alt={show.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold">{show.name}</h1>
                <p className="text-xl text-muted-foreground">
                  {new Date(show.first_air_date).getFullYear()} • {show.episode_run_time?.[0]} min
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 px-2 py-1 rounded">
                  <p className="text-lg font-semibold">
                    {(show.vote_average * 10).toFixed(0)}%
                  </p>
                </div>
                <span className="text-muted-foreground">User Score</span>
              </div>

              {/* Add Buttons after rating */}
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Button asChild>
                  <Link href={`/tv/${params.id}?season=1&episode=1`}>
                    <Play className="h-4 w-4 mr-2" />
                    Watch Now
                  </Link>
                </Button>
                
                {trailer && (
                  <Button variant="outline" asChild>
                    <Link 
                      href={`https://www.youtube.com/watch?v=${trailer.key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Youtube className="h-4 w-4 mr-2" />
                      Watch Trailer
                    </Link>
                  </Button>
                )}
              </div>

              {/* Tagline */}
              {show.tagline && (
                <p className="text-xl italic text-muted-foreground">&ldquo;{show.tagline}&rdquo;</p>
              )}

              {/* Overview */}
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Overview</h2>
                <p className="text-lg leading-relaxed text-muted-foreground">{show.overview}</p>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {show.genres.map((genre) => (
                  <Badge key={genre.id} variant="secondary">
                    {genre.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of the content */}
      <div className="container">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-[56px] z-30 w-full border-b px-4 flex justify-center">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cast">Cast</TabsTrigger>
            <TabsTrigger value="episodes">Episodes</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">First Air Date</h3>
                    <p className="text-sm">{new Date(show.first_air_date).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <p className="text-sm">{show.status}</p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Original Name</h3>
                    <p className="text-sm">{show.original_name}</p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Episode Runtime</h3>
                    <p className="text-sm">
                      {show.episode_run_time?.[0] ? `${show.episode_run_time[0]} minutes` : 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Seasons</h3>
                    <p className="text-sm">{show.number_of_seasons}</p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Episodes</h3>
                    <p className="text-sm">{show.number_of_episodes}</p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Language</h3>
                    <p className="text-sm">{show.original_language.toUpperCase()}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Production Companies</h3>
                    <div className="flex flex-wrap gap-2">
                      {show.production_companies.map((company) => (
                        <Badge key={company.id} variant="outline">
                          {company.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cast" className="space-y-6">
            <div className="max-w-6xl mx-auto">
              <Suspense fallback={<div>Loading cast...</div>}>
                <TVCredits tvId={params.id} />
              </Suspense>
            </div>
          </TabsContent>

          <TabsContent value="episodes" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Latest Season</h2>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Season {show.number_of_seasons} • {show.number_of_episodes} Episodes
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <Suspense fallback={<div>Loading reviews...</div>}>
                <p className="text-center text-muted-foreground">No reviews yet.</p>
              </Suspense>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 