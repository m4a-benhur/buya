import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Business } from "@/lib/types";
import { daysSince, plural } from "@/lib/format";
import CreateProgrammeForm from "./create-programme-form";
import DemoDataCard from "./demo-data-card";
import JoinQr from "@/components/join-qr";
import Funnel from "@/components/funnel";
import WeeklyChart from "@/components/weekly-chart";
import WhatsAppButton from "@/components/whatsapp-button";

type Stats = { enrolled: number; returned_30d: number; redeemed: number; inactive: number };
type Row = {
  id: string; name: string; phone: string; balance: number; last_visit: string | null;
  joined_at: string; is_demo: boolean; total_stamps: number; total_redemptions: number;
};

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

  const { data: weeklyData, error: weeklyError } = await supabase.rpc("weekly_visits", { p_weeks: 8 });
  if (weeklyError) console.error("weekly_visits failed (did you run 0003_weekly_visits.sql?):", weeklyError.message);
  const weeks = (weeklyData ?? []) as { week_start: string; visits: number }[];

  const { data: rows } = await supabase
    .from("customer_stats")
    .select("id, name, phone, balance, last_visit, joined_at, is_demo, total_stamps, total_redemptions")
    .eq("business_id", business.id);
  const customers = (rows ?? []) as Row[];
  const hasDemo = customers.some((c) => c.is_demo);
  const req = business.stamps_required;
  const reward = business.reward_text.toLowerCase();
  const first = (name: string) => name.split(" ")[0];

  const funnel = [
    { label: "Joined", value: customers.length },
    { label: "Had a first visit", value: customers.filter((c) => c.total_stamps >= 1).length },
    { label: "Came back", value: customers.filter((c) => c.total_stamps >= 2).length },
    { label: "Earned a reward", value: customers.filter((c) => c.total_redemptions >= 1 || c.balance >= req).length },
  ];

  const almost = req >= 2 ? customers.filter((c) => c.balance === req - 1) : [];

  // Inactive = no stamp for 45+ days (or joined 45+ days ago and never stamped)
  const inactive = customers
    .map((c) => ({ ...c, days: daysSince(c.last_visit ?? c.joined_at) }))
    .filter((c) => c.days >= 45)
    .sort((a, b) => b.days - a.days);

  function suggestion(c: { balance: number }) {
    const left = req - c.balance;
    return c.balance > 0 && left > 0
      ? `Only ${plural(left, "stamp")} from a ${reward}. Send a reminder.`
      : "Send a reminder or offer a low-cost incentive.";
  }
  function inactiveMessage(c: { name: string; balance: number }) {
    return c.balance > 0
      ? `Hi ${first(c.name)}, it's ${business!.name}. We miss you! You have ${c.balance} of ${req} stamps toward a ${reward}. Come see us soon.`
      : `Hi ${first(c.name)}, it's ${business!.name}. We miss you! Your loyalty card is waiting. Come see us soon.`;
  }

  return (
    <div className="space-y-5">
      <section className="card">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-2xl font-bold">{business.name}</h1>
          {hasDemo && <span className="rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-dark">Simulated data for demonstration</span>}
        </div>
        <p className="mt-2 text-lg">
          Collect <span className="font-semibold text-accent">{req} stamps</span>, get a{" "}
          <span className="font-semibold text-accent">{reward}</span>.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <StatCard label="Enrolled customers" value={stats.enrolled} caption="Joined your programme" />
        <StatCard label="Returned within 30 days" value={stats.returned_30d} caption="Second visit within 30 days of the first" />
        <StatCard label="Rewards redeemed" value={stats.redeemed} caption="Completed cards" />
        <StatCard label="Inactive customers" value={stats.inactive} caption="No visit in 45+ days" />
      </section>

      <section className="card">
        <h2 className="text-xl font-bold">Retention funnel</h2>
        <p className="mt-1 text-sm text-ink/60">How many customers reach each step.</p>
        <Funnel stages={funnel} />
      </section>

      {weeks.length > 0 && (
        <section className="card">
          <h2 className="text-xl font-bold">Visits per week</h2>
          <p className="mt-1 text-sm text-ink/60">Stamps awarded over the last 8 weeks.</p>
          <WeeklyChart weeks={weeks} />
        </section>
      )}

      <section className="card">
        <h2 className="text-xl font-bold">Almost there</h2>
        <p className="mt-1 text-sm text-ink/60">One stamp away from a {reward}. Give them a nudge.</p>
        {almost.length === 0 ? (
          <p className="mt-4 text-ink/70">Nobody is one stamp away right now.</p>
        ) : (
          <ul className="mt-4 divide-y divide-black/10">
            {almost.slice(0, 6).map((c) => (
              <li key={c.id} className="py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <Link href={`/dashboard/customers/${c.id}`} className="font-semibold underline-offset-4 hover:underline">{c.name}</Link>
                  <p className="shrink-0 text-sm font-semibold text-accent-dark">{req - 1}/{req} stamps</p>
                </div>
                <WhatsAppButton phone={c.phone}
                  message={`Hi ${first(c.name)}, you're only 1 stamp away from your ${reward} at ${business.name}. See you soon!`} />
              </li>
            ))}
          </ul>
        )}
        {almost.length > 6 && (
          <Link href="/dashboard/customers?filter=almost" className="mt-3 inline-block text-sm font-semibold text-accent">
            See all {almost.length}
          </Link>
        )}
      </section>

      <section className="card">
        <h2 className="text-xl font-bold">Inactive customers</h2>
        <p className="mt-1 text-sm text-ink/60">
          Suggestions only. The WhatsApp button opens your own WhatsApp with a drafted message. Buya sends nothing.
        </p>
        {inactive.length === 0 ? (
          <p className="mt-4 text-ink/70">No inactive customers right now. Nice work.</p>
        ) : (
          <ul className="mt-4 divide-y divide-black/10">
            {inactive.slice(0, 8).map((c) => (
              <li key={c.id} className="py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <Link href={`/dashboard/customers/${c.id}`} className="font-semibold underline-offset-4 hover:underline">{c.name}</Link>
                  <p className="shrink-0 text-sm text-ink/60">
                    {c.last_visit ? `${c.days} days ago` : `Joined ${c.days} days ago, no visits`}
                  </p>
                </div>
                <p className="text-sm text-ink/60">{c.phone}</p>
                <p className="mt-1 text-sm font-medium text-accent-dark">{suggestion(c)}</p>
                <WhatsAppButton phone={c.phone} message={inactiveMessage(c)} />
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
