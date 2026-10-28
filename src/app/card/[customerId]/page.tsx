import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StampCard from "@/components/stamp-card";
import AutoRefresh from "@/components/auto-refresh";

export const metadata = { title: "My loyalty card", robots: { index: false } };

type Card = {
  customer_name: string; business_name: string; stamps_required: number;
  reward_text: string; balance: number; rewards_earned: number;
};

export default async function CardPage({ params }: { params: Promise<{ customerId: string }> }) {
  const { customerId } = await params;
  // Guard against malformed ids before hitting the database
  if (!/^[0-9a-f-]{36}$/i.test(customerId)) notFound();

  const supabase = await createClient();
  const { data: card } = await supabase.rpc("get_card", { p_customer_id: customerId }).single<Card>();
  if (!card) notFound();

  const eligible = card.balance >= card.stamps_required;
  const remaining = card.stamps_required - card.balance;

  return (
    <main className="mx-auto min-h-screen max-w-md px-5 py-8">
      <AutoRefresh />
      <StampCard businessName={card.business_name} customerName={card.customer_name}
        balance={card.balance} required={card.stamps_required} />

      {eligible ? (
        <div className="mt-5 rounded-card bg-accent-soft p-5 text-center ring-1 ring-accent/30">
          <p className="text-2xl font-bold text-accent-dark">Reward available!</p>
          <p className="mt-2 text-lg">Show this card to staff to claim your {card.reward_text.toLowerCase()}.</p>
        </div>
      ) : (
        <p className="mt-5 text-center text-lg">
          {remaining} more {remaining === 1 ? "stamp" : "stamps"} to get a {card.reward_text.toLowerCase()}.
        </p>
      )}

      {card.rewards_earned > 0 && (
        <p className="mt-3 text-center text-sm text-ink/60">
          Rewards claimed so far: {card.rewards_earned}
        </p>
      )}

      <p className="mt-8 text-center text-sm text-ink/60">
        Bookmark this page or add it to your home screen. It’s your card. Stamps are added by staff after each paid visit.
      </p>
    </main>
  );
}
