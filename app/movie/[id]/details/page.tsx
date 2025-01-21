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
import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

async function getMovieLogos(movieId: number) {
  const response = await axios.get(`${BASE_URL}/movie/${movieId}/images`, {
    params: { api_key: API_KEY, language: "en" },
  });
  return response.data.logos || [];
}

function constructImageUrl(baseUrl: string, size: string, filePath: string): string {
  return `${baseUrl}${size}${filePath}`;
}

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
  const [movie, videos, config, movieLogos] = await Promise.all([
    fetchTMDBApi<MovieDetails>(`/movie/${params.id}`),
    fetchTMDBApi<VideoResult>(`/movie/${params.id}/videos`),
    fetchTMDBApi<{ images: { secure_base_url: string; logo_sizes: string[] } }>(`/configuration`),
    getMovieLogos(Number(params.id)),
  ]);

  if (!movie) {
    notFound();
  }

  // Find the first trailer from YouTube
  const trailer = videos.results.find(
    video => video.site === 'YouTube' && video.type === 'Trailer'
  );

  return (
    <div className="space-y-6 mb-16">
      {/* Hero Section */}
      <div className="relative min-h-[80vh] flex items-center pt-20">
        {/* Background Image with darker overlay */}
        <div className="absolute inset-0">
          <Image
            src={getTMDBImageUrl(movie.backdrop_path || movie.poster_path, 'original')}
            alt={movie.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-background/40" />
        </div>

        {/* Content Container */}
        <div className="container relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* Logo Section */}
            {movieLogos.length > 0 && (
              <div className="w-full max-w-[300px] sm:max-w-[400px] mb-8 sm:mb-10 px-4 sm:px-0">
                <Image
                  src={constructImageUrl(
                    config.images.secure_base_url,
                    "original",
                    movieLogos[0].file_path
                  )}
                  alt={`${movie.title} Logo`}
                  width={400}
                  height={200}
                  className="object-contain w-full"
                  priority
                />
              </div>
            )}

            {/* Movie Info */}
            <div className="space-y-6 w-full px-4 sm:px-0">
              {!movieLogos.length && (
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">{movie.title}</h1>
              )}
              <p className="text-lg sm:text-xl text-muted-foreground">
                {new Date(movie.release_date).getFullYear()} • {formatRuntime(movie.runtime)}
              </p>

              {/* Buttons and Rating Section */}
              <div className="flex flex-col items-center gap-6">
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
                  <Button size="lg" className="w-full sm:w-auto min-w-[160px]" asChild>
                    <Link href={`/movie/${params.id}`}>
                      <Play className="h-5 w-5 mr-2" />
                      Watch Now
                    </Link>
                  </Button>
                  
                  {trailer && (
                    <Button size="lg" variant="outline" className="w-full sm:w-auto min-w-[160px]" asChild>
                      <Link
                        href={`https://www.youtube.com/watch?v=${trailer.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Youtube className="h-5 w-5 mr-2" />
                        Watch Trailer
                      </Link>
                    </Button>
                  )}
                  </div>
                  
                
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 px-3 py-1.5 rounded-md">
                    <p className="text-xl font-semibold">
                      {(movie.vote_average * 10).toFixed(0)}%
                    </p>
                  </div>
                  <span className="text-lg text-muted-foreground">User Score</span>
                </div>
              </div>

              {/* Tagline */}
              {movie.tagline && (
                <p className="text-xl italic text-muted-foreground px-4 md:px-0">
                  &ldquo;{movie.tagline}&rdquo;
                </p>
              )}

              {/* Overview */}
              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-semibold">Overview</h2>
                <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">{movie.overview}</p>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
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
            <div className="max-w-4xl mx-auto pb-8">
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
            <div className="max-w-6xl mx-auto pb-8">
              <Suspense fallback={<div>Loading cast...</div>}>
                <MovieCredits movieId={params.id} />
              </Suspense>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="max-w-4xl mx-auto pb-8">
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