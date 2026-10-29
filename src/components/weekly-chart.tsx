export default function WeeklyChart({ weeks }: { weeks: { week_start: string; visits: number }[] }) {
  const max = Math.max(...weeks.map((w) => w.visits), 1);
  const summary = weeks.map((w) => `${w.week_start}: ${w.visits}`).join(", ");
  return (
    <div className="mt-4 flex items-end gap-2" role="img" aria-label={`Visits per week. ${summary}`}>
      {weeks.map((w, i) => (
        <div key={w.week_start} className="flex flex-1 flex-col items-center justify-end gap-1">
          <span className="text-xs font-semibold">{w.visits}</span>
          <div className={`w-full rounded-t-lg ${i === weeks.length - 1 ? "bg-accent" : "bg-accent/40"}`}
            style={{ height: `${Math.max(4, Math.round((w.visits / max) * 120))}px` }} />
          <span className="text-[11px] text-ink/60">
            {new Date(`${w.week_start}T00:00:00Z`).toLocaleDateString("en-ZA", { day: "numeric", month: "short", timeZone: "UTC" })}
          </span>
        </div>
      ))}
    </div>
  );
}
