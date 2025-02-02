import { Settings2Icon, TriangleAlertIcon } from "lucide-react";

import { ActiveLink } from "./_components/active-link";

export default async function Settings({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 p-4">
			<div className="mx-auto grid w-full gap-2 rounded-md border px-4 py-4 lg:px-6">
				<h1 className="font-semibold text-3xl">Settings</h1>
				<p className="text-muted-foreground">
					Manage your general account settings and other options.
				</p>
			</div>
			<div className="mx-auto grid w-full items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
				<nav className="flex h-full flex-col gap-2 rounded-md border bg-background p-2 text-muted-foreground text-sm">
					<ActiveLink name="General" href="/app/settings">
						<Settings2Icon className="size-5" />
					</ActiveLink>
					<ActiveLink name="Danger" href="/app/settings/danger">
						<TriangleAlertIcon className="size-5" />
					</ActiveLink>
				</nav>
				<div className="grid gap-6">{children}</div>
			</div>
		</main>
	);
}
