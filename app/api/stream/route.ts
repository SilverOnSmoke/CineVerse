import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_NATIVE_PROVIDER_URL;
const TOKEN = process.env.NEXT_PUBLIC_NATIVE_PROVIDER_TOKEN;

export async function GET(request: NextRequest) {
  if (typeof window !== 'undefined') {
    return NextResponse.json(
      { error: 'This endpoint must be called server-side' },
      { status: 400 }
    );
  }

  try {
    if (!API_BASE_URL || !TOKEN) {
      return NextResponse.json(
        { error: 'Provider configuration missing' },
        { status: 401 }
      );
    }

    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type');
    const tmdbId = searchParams.get('tmdbId');
    const season = searchParams.get('season');
    const episode = searchParams.get('episode');

    const endpoint = type === 'movie' 
      ? `/fetch/movie/${tmdbId}` 
      : `/fetch/tv/${tmdbId}/${season}/${episode}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}?token=${TOKEN}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Streaming API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch streaming data' },
      { status: 500 }
    );
  }
}
