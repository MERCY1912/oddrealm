export function SegmentBar({label, value, max, color="#b52a2a"}:{
  label:string; value:number; max:number; color?:string;
}) {
  const pct = Math.max(0, Math.min(100,(value/max)*100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[12px] text-ash/80">
        <span className="font-ui">{label}</span><span>{value}/{max}</span>
      </div>
      <div className="relative h-[14px] rounded-md ring-1 ring-[#2a2a33] overflow-hidden bg-[#1b1b22]/88
        before:absolute before:inset-[1px] before:rounded-[6px] before:pointer-events-none
        before:ring-1 before:ring-white/5
        after:absolute after:inset-0 after:rounded-md after:pointer-events-none
        after:bg-[radial-gradient(300px_200px_at_20%_-10%,rgba(181,42,42,.04),transparent_60%),radial-gradient(300px_200px_at_80%_110%,rgba(181,42,42,.03),transparent_60%)] after:opacity-[.2]">
        {/* сегменты - более выраженные риски */}
        <div className="absolute inset-0 opacity-30"
             style={{ background: "repeating-linear-gradient(90deg, transparent 0 16px, rgba(255,255,255,.12) 16px 17px)" }} />
        {/* заливка с улучшенным градиентом */}
        <div className="h-full transition-all duration-500 relative"
             style={{ width:`${pct}%`, background:`linear-gradient(180deg, ${color} 0%, ${color}dd 50%, #7a1b1b 100%)` }}>
          {/* внутренний блик на заливке */}
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(255,255,255,.15),transparent_40%)]" />
        </div>
        {/* верхний глянцевый блик */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(255,255,255,.2),transparent_50%)]" />
      </div>
    </div>
  );
}
