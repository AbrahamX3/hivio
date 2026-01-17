import { CalendarDays, CheckCircle2, Clock3, Sparkles } from "lucide-react";

const features = [
  {
    title: "Track everything",
    description:
      "Log episodes and movies, mark progress, and keep a clear history of what you’ve watched.",
    icon: CheckCircle2,
  },
  {
    title: "Never lose your place",
    description:
      "See what you’re currently watching and jump back in instantly, even across multiple shows.",
    icon: Clock3,
  },
  {
    title: "Know what’s next",
    description:
      "Upcoming releases and weekly drops are highlighted so you’re ready when new episodes land.",
    icon: CalendarDays,
  },
  {
    title: "Built for discovery",
    description:
      "A calm space to find new titles you haven’t watched yet—no ads, no clutter.",
    icon: Sparkles,
  },
];

export function Features() {
  return (
    <section id="features" className="bg-muted/30 border-t py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-3 text-center sm:gap-4">
          <p className="text-primary text-sm font-medium tracking-widest uppercase">
            Simple by design
          </p>
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Everything you need to keep up, nothing you don’t.
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            Hivio is built for people who want to enjoy their shows, not manage
            spreadsheets. Clear progress, smart reminders, and a dashboard that
            stays out of the way.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group bg-background rounded-2xl border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
