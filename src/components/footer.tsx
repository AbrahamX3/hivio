import { DotIcon } from "lucide-react";

import LogoFull, {
  EdgeDBIcon,
  GithubIcon,
  TMDBIcon,
  VercelIcon,
} from "@/components/icons";

export function Footer() {
  return (
    <footer className="w-full border-2 border-b-0 border-l-0 border-r-0 border-t-border bg-background">
      <div className="container flex w-full flex-col items-center justify-between gap-4 py-6 md:flex-row md:gap-0">
        <div className="flex items-center gap-4 align-middle">
          <LogoFull className="h-6 w-auto" />
          <div className="flex items-center gap-2 align-middle">
            <span className="font-medium md:hidden lg:block">
              Source code available on
            </span>
            <a
              aria-label="GitHub"
              rel="noopener noreferrer"
              className="transition-all duration-150 hover:scale-105 hover:opacity-90"
              target="_blank"
              href="https://github.com/AbrahamX3/hivio"
            >
              <GithubIcon />
            </a>
          </div>
        </div>
        <nav className="flex flex-col items-center gap-4 align-middle md:flex-row">
          <div className="flex items-center gap-2 align-middle">
            <span className="font-medium">Deployed on</span>
            <a
              aria-label="Vercel"
              className="transition-all duration-150 hover:scale-105 hover:opacity-90"
              rel="noopener noreferrer"
              target="_blank"
              href="https://vercel.com/"
            >
              <VercelIcon className="h-4 w-auto" />
            </a>
          </div>
          <DotIcon className="hidden size-4 md:block" />
          <div className="flex items-center gap-2 align-middle">
            <span className="font-medium">Powered by</span>
            <a
              aria-label="EdgeDB"
              className="transition-all duration-150 hover:scale-105 hover:opacity-90"
              rel="noopener noreferrer"
              target="_blank"
              href="https://www.edgedb.com/"
            >
              <EdgeDBIcon className="h-6 w-auto" />
            </a>
            <span className="font-medium">&</span>
            <a
              aria-label="TMDB"
              className="transition-all duration-150 hover:scale-105 hover:opacity-90"
              rel="noopener noreferrer"
              target="_blank"
              href="https://www.themoviedb.org/"
            >
              <TMDBIcon className="h-6 w-auto" />
            </a>
          </div>
        </nav>
      </div>
    </footer>
  );
}
