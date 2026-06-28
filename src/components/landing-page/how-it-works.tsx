import { ListChecks, MonitorPlay, Telescope } from "lucide-react";

const steps = [
	{
		number: "01",
		icon: ListChecks,
		title: "Add your shows",
		description:
			"Search for movies and series, add them to your library, and mark what you're currently watching.",
	},
	{
		number: "02",
		icon: MonitorPlay,
		title: "Log your progress",
		description:
			"Mark episodes as watched, track time spent, and see your viewing patterns over time.",
	},
	{
		number: "03",
		icon: Telescope,
		title: "Discover what's next",
		description:
			"See upcoming releases, trending titles, and get back into shows you forgot about.",
	},
];

export function HowItWorks() {
	return (
		<section className="bg-muted/30 border-t py-24 sm:py-32">
			<div className="mx-auto max-w-6xl px-4">
				<div className="flex flex-col gap-4 text-center">
					<span className="bg-primary/10 text-primary mx-auto inline-block rounded-full px-3 py-1 text-[11px] font-medium tracking-[0.2em] uppercase">
						How it works
					</span>
					<h2 className="text-3xl font-semibold sm:text-4xl">
						Three steps to a calmer watch history.
					</h2>
				</div>

				<div className="mt-16">
					<div className="grid gap-8 sm:grid-cols-3">
						{steps.map((step, idx) => (
							<div
								key={step.number}
								className="animate-enter relative"
								style={{ animationDelay: `${idx * 120}ms` }}
							>
								<div className="flex items-start gap-4">
									<div className="bg-primary/10 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-semibold">
										{step.number}
									</div>
									<div className="space-y-2">
										<h3 className="text-lg font-semibold">{step.title}</h3>
										<p className="text-muted-foreground text-sm leading-relaxed">
											{step.description}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
