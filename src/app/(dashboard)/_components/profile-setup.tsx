"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useReward } from "react-rewards";
import { toast } from "sonner";
import { z } from "zod";

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
import { UserSession } from "@/lib/auth";
import { statusOptions } from "@/lib/options";

import { ProfileOnboarding } from "../dashboard/_actions/profile-setup";

const ProfileSetupFormSchema = z.object({
  username: z
    .string()
    .min(4, {
      message: "Username must be at least 4 characters",
    })
    .max(50, {
      message: "Username must be less than 50 characters",
    }),
  name: z
    .string()
    .min(4, {
      message: "Display name must be at least 4 characters",
    })
    .max(50, {
      message: "Display name must be less than 50 characters",
    }),
  status: z.enum(["UPCOMING", "PENDING", "WATCHING", "UNFINISHED", "FINISHED"]),
});

export type ProfileSetupForm = z.infer<typeof ProfileSetupFormSchema>;

export function ProfileSetup({ user }: { user: UserSession }) {
  const { reward } = useReward("completed-profile-confetti", "confetti");

  const ProfileSetupForm = useForm<ProfileSetupForm>({
    resolver: zodResolver(ProfileSetupFormSchema),
    defaultValues: {
      username: "",
      name: user?.name,
      status: "WATCHING",
    },
  });

  const router = useRouter();

  async function onSubmit(values: ProfileSetupForm) {
    toast.promise<string>(ProfileOnboarding(values), {
      loading: "Verifying Username...",
      success: (username: string) => {
        reward();
        setTimeout(() => {
          router.refresh();
        }, 2000);
        return `Username "${username}" assigned correctly!`;
      },
      error: (error) => {
        ProfileSetupForm.reset();

        return error;
      },
    });
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Public Profile Onboarding</CardTitle>
        <CardDescription>
          Enter your details to get started with your public Hivio profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Form {...ProfileSetupForm}>
          <form
            onSubmit={ProfileSetupForm.handleSubmit(onSubmit)}
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
