import { CalendarDays, CheckCircle2, Clock3, Sparkles } from "lucide-react";

const features = [
	{
		title: "Track everything",
		description:
			"Log episodes and movies, mark progress, and keep a clear history of what you've watched.",
		icon: CheckCircle2,
	},
	{
		title: "Never lose your place",
		description:
			"See what you're currently watching and jump back in instantly, even across multiple shows.",
		icon: Clock3,
	},
	{
		title: "Know what's next",
		description:
			"Upcoming releases and weekly drops are highlighted so you're ready when new episodes land.",
		icon: CalendarDays,
	},
	{
		title: "Built for discovery",
		description:
			"A calm space to find new titles you haven't watched yet—no ads, no clutter.",
		icon: Sparkles,
	},
];

export function Features() {
	return (
		<section id="features" className="relative border-t py-24 sm:py-32">
			<div className="glow-orb-subtle absolute top-0 right-0 h-[400px] w-[500px]" />
			<div className="relative mx-auto max-w-6xl px-4">
				<div className="flex flex-col gap-4 text-center">
					<span className="bg-primary/10 text-primary mx-auto inline-block rounded-full px-3 py-1 text-[11px] font-medium tracking-[0.2em] uppercase">
						Features
					</span>
					<h2 className="text-3xl font-semibold sm:text-4xl lg:text-5xl">
						Everything you need.
						<br />
						<span className="text-muted-foreground">
							Nothing you don&apos;t.
						</span>
					</h2>
					<p className="text-muted-foreground mx-auto max-w-2xl text-pretty">
						Hivio is built for people who want to enjoy their shows, not manage
						spreadsheets. Clear progress, smart reminders, and a dashboard that
						stays out of the way.
					</p>
				</div>

				<div className="mt-16 grid gap-5 sm:grid-cols-2">
					{features.map((feature, idx) => (
						<div
							key={feature.title}
							className="animate-enter"
							style={{ animationDelay: `${idx * 80}ms` }}
						>
							<div className="bg-card ring-border/50 group rounded-xl p-6 ring-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)] transition-spring hover:ring-primary/20">
								<div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] transition-spring group-hover:scale-105">
									<feature.icon className="size-5" />
								</div>
								<h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
								<p className="text-muted-foreground mt-2 text-sm leading-relaxed">
									{feature.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
