"use client";

import { createContext, useContext, useState } from "react";
import { toast } from "sonner";

import {
  getMovieCredits,
  getSeriesCredits,
} from "@/app/(dashboard)/dashboard/_actions/tmdb";
import { useServerAction } from "@/hooks/use-server-action";
import { MovieCredits, SeriesCredits } from "@/types/tmdb";

type SelectedTitle = {
  id: string;
  tmdbId: number;
  type: "MOVIE" | "SERIES";
};

interface TitleDetailsContextType {
  selectedTitle: SelectedTitle | null;
  movieCredits: MovieCredits | null;
  seriesCredits: SeriesCredits | null;
  isPendingMovieCredits: boolean;
  isPendingSeriesCredits: boolean;
  setSelectedTitle: (value: SelectedTitle | null) => SelectedTitle | null;
}

const TitleDetailsContext = createContext<TitleDetailsContextType>({
  selectedTitle: null,
  movieCredits: null,
  seriesCredits: null,
  isPendingMovieCredits: false,
  isPendingSeriesCredits: false,
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

  const [movieCredits, setMovieCredits] = useState<MovieCredits | null>(null);
  const [seriesCredits, setSeriesCredits] = useState<SeriesCredits | null>(
    null,
  );

  const handleSelectedTitle = (value: SelectedTitle | null) => {
    setSelectedTitle(value);

    if (value?.type === "MOVIE") {
      setSeriesCredits(null);
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
        isPendingMovieCredits: isGetMovieCreditsPending,
        isPendingSeriesCredits: isGetSeriesCreditsPending,
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
