import {
  CheckCircle2,
  Clapperboard,
  Film,
  HelpCircle,
  PlayCircle,
  XCircle,
} from "lucide-react";

export const typeOptions = [
  {
    value: "MOVIE",
    label: "Movie",
    icon: Film,
  },
  {
    value: "SERIES",
    label: "Series",
    icon: Clapperboard,
  },
];

export const statusOptions = [
  {
    value: "PENDING",
    label: "Pending",
    icon: HelpCircle,
  },
  {
    value: "WATCHING",
    label: "Watching",
    icon: PlayCircle,
  },
  {
    value: "UNFINISHED",
    label: "Unfinished",
    icon: XCircle,
  },
  {
    value: "FINISHED",
    label: "Finished",
    icon: CheckCircle2,
  },
];

export const mediaTypeOptions = [
  {
    value: "MOVIE",
    label: "Movie",
    icon: Film,
  },
  {
    value: "SERIES",
    label: "Series",
    icon: Clapperboard,
  },
];

export const genreOptions = [
  { value: 12, label: "Adventure", icon: Film },
  { value: 14, label: "Fantasy", icon: Film },
  { value: 16, label: "Animation", icon: Film },
  { value: 18, label: "Drama", icon: Film },
  { value: 27, label: "Horror", icon: Film },
  { value: 28, label: "Action", icon: Film },
  { value: 35, label: "Comedy", icon: Film },
  { value: 36, label: "History", icon: Film },
  { value: 37, label: "Western", icon: Film },
  { value: 53, label: "Thriller", icon: Film },
  { value: 80, label: "Crime", icon: Film },
  { value: 99, label: "Documentary", icon: Film },
  { value: 878, label: "Science Fiction", icon: Film },
  { value: 9648, label: "Mystery", icon: Film },
  { value: 10402, label: "Music", icon: Film },
  { value: 10749, label: "Romance", icon: Film },
  { value: 10751, label: "Family", icon: Film },
  { value: 10752, label: "War", icon: Film },
  { value: 10759, label: "Action & Adventure", icon: Film },
  { value: 10762, label: "Kvalues", icon: Film },
  { value: 10763, label: "News", icon: Film },
  { value: 10764, label: "Reality", icon: Film },
  { value: 10765, label: "Sci-Fi & Fantasy", icon: Film },
  { value: 10766, label: "Soap", icon: Film },
  { value: 10767, label: "Talk", icon: Film },
  { value: 10768, label: "War & Politics", icon: Film },
  { value: 10770, label: "TV Movie", icon: Film },
];
