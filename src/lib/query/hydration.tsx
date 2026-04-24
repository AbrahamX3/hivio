"use client";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { cache } from "react";

import { createQueryClient } from "./client";

export const getQueryClient = cache(createQueryClient);

interface HydrateClientProps {
	children: React.ReactNode;
	client: QueryClient;
}

export function HydrateClient({ children, client }: HydrateClientProps) {
	return (
		<HydrationBoundary state={dehydrate(client)}>{children}</HydrationBoundary>
	);
}
