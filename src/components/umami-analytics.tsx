"use client";

import { useEffect, useRef } from "react";

import { env } from "@/env";
import { authClient } from "@/lib/auth-client";

declare global {
	interface Window {
		umami?: {
			track: (
				eventName?: string | object | ((props: object) => object),
				eventData?: object,
			) => void;
			identify: (userId?: string | object, userData?: object) => void;
		};
	}
}

function identifyUser(userId: string) {
	if (typeof window === "undefined" || !window.umami) {
		return;
	}

	// Send only a pseudonymous identifier. Email, name and avatar are not
	// shared with the analytics provider.
	window.umami.identify(userId);
}

export function UmamiAnalytics() {
	const { data: session } = authClient.useSession();
	const identifiedRef = useRef<string | null>(null);

	const user = session?.user;

	useEffect(() => {
		if (env.NODE_ENV === "development") {
			return;
		}

		const tryIdentify = () => {
			if (
				typeof window === "undefined" ||
				!window.umami ||
				!user ||
				identifiedRef.current === user.id
			) {
				return;
			}

			identifyUser(user.id);
			identifiedRef.current = user.id;
		};

		tryIdentify();

		window.addEventListener("umami-loaded", tryIdentify);

		return () => {
			window.removeEventListener("umami-loaded", tryIdentify);
		};
	}, [user]);

	return null;
}
