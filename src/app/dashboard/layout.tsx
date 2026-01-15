import UserMenu from "@/components/user-menu";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden max-w-full">
      <header className="border-b">
        <div className="mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <UserMenu />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 overflow-x-hidden max-w-full">
        {children}
      </main>
    </div>
  );
}
