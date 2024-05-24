import {
  DiscordIcon,
  GithubIcon,
  PersonalWebsiteIcon,
  TwitterIcon,
} from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "About Hivio",
};

export default function About() {
  return (
    <main className="flex-1 bg-primary pt-14 text-secondary-foreground dark:text-secondary">
      <section className="w-full py-12 ">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4">
            <h1 className="text-center text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              About Hivio
            </h1>
            <div className="flex w-full flex-col gap-4 text-lg">
              <h2 className="my-4 text-2xl font-bold">What is Hivio?</h2>
              <Paragraph>
                Hivio, a word that comes from the combination of
                &quot;hive&quot; (a bee hive) and &quot;io&quot; (for technology
                or input/output), pronounced /haɪˈviːoʊ/ (HAY-vee-oh), is a tool
                that helps you easily search, add, manage and organize your
                series and movies through a user-friendly way. It also helps you
                discover new content that you might like to watch with the help
                of the Hivio community (public user profiles).
              </Paragraph>
              <h2 className="my-4 text-2xl font-bold">The Why</h2>
              <Paragraph>
                When exploring for something that fit my needs of simply easily
                tracking my movies and series, I couldn&apos;t find anything
                until I started crafting Hivio, I came across a tool called{" "}
                <ExternalLink href="https://trakt.tv" label="Trakt" />, but it
                seemed too bloated with features, ads, and quite overkill for
                just tracking what I&apos;m currently watching since I watch
                from 3-6 shows at a time on average since only 1 episode comes
                out per week and can easily lose track while also watching
                movies on the side while I wait for new episodes and having a
                history of what I&apos;ve watched and also be able to recommend
                titles to friends when they need some recommendations. So when I
                saw the{" "}
                <ExternalLink
                  href="https://hackathon.edgedb.com/"
                  label="EdgeDB Hackathon"
                />{" "}
                announcement, the opportunity was there to build something,
                Hivio was then born.
              </Paragraph>
              <Paragraph>
                I&apos;ve given this a try before but on a much smaller and more
                personal scale, this project can be seen{" "}
                <ExternalLink
                  href="https://watchlist.abraham.lat/"
                  label="Peronal Watchlist"
                />{" "}
                but, has quite a lot of limitations, flaws and very few features
                where, only I can add titles through a dashboard that
                wasn&apos;t that user-friendly in the first place. This changes
                when using Hivio, the experience is much better from sharing, to
                discovering new content and even adding something to your hive
                watchlist.
              </Paragraph>
              <h2 className="my-4 text-2xl font-bold">Building Hivio</h2>
              <Paragraph>
                Hivio is built using{" "}
                <ExternalLink href="https://edgedb.com/" label="EdgeDB" /> which
                is used for storing movie and series with their basic metadata
                (kind of used like a cache and updates every certain time) since
                not all data can be kept up to date such as ratings or cast
                members which in some cases, the given title is very new and has
                to get updated directly from the provider, the provider being in
                this case{" "}
                <ExternalLink href="https://www.themoviedb.org/" label="TMDB" />
                , a movie and series database with a very generous free API.
              </Paragraph>
              <Paragraph>
                It also uses EdgeDB for authentication with Google OAuth
                provider (for now) to be able to save movies and series for
                every user and also be able to create a personalized public
                profile with their stats and history that users can share with
                their friends.
              </Paragraph>
              <Paragraph>
                It is also built using{" "}
                <ExternalLink href="https://nextjs.org/" label="Next.js" /> with
                Server Actions (with{" "}
                <ExternalLink
                  href="https://next-safe-action.dev/"
                  label="next-safe-action"
                />
                ),{" "}
                <ExternalLink
                  href="https://tailwindcss.com/"
                  label="TailwindCSS"
                />{" "}
                for styling and{" "}
                <ExternalLink href="https://ui.shadcn.com/" label="shadcn/ui" />{" "}
                for UI components and all deployed on{" "}
                <ExternalLink href="https://vercel.com/" label="Vercel" />. And
                of course, it uses Typescript.
              </Paragraph>
              <h2 className="my-4 text-2xl font-bold">My Overall Experience</h2>
              <Paragraph>
                Using EdgeDB was a challenge at first, but after 1-2 days of
                fiddling around, I was able to get the hang of it very quick, I
                being a fellow user of Prisma and from time to time also a
                Drizzle user, EdgeDB did have its learning curve but, it all
                resulted in a good experience at the end. Huge thanks to the
                wonderful support team in their Discord, I was able to learn and
                master some concepts of EdgeDB with their help which helped me
                massively refactor some of my code.
              </Paragraph>
              <Paragraph>
                While building the UI, it was quite a challenge to get things
                right, I went through 3 iterations just for the &quot;Add
                Title&quot; to hive Actions, 2 iterations for the public profile
                and 3 iterations just for the hive dashboard layout.
              </Paragraph>
              <Paragraph>
                Though, I also enjoyed the fact that you can set up a whole
                development environment with authentication flow in a few
                minutes and within a few commands, you can have it in production
                and on the EdgeDB Cloud and obviously, I couldn&apos;t have
                deployed this fast without Vercel, which I use mainly for all my
                projects.
              </Paragraph>
              <div className="mt-8 flex flex-col items-center  gap-2 align-middle sm:flex-row">
                <p className="w-fit rounded-md border-2 border-dashed border-secondary-foreground px-4 py-2 text-2xl tracking-tight dark:border-secondary">
                  Built by Abraham{" "}
                  <span className="text-sm text-muted-foreground dark:text-muted">
                    (AbrahamX3)
                  </span>
                </p>
                <div className="flex items-center gap-2 align-middle">
                  <SocialLink
                    href="https://github.com/AbrahamX3"
                    label="GitHub"
                  >
                    <GithubIcon className="size-6" />
                  </SocialLink>
                  <SocialLink href="https://twitter.com/x3_abe" label="X">
                    <TwitterIcon className="size-5 text-black dark:text-white" />
                  </SocialLink>
                  <SocialLink
                    href="https://discord.com/users/247971007409684480"
                    label="Discord"
                  >
                    <DiscordIcon className="size-6" />
                  </SocialLink>
                  <SocialLink
                    href="https://abraham.lat/"
                    label="Personal Website"
                  >
                    <PersonalWebsiteIcon />
                  </SocialLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <a
            target="_blank"
            rel="noreferrer"
            href={href}
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "size-10 sm:size-14",
            )}
          >
            {children} <span className="sr-only">{label}</span>
          </a>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      target="_blank"
      rel="noreferrer"
      href={href}
      className="font-semibold underline underline-offset-4"
    >
      {label}
    </a>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-pretty font-medium leading-relaxed tracking-wide text-primary-foreground">
      {children}
    </p>
  );
}
