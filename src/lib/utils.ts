import { clsx, type ClassValue } from "clsx";
import { ImageLoaderProps } from "next/image";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertMinutesToHrMin(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}min`;
  }

  return `${hours}h ${remainingMinutes}min`;
}

export const tmdbImageLoader = ({ src, width }: ImageLoaderProps): string => {
  let size = "w500";

  if (width <= 92) size = "w92";
  else if (width <= 154) size = "w154";
  else if (width <= 185) size = "w185";
  else if (width <= 342) size = "w342";
  else if (width <= 500) size = "w500";
  else if (width <= 780) size = "w780";
  else size = "original";

  return `https://image.tmdb.org/t/p/${size}${src}`;
};
