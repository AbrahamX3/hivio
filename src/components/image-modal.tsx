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
}

export default function ImageModal({
  url,
  alt,
  width,
  height,
  className,
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
          className="rounded object-cover"
        />
      </DialogContent>
    </Dialog>
  );
}
