import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn, tmdbImageLoader } from "@/lib/utils";
import Image from "next/image";

interface Props {
  url: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  loading?: "eager" | "lazy";
}

export default function ImageModal({
  url,
  alt,
  width,
  height,
  className,
  loading = "lazy",
}: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Image
          width={width}
          height={height}
          loader={tmdbImageLoader}
          src={url}
          alt={alt}
          className={cn("cursor-pointer rounded object-cover", className)}
          loading={loading}
        />
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{alt}</DialogTitle>
        <Image
          width={1000}
          height={1000}
          loader={tmdbImageLoader}
          src={url}
          alt={alt}
          loading="lazy"
          className="rounded object-cover"
        />
      </DialogContent>
    </Dialog>
  );
}
