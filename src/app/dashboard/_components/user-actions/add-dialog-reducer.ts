import type {
	Episode,
	MediaType,
	SearchResult,
	TitleDetails,
} from "@/types/history";

export interface AddDialogState {
	searchQuery: string;
	searchResults: SearchResult[];
	isSearching: boolean;
	mediaTypeFilter: "all" | MediaType;
	selectedResult: SearchResult | null;
	isAdding: boolean;
	isLoadingDetails: boolean;
	titleDetails: TitleDetails | null;
	selectedSeason: number | null;
	episodes: Episode[];
	isLoadingEpisodes: boolean;
}

export type AddDialogAction =
	| { type: "SET_SEARCH_QUERY"; query: string }
	| { type: "SET_SEARCH_RESULTS"; results: SearchResult[] }
	| { type: "SET_IS_SEARCHING"; isSearching: boolean }
	| { type: "SET_MEDIA_TYPE_FILTER"; filter: "all" | MediaType }
	| { type: "SELECT_RESULT"; result: SearchResult }
	| { type: "UPDATE_RESULT"; result: SearchResult }
	| { type: "SET_IS_ADDING"; isAdding: boolean }
	| { type: "SET_IS_LOADING_DETAILS"; isLoading: boolean }
	| { type: "SET_TITLE_DETAILS"; details: TitleDetails | null }
	| { type: "SET_SELECTED_SEASON"; season: number | null }
	| { type: "SET_EPISODES"; episodes: Episode[] }
	| { type: "SET_IS_LOADING_EPISODES"; isLoading: boolean }
	| {
			type: "RESET_TO_INITIAL";
			initialTitle?: SearchResult;
			initialDetails?: TitleDetails;
	  }
	| { type: "RESET_SEARCH" }
	| { type: "CLEAR_SELECTION" };

export function addDialogReducer(
	state: AddDialogState,
	action: AddDialogAction,
): AddDialogState {
	switch (action.type) {
		case "SET_SEARCH_QUERY":
			return { ...state, searchQuery: action.query };
		case "SET_SEARCH_RESULTS":
			return { ...state, searchResults: action.results };
		case "SET_IS_SEARCHING":
			return { ...state, isSearching: action.isSearching };
		case "SET_MEDIA_TYPE_FILTER":
			return { ...state, mediaTypeFilter: action.filter };
		case "SELECT_RESULT":
			return {
				...state,
				selectedResult: action.result,
				isLoadingDetails: true,
				titleDetails: null,
				selectedSeason: null,
				episodes: [],
			};
		case "UPDATE_RESULT":
			return { ...state, selectedResult: action.result };
		case "SET_IS_ADDING":
			return { ...state, isAdding: action.isAdding };
		case "SET_IS_LOADING_DETAILS":
			return { ...state, isLoadingDetails: action.isLoading };
		case "SET_TITLE_DETAILS":
			return { ...state, titleDetails: action.details };
		case "SET_SELECTED_SEASON":
			return { ...state, selectedSeason: action.season };
		case "SET_EPISODES":
			return { ...state, episodes: action.episodes };
		case "SET_IS_LOADING_EPISODES":
			return { ...state, isLoadingEpisodes: action.isLoading };
		case "RESET_TO_INITIAL":
			return {
				...state,
				selectedResult: action.initialTitle || null,
				titleDetails: action.initialDetails || null,
				selectedSeason: null,
				episodes: [],
				searchResults: [],
			};
		case "RESET_SEARCH":
			return {
				...state,
				searchQuery: "",
				searchResults: [],
				mediaTypeFilter: "all",
			};
		case "CLEAR_SELECTION":
			return {
				...state,
				selectedResult: null,
				titleDetails: null,
				selectedSeason: null,
				episodes: [],
				searchResults: [],
			};
		default:
			return state;
	}
}

export function getInitialState(
	initialTitle?: SearchResult,
	initialDetails?: TitleDetails,
): AddDialogState {
	return {
		searchQuery: "",
		searchResults: [],
		isSearching: false,
		mediaTypeFilter: "all",
		selectedResult: initialTitle || null,
		isAdding: false,
		isLoadingDetails: false,
		titleDetails: initialDetails || null,
		selectedSeason: null,
		episodes: [],
		isLoadingEpisodes: false,
	};
}
