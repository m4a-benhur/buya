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

export default async function CustomersPage() {
  const supabase = await createClient();
  const { data: business } = await supabase.from("businesses").select("*").maybeSingle<Business>();
  if (!business) redirect("/dashboard");

  const { data } = await supabase
    .from("customer_stats")
    .select("id, name, phone, balance, last_visit, joined_at, is_demo")
    .eq("business_id", business.id)
    .order("last_visit", { ascending: false, nullsFirst: false })
    .order("joined_at", { ascending: false });
  const customers = (data ?? []) as Row[];
  const hasDemo = customers.some((c) => c.is_demo);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold">Customers ({customers.length})</h1>
        {hasDemo && <span className="rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-dark">Simulated data for demonstration</span>}
      </div>

      {customers.length === 0 ? (
        <div className="card mt-5 text-center">
          <p className="text-lg font-semibold">No customers yet</p>
          <p className="mt-1 text-ink/70">Show your QR code at the counter, or load demo data from the Overview.</p>
          <Link href="/dashboard" className="btn mt-4">Go to Overview</Link>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {customers.map((c) => (
            <li key={c.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold">{c.name}</p>
                  <p className="text-sm text-ink/60">{c.phone}</p>
                </div>
                <p className="shrink-0 rounded-full bg-accent-soft px-3 py-1 font-semibold text-accent-dark">
                  {Math.min(c.balance, business.stamps_required)}/{business.stamps_required}
                </p>
              </div>
              <p className="mt-2 text-sm text-ink/70">
                {c.last_visit
                  ? `Last visit ${formatDate(c.last_visit)} (${daysSince(c.last_visit)} days ago)`
                  : `No visits yet. Joined ${formatDate(c.joined_at)}`}
              </p>
              <div className="mt-4">
                <CustomerActions customerId={c.id} name={c.name} balance={c.balance}
                  required={business.stamps_required} reward={business.reward_text} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
