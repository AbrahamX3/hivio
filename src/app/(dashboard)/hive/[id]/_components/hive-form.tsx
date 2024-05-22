"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  CalendarCheck2Icon,
  CalendarIcon,
  CalendarMinusIcon,
  CalendarOffIcon,
  ChevronLeftIcon,
  SaveIcon,
  TrashIcon,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { Link } from "next-view-transitions";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  hiveFormSchema,
  type HiveFormValues,
} from "@/app/(dashboard)/hive/validations";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { statusOptions } from "@/lib/options";
import { cn } from "@/lib/utils";

import { deleteTitle, type HiveData } from "../../actions";
import { updateTitleFromHive } from "../actions";

interface HiveFormStepProps {
  hive: HiveData[0];
}

const createSeasonsMap = (titleSeasons: HiveData[0]["title"]["seasons"]) => {
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

function handleValues(hide: HiveData[0]) {
  if (hide.status === "WATCHING") {
    return {
      currentEpisode: hide.currentEpisode ?? undefined,
      currentSeason: hide.currentSeason ?? undefined,
      status: hide.status,
      startedAt: hide.startedAt ? new Date(hide.startedAt) : undefined,
    };
  } else if (hide.status === "UNFINISHED") {
    return {
      currentEpisode: hide.currentEpisode ?? undefined,
      currentSeason: hide.currentSeason ?? undefined,
      startedAt: hide.startedAt ? new Date(hide.startedAt) : undefined,
      status: hide.status,
    };
  } else if (hide.status === "FINISHED") {
    return {
      currentEpisode: hide.currentEpisode ?? undefined,
      currentSeason: hide.currentSeason ?? undefined,
      finishedAt: hide.finishedAt ? new Date(hide.finishedAt) : undefined,
      status: hide.status,
      isFavorite: hide.isFavorite,
      rating: hide.rating ?? undefined,
      startedAt: hide.startedAt ? new Date(hide.startedAt) : undefined,
    };
  } else if (hide.status === "PENDING") {
    return {
      currentEpisode: hide.currentEpisode ?? undefined,
      currentSeason: hide.currentSeason ?? undefined,
      startedAt: hide.startedAt ? new Date(hide.startedAt) : undefined,
      status: hide.status,
    };
  }
}

export function HiveForm({ hive }: HiveFormStepProps) {
  const seasons = hive.title.seasons;

  const isTitleWatchable =
    new Date() >= new Date(hive.title.release_date.toString());

  const hiveForm = useForm<HiveFormValues>({
    resolver: zodResolver(hiveFormSchema),
    defaultValues: handleValues(hive),
  });

  const { execute } = useAction(updateTitleFromHive, {
    onSuccess: ({ success, error }) => {
      if (success) {
        toast.success("Title updated successfully", {
          id: "update-title",
        });
      } else {
        toast.error(error.reason, {
          id: "update-title",
        });
      }
    },
    onExecute: () => {
      toast.loading("Updating title...", {
        id: "update-title",
      });
    },
    onError: () => {
      toast.error("Error updating title!", {
        id: "update-title",
      });
    },
  });

  function handleSubmit(values: HiveFormValues) {
    execute({
      form: values,
      id: hive.id,
    });
  }

  const seasonsMap = useMemo(() => createSeasonsMap(seasons), [seasons]);

  const canSetSeason =
    hiveForm.watch("status") === "UNFINISHED" ||
    hiveForm.watch("status") === "WATCHING" ||
    hiveForm.watch("status") === "FINISHED";

  const currentSeason = hiveForm.watch("currentSeason");
  const episodes = seasonsMap.get(Number(currentSeason)) ?? [];

  const lastSeason = useMemo(() => seasons.at(-1)?.season ?? 0, [seasons]);
  const lastEpisode = useMemo(() => seasons.at(-1)?.episodes ?? 0, [seasons]);

  const isFinished = hiveForm.watch("status") === "FINISHED";

  useEffect(() => {
    if (hive.title.type === "SERIES") {
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
  }, [hive.title.type, hiveForm, isFinished, lastEpisode, lastSeason]);

  useEffect(() => {
    if (!isTitleWatchable) {
      hiveForm.setValue("status", "PENDING");
    }
  }, [hiveForm, isTitleWatchable]);

  useEffect(() => {
    hiveForm.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Form {...hiveForm}>
      <form
        onSubmit={hiveForm.handleSubmit(handleSubmit)}
        className="col-span-3 flex w-full flex-col gap-4"
      >
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/hive"
            className={cn(
              "size-7",
              buttonVariants({
                variant: "outline",
                size: "icon",
              }),
            )}
          >
            <ChevronLeftIcon className="h-4 w-4" />
            <span className="sr-only">Back to Hive</span>
          </Link>
          <h1
            title={hive.title.name}
            className="w-60 flex-1 shrink truncate whitespace-nowrap text-xl font-semibold tracking-tight"
          >
            {hive.title.name}
          </h1>
          <Badge className="ml-auto sm:ml-0">{hive.status}</Badge>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
            <DeleteTitle id={hive.id} type={hive.title.type} />
            <Button
              disabled={!hiveForm.formState.isDirty}
              type="submit"
              size="sm"
            >
              Save Changes <SaveIcon className="ml-2 size-4" />
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Edit Hive Title</CardTitle>
            <CardDescription>
              Make changes to the title in your hive to better reflect your
              current watch status or to add more information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mx-auto w-full max-w-lg space-y-8 pb-4">
              <FormField
                control={hiveForm.control}
                name="status"
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

              {canSetSeason &&
                hive.title.type === "SERIES" &&
                seasons.length > 0 && (
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
                              {seasons.map(({ season }) => (
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
                            Yesterday{" "}
                            <CalendarMinusIcon className="ml-2 size-4" />
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
                            2 days ago{" "}
                            <CalendarMinusIcon className="ml-2 size-4" />
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
                                date > new Date() ||
                                date < new Date("1900-01-01")
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
                              Today{" "}
                              <CalendarCheck2Icon className="ml-2 size-4" />
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
                              Yesterday{" "}
                              <CalendarMinusIcon className="ml-2 size-4" />
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                field.onChange(
                                  new Date(
                                    Date.now() - 1000 * 60 * 60 * 24 * 2,
                                  ),
                                )
                              }
                            >
                              2 days ago{" "}
                              <CalendarMinusIcon className="ml-2 size-4" />
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
            </div>
          </CardContent>
        </Card>
        <div className="flex items-center justify-center gap-2 md:hidden">
          <DeleteTitle id={hive.id} type={hive.title.type} />
          <Button
            disabled={!hiveForm.formState.isDirty}
            type="submit"
            size="sm"
          >
            Save Changes <SaveIcon className="ml-2 size-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}

function DeleteTitle({ id, type }: { id: string; type: "MOVIE" | "SERIES" }) {
  const router = useRouter();

  const { execute, status } = useAction(deleteTitle, {
    onSuccess: ({ success }) => {
      if (success) {
        toast.success("Title deleted from your hive!", {
          id: "delete-title",
        });
        router.replace("/hive");
      }
    },
    onError: ({ serverError }) => {
      toast.error("Server Error", {
        description: serverError,
        id: "delete-title",
      });
    },
    onExecute: () => {
      toast.loading("Deleting title from your hive...", {
        id: "delete-title",
      });
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive" size="sm">
          Delete <TrashIcon className="ml-2 size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¡Warning!</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Are you sure you want to delete this {type.toLowerCase()} from your
            hive?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={status === "executing"}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => execute({ id })}
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
