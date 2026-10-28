import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Business } from "@/lib/types";
import { daysSince, plural } from "@/lib/format";
import CreateProgrammeForm from "./create-programme-form";
import DemoDataCard from "./demo-data-card";
import JoinQr from "@/components/join-qr";

type Stats = { enrolled: number; returned_30d: number; redeemed: number; inactive: number };
type Row = { id: string; name: string; phone: string; balance: number; last_visit: string | null; joined_at: string; is_demo: boolean };

function StatCard({ label, value, caption }: { label: string; value: number; caption: string }) {
  return (
    <div className="card">
      <p className="text-4xl font-bold text-accent">{value}</p>
      <p className="mt-1 font-semibold">{label}</p>
      <p className="mt-1 text-sm text-ink/60">{caption}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: business } = await supabase.from("businesses").select("*").maybeSingle<Business>();
  if (!business) return <CreateProgrammeForm />;

  const { data: statsData } = await supabase.rpc("dashboard_stats").single<Stats>();
  const stats: Stats = statsData ?? { enrolled: 0, returned_30d: 0, redeemed: 0, inactive: 0 };

  const { data: rows } = await supabase
    .from("customer_stats")
    .select("id, name, phone, balance, last_visit, joined_at, is_demo")
    .eq("business_id", business.id);
  const customers = (rows ?? []) as Row[];
  const hasDemo = customers.some((c) => c.is_demo);

  // Inactive = no stamp for 45+ days (or joined 45+ days ago and never stamped)
  const inactive = customers
    .map((c) => ({ ...c, days: daysSince(c.last_visit ?? c.joined_at) }))
    .filter((c) => c.days >= 45)
    .sort((a, b) => b.days - a.days);

  function suggestion(c: { balance: number }) {
    const left = business!.stamps_required - c.balance;
    return c.balance > 0 && left > 0
      ? `Only ${plural(left, "stamp")} from a ${business!.reward_text.toLowerCase()}. Send a reminder.`
      : "Send a reminder or offer a low-cost incentive.";
  }

  return (
    <div className="space-y-5">
      <section className="card">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-2xl font-bold">{business.name}</h1>
          {hasDemo && <span className="rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-dark">Simulated data for demonstration</span>}
        </div>
        <p className="mt-2 text-lg">
          Collect <span className="font-semibold text-accent">{business.stamps_required} stamps</span>, get a{" "}
          <span className="font-semibold text-accent">{business.reward_text.toLowerCase()}</span>.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <StatCard label="Enrolled customers" value={stats.enrolled} caption="Joined your programme" />
        <StatCard label="Returned within 30 days" value={stats.returned_30d} caption="Second visit within 30 days of the first" />
        <StatCard label="Rewards redeemed" value={stats.redeemed} caption="Completed cards" />
        <StatCard label="Inactive customers" value={stats.inactive} caption="No visit in 45+ days" />
      </section>

      <section className="card">
        <h2 className="text-xl font-bold">Inactive customers</h2>
        <p className="mt-1 text-sm text-ink/60">Suggestions only. Buya does not send messages.</p>
        {inactive.length === 0 ? (
          <p className="mt-4 text-ink/70">No inactive customers right now. Nice work.</p>
        ) : (
          <ul className="mt-4 divide-y divide-black/10">
            {inactive.slice(0, 8).map((c) => (
              <li key={c.id} className="py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-semibold">{c.name}</p>
                  <p className="shrink-0 text-sm text-ink/60">
                    {c.last_visit ? `${c.days} days ago` : `Joined ${c.days} days ago, no visits`}
                  </p>
                </div>
                <p className="text-sm text-ink/60">{c.phone}</p>
                <p className="mt-1 text-sm font-medium text-accent-dark">{suggestion(c)}</p>
              </li>
            ))}
          </ul>
        )}
        {inactive.length > 8 && <p className="mt-3 text-sm text-ink/60">+ {inactive.length - 8} more</p>}
      </section>

      <section className="card">
        <h2 className="text-xl font-bold">Your join QR code</h2>
        <p className="mt-1 text-ink/70">
          Display it at the counter. Scanning it only signs a customer up. You award the stamps.
        </p>
        <div className="mt-5"><JoinQr businessId={business.id} /></div>
        <div className="mt-5 flex justify-center">
          <Link href="/dashboard/qr" className="btn">Open printable poster</Link>
        </div>
      </section>

      <DemoDataCard hasDemo={hasDemo} />
    </div>
  );
}
