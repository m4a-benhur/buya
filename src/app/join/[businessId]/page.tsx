import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { dict, fill } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import LanguageSwitcher from "@/components/language-switcher";
import JoinForm from "./join-form";

export const metadata = { title: "Join the loyalty programme" };

export default async function JoinPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  const lang = await getLang();
  const t = dict[lang];
  const supabase = await createClient();
  const { data: business } = await supabase.rpc("get_business_public", { p_business_id: businessId }).single<{
    id: string; name: string; stamps_required: number; reward_text: string;
  }>();
  if (!business) notFound();

  return (
    <main className="mx-auto min-h-screen max-w-md px-5 py-6">
      <LanguageSwitcher current={lang} />
      <p className="mt-6 text-xl font-bold text-accent">{business.name}</p>
      <h1 className="mt-3 text-3xl font-bold leading-tight">{t.joinTitle}</h1>
      <p className="mt-3 text-lg text-ink/70">{fill(t.collect, { n: business.stamps_required })}</p>
      <p className="mt-2 text-lg font-semibold">{t.rewardLabel}: {business.reward_text}</p>
      <JoinForm businessId={business.id} businessName={business.name} t={t} />
    </main>
  );
}
