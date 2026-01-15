import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickStatsProps {
  watching: number;
  finished: number;
  planned: number;
  favourites: number;
}

export function QuickStats({
  watching,
  finished,
  planned,
  favourites,
}: QuickStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick stats</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border bg-muted/30 p-4">
          <p className="text-xs uppercase text-muted-foreground">Watching</p>
          <p className="mt-2 text-2xl font-semibold">{watching}</p>
          <p className="text-xs text-muted-foreground">
            Titles in progress right now.
          </p>
        </div>
        <div className="rounded-xl border bg-muted/30 p-4">
          <p className="text-xs uppercase text-muted-foreground">Completed</p>
          <p className="mt-2 text-2xl font-semibold">{finished}</p>
          <p className="text-xs text-muted-foreground">
            Finished titles in your library.
          </p>
        </div>
        <div className="rounded-xl border bg-muted/30 p-4">
          <p className="text-xs uppercase text-muted-foreground">Planned</p>
          <p className="mt-2 text-2xl font-semibold">{planned}</p>
          <p className="text-xs text-muted-foreground">Lined up for later.</p>
        </div>
        <div className="rounded-xl border bg-muted/30 p-4">
          <p className="text-xs uppercase text-muted-foreground">Favorites</p>
          <p className="mt-2 text-2xl font-semibold">{favourites}</p>
          <p className="text-xs text-muted-foreground">
            Saved highlights you love.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
