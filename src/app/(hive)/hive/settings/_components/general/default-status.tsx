"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { statusOptions } from "@/lib/options";

import { saveStatus } from "../../actions";
import {
  GeneralSettingsStatusForm,
  GeneralSettingsStatusFormSchema,
} from "../../validations";

interface Props {
  status: GeneralSettingsStatusForm["status"];
}

export default function DefaultStatusForm({ status }: Props) {
  const StatusForm = useForm<GeneralSettingsStatusForm>({
    resolver: zodResolver(GeneralSettingsStatusFormSchema),
    defaultValues: {
      status: status,
    },
  });

  const { execute } = useAction(saveStatus, {
    onSuccess: ({ error, success, data }) => {
      if (!success) {
        toast.error("Error", {
          description: error?.reason,
          id: "status-form",
        });
        StatusForm.reset();
      } else {
        toast.success(`Now using "${data?.status}" as your default status!`, {
          id: "status-form",
        });
        StatusForm.reset({ status: data?.status });
      }
    },
    onError: ({ serverError }) => {
      toast.error("Server Error", {
        description: serverError,
        id: "status-form",
      });
    },
    onExecute: () => {
      toast.loading("Applying default status...", {
        id: "status-form",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Default Status</CardTitle>
        <CardDescription>
          The default status used when adding a new movie or series to your
          Hive.
        </CardDescription>
      </CardHeader>
      <Form {...StatusForm}>
        <form onSubmit={StatusForm.handleSubmit((values) => execute(values))}>
          <CardContent className="space-y-8">
            <FormField
              control={StatusForm.control}
              name="status"
              render={({ field }) => (
                <FormItem className="w-full">
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
          </CardContent>
          <CardFooter className="justify-end border-t px-6 py-4">
            <Button disabled={!StatusForm.formState.isDirty} type="submit">
              Save
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
