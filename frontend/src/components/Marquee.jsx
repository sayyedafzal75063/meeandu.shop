const ITEMS = [
  "HAND-POURED IN MUMBAI",
  "PURE OIL-BASED",
  "NO ALCOHOL",
  "12+ HOUR SILLAGE",
  "SMALL-BATCH",
  "EST. 2025",
];

export function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div
      data-testid="editorial-marquee"
      className="relative overflow-hidden border-y border-[#D4AF37]/15 py-5 bg-[#0A0A0A]"
    >
      <div className="animate-marquee flex w-max items-center gap-10 whitespace-nowrap">
        {[0, 1].map((half) => (
          <div key={half} className="flex items-center gap-10">
            {row.map((item, i) => (
              <span key={`${half}-${i}`} className="flex items-center gap-10">
                <span className="f-serif text-sm sm:text-base tracking-[0.35em] uppercase text-[#D4AF37]/40">
                  {item}
                </span>
                <span className="text-[#D4AF37]/30 text-xs">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
