"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, XIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

import { LogoIcon } from "@/components/icons";
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
import { useConfetti } from "@/context/use-confetti";
import { useServerAction } from "@/hooks/use-server-action";
import { cn } from "@/lib/utils";
import { type UserSession } from "@/types/auth";
import { type SearchResult } from "@/types/tmdb";

import {
  addTitleHive,
  findTitleSeasons,
  searchTitle,
  type SeasonData,
} from "../../actions";
import {
  searchFormSchema,
  type HiveFormValues,
  type TitleFormValues,
} from "../../validations";
import ConfirmTitleCard from "./confirm-title-card";
import { StepperFooter } from "./stepper/stepper-footer";
import { StepperFormActions } from "./stepper/stepper-form-actions";
import { HiveFormStep } from "./stepper/steps/hive-form-step";
import { TitleFormStep } from "./stepper/steps/title-form-step";

export default function AddTitleToHive({
  user,
  className,
}: {
  user: UserSession;
  className?: string;
}) {
  const searchForm = useForm<z.infer<typeof searchFormSchema>>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      query: "",
    },
  });
  const { tossConfetti } = useConfetti();
  const router = useRouter();

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
  const [getTitleSearchAction, isGetTitleSearchPending] =
    useServerAction(searchTitle);
  const [titleSeasons, setTitleSeasons] = useState<SeasonData[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const { execute: findTitleSeasonsAction } = useAction(findTitleSeasons, {
    onSuccess: (data) => setTitleSeasons(data),
  });

  const { execute: AddTitleAction, status: AddTitleStatus } = useAction(
    addTitleHive,
    {
      onSuccess: ({ success, error }) => {
        if (success) {
          setIsSuccess(true);
          toast.success("Title added to your Hive", {
            id: "add-title",
          });

          if (hiveFormValues && hiveFormValues.status === "FINISHED") {
            tossConfetti();
          }

          setHiveFormValues(undefined);
          setTitleFormValues(undefined);
          setSelectedTitleData(undefined);

          router.refresh();
        } else {
          setIsSuccess(false);
          toast.error(error.reason, {
            id: "add-title",
          });
        }
      },
      onExecute: () => {
        toast.loading("Adding Title to your Hive", {
          id: "add-title",
        });
      },
      onError: () => {
        toast.error("Error adding title to your hive", {
          id: "add-title",
        });
      },
    },
  );

  async function handleSearch(values: z.infer<typeof searchFormSchema>) {
    const searchResult = await getTitleSearchAction({
      query: values.query,
    });

    const filteredResults = searchResult?.results.filter(
      (result) => result.overview && result.poster_path,
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
    if (!hiveFormValues || !titleFormValues) return false;

    AddTitleAction({ hiveFormValues, titleFormValues });

    return true;
  }

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button
          type="button"
          onClick={handleSearchFocus}
          size="lg"
          className={cn(
            "group relative flex items-center justify-between gap-4 align-middle font-bold",
            className,
          )}
        >
          <span>Add Title</span>
          <LogoIcon className="size-4" />
          <PlusIcon className="absolute right-[25px] top-[22px] size-2 stroke-[4px] group-hover:animate-pulse" />
        </Button>
      </DrawerTrigger>
      <DrawerContent
        direction="right"
        className="left-auto right-0 top-0 mt-0 h-screen w-full rounded-none pb-4 md:w-[90vw]"
      >
        <div className="mx-auto h-full w-full overflow-y-auto p-1 scrollbar scrollbar-track-muted scrollbar-thumb-foreground scrollbar-thumb-rounded-md scrollbar-w-2">
          <DrawerHeader>
            <DrawerTitle>Add Title to Your Hive</DrawerTitle>
            <DrawerDescription>
              Your hive is a collection of your movies and series that
              you&apos;re currently watching, have watched, or that you want to
              watch.
            </DrawerDescription>
          </DrawerHeader>
          <div className="mb-8 flex w-full flex-col gap-4 p-3 sm:mb-0">
            <Stepper
              size="sm"
              variant="circle-alt"
              responsive={false}
              className="sticky top-2 z-10 w-full rounded-md p-2 text-sm backdrop-blur supports-[backdrop-filter]:bg-muted/60"
              scrollTracking
              initialStep={0}
              steps={[
                {
                  label: "Search Title",
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
                    <div className="grid w-full grid-cols-4 gap-4 md:grid-cols-12">
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
                        disabled={isGetTitleSearchPending}
                        type="submit"
                        className="col-span-2"
                      >
                        {isGetTitleSearchPending ? (
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
                        <XIcon className="ml-2 size-4" />
                      </Button>
                    </div>
                  </form>
                </Form>
                <TitleFormStep
                  handleSeasons={(tmdbId: number) =>
                    findTitleSeasonsAction({ tmdbId })
                  }
                  setSelectedTitleData={setSelectedTitleData}
                  handleSearchClear={handleSearchClear}
                  setFormValues={(values) => setTitleFormValues(values)}
                  isSubmitSuccessful={searchForm.formState.isSubmitSuccessful}
                  searchResults={searchResults}
                />
              </Step>
              <Step label="Add Title">
                <HiveFormStep
                  type={
                    selectedTitleData?.media_type === "movie"
                      ? "MOVIE"
                      : "SERIES"
                  }
                  selectedTitleData={selectedTitleData}
                  titleSeasons={titleSeasons}
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
                  isSubmitSuccessful={isSuccess}
                  setIsSubmitSuccessful={setIsSuccess}
                  isSubmitFnPending={AddTitleStatus === "executing"}
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
