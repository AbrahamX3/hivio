"use client";

import { searchTitle } from "@/app/(dashboard)/dashboard/_actions/list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Step, Stepper, useStepper } from "@/components/ui/stepper";
import { useServerAction } from "@/hooks/use-server-action";
import { statusOptions } from "@/lib/options";
import { cn } from "@/lib/utils";
import { SearchResult } from "@/types/tmdb";
import { zodResolver } from "@hookform/resolvers/zod";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  tmdbId: z.string().min(1),
  status: z.enum(["UPCOMING", "PENDING", "WATCHING", "UNFINISHED", "FINISHED"]),
});

const searchFormSchema = z.object({
  query: z.string().min(1, {
    message: "Search query is required",
  }),
});

export default function AddTitle() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tmdbId: "",
      status: "WATCHING",
    },
  });

  const searchForm = useForm<z.infer<typeof searchFormSchema>>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      query: "",
    },
  });

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedTitleId, setSelectedTitleId] = useState(0);

  const [searchTitleAction, isTitleSearchPending] =
    useServerAction(searchTitle);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  async function handleSearch(values: z.infer<typeof searchFormSchema>) {
    const searchResult = await searchTitleAction({
      query: values.query,
    });
    setSearchResults(searchResult?.results ?? []);
  }

  function handleClear() {
    searchForm.reset();
    setSearchResults([]);
    setSelectedTitleId(0);
  }

  function handleSelect(id: number) {
    if (selectedTitleId !== id) {
      setSelectedTitleId(id);
    } else {
      setSelectedTitleId(0);
    }
  }
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Add New Title</Button>
      </DrawerTrigger>
      <DrawerContent className="h-[95%]">
        <div className="mx-auto w-full overflow-y-auto h-full">
          <DrawerHeader>
            <DrawerTitle>Add New Title</DrawerTitle>
            <DrawerDescription>
              Add a new movie or series to your list.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex w-full p-4 pb-0 flex-col gap-4">
            <Stepper
              size="sm"
              responsive={false}
              className="sticky top-0 z-10 w-full p-3 rounded-md backdrop-blur supports-[backdrop-filter]:bg-muted/60"
              scrollTracking
              initialStep={0}
              steps={[
                {
                  label: "Search Title",
                },
                {
                  label: "Add Title",
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
                        onClick={handleClear}
                        aria-label="Clear search query"
                      >
                        <span>Clear</span>
                        <XIcon className="size-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </Form>
                <div className="w-full relative pb-4">
                  {searchForm.formState.isSubmitSuccessful ? (
                    searchResults.length > 0 ? (
                      <div className="mx-auto max-w-[78%] md:max-w-[88%] md:w-full min-w-0">
                        <Carousel
                          opts={{
                            loop: true,
                            align: "center",
                            startIndex: 0,
                          }}
                        >
                          <CarouselContent>
                            {searchResults.map((result) => (
                              <CarouselItem
                                key={result.id}
                                onClick={() => handleSelect(result.id)}
                                className="md:basis-1/2 lg:basis-1/3 cursor-pointer"
                              >
                                <Card
                                  className={cn(
                                    "max-w-md md:max-w-2xl w-full",
                                    selectedTitleId === result.id &&
                                      "border-green-500 border-2"
                                  )}
                                >
                                  {result.media_type === "movie" ? (
                                    <>
                                      <CardHeader className="grid gap-1 p-4">
                                        <CardTitle className="flex items-center gap-2 align-middle">
                                          {result.title} <Badge>Movie</Badge>
                                        </CardTitle>
                                        <CardDescription>
                                          {result.overview}
                                        </CardDescription>
                                      </CardHeader>
                                      <CardContent className="p-4">
                                        <p className="text-3xl font-semibold">
                                          {result.vote_average}
                                        </p>
                                      </CardContent>
                                    </>
                                  ) : (
                                    <>
                                      <CardHeader className="grid gap-1 p-4">
                                        <CardTitle className="flex items-center gap-2 align-middle">
                                          {result.name} <Badge>Series</Badge>
                                        </CardTitle>
                                        <CardDescription>
                                          {result.overview}
                                        </CardDescription>
                                      </CardHeader>
                                      <CardContent className="p-4">
                                        <p className="text-3xl font-semibold">
                                          {result.vote_average}
                                        </p>
                                      </CardContent>
                                    </>
                                  )}
                                </Card>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious />
                          <CarouselNext />
                        </Carousel>
                      </div>
                    ) : (
                      <div className="flex w-full flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
                        No results found using your search.
                      </div>
                    )
                  ) : (
                    <div className="flex w-full flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
                      Search for a movie or series to add to your list.
                    </div>
                  )}
                </div>
              </Step>
              <Step label="Add Title">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                  >
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full truncate">
                                <SelectValue placeholder="Select the status..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectSeparator />
                              <ScrollArea className="h-40 w-full">
                                {statusOptions.map((item) => (
                                  <SelectItem
                                    key={item.value}
                                    title={item.label}
                                    value={item.value}
                                  >
                                    <div className="flex items-center gap-2 align-middle">
                                      <item.icon className="h-3 w-3" />
                                      <span>{item.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </ScrollArea>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </Step>
              <StepFooter />
            </Stepper>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function StepFooter() {
  const {
    nextStep,
    prevStep,
    resetSteps,
    isDisabledStep,
    hasCompletedAllSteps,
    isLastStep,
    isOptionalStep,
  } = useStepper();

  return (
    <>
      {hasCompletedAllSteps && (
        <div className="h-40 flex items-center justify-center my-4 border bg-secondary text-primary rounded-md">
          <h1 className="text-xl">Woohoo! All steps completed! 🎉</h1>
        </div>
      )}
      <div className="w-full flex justify-end gap-2">
        {hasCompletedAllSteps ? (
          <Button size="sm" onClick={resetSteps}>
            Reset
          </Button>
        ) : (
          <>
            <Button
              disabled={isDisabledStep}
              onClick={prevStep}
              size="sm"
              variant="secondary"
            >
              Prev
            </Button>
            <Button size="sm" onClick={nextStep}>
              {isLastStep ? "Finish" : isOptionalStep ? "Skip" : "Next"}
            </Button>
          </>
        )}
      </div>
    </>
  );
}
