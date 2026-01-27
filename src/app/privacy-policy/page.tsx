import Link from "next/link";

import { HivioLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Hivio collects, uses, and protects your personal information.",
};

export default function PrivacyPolicy() {
  return (
    <main className="bg-background text-foreground flex min-h-screen flex-col">
      <div className="pointer-events-none fixed top-4 z-50 w-full px-4">
        <div className="mx-auto flex max-w-6xl">
          <div className="border-border/60 bg-background/80 ring-border/40 pointer-events-auto flex w-full items-center justify-between rounded-full border px-3 py-2 shadow-lg ring-1 shadow-black/5 backdrop-blur">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold transition-opacity hover:opacity-90"
            >
              <HivioLogo className="text-primary" />
            </Link>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground hidden rounded-full px-3 text-xs sm:inline-flex"
            >
              <Link href="/">← Back to home</Link>
            </Button>
          </div>
        </div>
      </div>

      <section className="px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <p className="text-primary text-sm font-semibold tracking-widest uppercase">
              Legal
            </p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground mt-4">
              Last updated:{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="text-muted-foreground space-y-8">
            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                1. Introduction
              </h2>
              <p>
                Welcome to Hivio (&quot;we,&quot; &quot;our,&quot; or
                &quot;us&quot;). We are committed to protecting your privacy and
                being transparent about how we collect, use, and protect your
                personal information. This Privacy Policy explains our practices
                regarding your data when you use our media tracking application.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                2. Information We Collect
              </h2>

              <div className="space-y-3">
                <h3 className="text-foreground text-xl font-semibold">
                  2.1 Information You Provide
                </h3>
                <p>
                  When you sign in to Hivio using Discord OAuth, we collect the
                  following information from your Discord account:
                </p>
                <ul className="ml-4 list-inside list-disc space-y-1">
                  <li>
                    <strong className="text-foreground font-medium">
                      Email address
                    </strong>{" "}
                    - Used for account identification and communication
                  </li>
                  <li>
                    <strong className="text-foreground font-medium">
                      Username/Display name
                    </strong>{" "}
                    - Used to personalize your experience
                  </li>
                  <li>
                    <strong className="text-foreground font-medium">
                      Profile picture
                    </strong>{" "}
                    - Used to enhance your user interface
                  </li>
                  <li>
                    <strong className="text-foreground font-medium">
                      Discord User ID
                    </strong>{" "}
                    - Used for account management and linking
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-foreground text-xl font-semibold">
                  2.2 Information We Collect Automatically
                </h3>
                <p>As you use our application, we collect:</p>
                <ul className="ml-4 list-inside list-disc space-y-1">
                  <li>
                    <strong className="text-foreground font-medium">
                      Watch History
                    </strong>{" "}
                    - Movies and TV shows you&apos;ve tracked, including watch
                    status, progress, and ratings
                  </li>
                  <li>
                    <strong className="text-foreground font-medium">
                      Usage Data
                    </strong>{" "}
                    - How you interact with our application
                  </li>
                  <li>
                    <strong className="text-foreground font-medium">
                      Device Information
                    </strong>{" "}
                    - Browser type, operating system, and screen resolution
                  </li>
                  <li>
                    <strong className="text-foreground font-medium">
                      Log Data
                    </strong>{" "}
                    - Server logs including timestamps and error reports
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-foreground text-xl font-semibold">
                  2.3 Third-Party Data
                </h3>
                <p>
                  We integrate with The Movie Database (TMDB) API to provide
                  movie and TV show information. We cache this data locally to
                  improve performance, but we do not store or share this
                  information beyond providing it to you through our
                  application.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                3. How We Use Your Information
              </h2>
              <p>We use the information we collect to:</p>
              <ul className="ml-4 list-inside list-disc space-y-1">
                <li>Provide and maintain our media tracking service</li>
                <li>Personalize your experience and dashboard</li>
                <li>Sync your watch history across devices</li>
                <li>Improve our application and develop new features</li>
                <li>Communicate with you about service updates or issues</li>
                <li>Ensure security and prevent abuse</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                4. Information Sharing and Disclosure
              </h2>
              <p>
                We do not sell, trade, or otherwise transfer your personal
                information to third parties, except in the following limited
                circumstances:
              </p>
              <ul className="ml-4 list-inside list-disc space-y-1">
                <li>
                  <strong className="text-foreground font-medium">
                    Service Providers
                  </strong>{" "}
                  - We use Convex and TMDB APIs to power our application. These
                  providers have access to data necessary to provide their
                  services.
                </li>
                <li>
                  <strong className="text-foreground font-medium">
                    Legal Requirements
                  </strong>{" "}
                  - We may disclose information if required by law or to protect
                  our rights and safety.
                </li>
                <li>
                  <strong className="text-foreground font-medium">
                    Business Transfers
                  </strong>{" "}
                  - In the event of a merger, acquisition, or sale of assets,
                  your data may be transferred.
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                5. Data Security
              </h2>
              <p>
                We implement appropriate technical and organizational measures
                to protect your personal information against unauthorized
                access, alteration, disclosure, or destruction. This includes:
              </p>
              <ul className="ml-4 list-inside list-disc space-y-1">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication using industry-standard protocols</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal data on a need-to-know basis</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                6. Data Retention
              </h2>
              <p>
                We retain your personal information for as long as necessary to
                provide our services and comply with legal obligations.
                Specifically:
              </p>
              <ul className="ml-4 list-inside list-disc space-y-1">
                <li>
                  <strong className="text-foreground font-medium">
                    Account Data
                  </strong>{" "}
                  - Retained while your account is active and for a reasonable
                  period after deletion
                </li>
                <li>
                  <strong className="text-foreground font-medium">
                    Watch History
                  </strong>{" "}
                  - Retained indefinitely unless you request deletion
                </li>
                <li>
                  <strong className="text-foreground font-medium">
                    Cached TMDB Data
                  </strong>{" "}
                  - Retained for performance purposes and periodically refreshed
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                7. Your Rights
              </h2>
              <p>
                You have the following rights regarding your personal
                information:
              </p>
              <ul className="ml-4 list-inside list-disc space-y-1">
                <li>
                  <strong className="text-foreground font-medium">
                    Access
                  </strong>{" "}
                  - Request a copy of your personal data
                </li>
                <li>
                  <strong className="text-foreground font-medium">
                    Correction
                  </strong>{" "}
                  - Update or correct inaccurate information
                </li>
                <li>
                  <strong className="text-foreground font-medium">
                    Deletion
                  </strong>{" "}
                  - Request deletion of your account and associated data
                </li>
                <li>
                  <strong className="text-foreground font-medium">
                    Portability
                  </strong>{" "}
                  - Request your data in a portable format
                </li>
                <li>
                  <strong className="text-foreground font-medium">
                    Opt-out
                  </strong>{" "}
                  - Withdraw consent for data processing
                </li>
              </ul>
              <p>
                To exercise these rights, please contact us at our support
                channels.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                8. Cookies and Tracking
              </h2>
              <p>
                We use cookies and similar technologies to maintain your session
                and improve your experience. These include:
              </p>
              <ul className="ml-4 list-inside list-disc space-y-1">
                <li>
                  <strong className="text-foreground font-medium">
                    Authentication Cookies
                  </strong>{" "}
                  - To keep you signed in securely
                </li>
                <li>
                  <strong className="text-foreground font-medium">
                    Preference Cookies
                  </strong>{" "}
                  - To remember your settings and preferences
                </li>
                <li>
                  <strong className="text-foreground font-medium">
                    Analytics Cookies
                  </strong>{" "}
                  - To understand how our application is used (optional)
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                9. Third-Party Services
              </h2>
              <p>Hivio integrates with the following third-party services:</p>
              <ul className="ml-4 list-inside list-disc space-y-1">
                <li>
                  <strong className="text-foreground font-medium">
                    Discord
                  </strong>{" "}
                  - For authentication and user profile information
                </li>
                <li>
                  <strong className="text-foreground font-medium">
                    The Movie Database (TMDB)
                  </strong>{" "}
                  - For movie and TV show data
                </li>
                <li>
                  <strong className="text-foreground font-medium">
                    Convex
                  </strong>{" "}
                  - For data storage and real-time synchronization
                </li>
              </ul>
              <p>
                Each of these services has their own privacy policies, which we
                encourage you to review.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                10. Children&apos;s Privacy
              </h2>
              <p>
                Our service is not intended for children under 13 years of age.
                We do not knowingly collect personal information from children
                under 13. If you are a parent or guardian and believe your child
                has provided us with personal information, please contact us.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                11. International Data Transfers
              </h2>
              <p>
                Your data may be transferred to and processed in countries other
                than your own. We ensure appropriate safeguards are in place to
                protect your data during such transfers.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                12. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. We will
                notify you of any material changes by posting the new policy on
                this page and updating the &quot;Last updated&quot; date. Your
                continued use of our service after such changes constitutes
                acceptance of the updated policy.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                13. Contact Us
              </h2>
              <p>
                If you have any questions about this Privacy Policy or our data
                practices, please contact us through our support channels or by
                email.
              </p>
            </section>

            <div className="bg-muted/30 mt-8 rounded-lg border p-6">
              <p className="text-muted-foreground text-sm">
                This privacy policy is effective as of{" "}
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
