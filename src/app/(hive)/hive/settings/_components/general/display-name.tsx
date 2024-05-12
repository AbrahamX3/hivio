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
import { Input } from "@/components/ui/input";

import { saveDisplayName } from "../../actions";
import {
  GeneralSettingsDisplayNameForm,
  GeneralSettingsDisplayNameFormSchema,
} from "../../validations";

interface Props {
  name: string | null;
}

export default function DisplayNameForm({ name }: Props) {
  const DisplayNameForm = useForm<GeneralSettingsDisplayNameForm>({
    resolver: zodResolver(GeneralSettingsDisplayNameFormSchema),
    defaultValues: {
      name: name ?? "",
    },
  });

  const { execute } = useAction(saveDisplayName, {
    onSuccess: ({ error, success, data }) => {
      if (!success) {
        toast.error("Error", {
          description: error?.reason,
          id: "name-form",
        });
        DisplayNameForm.reset();
      } else {
        toast.success(`Display name "${data?.name}" assigned correctly!`, {
          id: "name-form",
        });
      }
    },
    onError: ({ serverError }) => {
      toast.error("Server Error", {
        description: serverError,
        id: "name-form",
      });
    },
    onExecute: () => {
      toast.loading("Applying display name...", {
        id: "name-form",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Display Name</CardTitle>
        <CardDescription>
          Your public display name. This will be displayed in your public
          profile.
        </CardDescription>
      </CardHeader>
      <Form {...DisplayNameForm}>
        <form
          onSubmit={DisplayNameForm.handleSubmit((values) => execute(values))}
        >
          <CardContent className="space-y-8">
            <FormField
              control={DisplayNameForm.control}
              name="name"
              render={({ field }) => (
                <FormItem className="col-span-4 md:col-span-8">
                  <FormControl>
                    <Input
                      type="text"
                      autoComplete="off"
                      aria-label="Display Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="justify-end border-t px-6 py-4">
            <Button disabled={!DisplayNameForm.formState.isDirty} type="submit">
              Save
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
