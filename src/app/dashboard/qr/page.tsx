import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Business } from "@/lib/types";
import JoinQr from "@/components/join-qr";
import PrintButton from "@/components/print-button";

export default async function PosterPage() {
  const supabase = await createClient();
  const { data: business } = await supabase.from("businesses").select("*").maybeSingle<Business>();
  if (!business) redirect("/dashboard");

  return (
    <div>
      <div className="flex items-center justify-between print:hidden">
        <Link href="/dashboard" className="btn-ghost">Back</Link>
        <PrintButton />
      </div>

      <section className="mx-auto mt-6 flex max-w-md flex-col items-center gap-6 rounded-card bg-white p-8 text-center ring-1 ring-black/5 print:mt-0 print:ring-0">
        <p className="text-xl font-bold text-accent">{business.name}</p>
        <h1 className="text-4xl font-bold leading-tight">Get rewarded for coming back</h1>
        <JoinQr businessId={business.id} size={260} showLink={false} />
        <p className="text-lg">
          Scan with your phone camera to join. Collect {business.stamps_required} stamps and get a{" "}
          {business.reward_text.toLowerCase()}.
        </p>
        <p className="text-sm text-ink/60">No app to install.</p>
      </section>
    </div>
  );
}
