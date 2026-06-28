"use client";

import { useEffect, useRef } from "react";

export function useScrollReveal<T extends HTMLElement>({
	threshold = 0.15,
	rootMargin = "0px 0px -40px 0px",
}: {
	threshold?: number;
	rootMargin?: string;
} = {}) {
	const ref = useRef<T>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					el.setAttribute("data-visible", "");
					observer.disconnect();
				}
			},
			{ threshold, rootMargin },
		);

		observer.observe(el);

		return () => observer.disconnect();
	}, [threshold, rootMargin]);

	return { ref };
}
