import { HivioLogo } from "@/components/icons";
import UserMenu from "@/components/user-menu";
import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen max-w-full overflow-x-hidden">
      <header className="border-b">
        <div className="mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <HivioLogo className="text-primary" />
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>
      <main className="container mx-auto max-w-full overflow-x-hidden px-4 py-6">
        {children}
      </main>
    </div>
  );
}
