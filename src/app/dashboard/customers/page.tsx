import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Business } from "@/lib/types";
import { daysSince, formatDate } from "@/lib/format";
import CustomerActions from "./customer-actions";

type Row = {
  id: string; name: string; phone: string; balance: number; last_visit: string | null;
  joined_at: string; is_demo: boolean;
};

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { filter } = await searchParams;
  const supabase = await createClient();
  const { data: business } = await supabase.from("businesses").select("*").maybeSingle<Business>();
  if (!business) redirect("/dashboard");

  const { data } = await supabase
    .from("customer_stats")
    .select("id, name, phone, balance, last_visit, joined_at, is_demo")
    .eq("business_id", business.id)
    .order("last_visit", { ascending: false, nullsFirst: false })
    .order("joined_at", { ascending: false });
  const all = (data ?? []) as Row[];
  const hasDemo = all.some((c) => c.is_demo);
  const req = business.stamps_required;

  const customers =
    filter === "almost" ? all.filter((c) => c.balance === req - 1)
    : filter === "ready" ? all.filter((c) => c.balance >= req)
    : all;

  const chips = [
    { key: undefined, label: "All", href: "/dashboard/customers" },
    { key: "almost", label: "Almost there", href: "/dashboard/customers?filter=almost" },
    { key: "ready", label: "Ready to redeem", href: "/dashboard/customers?filter=ready" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold">Customers ({customers.length})</h1>
        {hasDemo && <span className="rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-dark">Simulated data for demonstration</span>}
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter customers">
        {chips.map((c) => (
          <Link key={c.label} href={c.href}
            className={`inline-flex min-h-[44px] items-center rounded-full px-4 text-sm font-semibold ${
              filter === c.key ? "bg-accent text-white" : "ring-1 ring-black/15"}`}>
            {c.label}
          </Link>
        ))}
      </div>

      {customers.length === 0 ? (
        <div className="card mt-5 text-center">
          <p className="text-lg font-semibold">{all.length === 0 ? "No customers yet" : "No customers match this filter"}</p>
          <p className="mt-1 text-ink/70">
            {all.length === 0 ? "Show your QR code at the counter, or load demo data from the Overview." : "Try another filter."}
          </p>
          <Link href="/dashboard" className="btn mt-4">Go to Overview</Link>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {customers.map((c) => (
            <li key={c.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/dashboard/customers/${c.id}`} className="block truncate text-lg font-semibold underline-offset-4 hover:underline">
                    {c.name}
                  </Link>
                  <p className="text-sm text-ink/60">{c.phone}</p>
                </div>
                <p className="shrink-0 rounded-full bg-accent-soft px-3 py-1 font-semibold text-accent-dark">
                  {Math.min(c.balance, req)}/{req}
                </p>
              </div>
              <p className="mt-2 text-sm text-ink/70">
                {c.last_visit
                  ? `Last visit ${formatDate(c.last_visit)} (${daysSince(c.last_visit)} days ago)`
                  : `No visits yet. Joined ${formatDate(c.joined_at)}`}
              </p>
              <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
                <CustomerActions customerId={c.id} name={c.name} balance={c.balance}
                  required={req} reward={business.reward_text} />
                <Link href={`/dashboard/customers/${c.id}`} className="inline-flex min-h-[48px] items-center text-sm font-semibold text-accent underline-offset-4 hover:underline">
                  Stamp history
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
