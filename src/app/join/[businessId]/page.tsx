import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import JoinForm from "./join-form";

export const metadata = { title: "Join the loyalty programme" };

export default async function JoinPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  const supabase = await createClient();
  const { data: business } = await supabase.rpc("get_business_public", { p_business_id: businessId }).single<{
    id: string; name: string; stamps_required: number; reward_text: string;
  }>();
  if (!business) notFound();

  return (
    <main className="mx-auto min-h-screen max-w-md px-5 py-10">
      <p className="text-xl font-bold text-accent">{business.name}</p>
      <h1 className="mt-3 text-3xl font-bold leading-tight">Get a {business.reward_text.toLowerCase()} for coming back</h1>
      <p className="mt-3 text-lg text-ink/70">
        Collect {business.stamps_required} stamps. Staff add a stamp after each paid visit.
      </p>
      <JoinForm businessId={business.id} businessName={business.name} />
    </main>
  );
}
