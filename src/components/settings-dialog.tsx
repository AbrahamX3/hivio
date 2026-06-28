"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AvatarManager } from "@/components/avatar-manager";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";
import { client } from "@/lib/orpc";
import type { HistoryStatus } from "@/types/history";

const settingsFormSchema = z.object({
	defaultStatus: z.enum([
		"FINISHED",
		"WATCHING",
		"PLANNED",
		"ON_HOLD",
		"DROPPED",
		"REWATCHING",
	]),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

interface SettingsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const STATUS_OPTIONS = [
	{ value: "FINISHED", label: "Finished" },
	{ value: "WATCHING", label: "Watching" },
	{ value: "PLANNED", label: "Planned" },
	{ value: "ON_HOLD", label: "On Hold" },
	{ value: "DROPPED", label: "Dropped" },
	{ value: "REWATCHING", label: "Rewatching" },
] as const;

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
	const [isPending, startTransition] = useTransition();
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();
	const [isUploading, setIsUploading] = useState(false);

	const { data: userData } = useQuery({
		queryKey: ["user", "getCurrentUser"],
		queryFn: () => client.user.getCurrentUser(),
	});

	const updateDefaultStatus = useMutation({
		mutationFn: (data: { defaultStatus: HistoryStatus }) =>
			client.user.updateDefaultStatus(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["user", "getCurrentUser"] });
			toast.success("Settings saved successfully");
		},
		onError: () => {
			toast.error("Failed to save settings");
		},
	});

	const defaultStatusValue = userData?.defaultStatus ?? "PLANNED";

	const form = useForm<SettingsFormValues>({
		resolver: zodResolver(settingsFormSchema),
		defaultValues: {
			defaultStatus: defaultStatusValue,
		},
	});

	useEffect(() => {
		if (open && userData) {
			startTransition(() => {
				form.reset({
					defaultStatus:
						(userData.defaultStatus as SettingsFormValues["defaultStatus"]) ||
						"PLANNED",
				});
			});
		}
	}, [form, open, userData, startTransition]);

	const onSubmit = useCallback(
		async (data: SettingsFormValues) => {
			try {
				await updateDefaultStatus.mutateAsync({
					defaultStatus: data.defaultStatus as HistoryStatus,
				});
				onOpenChange(false);
			} catch {
				// Error handled in onError
			}
		},
		[updateDefaultStatus, onOpenChange],
	);

	const user = session?.user;
	const canSave = !updateDefaultStatus.isPending && !isPending;

	return (
		<Dialog
			open={open}
			onOpenChange={(newOpen) => {
				if (!isPending && !isUploading) {
					onOpenChange(newOpen);
				}
			}}
		>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Settings</DialogTitle>
					<DialogDescription>Update your preferences</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<AvatarManager
							userName={user?.name}
							userEmail={user?.email}
							userImage={user?.image}
							userUpdatedAt={userData?.updatedAt}
							onUploadingChange={setIsUploading}
						/>

						<FormField
							control={form.control}
							name="defaultStatus"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Default Status</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={field.value}
										disabled={isPending}
									>
										<FormControl>
											<SelectTrigger disabled={isPending}>
												<SelectValue placeholder="Select default status" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectGroup>
												<SelectLabel>Status</SelectLabel>
												{STATUS_OPTIONS.map((opt) => (
													<SelectItem key={opt.value} value={opt.value}>
														{opt.label}
													</SelectItem>
												))}
											</SelectGroup>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={
									updateDefaultStatus.isPending || isPending || isUploading
								}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={!canSave || isPending || isUploading}
							>
								{updateDefaultStatus.isPending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Saving...
									</>
								) : (
									"Save Changes"
								)}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
