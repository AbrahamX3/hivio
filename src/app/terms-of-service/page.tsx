import { LegalPageLayout } from "@/app/_components/legal-page-layout";
import { LegalSection, LegalSubsection } from "@/app/_components/legal-section";

export const metadata = {
	title: "Terms of Service",
	description: "Terms of service and usage guidelines for Hivio.",
};

export default function TermsOfService() {
	return (
		<LegalPageLayout title="Terms of Service">
			<LegalSection title="1. Acceptance of Terms">
				<p>
					By accessing and using Hivio (&quot;the Service&quot;), you accept and
					agree to be bound by the terms and provision of this agreement. If you
					do not agree to abide by the above, please do not use this service.
				</p>
			</LegalSection>

			<LegalSection title="2. Description of Service">
				<p>
					Hivio is a media tracking application that allows users to track their
					progress watching movies and television series. The service integrates
					with The Movie Database (TMDB) to provide comprehensive information
					about media content.
				</p>
			</LegalSection>

			<LegalSection title="3. User Accounts">
				<LegalSubsection title="3.1 Account Creation">
					<p>
						To use certain features of the Service, you must create an account
						by signing in through Discord OAuth. You are responsible for
						maintaining the confidentiality of your account credentials.
					</p>
				</LegalSubsection>
				<LegalSubsection title="3.2 Account Responsibilities">
					<p>You agree to:</p>
					<ul className="ml-4 list-inside list-disc space-y-1">
						<li>
							Provide accurate and complete information when creating your
							account
						</li>
						<li>Maintain and update your account information as needed</li>
						<li>
							Be responsible for all activities that occur under your account
						</li>
						<li>
							Notify us immediately of any unauthorized use of your account
						</li>
					</ul>
				</LegalSubsection>
			</LegalSection>

			<LegalSection title="4. Acceptable Use Policy">
				<LegalSubsection title="4.1 Permitted Use">
					<p>
						You may use the Service for personal, non-commercial purposes to
						track your media consumption.
					</p>
				</LegalSubsection>
				<LegalSubsection title="4.2 Prohibited Activities">
					<p>You agree not to:</p>
					<ul className="ml-4 list-inside list-disc space-y-1">
						<li>Use the Service for any illegal or unauthorized purpose</li>
						<li>Attempt to gain unauthorized access to our systems</li>
						<li>Interfere with or disrupt the Service or servers</li>
						<li>
							Use automated tools to access the Service without permission
						</li>
						<li>Share your account credentials with others</li>
						<li>Upload or transmit harmful code or content</li>
						<li>Violate any applicable laws or regulations</li>
					</ul>
				</LegalSubsection>
			</LegalSection>

			<LegalSection title="5. Content and Data">
				<LegalSubsection title="5.1 User Content">
					<p>
						You retain ownership of your watch history and personal data. By
						using the Service, you grant us a limited license to store and
						process this data to provide the Service.
					</p>
				</LegalSubsection>
				<LegalSubsection title="5.2 Third-Party Content">
					<p>
						Movie and TV show information is sourced from TMDB. We cache this
						data for performance purposes, but do not claim ownership of this
						content. All rights belong to their respective copyright holders.
					</p>
				</LegalSubsection>
				<LegalSubsection title="5.3 Data Accuracy">
					<p>
						While we strive to provide accurate information, we cannot guarantee
						the completeness or accuracy of data from third-party sources like
						TMDB.
					</p>
				</LegalSubsection>
			</LegalSection>

			<LegalSection title="6. Privacy and Data Protection">
				<p>
					Your privacy is important to us. Please review our Privacy Policy,
					which also governs your use of the Service, to understand our
					practices.
				</p>
			</LegalSection>

			<LegalSection title="7. Service Availability">
				<LegalSubsection title="7.1 Service Continuity">
					<p>
						We strive to provide continuous service but cannot guarantee
						uninterrupted availability. The Service may be temporarily
						unavailable due to maintenance, updates, or unforeseen
						circumstances.
					</p>
				</LegalSubsection>
				<LegalSubsection title="7.2 Service Changes">
					<p>
						We reserve the right to modify, suspend, or discontinue the Service
						at any time with or without notice. We will not be liable to you for
						any such changes.
					</p>
				</LegalSubsection>
			</LegalSection>

			<LegalSection title="8. Intellectual Property">
				<LegalSubsection title="8.1 Our Rights">
					<p>
						The Service and its original content, features, and functionality
						are owned by us and are protected by copyright, trademark, and other
						intellectual property laws.
					</p>
				</LegalSubsection>
				<LegalSubsection title="8.2 Third-Party Rights">
					<p>
						TMDB content and Discord branding are owned by their respective
						owners. All rights reserved.
					</p>
				</LegalSubsection>
			</LegalSection>

			<LegalSection title="9. Disclaimers and Limitations">
				<LegalSubsection title="9.1 No Warranties">
					<p>
						The Service is provided &quot;as is&quot; and &quot;as
						available&quot; without warranties of any kind, either express or
						implied, including but not limited to merchantability, fitness for a
						particular purpose, and non-infringement.
					</p>
				</LegalSubsection>
				<LegalSubsection title="9.2 Limitation of Liability">
					<p>
						In no event shall we be liable for any indirect, incidental,
						special, consequential, or punitive damages arising out of or
						related to your use of the Service.
					</p>
				</LegalSubsection>
			</LegalSection>

			<LegalSection title="10. Indemnification">
				<p>
					You agree to indemnify and hold us harmless from any claims, damages,
					losses, or expenses arising from your use of the Service or violation
					of these Terms.
				</p>
			</LegalSection>

			<LegalSection title="11. Termination">
				<LegalSubsection title="11.1 Termination by User">
					<p>
						You may terminate your account at any time by discontinuing use of
						the Service. Upon termination, we will delete your account data in
						accordance with our Privacy Policy.
					</p>
				</LegalSubsection>
				<LegalSubsection title="11.2 Termination by Us">
					<p>
						We may terminate or suspend your account immediately, without prior
						notice, for conduct that we believe violates these Terms or is
						harmful to other users, us, or third parties.
					</p>
				</LegalSubsection>
			</LegalSection>

			<LegalSection title="12. Governing Law">
				<p>
					These Terms shall be interpreted and governed by the laws of
					applicable jurisdiction, without regard to conflict of law provisions.
				</p>
			</LegalSection>

			<LegalSection title="13. Changes to Terms">
				<p>
					We reserve the right to modify these Terms at any time. We will notify
					users of material changes via the Service or email. Your continued use
					of the Service after such changes constitutes acceptance of the new
					Terms.
				</p>
			</LegalSection>

			<LegalSection title="14. Contact Information">
				<p>
					If you have any questions about these Terms of Service, please contact
					us through our support channels.
				</p>
			</LegalSection>

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
		</LegalPageLayout>
	);
}
