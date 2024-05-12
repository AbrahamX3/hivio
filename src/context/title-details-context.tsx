"use client";

import { createContext, useContext, useState } from "react";
import { toast } from "sonner";

import {
  getMovieCredits,
  getMovieDetails,
  getSeriesCredits,
  getSeriesDetails,
} from "@/app/(hive)/hive/_actions/tmdb";
import { useServerAction } from "@/hooks/use-server-action";
import {
  MovieCredits,
  MovieDetails,
  SeriesCredits,
  SeriesDetails,
} from "@/types/tmdb";

type SelectedTitle = {
  id: string;
  tmdbId: number;
  type: "MOVIE" | "SERIES";
};

interface TitleDetailsContextType {
  selectedTitle: SelectedTitle | null;
  setSelectedTitle: (value: SelectedTitle | null) => SelectedTitle | null;
  movieCredits: MovieCredits | null;
  seriesCredits: SeriesCredits | null;
  isGetMovieCreditsPending: boolean;
  isGetSeriesCreditsPending: boolean;
  movieDetails: MovieDetails | null;
  seriesDetails: SeriesDetails | null;
  isGetMovieDetailsPending: boolean;
  isGetSeriesDetailsPending: boolean;
}

const TitleDetailsContext = createContext<TitleDetailsContextType>({
  selectedTitle: null,
  movieCredits: null,
  seriesCredits: null,
  movieDetails: null,
  seriesDetails: null,
  isGetMovieCreditsPending: false,
  isGetSeriesCreditsPending: false,
  isGetMovieDetailsPending: false,
  isGetSeriesDetailsPending: false,
  setSelectedTitle: (value: SelectedTitle | null) => value,
});

export function TitleDetailsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedTitle, setSelectedTitle] = useState<SelectedTitle | null>(
    null,
  );
  const [getMovieCreditsAction, isGetMovieCreditsPending] =
    useServerAction(getMovieCredits);

  const [getSeriesCreditsAction, isGetSeriesCreditsPending] =
    useServerAction(getSeriesCredits);

  const [getSeriesDetailsAction, isGetSeriesDetailsPending] =
    useServerAction(getSeriesDetails);

  const [getMovieDetailsAction, isGetMovieDetailsPending] =
    useServerAction(getMovieDetails);

  const [movieCredits, setMovieCredits] = useState<MovieCredits | null>(null);
  const [seriesCredits, setSeriesCredits] = useState<SeriesCredits | null>(
    null,
  );

  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
  const [seriesDetails, setSeriesDetails] = useState<SeriesDetails | null>(
    null,
  );

  const handleSelectedTitle = (value: SelectedTitle | null) => {
    setSelectedTitle(value);

    if (value?.type === "MOVIE") {
      setSeriesCredits(null);
      setSeriesDetails(null);

      getMovieDetailsAction({
        tmdbId: value.tmdbId,
      })
        .then((data) => {
          if (!data) return;

          setMovieDetails(data);
        })
        .catch((error) => {
          toast.error("Error getting movie details", {
            description: error.message,
          });
        });

      getMovieCreditsAction({
        tmdbId: value.tmdbId,
      })
        .then((data) => {
          if (!data) return;

          setMovieCredits(data);
        })
        .catch((error) => {
          toast.error("Error getting movie credits", {
            description: error.message,
          });
        });
    } else if (value?.type === "SERIES") {
      setMovieCredits(null);
      setMovieDetails(null);

      getSeriesDetailsAction({
        tmdbId: value.tmdbId,
      })
        .then((data) => {
          if (!data) return;

          setSeriesDetails(data);
        })
        .catch((error) => {
          toast.error("Error getting series details", {
            description: error.message,
          });
        });

      getSeriesCreditsAction({
        tmdbId: value.tmdbId,
      })
        .then((data) => {
          if (!data) return;
          setSeriesCredits(data);
        })
        .catch((error) => {
          toast.error("Error getting series credits", {
            description: error.message,
          });
        });
    } else {
      setMovieCredits(null);
      setSeriesCredits(null);
    }

    return value;
  };

  return (
    <TitleDetailsContext.Provider
      value={{
        movieCredits,
        seriesCredits,
        movieDetails,
        seriesDetails,
        isGetMovieDetailsPending,
        isGetSeriesDetailsPending,
        isGetMovieCreditsPending,
        isGetSeriesCreditsPending,
        selectedTitle: selectedTitle,
        setSelectedTitle: handleSelectedTitle,
      }}
    >
      {children}
    </TitleDetailsContext.Provider>
  );
}

export const useTitleDetails = () => {
  const context = useContext(TitleDetailsContext);
  if (!context) {
    throw new Error(
      "useTitleDetails must be used within a TitleDetailsProvider",
    );
  }
  return context;
};
