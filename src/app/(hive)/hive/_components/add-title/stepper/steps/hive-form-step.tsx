import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import {
  CalendarCheck2Icon,
  CalendarIcon,
  CalendarMinusIcon,
  CalendarOffIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

import { StepperFormActions } from "../stepper-form-actions";

const hiveFormSchema = z
  .discriminatedUnion("status", [
    z.object({
      status: z.literal("FINISHED"),
      date: z.date(),
      isFavorite: z.boolean().optional(),
      rating: z.coerce.number().min(0).max(10).default(0),
    }),
    z.object({
      status: z
        .enum(["UPCOMING", "PENDING", "WATCHING", "UNFINISHED"])
        .default("WATCHING"),
    }),
  ])
  .transform((data) => {
    if (data.status === "FINISHED") {
      const utcDate = fromZonedTime(
        data.date,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      );

      return {
        ...data,
        date: utcDate,
      };
    }

    return data;
  });

export type HiveFormValues = z.infer<typeof hiveFormSchema>;

interface HiveFormStepProps {
  defaultStatus:
    | "UPCOMING"
    | "WATCHING"
    | "UNFINISHED"
    | "PENDING"
    | "FINISHED";
  setFormValues: (values: HiveFormValues) => void;
}

export function HiveFormStep({
  defaultStatus,
  setFormValues,
}: HiveFormStepProps) {
  const { nextStep } = useStepper();

  const hiveForm = useForm<HiveFormValues>({
    resolver: zodResolver(hiveFormSchema),
    defaultValues: {
      status: defaultStatus ?? "WATCHING",
    },
  });

  function handleSubmit(values: HiveFormValues) {
    setFormValues(values);

    nextStep();
  }

  return (
    <Form {...hiveForm}>
      <form
        onSubmit={hiveForm.handleSubmit(handleSubmit)}
        className="mx-auto w-full max-w-md space-y-8 pb-4"
      >
        <FormField
          control={hiveForm.control}
          name="status"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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

        {hiveForm.watch("status") === "FINISHED" && (
          <>
            <FormField
              control={hiveForm.control}
              name="date"
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
                            <span>Pick a date</span>
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
                    <div className="flex w-full items-center justify-between gap-2 pt-2">
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
                      Marking this as a favorite will make it appear in a
                      section of your public profile.
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
