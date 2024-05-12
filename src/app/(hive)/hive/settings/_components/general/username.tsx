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

import { saveUsername } from "../../actions";
import {
  GeneralSettingsUsernameForm,
  GeneralSettingsUsernameFormSchema,
} from "../../validations";

interface Props {
  username: string | null;
}

export default function UsernameForm({ username }: Props) {
  const UsernameForm = useForm<GeneralSettingsUsernameForm>({
    resolver: zodResolver(GeneralSettingsUsernameFormSchema),
    defaultValues: {
      username: username ?? "",
    },
  });

  const { execute } = useAction(saveUsername, {
    onSuccess: ({ error, success, data }) => {
      if (!success) {
        toast.error("Error", {
          description: error?.reason,
          id: "username-form",
        });
        UsernameForm.reset();
      } else {
        toast.success(`Username "${data?.username}" assigned correctly!`, {
          id: "username-form",
        });
      }
    },
    onError: ({ serverError }) => {
      toast.error("Server Error", {
        description: serverError,
        id: "username-form",
      });
    },
    onExecute: () => {
      toast.loading("Verifying Username...", {
        id: "username-form",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Username</CardTitle>
        <CardDescription>
          A unique identifier used to navigate to your public profile.
        </CardDescription>
      </CardHeader>
      <Form {...UsernameForm}>
        <form onSubmit={UsernameForm.handleSubmit((values) => execute(values))}>
          <CardContent className="space-y-8">
            <FormField
              control={UsernameForm.control}
              name="username"
              render={({ field }) => (
                <FormItem className="col-span-4 md:col-span-8">
                  <FormControl>
                    <Input
                      type="text"
                      autoComplete="off"
                      aria-label="Username"
                      className="lowercase"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="justify-end border-t px-6 py-4">
            <Button disabled={!UsernameForm.formState.isDirty} type="submit">
              Save
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
