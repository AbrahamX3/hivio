import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { tmdbImageLoader } from "@/lib/utils";
import Image from "next/image";

interface Props {
  url: string;
  alt: string;
  width: number;
  height: number;
}

export default function ImageModal({ url, alt, width, height }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Image
          width={width}
          height={height}
          loader={tmdbImageLoader}
          src={url}
          alt={alt}
          className="h-12 w-8 object-cover rounded"
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
          className="object-cover rounded"
        />
      </DialogContent>
    </Dialog>
  );
}
