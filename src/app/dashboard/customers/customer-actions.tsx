"use client";

import { useState, useTransition } from "react";
import { awardStamp, redeemReward } from "../actions";

export default function CustomerActions({
  customerId, name, balance, required, reward,
}: { customerId: string; name: string; balance: number; required: number; reward: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const full = balance >= required;

  function run(kind: "award" | "redeem") {
    const message =
      kind === "award"
        ? `Confirm a paid visit for ${name}?`
        : `Redeem “${reward}” for ${name}? Their card will reset.`;
    if (!window.confirm(message)) return;
    setError("");
    start(async () => {
      const res = await (kind === "award" ? awardStamp(customerId) : redeemReward(customerId));
      if (res.error) setError(res.error);
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button className="btn" disabled={pending || full} onClick={() => run("award")}
          title={full ? "Card is full. Redeem the reward first." : undefined}>
          Award stamp
        </button>
        <button className="btn-ghost disabled:cursor-not-allowed disabled:opacity-40" disabled={pending || !full}
          onClick={() => run("redeem")}>
          Redeem reward
        </button>
      </div>
      {full && <p className="mt-2 text-sm font-medium text-accent-dark">Card full. Ready to redeem.</p>}
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
