import { fetchTMDBApi } from '@/lib/tmdb';
import type { TVShowSeason } from '@/types/tmdb';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string; season: string } }
) {
  try {
    const seasonData = await fetchTMDBApi<TVShowSeason>(
      `/tv/${params.id}/season/${params.season}`
    );
    return NextResponse.json(seasonData);
  } catch (error) {
    return new NextResponse('Failed to fetch season data', { status: 500 });
  }
} 