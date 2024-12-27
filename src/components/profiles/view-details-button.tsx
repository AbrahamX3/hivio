"use client";

import { MoreHorizontalIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTitleDetails } from "@/context/title-details-context";
import type { UserSession } from "@/types/auth";

import type { UserHiveProfile } from "@/actions/profiles/user/types";
import { TitleDetailsDrawer } from "./title-details-drawer";

interface Props {
	data: UserHiveProfile;
	currentUser: UserSession | null;
}

export default function ViewDetailsButton({ data, currentUser }: Props) {
	const { setSelectedTitle } = useTitleDetails();
	const [openDetails, setOpenDetails] = useState(false);

	return (
		<>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							aria-label="View Title Details"
							size="icon"
							className="size-8"
							variant="outline"
							onClick={() => {
								setOpenDetails(true);

								if (!data.title.type) return;

								setSelectedTitle({
									id: data.title.id,
									tmdbId: data.title.tmdbId,
									type: data.title.type,
								});
							}}
						>
							<MoreHorizontalIcon className="size-3" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p className="font-medium text-sm">View Title Details</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
			{openDetails && (
				<TitleDetailsDrawer
					id={data.id}
					data={data}
					open={openDetails}
					setOpen={setOpenDetails}
					currentUser={currentUser}
				/>
			)}
		</>
	);
}
