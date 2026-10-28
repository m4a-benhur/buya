import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: business } = await supabase.from("businesses").select("*").maybeSingle();

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <header className="flex items-center justify-between">
        <p className="text-2xl font-bold text-accent">Buya</p>
        <form action="/auth/signout" method="post">
          <button className="btn-ghost">Log out</button>
        </form>
      </header>

      <section className="card mt-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-2 text-ink/70">Signed in as {user?.email}</p>
        <p className="mt-4 text-sm text-ink/60">
          {business
            ? `Programme: ${business.name}`
            : "No loyalty programme yet. You'll create one in the next step."}
        </p>
      </section>
    </main>
  );
}
