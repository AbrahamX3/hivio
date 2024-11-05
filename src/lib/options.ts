import {
	ActivityIcon,
	BookIcon,
	CheckCircle2,
	Clapperboard,
	Film,
	FlaskConicalIcon,
	HeartIcon,
	HelpCircle,
	HistoryIcon,
	MusicIcon,
	PersonStandingIcon,
	PlayCircle,
	SailboatIcon,
	SearchIcon,
	SliceIcon,
	UsersIcon,
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
	{ value: 12, label: "Adventure", icon: SailboatIcon },
	{ value: 14, label: "Fantasy", icon: Film },
	{ value: 16, label: "Animation", icon: Film },
	{ value: 18, label: "Drama", icon: Film },
	{ value: 27, label: "Horror", icon: Film },
	{ value: 28, label: "Action", icon: ActivityIcon },
	{ value: 35, label: "Comedy", icon: Film },
	{ value: 36, label: "History", icon: HistoryIcon },
	{ value: 37, label: "Western", icon: Film },
	{ value: 53, label: "Thriller", icon: Film },
	{ value: 80, label: "Crime", icon: SliceIcon },
	{ value: 99, label: "Documentary", icon: BookIcon },
	{ value: 878, label: "Science Fiction", icon: FlaskConicalIcon },
	{ value: 9648, label: "Mystery", icon: SearchIcon },
	{ value: 10402, label: "Music", icon: MusicIcon },
	{ value: 10749, label: "Romance", icon: HeartIcon },
	{ value: 10751, label: "Family", icon: UsersIcon },
	{ value: 10752, label: "War", icon: Film },
	{ value: 10759, label: "Action & Adventure", icon: Film },
	{ value: 10762, label: "Kids", icon: PersonStandingIcon },
	{ value: 10763, label: "News", icon: Film },
	{ value: 10764, label: "Reality", icon: Film },
	{ value: 10765, label: "Sci-Fi & Fantasy", icon: Film },
	{ value: 10766, label: "Soap", icon: Film },
	{ value: 10767, label: "Talk", icon: Film },
	{ value: 10768, label: "War & Politics", icon: Film },
	{ value: 10770, label: "TV Movie", icon: Film },
];
