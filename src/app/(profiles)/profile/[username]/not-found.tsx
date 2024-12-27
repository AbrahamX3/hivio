import { UserIcon } from "lucide-react";
import Link from "next/link";

export const metadata = {
	title: "User Not Found",
};

export default async function not_found() {
	return (
		<main className="flex h-[100dvh] flex-col items-center justify-center px-4 md:px-6">
			<div className="max-w-md space-y-4 text-center">
				<UserIcon className="mx-auto h-16 w-16 text-gray-500 dark:text-gray-400" />
				<h1 className="font-bold text-3xl tracking-tighter sm:text-4xl">
					User does not exist
				</h1>
				<p className="text-gray-500 dark:text-gray-400">
					The requested user profile could not be found. The username may have
					been changed, deleted or is wrong.
				</p>
				<Link
					className="inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-4 py-2 font-medium text-gray-50 text-sm shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:focus-visible:ring-gray-300 dark:hover:bg-gray-50/90"
					href="/"
				>
					Go to Homepage
				</Link>
			</div>
		</main>
	);
}
