"use client";

import {
  addTitle,
  searchTitle,
} from "@/app/(dashboard)/dashboard/_actions/add-to-hive";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { Step, Stepper } from "@/components/ui/stepper";
import { useServerAction } from "@/hooks/use-server-action";
import { UserSession } from "@/lib/auth";
import { SearchResult } from "@/types/tmdb";
import { zodResolver } from "@hookform/resolvers/zod";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import ConfirmTitleCard from "./confirm-title-card";
import { StepperFooter } from "./stepper-footer";
import { StepperFormActions } from "./stepper-form-actions";
import { HiveFormStep, HiveFormValues } from "./steps/hive-form-step";
import { TitleFormStep, TitleFormValues } from "./steps/title-form-step";

const searchFormSchema = z.object({
  query: z.string().min(1, {
    message: "Search query is required",
  }),
});

export type SearchFormValues = z.infer<typeof searchFormSchema>;

export default function AddTitle({ user }: { user: UserSession }) {
  const searchForm = useForm<z.infer<typeof searchFormSchema>>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      query: "",
    },
  });

  const [hiveFormValues, setHiveFormValues] = useState<
    HiveFormValues | undefined
  >(undefined);
  const [titleFormValues, setTitleFormValues] = useState<
    TitleFormValues | undefined
  >(undefined);
  const [selectedTitleData, setSelectedTitleData] = useState<
    SearchResult | undefined
  >(undefined);

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchTitleAction, isTitleSearchPending] =
    useServerAction(searchTitle);

  const [addTitleAction, isAddTitlePending] = useServerAction(addTitle);

  async function handleSearch(values: z.infer<typeof searchFormSchema>) {
    const searchResult = await searchTitleAction({
      query: values.query,
    });

    const filteredResults = searchResult?.results.filter(
      (result) => result.overview
    );

    setSearchResults(filteredResults ?? []);
  }

  function handleSearchClear() {
    searchForm.reset();
    setSearchResults([]);
  }

  function handleSearchFocus() {
    const timeout = setTimeout(() => {
      searchForm.setFocus("query");
    }, 100);

    return () => clearTimeout(timeout);
  }

  function handleSubmit() {
    if (!hiveFormValues || !titleFormValues || !selectedTitleData) return;

    toast.promise<string | undefined>(
      addTitleAction({
        hiveFormValues,
        titleFormValues,
        selectedTitleData,
      }),
      {
        loading: "Adding Title to your Hive...",
        success: (id: string | undefined) => {
          if (!id) return;
          // reward();
          console.log(id);
          return `Title added to your Hive correctly!`;
        },
        error: (error) => {
          return error;
        },
      }
    );
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          type="button"
          onClick={handleSearchFocus}
          size="lg"
          className="font-bold"
        >
          Add Title to Hive
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[95%]">
        <div className="mx-auto w-full overflow-y-auto h-full scrollbar scrollbar-track-muted scrollbar-thumb-foreground scrollbar-thumb-rounded-md scrollbar-w-2 selection:bg-gray-600 selection:text-white">
          <DrawerHeader>
            <DrawerTitle>Add Title to Your Hive</DrawerTitle>
            <DrawerDescription>
              Add a movie or series to your hive. Your hive is a collection of
              your movies and series that you&apos;re currently watching, have
              watched, or that you want to watch.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex w-full p-4 pb-0 flex-col gap-4">
            <Stepper
              size="sm"
              variant="circle-alt"
              responsive={false}
              className="sticky top-2 z-10 w-full p-2 rounded-md backdrop-blur supports-[backdrop-filter]:bg-muted/60"
              scrollTracking
              initialStep={0}
              steps={[
                {
                  label: "Search Title",
                  description:
                    "Search for a movie or series to add to your hive.",
                },
                {
                  label: "Add Title",
                },
                {
                  label: "Confirm",
                },
              ]}
            >
              <Step label="Search Title">
                <Form {...searchForm}>
                  <form
                    onSubmit={searchForm.handleSubmit(handleSearch)}
                    className="space-y-8"
                  >
                    <div className="grid w-full grid-cols-4 md:grid-cols-12 gap-4 pb-4">
                      <FormField
                        control={searchForm.control}
                        name="query"
                        render={({ field }) => (
                          <FormItem className="col-span-4 md:col-span-8">
                            <FormControl>
                              <Input
                                type="text"
                                autoComplete="off"
                                aria-label="Search for a title"
                                placeholder="Search for a title..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        disabled={isTitleSearchPending}
                        type="submit"
                        className="col-span-2"
                      >
                        {isTitleSearchPending ? (
                          <span>Searching...</span>
                        ) : (
                          <span>Search</span>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="col-span-2"
                        onClick={handleSearchClear}
                        aria-label="Clear search query"
                      >
                        <span>Clear</span>
                        <XIcon className="size-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </Form>
                <TitleFormStep
                  setSelectedTitleData={setSelectedTitleData}
                  handleSearchClear={handleSearchClear}
                  setFormValues={(values) => setTitleFormValues(values)}
                  isSubmitSuccessful={searchForm.formState.isSubmitSuccessful}
                  searchResults={searchResults}
                />
              </Step>
              <Step label="Add Title">
                <HiveFormStep
                  setFormValues={(values) => setHiveFormValues(values)}
                  defaultStatus={user.status}
                />
              </Step>
              <Step label="Confirm Details">
                <ConfirmTitleCard
                  selectedTitle={selectedTitleData}
                  hiveFormValues={hiveFormValues}
                />
                <StepperFormActions
                  isSubmitFnPending={isAddTitlePending}
                  submitFn={handleSubmit}
                />
              </Step>
              <StepperFooter />
            </Stepper>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
