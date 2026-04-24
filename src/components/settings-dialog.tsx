"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
	SelectItem,
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
	const canSave = useMemo(
		() => !updateDefaultStatus.isPending && !isPending,
		[updateDefaultStatus.isPending, isPending],
	);

	return (
		<Dialog
			open={open}
			onOpenChange={(open) => {
				if (!isPending) {
					onOpenChange(open);
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
						{/* Profile Info (read-only from auth) */}
						<div className="flex flex-col items-center gap-2">
							<Avatar className="h-16 w-16">
								{user?.image ? (
									<AvatarImage src={user.image} alt={user.name} />
								) : (
									<AvatarFallback className="text-xl">
										{user?.name?.charAt(0).toUpperCase() || "U"}
									</AvatarFallback>
								)}
							</Avatar>
							<p className="text-sm font-medium">{user?.name}</p>
							<p className="text-muted-foreground text-xs">{user?.email}</p>
						</div>

						{/* Default Status */}
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
											{STATUS_OPTIONS.map((opt) => (
												<SelectItem key={opt.value} value={opt.value}>
													{opt.label}
												</SelectItem>
											))}
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
								disabled={updateDefaultStatus.isPending || isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={!canSave || isPending}>
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
