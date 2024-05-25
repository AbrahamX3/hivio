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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConfetti } from "@/context/use-confetti";
import { statusOptions } from "@/lib/options";
import { type UserSession } from "@/types/auth";

import { profileOnboarding } from "../hive/actions";
import {
  ProfileSetupFormSchema,
  type ProfileSetupForm,
} from "../hive/validations";

export function ProfileSetup({ user }: { user: UserSession }) {
  const ProfileSetupForm = useForm<ProfileSetupForm>({
    resolver: zodResolver(ProfileSetupFormSchema),
    defaultValues: {
      username: "",
      name: user?.name,
      status: "WATCHING",
    },
  });

  const { tossConfetti } = useConfetti();
  const { execute } = useAction(profileOnboarding, {
    onSuccess: ({ error, success, data }) => {
      if (!success) {
        toast.error("Error", {
          description: error?.reason,
          id: "profile-setup",
        });
        ProfileSetupForm.reset();
      } else {
        toast.success(`Username "${data?.username}" assigned correctly!`, {
          id: "profile-setup",
        });
        tossConfetti();
      }
    },
    onError: ({ serverError }) => {
      toast.error("Server Error", {
        description: serverError,
        id: "profile-setup",
      });
    },
    onExecute: () => {
      toast.loading("Verifying Username...", {
        id: "profile-setup",
      });
    },
  });

  return (
    <Card className="w-full max-w-sm py-8 md:py-0">
      <CardHeader>
        <CardTitle className="text-2xl">Public Profile Onboarding</CardTitle>
        <CardDescription>
          Enter your details to get started with your public Hivio profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Form {...ProfileSetupForm}>
          <form
            onSubmit={ProfileSetupForm.handleSubmit((values) =>
              execute(values),
            )}
            className="space-y-8"
          >
            <FormField
              control={ProfileSetupForm.control}
              name="username"
              render={({ field }) => (
                <FormItem className="col-span-4 md:col-span-8">
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      autoComplete="off"
                      aria-label="Username"
                      className="lowercase"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A unique identifier used to navigate to your public profile.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={ProfileSetupForm.control}
              name="name"
              render={({ field }) => (
                <FormItem className="col-span-4 md:col-span-8">
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      autoComplete="off"
                      aria-label="Display Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    Your public display name. This will be displayed in your
                    public profile.
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={ProfileSetupForm.control}
              name="status"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Default Status</FormLabel>
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
                  <FormDescription>
                    The default status used when adding a new movie or series to
                    your Hive.
                  </FormDescription>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Complete Profile
            </Button>
            <div id="completed-profile-confetti" className="w-full" />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
