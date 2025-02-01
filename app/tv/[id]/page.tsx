import { VideoPlayer } from '@/components/video-player';
import { notFound } from 'next/navigation';
import { fetchTMDBApi } from '@/lib/tmdb';
import type { TVShowDetails, TVShowSeason } from '@/types/tmdb';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: TVShowPageProps): Promise<Metadata> {
  const show = await fetchTMDBApi<TVShowDetails>(`/tv/${params.id}`);
  return {
    title: `${show.name} | CineVerse`
  };
}

interface TVShowPageProps {
  params: { 
    id: string;
  };
  searchParams: {
    season?: string;
    episode?: string;
  };
}

export default async function TVShowPage({ params, searchParams }: TVShowPageProps) {
  const [show, initialSeason] = await Promise.all([
    fetchTMDBApi<TVShowDetails>(`/tv/${params.id}`),
    fetchTMDBApi<TVShowSeason>(`/tv/${params.id}/season/${searchParams.season || 1}`),
  ]).catch(() => [null, null]);

  if (!show || !initialSeason) {
    notFound();
  }

  const season = Number(searchParams.season) || 1;
  const episode = Number(searchParams.episode) || 1;

  return (
    <VideoPlayer
      tmdbId={params.id}
      type="tv"
      season={season}
      episode={episode}
      show={show}
      initialSeason={initialSeason}
    />
  );
}
