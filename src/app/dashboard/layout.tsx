export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-6">
      <header className="flex items-center justify-between print:hidden">
        <p className="text-2xl font-bold text-accent">Buya</p>
        <form action="/auth/signout" method="post">
          <button className="btn-ghost">Log out</button>
        </form>
      </header>
      <div className="mt-6">{children}</div>
    </div>
  );
}
