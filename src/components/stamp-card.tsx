export default function StampCard({
  businessName, customerName, balance, required,
}: { businessName: string; customerName: string; balance: number; required: number }) {
  const filled = Math.min(balance, required);
  return (
    <div className="rounded-card bg-accent p-6 text-white shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-2xl font-bold leading-tight">{businessName}</h2>
        <p className="shrink-0 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold" aria-label={`${filled} of ${required} stamps`}>
          {filled}/{required}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-5 gap-3">
        {Array.from({ length: required }, (_, i) =>
          i < filled ? (
            <div key={i} className="flex aspect-square items-center justify-center rounded-full bg-white text-accent shadow-inner">
              <svg viewBox="0 0 24 24" className="h-1/2 w-1/2" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </div>
          ) : (
            <div key={i} className="aspect-square rounded-full border-2 border-dashed border-white/50" />
          )
        )}
      </div>

      <p className="mt-6 text-base font-medium opacity-90">{customerName}</p>
    </div>
  );
}
