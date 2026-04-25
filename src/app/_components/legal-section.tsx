import type { ReactNode } from "react";

interface LegalSectionProps {
	title: string;
	children: ReactNode;
}

export function LegalSection({ title, children }: LegalSectionProps) {
	return (
		<section className="space-y-4">
			<h2 className="text-foreground text-2xl font-semibold">{title}</h2>
			{children}
		</section>
	);
}

interface LegalSubsectionProps {
	title: string;
	children: ReactNode;
}

export function LegalSubsection({ title, children }: LegalSubsectionProps) {
	return (
		<div className="space-y-3">
			<h3 className="text-foreground text-xl font-semibold">{title}</h3>
			{children}
		</div>
	);
}
