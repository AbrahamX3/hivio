import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { useStepper } from "@/components/ui/stepper";
import { SearchResult } from "@/types/tmdb";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import SearchTitleCard from "../search-title-card";
import { StepperFormActions } from "../stepper-form-actions";

const titleFormSchema = z.object({
  tmdbId: z.coerce.number().min(1, {
    message: "Select a movie or series by clicking on a card.",
  }),
});

export type TitleFormValues = z.infer<typeof titleFormSchema>;

interface TitleFormStepProps {
  isSubmitSuccessful: boolean;
  searchResults: SearchResult[];
  setFormValues: (values: TitleFormValues) => void;
  handleSearchClear: () => void;
  setSelectedTitleData: (data: SearchResult | undefined) => void;
}

export function TitleFormStep({
  isSubmitSuccessful,
  searchResults,
  setFormValues,
  handleSearchClear,
  setSelectedTitleData,
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
      (result) => result.id === values.tmdbId
    );
    setSelectedTitleData(selectedTitle);
    nextStep();
    handleSearchClear();
  }

  return (
    <div className="w-full relative pb-4">
      {isSubmitSuccessful ? (
        searchResults.length > 0 ? (
          <form
            onSubmit={titleForm.handleSubmit(handleSubmit)}
            className="mx-auto max-w-[78%] md:lg:max-w-[90%] lg:max-w-[93%] md:w-full min-w-0"
          >
            <Carousel
              opts={{
                startIndex: 0,
              }}
            >
              <CarouselContent className="p-4 gap-2">
                {searchResults.map((result) => (
                  <CarouselItem
                    key={result.id}
                    onClick={() => {
                      if (titleForm.watch("tmdbId") !== result.id) {
                        titleForm.setValue("tmdbId", result.id);
                      } else {
                        titleForm.setValue("tmdbId", 0);
                      }
                    }}
                    className="basis-full mx-auto lg:basis-1/2 xl:basis-1/3 transition-transform duration-75 cursor-pointer hover:scale-105"
                  >
                    <SearchTitleCard
                      result={result}
                      selectedTitleId={titleForm.watch("tmdbId")}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious type="button" />
              <CarouselNext type="button" />
            </Carousel>
            {titleForm.formState.errors.tmdbId && (
              <p className="mx-auto flex gap-2 mb-2 items-center align-middle justify-center text-center border text-foreground rounded-md bg-destructive p-2">
                <CircleAlertIcon className="size-4" />{" "}
                {titleForm.formState.errors.tmdbId.message}
              </p>
            )}
            <StepperFormActions />
          </form>
        ) : (
          <div className="flex w-full flex-col items-center justify-center rounded-md border border-dashed p-8 animate-in fade-in-50">
            No results found using your search.
          </div>
        )
      ) : (
        <div className="flex w-full flex-col items-center justify-center rounded-md border border-dashed p-8 animate-in fade-in-50">
          Search for a movie or series to add to your list.
        </div>
      )}
    </div>
  );
}
