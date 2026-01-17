import Link from "next/link";

import { HivioLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Terms of Service | Hivio",
  description: "Terms of service and usage guidelines for Hivio.",
};

export default function TermsOfService() {
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
              Terms of Service
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
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using Hivio (&quot;the Service&quot;), you accept and
                agree to be bound by the terms and provision of this agreement.
                If you do not agree to abide by the above, please do not use
                this service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                2. Description of Service
              </h2>
              <p>
                Hivio is a media tracking application that allows users to track
                their progress watching movies and television series. The
                service integrates with The Movie Database (TMDB) to provide
                comprehensive information about media content.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                3. User Accounts
              </h2>

              <div className="space-y-3">
                <h3 className="text-foreground text-xl font-semibold">
                  3.1 Account Creation
                </h3>
                <p>
                  To use certain features of the Service, you must create an
                  account by signing in through Discord OAuth. You are
                  responsible for maintaining the confidentiality of your
                  account credentials.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-foreground text-xl font-semibold">
                  3.2 Account Responsibilities
                </h3>
                <p>You agree to:</p>
                <ul className="ml-4 list-inside list-disc space-y-1">
                  <li>
                    Provide accurate and complete information when creating your
                    account
                  </li>
                  <li>
                    Maintain and update your account information as needed
                  </li>
                  <li>
                    Be responsible for all activities that occur under your
                    account
                  </li>
                  <li>
                    Notify us immediately of any unauthorized use of your
                    account
                  </li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                4. Acceptable Use Policy
              </h2>

              <div className="space-y-3">
                <h3 className="text-foreground text-xl font-semibold">
                  4.1 Permitted Use
                </h3>
                <p>
                  You may use the Service for personal, non-commercial purposes
                  to track your media consumption.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-foreground text-xl font-semibold">
                  4.2 Prohibited Activities
                </h3>
                <p>You agree not to:</p>
                <ul className="ml-4 list-inside list-disc space-y-1">
                  <li>
                    Use the Service for any illegal or unauthorized purpose
                  </li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with or disrupt the Service or servers</li>
                  <li>
                    Use automated tools to access the Service without permission
                  </li>
                  <li>Share your account credentials with others</li>
                  <li>Upload or transmit harmful code or content</li>
                  <li>Violate any applicable laws or regulations</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                5. Content and Data
              </h2>

              <div className="space-y-3">
                <h3 className="text-foreground text-xl font-semibold">
                  5.1 User Content
                </h3>
                <p>
                  You retain ownership of your watch history and personal data.
                  By using the Service, you grant us a limited license to store
                  and process this data to provide the Service.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-foreground text-xl font-semibold">
                  5.2 Third-Party Content
                </h3>
                <p>
                  Movie and TV show information is sourced from TMDB. We cache
                  this data for performance purposes, but do not claim ownership
                  of this content. All rights belong to their respective
                  copyright holders.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-foreground text-xl font-semibold">
                  5.3 Data Accuracy
                </h3>
                <p>
                  While we strive to provide accurate information, we cannot
                  guarantee the completeness or accuracy of data from
                  third-party sources like TMDB.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                6. Privacy and Data Protection
              </h2>
              <p>
                Your privacy is important to us. Please review our Privacy
                Policy, which also governs your use of the Service, to
                understand our practices.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                7. Service Availability
              </h2>

              <div className="space-y-3">
                <h3 className="text-foreground text-xl font-semibold">
                  7.1 Service Continuity
                </h3>
                <p>
                  We strive to provide continuous service but cannot guarantee
                  uninterrupted availability. The Service may be temporarily
                  unavailable due to maintenance, updates, or unforeseen
                  circumstances.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-foreground text-xl font-semibold">
                  7.2 Service Changes
                </h3>
                <p>
                  We reserve the right to modify, suspend, or discontinue the
                  Service at any time with or without notice. We will not be
                  liable to you for any such changes.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                8. Intellectual Property
              </h2>

              <div className="space-y-3">
                <h3 className="text-foreground text-xl font-semibold">
                  8.1 Our Rights
                </h3>
                <p>
                  The Service and its original content, features, and
                  functionality are owned by us and are protected by copyright,
                  trademark, and other intellectual property laws.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-foreground text-xl font-semibold">
                  8.2 Third-Party Rights
                </h3>
                <p>
                  TMDB content and Discord branding are owned by their
                  respective owners. All rights reserved.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                9. Disclaimers and Limitations
              </h2>

              <div className="space-y-3">
                <h3 className="text-foreground text-xl font-semibold">
                  9.1 No Warranties
                </h3>
                <p>
                  The Service is provided &quot;as is&quot; and &quot;as available&quot; without
                  warranties of any kind, either express or implied, including
                  but not limited to merchantability, fitness for a particular
                  purpose, and non-infringement.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-foreground text-xl font-semibold">
                  9.2 Limitation of Liability
                </h3>
                <p>
                  In no event shall we be liable for any indirect, incidental,
                  special, consequential, or punitive damages arising out of or
                  related to your use of the Service.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                10. Indemnification
              </h2>
              <p>
                You agree to indemnify and hold us harmless from any claims,
                damages, losses, or expenses arising from your use of the
                Service or violation of these Terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                11. Termination
              </h2>

              <div className="space-y-3">
                <h3 className="text-foreground text-xl font-semibold">
                  11.1 Termination by User
                </h3>
                <p>
                  You may terminate your account at any time by discontinuing
                  use of the Service. Upon termination, we will delete your
                  account data in accordance with our Privacy Policy.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-foreground text-xl font-semibold">
                  11.2 Termination by Us
                </h3>
                <p>
                  We may terminate or suspend your account immediately, without
                  prior notice, for conduct that we believe violates these Terms
                  or is harmful to other users, us, or third parties.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                12. Governing Law
              </h2>
              <p>
                These Terms shall be interpreted and governed by the laws of
                applicable jurisdiction, without regard to conflict of law
                provisions.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                13. Changes to Terms
              </h2>
              <p>
                We reserve the right to modify these Terms at any time. We will
                notify users of material changes via the Service or email. Your
                continued use of the Service after such changes constitutes
                acceptance of the new Terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-foreground text-2xl font-semibold">
                14. Contact Information
              </h2>
              <p>
                If you have any questions about these Terms of Service, please
                contact us through our support channels.
              </p>
            </section>

            <div className="bg-muted/30 mt-8 rounded-lg border p-6">
              <p className="text-muted-foreground text-sm">
                These Terms of Service are effective as of{" "}
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
