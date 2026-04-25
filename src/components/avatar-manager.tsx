"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2, Upload, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { client } from "@/lib/orpc";
import { getAvatarUrl } from "@/lib/utils";

interface AvatarManagerProps {
	userName?: string | null;
	userEmail?: string | null;
	userImage?: string | null;
	userUpdatedAt?: Date | null;
	onUploadingChange?: (isUploading: boolean) => void;
}

export function AvatarManager({
	userName,
	userEmail,
	userImage,
	userUpdatedAt,
	onUploadingChange,
}: AvatarManagerProps) {
	const queryClient = useQueryClient();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [isUploadingFile, setIsUploadingFile] = useState(false);

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

		setIsUploadingFile(true);
		try {
			const { uploadUrl, key } = await client.user.getAvatarUploadUrl({
				contentType: selectedFile.type,
			});

			const r2Res = await fetch(uploadUrl, {
				method: "PUT",
				body: selectedFile,
				headers: { "Content-Type": selectedFile.type },
			});

			if (!r2Res.ok) {
				throw new Error("Failed to upload image to storage");
			}

			await updateAvatar.mutateAsync(key);
			await authClient.updateUser({ image: key });

			toast.success("Avatar updated successfully");

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
		} finally {
			setIsUploadingFile(false);
		}
	}, [selectedFile, updateAvatar, previewUrl]);

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

	const currentImage =
		previewUrl ?? getAvatarUrl(userImage, userUpdatedAt ?? undefined);
	const isUploading =
		isUploadingFile || updateAvatar.isPending || removeAvatar.isPending;

	useEffect(() => {
		onUploadingChange?.(isUploading);
	}, [isUploading, onUploadingChange]);

	return (
		<div className="flex flex-col items-center gap-3">
			<Avatar className="h-20 w-20">
				{currentImage ? (
					<AvatarImage src={currentImage} alt={userName ?? undefined} />
				) : (
					<AvatarFallback className="text-2xl">
						{userName?.charAt(0).toUpperCase() || "U"}
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
						{userImage && (
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
					{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
					MB)
				</p>
			)}

			<p className="text-sm font-medium">{userName}</p>
			<p className="text-muted-foreground text-xs">{userEmail}</p>
		</div>
	);
}
