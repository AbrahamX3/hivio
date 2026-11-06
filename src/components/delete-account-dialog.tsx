"use client";

import { Loader2, TriangleAlertIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";

interface DeleteAccountDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	email?: string;
}

export function DeleteAccountDialog({
	open,
	onOpenChange,
	email,
}: DeleteAccountDialogProps) {
	const [isSending, setIsSending] = useState(false);
	const [sent, setSent] = useState(false);

	const handleOpenChange = (nextOpen: boolean) => {
		if (isSending) return;
		onOpenChange(nextOpen);
		if (!nextOpen) setSent(false);
	};

	const handleRequestDeletion = async () => {
		setIsSending(true);
		try {
			const { error } = await authClient.deleteUser({ callbackURL: "/" });
			if (error) {
				toast.error(error.message ?? "Could not send the confirmation email");
				return;
			}
			setSent(true);
		} catch {
			toast.error("Could not send the confirmation email");
		} finally {
			setIsSending(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md">
				{sent ? (
					<>
						<DialogHeader>
							<DialogTitle>Check your email</DialogTitle>
							<DialogDescription>
								We sent a deletion link to {email}. Open it in this browser
								while signed in to permanently delete your account.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button onClick={() => handleOpenChange(false)}>Close</Button>
						</DialogFooter>
					</>
				) : (
					<>
						<DialogHeader>
							<DialogTitle>Delete account</DialogTitle>
							<DialogDescription>
								This permanently deletes your account, watch history,
								favourites, and analytics. We&apos;ll email you a confirmation
								link first.
							</DialogDescription>
						</DialogHeader>
						<div className="bg-destructive/10 text-destructive flex gap-3 rounded-lg p-3 text-sm">
							<TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
							<p>
								The link expires in 1 hour and must be opened in this browser
								while signed in. This action cannot be undone.
							</p>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => handleOpenChange(false)}
								disabled={isSending}
							>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={handleRequestDeletion}
								disabled={isSending}
							>
								{isSending ? (
									<>
										<Loader2 className="size-4 animate-spin" />
										Sending...
									</>
								) : (
									"Send confirmation email"
								)}
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
