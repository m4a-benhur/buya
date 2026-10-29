import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { dict, fill } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import StampCard from "@/components/stamp-card";
import AutoRefresh from "@/components/auto-refresh";
import StaffQr from "@/components/staff-qr";
import LanguageSwitcher from "@/components/language-switcher";

type Card = {
  customer_name: string; business_name: string; stamps_required: number;
  reward_text: string; balance: number; rewards_earned: number;
};

export async function generateMetadata({ params }: { params: Promise<{ customerId: string }> }): Promise<Metadata> {
  const { customerId } = await params;
  return {
    title: "My loyalty card",
    robots: { index: false },
    manifest: `/card/${customerId}/manifest.webmanifest`, // makes "Add to home screen" open THIS card
    appleWebApp: { capable: true, title: "My card", statusBarStyle: "default" },
  };
}

export default async function CardPage({ params }: { params: Promise<{ customerId: string }> }) {
  const { customerId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(customerId)) notFound();

  const lang = await getLang();
  const t = dict[lang];
  const supabase = await createClient();
  const { data: card } = await supabase.rpc("get_card", { p_customer_id: customerId }).single<Card>();
  if (!card) notFound();

  const eligible = card.balance >= card.stamps_required;
  const remaining = card.stamps_required - card.balance;

  return (
    <main className="mx-auto min-h-screen max-w-md px-5 py-6">
      <AutoRefresh />
      <LanguageSwitcher current={lang} />
      <div className="mt-5">
        <StampCard businessName={card.business_name} customerName={card.customer_name}
          balance={card.balance} required={card.stamps_required} />
      </div>

      {eligible ? (
        <div className="mt-5 rounded-card bg-accent-soft p-5 text-center ring-1 ring-accent/30">
          <p className="text-2xl font-bold text-accent-dark">{t.rewardAvailable}</p>
          <p className="mt-2 text-lg">{t.showStaff}</p>
        </div>
      ) : (
        <p className="mt-5 text-center text-lg">
          {remaining === 1 ? t.moreOne : fill(t.moreMany, { n: remaining })}
        </p>
      )}
      <p className="mt-2 text-center font-semibold">{t.rewardLabel}: {card.reward_text}</p>

      <section className="card mt-6 text-center">
        <StaffQr customerId={customerId} />
        <p className="mt-3 text-sm text-ink/70">{t.scanForStamp}</p>
      </section>

      {card.rewards_earned > 0 && (
        <p className="mt-4 text-center text-sm text-ink/60">{fill(t.rewardsClaimed, { n: card.rewards_earned })}</p>
      )}
      <p className="mt-6 text-center text-sm text-ink/60">{t.bookmark}</p>
    </main>
  );
}
