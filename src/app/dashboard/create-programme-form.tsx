"use client";

import { useActionState } from "react";
import { createProgramme, type FormState } from "./actions";

export default function CreateProgrammeForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createProgramme, {});

  return (
    <section className="card">
      <h1 className="text-2xl font-bold">Set up your loyalty programme</h1>
      <p className="mt-2 text-ink/70">
        Customers collect a stamp for every paid visit and earn a reward when the card is full.
      </p>

      <form action={action} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="label">Business name</label>
          <input id="name" name="name" required defaultValue="FreshCut Barbershop" className="input" />
        </div>
        <div>
          <label htmlFor="stamps_required" className="label">Stamps needed for a reward</label>
          <input id="stamps_required" name="stamps_required" type="number" inputMode="numeric"
            min={2} max={20} required defaultValue={5} className="input" />
        </div>
        <div>
          <label htmlFor="reward_text" className="label">Reward</label>
          <input id="reward_text" name="reward_text" required defaultValue="Free haircut" className="input" />
        </div>
        {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
        <button type="submit" disabled={pending} className="btn w-full">
          {pending ? "Creating…" : "Create programme"}
        </button>
      </form>
    </section>
  );
}
