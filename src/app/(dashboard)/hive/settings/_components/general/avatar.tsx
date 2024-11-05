"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
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

import { cn } from "@/lib/utils";
import { ExternalLinkIcon } from "lucide-react";
import { saveAvatar } from "../../actions";
import {
	type GeneralSettingsAvatarForm,
	GeneralSettingsAvatarFormSchema,
} from "../../validations";

interface Props {
	avatar: string | null;
}

export default function AvatarForm({ avatar }: Props) {
	const AvatarForm = useForm<GeneralSettingsAvatarForm>({
		resolver: zodResolver(GeneralSettingsAvatarFormSchema),
		defaultValues: {
			avatar: avatar ?? "",
		},
	});

	const { execute } = useAction(saveAvatar, {
		onSuccess: ({ data }) => {
			if (!data?.success) {
				toast.error("Error", {
					description: "Error saving avatar image!",
					id: "avatar-form",
				});
				AvatarForm.reset();
			} else {
				toast.success("Avatar Image assigned correctly!", {
					id: "avatar-form",
				});
				AvatarForm.reset({ avatar: data?.data?.avatar });
			}
		},
		onError: ({ error }) => {
			toast.error("Server Error", {
				description: error.serverError,
				id: "avatar-form",
			});
		},
		onExecute: () => {
			toast.loading("Updating Avatar Image...", {
				id: "avatar-form",
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
			<Form {...AvatarForm}>
				<form onSubmit={AvatarForm.handleSubmit((values) => execute(values))}>
					<CardContent className="space-y-8">
						<div className="flex w-full items-center align-middle gap-2 justify-between">
							<FormField
								control={AvatarForm.control}
								name="avatar"
								render={({ field }) => (
									<FormItem className="col-span-4 md:col-span-8 w-full">
										<FormControl>
											<Input
												type="text"
												autoComplete="off"
												aria-label="Avatar Image URL"
												className="lowercase"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							{AvatarForm.watch("avatar") && (
								<a
									className={cn(
										buttonVariants({
											variant: "outline",
										}),
									)}
									href={AvatarForm.watch("avatar")}
									target="_blank"
									rel="noreferrer"
								>
									<ExternalLinkIcon className="w-4 h-4" />
								</a>
							)}
						</div>
					</CardContent>
					<CardFooter className="justify-end border-t px-6 py-4">
						<Button disabled={!AvatarForm.formState.isDirty} type="submit">
							Save
						</Button>
					</CardFooter>
				</form>
			</Form>
		</Card>
	);
}
