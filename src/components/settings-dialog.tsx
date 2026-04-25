"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2, Upload, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
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
import { getAvatarUrl } from "@/lib/utils";
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

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

	const getAvatarUploadUrl = useMutation({
		mutationFn: (contentType: string) =>
			client.user.getAvatarUploadUrl({ contentType }),
	});

	const updateAvatar = useMutation({
		mutationFn: (imageUrl: string) => client.user.updateAvatar({ imageUrl }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["user", "getCurrentUser"] });
			toast.success("Avatar updated successfully");
		},
		onError: () => {
			toast.error("Failed to update avatar");
		},
	});

	const removeAvatar = useMutation({
		mutationFn: () => client.user.removeAvatar(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["user", "getCurrentUser"] });
			toast.success("Avatar removed");
		},
		onError: () => {
			toast.error("Failed to remove avatar");
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

	const handleFileSelect = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;

			if (!file.type.startsWith("image/")) {
				toast.error("Please select an image file");
				return;
			}

			if (file.size > 5 * 1024 * 1024) {
				toast.error("Image must be less than 5MB");
				return;
			}

			setSelectedFile(file);
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
			setPreviewUrl(URL.createObjectURL(file));
		},
		[previewUrl],
	);

	const handleUpload = useCallback(async () => {
		if (!selectedFile) return;

		try {
			// 1. Get presigned upload URL from server
			const { uploadUrl, key } = await getAvatarUploadUrl.mutateAsync(
				selectedFile.type,
			);

			// 2. Upload file directly to R2
			const r2Res = await fetch(uploadUrl, {
				method: "PUT",
				body: selectedFile,
				headers: { "Content-Type": selectedFile.type },
			});

			if (!r2Res.ok) {
				throw new Error("Failed to upload image to storage");
			}

			// 3. Update avatar in database (store just the key)
			await updateAvatar.mutateAsync(key);

			// 4. Update Better Auth session cache
			await authClient.updateUser({ image: key });

			toast.success("Avatar updated successfully");

			// Reset file selection
			setSelectedFile(null);
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
				setPreviewUrl(null);
			}
		} catch (error) {
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("Failed to upload avatar");
			}
		}
	}, [selectedFile, getAvatarUploadUrl, updateAvatar, previewUrl]);

	const handleRemoveAvatar = useCallback(async () => {
		try {
			await removeAvatar.mutateAsync();
			await authClient.updateUser({ image: null });
		} catch {
			// Error handled in onError
		}
	}, [removeAvatar]);

	const handleCancelSelection = useCallback(() => {
		setSelectedFile(null);
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			setPreviewUrl(null);
		}
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}, [previewUrl]);

	const user = session?.user;
	const currentImage =
		previewUrl ?? getAvatarUrl(user?.image, userData?.updatedAt);
	const canSave = !updateDefaultStatus.isPending && !isPending;
	const isUploading =
		getAvatarUploadUrl.isPending ||
		updateAvatar.isPending ||
		removeAvatar.isPending;

	return (
		<Dialog
			open={open}
			onOpenChange={(newOpen) => {
				if (!newOpen) {
					setSelectedFile(null);
					if (previewUrl) {
						URL.revokeObjectURL(previewUrl);
						setPreviewUrl(null);
					}
				}
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
						{/* Avatar Section */}
						<div className="flex flex-col items-center gap-3">
							<Avatar className="h-20 w-20">
								{currentImage ? (
									<AvatarImage src={currentImage} alt={user?.name} />
								) : (
									<AvatarFallback className="text-2xl">
										{user?.name?.charAt(0).toUpperCase() || "U"}
									</AvatarFallback>
								)}
							</Avatar>

							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								className="hidden"
								onChange={handleFileSelect}
							/>

							<div className="flex items-center gap-2">
								{selectedFile ? (
									<>
										<Button
											type="button"
											size="sm"
											onClick={handleUpload}
											disabled={isUploading}
										>
											{isUploading ? (
												<Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
											) : (
												<Upload className="mr-1.5 h-3.5 w-3.5" />
											)}
											Upload
										</Button>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={handleCancelSelection}
											disabled={isUploading}
										>
											<X className="mr-1.5 h-3.5 w-3.5" />
											Cancel
										</Button>
									</>
								) : (
									<>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => fileInputRef.current?.click()}
											disabled={isUploading}
										>
											<Upload className="mr-1.5 h-3.5 w-3.5" />
											Change Avatar
										</Button>
										{user?.image && (
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={handleRemoveAvatar}
												disabled={isUploading}
											>
												{removeAvatar.isPending ? (
													<Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
												) : (
													<Trash2 className="mr-1.5 h-3.5 w-3.5" />
												)}
												Remove
											</Button>
										)}
									</>
								)}
							</div>

							{selectedFile && (
								<p className="text-muted-foreground text-xs">
									{selectedFile.name} (
									{(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
								</p>
							)}

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
