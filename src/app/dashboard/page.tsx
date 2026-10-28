import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Business } from "@/lib/types";
import CreateProgrammeForm from "./create-programme-form";
import JoinQr from "@/components/join-qr";

export default async function DashboardPage() {
  const supabase = await createClient();
  // RLS means this only ever returns the signed-in owner's business.
  const { data: business } = await supabase.from("businesses").select("*").maybeSingle<Business>();

  if (!business) return <CreateProgrammeForm />;

  return (
    <div className="space-y-5">
      <section className="card">
        <h1 className="text-2xl font-bold">{business.name}</h1>
        <p className="mt-2 text-lg">
          Collect <span className="font-semibold text-accent">{business.stamps_required} stamps</span>,
          get a <span className="font-semibold text-accent">{business.reward_text.toLowerCase()}</span>.
        </p>
      </section>

      <section className="card">
        <h2 className="text-xl font-bold">Your join QR code</h2>
        <p className="mt-1 text-ink/70">
          Display it at the counter. Scanning it only signs a customer up. You award the stamps.
        </p>
        <div className="mt-5">
          <JoinQr businessId={business.id} />
        </div>
        <div className="mt-5 flex justify-center">
          <Link href="/dashboard/qr" className="btn">Open printable poster</Link>
        </div>
      </section>
    </div>
  );
}
