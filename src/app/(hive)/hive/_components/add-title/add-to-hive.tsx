"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, XIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  addTitleToHive,
  searchTitle as getTitleSearch,
} from "@/app/(hive)/hive/_actions/hive";
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
import { type UserSession } from "@/types/auth";
import { type SearchResult } from "@/types/tmdb";

import ConfirmTitleCard from "./confirm-title-card";
import { StepperFooter } from "./stepper/stepper-footer";
import { StepperFormActions } from "./stepper/stepper-form-actions";
import {
  HiveFormStep,
  type HiveFormValues,
} from "./stepper/steps/hive-form-step";
import {
  TitleFormStep,
  type TitleFormValues,
} from "./stepper/steps/title-form-step";

const searchFormSchema = z.object({
  query: z.string().min(1, {
    message: "Search query is required",
  }),
});
export type SearchFormValues = z.infer<typeof searchFormSchema>;

export default function AddTitleToHive({ user }: { user: UserSession }) {
  const searchForm = useForm<z.infer<typeof searchFormSchema>>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      query: "",
    },
  });
  const { tossConfetti } = useConfetti();

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
    useServerAction(getTitleSearch);

  const [isAddTitlePending, setIsAddTitlePending] = useState(false);

  async function handleSearch(values: z.infer<typeof searchFormSchema>) {
    const searchResult = await getTitleSearchAction({
      query: values.query,
    });

    const filteredResults = searchResult?.results.filter(
      (result) => result.overview,
    );

    setSearchResults(filteredResults ?? []);
  }

  function handleSearchClear() {
    searchForm.reset();
    setSearchResults([]);
  }

  const router = useRouter();

  function handleSearchFocus() {
    const timeout = setTimeout(() => {
      searchForm.setFocus("query");
    }, 100);

    return () => clearTimeout(timeout);
  }

  async function handleSubmit() {
    let isSuccess = false;

    if (!hiveFormValues || !titleFormValues || !selectedTitleData)
      return isSuccess;

    setIsAddTitlePending(true);
    toast.loading("Adding Title to your Hive", {
      id: "add-title",
    });

    await addTitleToHive({
      hiveFormValues,
      titleFormValues,
      selectedTitleData,
    })
      .then((id) => {
        if (!id) return;

        toast.success("Title added to your Hive", {
          id: "add-title",
        });

        if (hiveFormValues.status === "FINISHED") {
          tossConfetti();
        }

        setHiveFormValues(undefined);
        setTitleFormValues(undefined);
        setSelectedTitleData(undefined);
        isSuccess = true;
        router.refresh();
      })
      .catch((error) => {
        toast.error(String(error), {
          id: "add-title",
        });

        isSuccess = false;
      })
      .finally(() => {
        setIsAddTitlePending(false);
      });

    return isSuccess;
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          type="button"
          onClick={handleSearchFocus}
          size="lg"
          className="group relative flex items-center justify-between gap-4 align-middle font-bold"
        >
          <span>Add to Hive</span>
          <LogoIcon className="size-4" />
          <PlusIcon className="absolute right-[25px] top-[22px] size-2 stroke-[4px] group-hover:animate-pulse" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[95%]">
        <div className="mx-auto h-full w-full overflow-y-auto scrollbar scrollbar-track-muted scrollbar-thumb-foreground scrollbar-thumb-rounded-md scrollbar-w-2">
          <DrawerHeader>
            <DrawerTitle>Add Title to Your Hive</DrawerTitle>
            <DrawerDescription>
              Add a movie or series to your hive. Your hive is a collection of
              your movies and series that you&apos;re currently watching, have
              watched, or that you want to watch.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex w-full flex-col gap-4 p-4 pb-0">
            <Stepper
              size="sm"
              variant="circle-alt"
              responsive={false}
              className="sticky top-2 z-10 w-full rounded-md p-2 backdrop-blur supports-[backdrop-filter]:bg-muted/60"
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
                    <div className="grid w-full grid-cols-4 gap-4 pb-4 md:grid-cols-12">
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
