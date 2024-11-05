"use client";

import { createContext, useContext, useState } from "react";

export type SelectedTitle = {
	id: string;
	tmdbId: number;
	type: "MOVIE" | "SERIES";
};

interface TitleDetailsContextType {
	selectedTitle: SelectedTitle | null;
	setSelectedTitle: (value: SelectedTitle | null) => SelectedTitle | null;
}

const TitleDetailsContext = createContext<TitleDetailsContextType>({
	selectedTitle: null,
	setSelectedTitle: (value: SelectedTitle | null) => value,
});

export function TitleDetailsProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [title, setTitle] = useState<SelectedTitle | null>(null);

	function handleSelectedTitle(value: SelectedTitle | null) {
		setTitle(value);

		return value;
	}

	return (
		<TitleDetailsContext.Provider
			value={{
				selectedTitle: title,
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
