export default function Funnel({ stages }: { stages: { label: string; value: number }[] }) {
  const top = Math.max(stages[0]?.value ?? 0, 1);
  return (
    <ol className="mt-4 space-y-4">
      {stages.map((s, i) => {
        const pct = Math.round((s.value / top) * 100);
        const prev = i > 0 ? stages[i - 1].value : 0;
        const step = i > 0 && prev > 0 ? Math.round((s.value / prev) * 100) : null;
        return (
          <li key={s.label}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-semibold">{s.label}</span>
              <span>
                <span className="font-bold">{s.value}</span>
                {step !== null && <span className="text-ink/50"> ({step}% of previous step)</span>}
              </span>
            </div>
            <div className="mt-1 h-7 rounded-full bg-black/5">
              <div className="h-7 rounded-full bg-accent"
                style={{ width: `${s.value > 0 ? Math.max(pct, 4) : 0}%`, opacity: 1 - i * 0.15 }} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
