import Link from "next/link";
import { UserIcon } from "lucide-react";

export const metadata = {
  title: "Hive Title Not Found",
};

export default async function not_found() {
  return (
    <main className="flex h-[100dvh] flex-col items-center justify-center px-4 md:px-6">
      <div className="max-w-md space-y-4 text-center">
        <UserIcon className="mx-auto h-16 w-16 text-gray-500 dark:text-gray-400" />
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
          This title does not exist in your hive
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          The requested title not be found in your hive. Please go back to your
          hive dashboard and try editing the desired title again.
        </p>
        <Link
          className="inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
          href="/hive"
        >
          Go to Hive Dashboard
        </Link>
      </div>
    </main>
  );
}
