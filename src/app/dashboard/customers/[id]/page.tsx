import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Business } from "@/lib/types";
import { formatDate, formatDateTime } from "@/lib/format";
import StampCard from "@/components/stamp-card";
import CustomerActions from "../customer-actions";

type Customer = {
  id: string; name: string; phone: string; balance: number; joined_at: string;
  total_stamps: number; total_redemptions: number;
};

// Also the page a customer's card QR opens: scan → big Award stamp button.
export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const { data: business } = await supabase.from("businesses").select("*").maybeSingle<Business>();
  if (!business) redirect("/dashboard");

  const { data: customer } = await supabase
    .from("customer_stats")
    .select("id, name, phone, balance, joined_at, total_stamps, total_redemptions")
    .eq("id", id).eq("business_id", business.id)
    .maybeSingle<Customer>();
  if (!customer) notFound();

  const [stamps, redemptions] = await Promise.all([
    supabase.from("stamp_events").select("id, created_at").eq("customer_id", id).order("created_at", { ascending: false }).limit(200),
    supabase.from("redemptions").select("id, created_at").eq("customer_id", id).order("created_at", { ascending: false }).limit(200),
  ]);
  const history = [
    ...(stamps.data ?? []).map((e) => ({ id: e.id as string, at: e.created_at as string, kind: "stamp" as const })),
    ...(redemptions.data ?? []).map((e) => ({ id: e.id as string, at: e.created_at as string, kind: "redeem" as const })),
  ].sort((a, b) => (a.at < b.at ? 1 : -1));

  return (
    <div className="space-y-5">
      <Link href="/dashboard/customers" className="btn-ghost">Back to customers</Link>

      <StampCard businessName={business.name} customerName={customer.name}
        balance={customer.balance} required={business.stamps_required} />

      <section className="card">
        <p className="text-sm text-ink/60">{customer.phone} · joined {formatDate(customer.joined_at)}</p>
        <div className="mt-4">
          <CustomerActions customerId={customer.id} name={customer.name} balance={customer.balance}
            required={business.stamps_required} reward={business.reward_text} askConfirm={false} />
        </div>
      </section>

      <section className="card">
        <h2 className="text-xl font-bold">Stamp history</h2>
        <p className="mt-1 text-sm text-ink/60">
          {customer.total_stamps} {customer.total_stamps === 1 ? "stamp" : "stamps"} awarded,{" "}
          {customer.total_redemptions} {customer.total_redemptions === 1 ? "reward" : "rewards"} redeemed.
        </p>
        {history.length === 0 ? (
          <p className="mt-4 text-ink/70">No stamps yet. They’ll appear here with the time they were awarded.</p>
        ) : (
          <ul className="mt-4 divide-y divide-black/10">
            {history.map((h) => (
              <li key={`${h.kind}-${h.id}`} className="flex items-center justify-between gap-3 py-3">
                <span className={h.kind === "redeem" ? "font-semibold text-accent-dark" : "font-medium"}>
                  {h.kind === "redeem" ? `Reward redeemed: ${business.reward_text}` : "Stamp awarded"}
                </span>
                <span className="shrink-0 text-sm text-ink/60">{formatDateTime(h.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
