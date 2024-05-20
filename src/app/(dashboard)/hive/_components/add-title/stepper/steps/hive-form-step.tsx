import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  CalendarCheck2Icon,
  CalendarIcon,
  CalendarMinusIcon,
  CalendarOffIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";

import { type SeasonData } from "@/app/(dashboard)/hive/actions";
import {
  hiveFormSchema,
  type HiveFormValues,
} from "@/app/(dashboard)/hive/validations";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStepper } from "@/components/ui/stepper";
import { Switch } from "@/components/ui/switch";
import { statusOptions } from "@/lib/options";
import { cn } from "@/lib/utils";
import { type SearchResult } from "@/types/tmdb";

import { StepperFormActions } from "../stepper-form-actions";

interface HiveFormStepProps {
  defaultStatus: "WATCHING" | "UNFINISHED" | "PENDING" | "FINISHED";
  setFormValues: (values: HiveFormValues) => void;
  titleSeasons: SeasonData[];
  selectedTitleData: SearchResult | undefined;
  type: "MOVIE" | "SERIES";
}

const createSeasonsMap = (titleSeasons: SeasonData[]) => {
  const seasonsMap = new Map<number, number[]>();

  titleSeasons.forEach((season) => {
    const episodesArray = Array.from(
      { length: season.episodes },
      (_, index) => index + 1,
    );
    seasonsMap.set(season.season, episodesArray);
  });

  return seasonsMap;
};

export function HiveFormStep({
  defaultStatus,
  setFormValues,
  titleSeasons,
  type,
  selectedTitleData,
}: HiveFormStepProps) {
  const { nextStep } = useStepper();

  const releaseDate =
    selectedTitleData?.media_type === "movie"
      ? selectedTitleData.release_date
      : selectedTitleData?.first_air_date;

  const isTitleWatchable = releaseDate && new Date() >= new Date(releaseDate);

  const hiveForm = useForm<HiveFormValues>({
    resolver: zodResolver(hiveFormSchema),
    defaultValues: {
      rating: 0,
      currentSeason: 1,
      currentEpisode: 1,
      startedAt: undefined,
    },
  });

  function handleSubmit(values: HiveFormValues) {
    setFormValues(values);

    nextStep();
  }

  const seasonsMap = useMemo(
    () => createSeasonsMap(titleSeasons),
    [titleSeasons],
  );

  const canSetSeason =
    hiveForm.watch("status") === "UNFINISHED" ||
    hiveForm.watch("status") === "WATCHING" ||
    hiveForm.watch("status") === "FINISHED";

  const currentSeason = hiveForm.watch("currentSeason");
  const episodes = seasonsMap.get(Number(currentSeason)) ?? [];

  const lastSeason = useMemo(
    () => titleSeasons.at(-1)?.season ?? 0,
    [titleSeasons],
  );
  const lastEpisode = useMemo(
    () => titleSeasons.at(-1)?.episodes ?? 0,
    [titleSeasons],
  );

  const isFinished = hiveForm.watch("status") === "FINISHED";

  useEffect(() => {
    if (type === "SERIES") {
      if (isFinished) {
        const timeout1 = setTimeout(() => {
          hiveForm.setValue("currentSeason", lastSeason);
        }, 100);
        const timeout2 = setTimeout(() => {
          hiveForm.setValue("currentEpisode", lastEpisode);
        }, 200);

        return () => {
          clearTimeout(timeout1);
          clearTimeout(timeout2);
        };
      } else {
        hiveForm.setValue("currentSeason", 1);
        hiveForm.setValue("currentEpisode", 1);
      }
    }
  }, [hiveForm, isFinished, lastEpisode, lastSeason, type]);

  return (
    <Form {...hiveForm}>
      <form
        onSubmit={hiveForm.handleSubmit(handleSubmit)}
        data-vaul-no-drag
        className="mx-auto w-full max-w-md space-y-8 pb-4"
      >
        <FormField
          control={hiveForm.control}
          name="status"
          defaultValue={
            isTitleWatchable ? defaultStatus ?? "WATCHING" : "PENDING"
          }
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel isRequired>Status</FormLabel>
              <Select
                disabled={!isTitleWatchable}
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
                  <ScrollArea className="h-30 w-full">
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

        {canSetSeason && type === "SERIES" && titleSeasons.length > 0 && (
          <>
            <FormField
              control={hiveForm.control}
              name="currentSeason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>Current Season</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={String(field.value)}
                    value={String(hiveForm.watch("currentSeason"))}
                    disabled={isFinished}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the season you are on" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {titleSeasons.map(({ season }) => (
                        <SelectItem
                          key={`season_${season}`}
                          value={String(season)}
                        >
                          Season {season}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {hiveForm.watch("currentSeason") !== 0 && (
              <FormField
                control={hiveForm.control}
                name="currentEpisode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>Current Episode</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={String(field.value)}
                      value={String(hiveForm.watch("currentEpisode"))}
                      disabled={isFinished}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select the episode you are on" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {episodes.map((episode) => (
                          <SelectItem
                            key={`episode_${episode}`}
                            value={String(episode)}
                          >
                            Episode {episode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        )}

        {canSetSeason && (
          <FormField
            control={hiveForm.control}
            name="startedAt"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date Started</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick start date</span>
                        )}
                        <CalendarIcon className="ml-auto size-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  <p>The date you started watching this title.</p>
                  <div className="flex w-full flex-wrap items-center gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => field.onChange(new Date())}
                    >
                      Today <CalendarCheck2Icon className="ml-2 size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        field.onChange(
                          new Date(Date.now() - 1000 * 60 * 60 * 24),
                        )
                      }
                    >
                      Yesterday <CalendarMinusIcon className="ml-2 size-4" />
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        field.onChange(
                          new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
                        )
                      }
                    >
                      2 days ago <CalendarMinusIcon className="ml-2 size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => field.onChange(undefined)}
                    >
                      Clear <CalendarOffIcon className="ml-2 size-4" />
                    </Button>
                  </div>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {isFinished && (
          <>
            <FormField
              control={hiveForm.control}
              name="finishedAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date Finished</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick finished date</span>
                          )}
                          <CalendarIcon className="ml-auto size-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    <p>The date you finished watching this title.</p>
                    <div className="flex w-full flex-wrap items-center gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => field.onChange(new Date())}
                      >
                        Today <CalendarCheck2Icon className="ml-2 size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          field.onChange(
                            new Date(Date.now() - 1000 * 60 * 60 * 24),
                          )
                        }
                      >
                        Yesterday <CalendarMinusIcon className="ml-2 size-4" />
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          field.onChange(
                            new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
                          )
                        }
                      >
                        2 days ago <CalendarMinusIcon className="ml-2 size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => field.onChange(undefined)}
                      >
                        Clear <CalendarOffIcon className="ml-2 size-4" />
                      </Button>
                    </div>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={hiveForm.control}
              name="isFavorite"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Was this a favorite?</FormLabel>
                    <FormDescription>
                      This will be visibile on your public profile.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={hiveForm.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Rating</FormLabel>
                  <FormControl>
                    <Input
                      step={0.5}
                      type="number"
                      pattern="[0-9]*"
                      placeholder="1-10"
                      min={0}
                      max={10}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    0 = No Rating. It won&apos;t be visible on your public
                    profile.
                    <br />
                    1-10 = Your Rating. It will be visbile on your public
                    profile.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        <StepperFormActions />
      </form>
    </Form>
  );
}
