"use client";

import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog";
import { TrashIcon } from "lucide-react";
import { toast } from "sonner";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTitleDetails } from "@/context/title-details-context";

import { deleteTitle } from "../../app/(dashboard)/app/actions";

export default function DeleteHiveTitle({ id }: { id: string }) {
	const { setSelectedTitle } = useTitleDetails();

	return (
		<AlertDialog>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<AlertDialogTrigger asChild>
							<Button
								type="button"
								size="icon"
								variant="outline"
								className="h-8 gap-1"
							>
								<TrashIcon className="size-3.5" />
								<span className="sr-only">Delete from Hive</span>
							</Button>
						</AlertDialogTrigger>
					</TooltipTrigger>
					<TooltipContent>Delete from Hive</TooltipContent>
				</Tooltip>
			</TooltipProvider>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>¡Warning!</AlertDialogTitle>
					<AlertDialogDescription>
						¿Are you sure you want to delete this title from your hive?
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						onClick={() => {
							toast.promise(deleteTitle({ id }), {
								loading: "Deleting title from your hive...",
								success: () => {
									setSelectedTitle(null);
									return "Title deleted from your hive!";
								},
								error: "Server Error",
							});
						}}
					>
						Confirm
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
