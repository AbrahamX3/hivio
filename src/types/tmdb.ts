export type SearchResult = Series | Movie;

export interface Series {
  backdrop_path: string;
  id: number;
  original_name: string;
  overview: string;
  poster_path: string;
  media_type: "tv";
  adult: boolean;
  name: string;
  original_language: string;
  genre_ids: number[];
  popularity: number;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  origin_country: string[];
}

export interface Movie {
  backdrop_path: string;
  id: number;
  original_title: string;
  overview: string;
  poster_path: string;
  media_type: "movie";
  adult: boolean;
  title: string;
  original_language: string;
  genre_ids: number[];
  popularity: number;
  release_date: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

export interface MultiSearch {
  page: number;
  results: SearchResult[];
  total_pages: number;
  total_results: number;
}
