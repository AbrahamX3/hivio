import Header from "@/components/header";
import LogoFull, {
  EdgeDBIcon,
  GithubIcon,
  TMDBIcon,
  VercelIcon,
} from "@/components/icons";

export default async function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <Header />
      {children}
      <footer className="container flex w-full items-center justify-between py-6">
        <div className="flex items-center gap-4 align-middle">
          <LogoFull className="h-6 w-auto" />
          <div className="flex items-center gap-2 align-middle">
            <span className="font-medium">Source code available on</span>
            <a
              rel="noopener"
              className="transition-all duration-150 hover:scale-105 hover:opacity-90"
              target="_blank"
              href="https://github.com/AbrahamX3/hivio"
            >
              <GithubIcon />
            </a>
          </div>
        </div>
        <nav className="flex flex-row items-center gap-4 align-middle">
          <span className="font-medium">Deployed on</span>
          <a
            className="transition-all duration-150 hover:scale-105 hover:opacity-90"
            rel="noopener"
            target="_blank"
            href="https://vercel.com/"
          >
            <VercelIcon className="h-4 w-auto" />
          </a>
          <span className="font-medium">Powered by</span>
          <a
            className="transition-all duration-150 hover:scale-105 hover:opacity-90"
            rel="noopener"
            target="_blank"
            href="https://www.edgedb.com/"
          >
            <EdgeDBIcon className="h-6 w-auto" />
          </a>
          <span className="font-medium">&</span>
          <a
            className="transition-all duration-150 hover:scale-105 hover:opacity-90"
            rel="noopener"
            target="_blank"
            href="https://www.themoviedb.org/"
          >
            <TMDBIcon className="h-6 w-auto" />
          </a>
        </nav>
      </footer>
    </div>
  );
}
