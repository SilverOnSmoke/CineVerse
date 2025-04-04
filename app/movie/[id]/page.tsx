import { notFound } from 'next/navigation';
import { fetchTMDBApi } from '@/lib/tmdb';
import type { MovieDetails } from '@/types/tmdb';
import type { Metadata } from 'next';
import { VideoPlayer } from '@/components/video-player';

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const movie = await fetchTMDBApi<MovieDetails>(`/movie/${params.id}`);
  return {
    title: `${movie.title} | CineVerse`
  };
}

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
export const dynamic = 'force-dynamic';
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
