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

function identifyUser(user: {
	id: string;
	email: string;
	name: string;
	image?: string | null;
}) {
	if (typeof window === "undefined" || !window.umami) {
		return;
	}

	window.umami.identify(user.id, {
		email: user.email,
		name: user.name,
		...(user.image && { image: user.image }),
	});
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

			identifyUser(user);
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
