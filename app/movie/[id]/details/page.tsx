import { Suspense } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { fetchTMDBApi } from '@/lib/tmdb';
import { getTMDBImageUrl } from '@/lib/tmdb';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MovieCredits } from '@/components/movie-credits';
import { MovieReviews } from '@/components/movie-reviews';
import { formatCurrency, formatRuntime } from '@/lib/utils';
import type { MovieDetails } from '@/types/tmdb';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Youtube } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface MovieDetailsPageProps {
  params: {
    id: string;
  };
}

// Add this type for the API response
interface MovieListResponse {
  results: Array<{
    id: number;
  }>;
}

// Add generateStaticParams function
export async function generateStaticParams() {
  try {
    const popularMovies = await fetchTMDBApi<MovieListResponse>('/movie/popular');
    
    // Take only first 5 movies for initial build to reduce build time
    const movieIds = popularMovies.results.slice(0, 5).map(movie => movie.id);

    return movieIds.map((id) => ({
      id: id.toString(),
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Add dynamic configuration
export const dynamicParams = true;
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

// Add this interface for video results
interface VideoResult {
  results: Array<{
    key: string;
    site: string;
    type: string;
  }>;
}

export default async function MovieDetailsPage({ params }: MovieDetailsPageProps) {
  const [movie, videos] = await Promise.all([
    fetchTMDBApi<MovieDetails>(`/movie/${params.id}`),
    fetchTMDBApi<VideoResult>(`/movie/${params.id}/videos`),
  ]);

  if (!movie) {
    notFound();
  }

  // Find the first trailer from YouTube
  const trailer = videos.results.find(
    video => video.site === 'YouTube' && video.type === 'Trailer'
  );

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative min-h-[600px] flex items-end">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={getTMDBImageUrl(movie.backdrop_path || movie.poster_path, 'original')}
            alt={movie.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
        </div>

        {/* Content Container */}
        <div className="container relative z-10 pb-10">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Poster - Only mobile adjustments */}
            <div className="shrink-0 w-[180px] md:w-[300px] mx-auto md:mx-0">
              <div className="aspect-[2/3] relative rounded-lg overflow-hidden">
                <Image
                  src={getTMDBImageUrl(movie.poster_path, 'w500')}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Info - Mobile optimizations */}
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold">{movie.title}</h1>
                <p className="text-muted-foreground">
                  {new Date(movie.release_date).getFullYear()} • {formatRuntime(movie.runtime)}
                </p>
              </div>

              {/* Rating - Centered on mobile */}
              <div className="flex items-center justify-center md:justify-start gap-2">
                <div className="bg-primary/10 px-2 py-1 rounded">
                  <p className="text-lg font-semibold">
                    {(movie.vote_average * 10).toFixed(0)}%
                  </p>
                </div>
                <span className="text-muted-foreground">User Score</span>
              </div>

              {/* Add Buttons after rating */}
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Button asChild>
                  <Link href={`/movie/${params.id}`}>
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
              {movie.tagline && (
                <p className="text-xl italic text-muted-foreground">
                  &ldquo;{movie.tagline}&rdquo;
                </p>
              )}

              {/* Overview */}
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Overview</h2>
                <p className="text-lg leading-relaxed text-muted-foreground">{movie.overview}</p>
              </div>

              {/* Genres - Center on mobile */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {movie.genres.map((genre) => (
                  <Badge key={genre.id} variant="secondary">
                    {genre.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section - Mobile optimizations */}
      <div className="container">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-[56px] z-30 w-full border-b px-4 flex justify-start md:justify-center overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cast">Cast</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 p-4 md:p-6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Release Date</h3>
                    <p className="text-sm">{new Date(movie.release_date).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <p className="text-sm">{movie.status}</p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Original Title</h3>
                    <p className="text-sm">{movie.original_title}</p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Runtime</h3>
                    <p className="text-sm">{formatRuntime(movie.runtime)}</p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Budget</h3>
                    <p className="text-sm">{formatCurrency(movie.budget)}</p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Revenue</h3>
                    <p className="text-sm">{formatCurrency(movie.revenue)}</p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Language</h3>
                    <p className="text-sm">{movie.original_language.toUpperCase()}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Production Companies</h3>
                    <div className="flex flex-wrap gap-2">
                      {movie.production_companies.map((company) => (
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
                <MovieCredits movieId={params.id} />
              </Suspense>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <Suspense fallback={<div>Loading reviews...</div>}>
                <MovieReviews movieId={params.id} />
              </Suspense>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 