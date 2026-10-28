"use client";

import { useState, useTransition } from "react";
import { loadDemoData, removeDemoData } from "./actions";

export default function DemoDataCard({ hasDemo }: { hasDemo: boolean }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  function run(fn: typeof loadDemoData) {
    setError("");
    start(async () => {
      const res = await fn();
      if (res.error) setError(res.error);
    });
  }

  return (
    <section className="card">
      <h2 className="text-xl font-bold">Demo data</h2>
      <p className="mt-1 inline-block rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-dark">
        Simulated data for demonstration
      </p>
      <p className="mt-3 text-ink/70">
        Adds 40 made-up customers with varied visit dates so the dashboard looks realistic. Loading again replaces
        the earlier demo data. Your real customers are never touched.
      </p>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="btn" disabled={pending} onClick={() => run(loadDemoData)}>
          {pending ? "Working…" : hasDemo ? "Reload demo data" : "Load demo data"}
        </button>
        {hasDemo && (
          <button className="btn-ghost" disabled={pending} onClick={() => run(removeDemoData)}>
            Remove demo data
          </button>
        )}
      </div>
    </section>
  );
}
