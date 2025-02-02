import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import {
	type TitleFormValues,
	titleFormSchema,
} from "@/app/(dashboard)/app/validations";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { useStepper } from "@/components/ui/stepper";
import type { SearchResult } from "@/types/tmdb";

import SearchTitleCard from "../../search-title-card";

interface TitleFormStepProps {
	isSubmitSuccessful: boolean;
	searchResults: SearchResult[];
	setFormValues: (values: TitleFormValues) => void;
	handleSearchClear: () => void;
	setSelectedTitleData: (data: SearchResult | undefined) => void;
	handleSeasons: (tmdbId: number) => void;
}

export function TitleFormStep({
	isSubmitSuccessful,
	searchResults,
	setFormValues,
	handleSearchClear,
	setSelectedTitleData,
	handleSeasons,
}: TitleFormStepProps) {
	const { nextStep } = useStepper();

	const titleForm = useForm<TitleFormValues>({
		resolver: zodResolver(titleFormSchema),
		defaultValues: {
			tmdbId: 0,
		},
	});

	function handleSubmit(values: TitleFormValues) {
		setFormValues(values);
		const selectedTitle = searchResults.find(
			(result) => result.id === values.tmdbId,
		);

		if (selectedTitle?.media_type === "tv") {
			handleSeasons(values.tmdbId);
		}

		setSelectedTitleData(selectedTitle);
		nextStep();
		handleSearchClear();
	}

	return (
		<div className="relative mx-auto w-full rounded-md border p-4">
			{isSubmitSuccessful ? (
				searchResults.length > 0 ? (
					<form
						onSubmit={titleForm.handleSubmit(handleSubmit)}
						className="mx-auto min-w-0 max-w-[78%] md:w-full lg:max-w-[93%] md:lg:max-w-[90%]"
					>
						<Carousel data-vaul-no-drag>
							<CarouselContent className="w-full max-w-[380px] xs:max-w-[300px] sm:max-w-[400px] md:max-w-[550px]">
								{searchResults.map((result) => (
									<CarouselItem
										key={result.id}
										onClick={() => {
											if (titleForm.watch("tmdbId") !== result.id) {
												titleForm.setValue("tmdbId", result.id);
												titleForm.setValue("type", result.media_type);
											} else {
												titleForm.setValue("tmdbId", 0);
											}
										}}
										className="basis-full md:basis-1/2 lg:basis-2/3 xl:basis-1/2"
									>
										<SearchTitleCard
											result={result}
											selectedTitleId={titleForm.watch("tmdbId")}
										/>
									</CarouselItem>
								))}
							</CarouselContent>
							<CarouselPrevious className="-right-8" type="button" />
							<CarouselNext className="-right-8" type="button" />
						</Carousel>
						{titleForm.formState.errors.tmdbId && (
							<p className="mx-auto mb-2 flex items-center justify-center gap-2 rounded-md border bg-destructive p-2 text-center align-middle text-foreground">
								<CircleAlertIcon className="size-4" />{" "}
								{titleForm.formState.errors.tmdbId.message}
							</p>
						)}
					</form>
				) : (
					<div
						data-vaul-no-drag
						className="fade-in-50 flex w-full animate-in flex-col items-center justify-center rounded-md border border-dashed p-8"
					>
						No results found using your search.
					</div>
				)
			) : (
				<div
					data-vaul-no-drag
					className="fade-in-50 flex h-[50%] w-full flex-1 animate-in flex-col items-center justify-center rounded-md border border-dashed p-8"
				>
					Search for a movie or series to add to your list.
				</div>
			)}
		</div>
	);
}
