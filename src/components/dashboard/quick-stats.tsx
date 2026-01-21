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
        <CardTitle>Overview</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <div className="bg-muted/30 rounded-xl border p-4">
          <p className="text-muted-foreground text-xs uppercase">Watching</p>
          <p className="mt-2 text-2xl font-semibold">{watching}</p>
          <p className="text-muted-foreground text-xs">
            Titles in progress right now.
          </p>
        </div>
        <div className="bg-muted/30 rounded-xl border p-4">
          <p className="text-muted-foreground text-xs uppercase">Completed</p>
          <p className="mt-2 text-2xl font-semibold">{finished}</p>
          <p className="text-muted-foreground text-xs">
            Finished titles in your library.
          </p>
        </div>
        <div className="bg-muted/30 rounded-xl border p-4">
          <p className="text-muted-foreground text-xs uppercase">Planned</p>
          <p className="mt-2 text-2xl font-semibold">{planned}</p>
          <p className="text-muted-foreground text-xs">Lined up for later.</p>
        </div>
        <div className="bg-muted/30 rounded-xl border p-4">
          <p className="text-muted-foreground text-xs uppercase">Favorites</p>
          <p className="mt-2 text-2xl font-semibold">{favourites}</p>
          <p className="text-muted-foreground text-xs">
            Saved titles you love.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
