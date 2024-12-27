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
			<section className="w-full py-12">
				<div className="container px-4 md:px-6">
					<div className="flex flex-col items-center space-y-4">
						<h1 className="text-center font-bold text-3xl tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
							About Hivio
						</h1>
						<div className="flex w-full flex-col gap-4 text-lg">
							<h2 className="my-4 font-bold text-2xl">What is Hivio?</h2>
							<Paragraph>
								Hivio (pronounced /haɪˈviːoʊ/, HAY-vee-oh) is a web tool
								designed to help you effortlessly search, add, manage, and
								organize your favorite series and movies through a user-friendly
								interface. It also enables discovery of new content you might
								enjoy by exploring other users' profiles.
							</Paragraph>
							<h2 className="my-4 font-bold text-2xl">Why I Built Hivio</h2>
							<Paragraph>
								When I set out to find a tool to easily track my movies and
								series, I couldn’t find anything that fit my needs. Some
								solutions only tracked movies, while others lacked user-friendly
								organization or the ability to assign custom statuses. My
								personal use case involves juggling multiple shows—usually 3 to
								6 at a time—many of which release episodes weekly. Keeping track
								of everything, especially while watching movies in between,
								often became overwhelming. That’s why I built Hivio: to simplify
								the process for myself—and maybe for you too.
							</Paragraph>
							<div className="mt-8 flex flex-col items-center gap-2 align-middle sm:flex-row">
								<p className="w-fit rounded-md border-2 border-secondary-foreground border-dashed px-4 py-2 text-2xl tracking-tight dark:border-secondary">
									Built by Abraham{" "}
									<span className="text-muted-foreground text-sm dark:text-muted">
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
		<p className="text-pretty font-medium text-primary-foreground leading-relaxed tracking-wide">
			{children}
		</p>
	);
}
