import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface DoubleBezelProps {
	children: ReactNode;
	className?: string;
	outerClassName?: string;
	innerClassName?: string;
	as?: "div" | "section" | "article";
}

export function DoubleBezel({
	children,
	className,
	outerClassName,
	innerClassName,
	as: Component = "div",
}: DoubleBezelProps) {
	return (
		<Component
			className={cn(
				"bg-card/50 ring-border/50 rounded-xl p-4 ring-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]",
				outerClassName,
				innerClassName,
				className,
			)}
		>
			{children}
		</Component>
	);
}
