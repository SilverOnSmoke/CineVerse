import { notFound } from 'next/navigation';
import { fetchTMDBApi } from '@/lib/tmdb';
import type { MovieDetails } from '@/types/tmdb';
import { VideoPlayer } from '@/components/video-player';

interface MoviePageProps {
  params: { id: string };
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
    
    // Take only first 20 movies for initial build
    const movieIds = popularMovies.results.slice(0, 20).map(movie => movie.id);

    return movieIds.map((id) => ({
      id: id.toString(),
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export default async function MoviePage({ params }: MoviePageProps) {
  try {
    const movie = await fetchTMDBApi<MovieDetails>(`/movie/${params.id}`);

    if (!movie) {
      notFound();
    }

    return (
      <VideoPlayer
        tmdbId={params.id}
        type="movie"
      />
    );
  } catch (error) {
    console.error('Error loading movie:', error);
    notFound();
  }
} 