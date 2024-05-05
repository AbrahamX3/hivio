"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
  id: string;
}

export default function DataTableLabelId({ id }: Props) {
  return (
    <Badge variant="outline" className="flex w-52 justify-between gap-x-2 py-1">
      <span className="text-xs">{id}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={async () => {
          await navigator.clipboard.writeText(id).then(() => {
            toast.success("Copied to Clipboard!");
          });
        }}
      >
        <Copy className="h-2 w-2 text-muted-foreground" />
      </Button>
    </Badge>
  );
}
