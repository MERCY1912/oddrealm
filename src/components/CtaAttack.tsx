// components/CtaAttack.tsx
export function CtaAttack({disabled=false, onClick}:{disabled?:boolean; onClick?:()=>void}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative w-full select-none rounded-xl px-6 py-3
                  font-ui tracking-wide text-[18px] text-white
                  ring-1 ring-[#3a1f21] shadow-[0_10px_24px_rgba(0,0,0,.35)]
                  transition active:translate-y-[1px]
                  ${disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:shadow-[0_12px_26px_rgba(181,42,42,.30)]"}`}
      style={{
        background:
          disabled
            ? "linear-gradient(180deg,#6b2a2a,#3a1f21)"
            : "linear-gradient(180deg,#d53a3a 0%, #b52a2a 50%, #7a1b1b 100%)",
      }}
    >
      {/* верхний глянец */}
      <span className="pointer-events-none absolute inset-0 rounded-xl
                       bg-[linear-gradient(180deg,rgba(255,255,255,.18),rgba(255,255,255,0)_28%)]" />
      {/* декоративные полосы снизу */}
      <span className="pointer-events-none absolute inset-x-2 bottom-2 h-1 rounded
                       bg-[linear-gradient(90deg,rgba(255,255,255,.12),rgba(255,255,255,0))]" />
      {/* диагональные штрихи */}
      <span className="pointer-events-none absolute inset-0 rounded-xl opacity-40
                       bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(255,255,255,.15)_6px,rgba(255,255,255,.15)_8px)]" />
      <span className="relative flex items-center justify-center font-bold">
        АТАКА!
      </span>
    </button>
  );
}
