import ActiveLink from "./_components/active-link";

export default async function Settings({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="mx-auto grid w-full gap-2">
        <h1 className="text-3xl font-semibold">Settings</h1>
      </div>
      <div className="mx-auto grid w-full items-start gap-6 pt-4 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
        <nav className="grid gap-4 text-sm text-muted-foreground">
          <ActiveLink path="/hive/settings" label="General" />
          <ActiveLink path="/hive/settings/danger" label="Danger" />
        </nav>
        <div className="grid gap-6">{children}</div>
      </div>
    </main>
  );
}
