"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CarouselItem } from "@/components/ui/carousel";
import useMediaQuery from "@/hooks/use-media-query";

export function EmptyCard({
	mobile,
	tablet,
	desktop,
}: {
	mobile: boolean;
	tablet: boolean;
	desktop: boolean;
}) {
	const { isDesktop, isMobile, isTablet } = useMediaQuery();

	if (isMobile && !mobile) {
		return null;
	}

	if (isTablet && !tablet) {
		return null;
	}

	if (isDesktop && !desktop) {
		return null;
	}

	return (
		<CarouselItem className="relative opacity-30 sm:basis-2/4 md:basis-1/4 lg:basis-1/3">
			<Card>
				<CardContent className="flex aspect-[500/750] h-full items-center justify-center p-0">
					<div className="aspect-[2/3] w-full rounded-t-lg bg-muted object-cover" />
				</CardContent>
				<CardFooter className="relative w-full flex-col gap-4 pt-2">
					<div className="flex w-full items-center gap-2 justify-self-start align-middle">
						<div className="h-5 w-14 rounded-full bg-muted px-2.5 py-0.5" />
						<div className="h-5 w-14 rounded-full bg-muted px-2.5 py-0.5" />
					</div>
					<div className="flex w-full items-center justify-between gap-2">
						<p className="h-8 w-2/3 rounded-md bg-muted" />
						<div className="flex items-center gap-2 align-middle">
							<div className="size-8 rounded-md bg-muted" />
							<div className="size-8 rounded-md bg-muted" />
						</div>
					</div>
					<div className="flex w-full items-center justify-between gap-2">
						<div className="size-8 w-full rounded-md bg-muted" />
					</div>
				</CardFooter>
			</Card>
		</CarouselItem>
	);
}
