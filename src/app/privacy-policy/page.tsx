import { LegalPageLayout } from "@/app/_components/legal-page-layout";
import { LegalSection, LegalSubsection } from "@/app/_components/legal-section";

export const metadata = {
	title: "Privacy Policy",
	description:
		"Learn how Hivio collects, uses, and protects your personal information.",
};

export default function PrivacyPolicy() {
	return (
		<LegalPageLayout title="Privacy Policy">
			<LegalSection title="1. Introduction">
				<p>
					Welcome to Hivio (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;).
					We are committed to protecting your privacy and being transparent
					about how we collect, use, and protect your personal information. This
					Privacy Policy explains our practices regarding your data when you use
					our media tracking application.
				</p>
			</LegalSection>

			<LegalSection title="2. Information We Collect">
				<LegalSubsection title="2.1 Information You Provide">
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
				</LegalSubsection>
				<LegalSubsection title="2.2 Information We Collect Automatically">
					<p>As you use our application, we collect:</p>
					<ul className="ml-4 list-inside list-disc space-y-1">
						<li>
							<strong className="text-foreground font-medium">
								Watch History
							</strong>{" "}
							- Movies and TV shows you&apos;ve tracked, including watch status,
							progress, and ratings
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
							<strong className="text-foreground font-medium">Log Data</strong>{" "}
							- Server logs including timestamps and error reports
						</li>
					</ul>
				</LegalSubsection>
				<LegalSubsection title="2.3 Third-Party Data">
					<p>
						We integrate with The Movie Database (TMDB) API to provide movie and
						TV show information. We cache this data locally to improve
						performance, but we do not store or share this information beyond
						providing it to you through our application.
					</p>
				</LegalSubsection>
			</LegalSection>

			<LegalSection title="3. How We Use Your Information">
				<p>We use the information we collect to:</p>
				<ul className="ml-4 list-inside list-disc space-y-1">
					<li>Provide and maintain our media tracking service</li>
					<li>Personalize your experience and dashboard</li>
					<li>Sync your watch history across devices</li>
					<li>Improve our application and develop new features</li>
					<li>Communicate with you about service updates or issues</li>
					<li>Ensure security and prevent abuse</li>
				</ul>
			</LegalSection>

			<LegalSection title="4. Information Sharing and Disclosure">
				<p>
					We do not sell, trade, or otherwise transfer your personal information
					to third parties, except in the following limited circumstances:
				</p>
				<ul className="ml-4 list-inside list-disc space-y-1">
					<li>
						<strong className="text-foreground font-medium">
							Service Providers
						</strong>{" "}
						- We use Convex and TMDB APIs to power our application. These
						providers have access to data necessary to provide their services.
					</li>
					<li>
						<strong className="text-foreground font-medium">
							Legal Requirements
						</strong>{" "}
						- We may disclose information if required by law or to protect our
						rights and safety.
					</li>
					<li>
						<strong className="text-foreground font-medium">
							Business Transfers
						</strong>{" "}
						- In the event of a merger, acquisition, or sale of assets, your
						data may be transferred.
					</li>
				</ul>
			</LegalSection>

			<LegalSection title="5. Data Security">
				<p>
					We implement appropriate technical and organizational measures to
					protect your personal information against unauthorized access,
					alteration, disclosure, or destruction. This includes:
				</p>
				<ul className="ml-4 list-inside list-disc space-y-1">
					<li>Encryption of data in transit and at rest</li>
					<li>Secure authentication using industry-standard protocols</li>
					<li>Regular security audits and updates</li>
					<li>Limited access to personal data on a need-to-know basis</li>
				</ul>
			</LegalSection>

			<LegalSection title="6. Data Retention">
				<p>
					We retain your personal information for as long as necessary to
					provide our services and comply with legal obligations. Specifically:
				</p>
				<ul className="ml-4 list-inside list-disc space-y-1">
					<li>
						<strong className="text-foreground font-medium">
							Account Data
						</strong>{" "}
						- Retained while your account is active and for a reasonable period
						after deletion
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
			</LegalSection>

			<LegalSection title="7. Your Rights">
				<p>
					You have the following rights regarding your personal information:
				</p>
				<ul className="ml-4 list-inside list-disc space-y-1">
					<li>
						<strong className="text-foreground font-medium">Access</strong> -
						Request a copy of your personal data
					</li>
					<li>
						<strong className="text-foreground font-medium">Correction</strong>{" "}
						- Update or correct inaccurate information
					</li>
					<li>
						<strong className="text-foreground font-medium">Deletion</strong> -
						Request deletion of your account and associated data
					</li>
					<li>
						<strong className="text-foreground font-medium">Portability</strong>{" "}
						- Request your data in a portable format
					</li>
					<li>
						<strong className="text-foreground font-medium">Opt-out</strong> -
						Withdraw consent for data processing
					</li>
				</ul>
				<p>
					To exercise these rights, please contact us at our support channels.
				</p>
			</LegalSection>

			<LegalSection title="8. Cookies and Tracking">
				<p>
					We use cookies and similar technologies to maintain your session and
					improve your experience. These include:
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
			</LegalSection>

			<LegalSection title="9. Third-Party Services">
				<p>Hivio integrates with the following third-party services:</p>
				<ul className="ml-4 list-inside list-disc space-y-1">
					<li>
						<strong className="text-foreground font-medium">Discord</strong> -
						For authentication and user profile information
					</li>
					<li>
						<strong className="text-foreground font-medium">
							The Movie Database (TMDB)
						</strong>{" "}
						- For movie and TV show data
					</li>
					<li>
						<strong className="text-foreground font-medium">Convex</strong> -
						For data storage and real-time synchronization
					</li>
				</ul>
				<p>
					Each of these services has their own privacy policies, which we
					encourage you to review.
				</p>
			</LegalSection>

			<LegalSection title="10. Children's Privacy">
				<p>
					Our service is not intended for children under 13 years of age. We do
					not knowingly collect personal information from children under 13. If
					you are a parent or guardian and believe your child has provided us
					with personal information, please contact us.
				</p>
			</LegalSection>

			<LegalSection title="11. International Data Transfers">
				<p>
					Your data may be transferred to and processed in countries other than
					your own. We ensure appropriate safeguards are in place to protect
					your data during such transfers.
				</p>
			</LegalSection>

			<LegalSection title="12. Changes to This Policy">
				<p>
					We may update this Privacy Policy from time to time. We will notify
					you of any material changes by posting the new policy on this page and
					updating the &quot;Last updated&quot; date. Your continued use of our
					service after such changes constitutes acceptance of the updated
					policy.
				</p>
			</LegalSection>

			<LegalSection title="13. Contact Us">
				<p>
					If you have any questions about this Privacy Policy or our data
					practices, please contact us through our support channels or by email.
				</p>
			</LegalSection>

			<div className="bg-muted/30 mt-8 rounded-lg border p-6">
				<p className="text-muted-foreground text-sm">
					This privacy policy is effective as of April 25, 2026.
				</p>
			</div>
		</LegalPageLayout>
	);
}
