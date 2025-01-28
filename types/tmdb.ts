export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
  media_type: 'movie';
  images?: {
    logos: Array<{
      file_path: string;
      aspect_ratio: number;
      height: number;
      width: number;
      vote_average: number;
      vote_count: number;
      iso_639_1: string | null;
    }>;
  };
}

export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  first_air_date: string;
  genre_ids: number[];
  media_type: 'tv';
}

export interface TrendingResponse {
  page: number;
  results: (Movie | TVShow)[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime: number;
  status: string;
  tagline: string;
  budget: number;
  revenue: number;
  original_language: string;
  original_title: string;
  production_companies: {
    id: number;
    name: string;
    logo_path: string | null;
  }[];
}

export interface SearchResult {
  page: number;
  results: (Movie | TVShow)[];
  total_pages: number;
  total_results: number;
}

export interface TVShowDetails extends TVShow {
  genres: Genre[];
  status: string;
  tagline: string;
  number_of_seasons: number;
  number_of_episodes: number;
  episode_run_time: number[];
  original_language: string;
  original_name: string;
  production_companies: {
    id: number;
    name: string;
    logo_path: string | null;
  }[];
}

export interface MovieResponse extends Omit<TrendingResponse, 'results'> {
  results: Movie[];
}

export interface TVShowEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  still_path: string | null;
  air_date: string;
}

export interface TVShowSeason {
  id: number;
  name: string;
  episode_count: number;
  season_number: number;
  episodes: TVShowEpisode[];
}