// src/components/HeroCard.tsx
export default function HeroCard() {
  return (
    <div className="relative">
      {/* позолоченная овальная рама */}
      <div className="relative mx-auto aspect-[3/4] w-[260px]">
        {/* внешнее золото */}
        <div className="absolute inset-0 rounded-[48%/40%] p-1"
             style={{ background: "conic-gradient(from 120deg, #fde8a7, #c18a2b 45%, #fff6c7 52%, #8a5a18 60%, #f6d37d)" }}>
          {/* внутренняя кромка + маска эллипса */}
          <div className="h-full w-full rounded-[48%/40%] bg-[#0f0f12] ring-1 ring-[#2a2a33]"
               style={{
                 WebkitMaskImage: "radial-gradient(ellipse 64% 56% at 50% 44%, #000 98%, transparent 102%)",
                 maskImage: "radial-gradient(ellipse 64% 56% at 50% 44%, #000 98%, transparent 102%)",
               }}>
            {/* фон портрета */}
            <div className="absolute inset-0 rounded-[48%/40%] overflow-hidden">
              {/* Placeholder фон с градиентом */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a33] via-[#1b1b22] to-[#0f0f12] opacity-95" />
              {/* Декоративный узор */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-300/10 via-transparent to-amber-300/5" />
              {/* мягкая виньетка */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/45" />
              {/* анимированный блик */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -left-1/3 top-0 h-full w-1/2 bg-gradient-to-r from-white/20 to-transparent blur-md animate-[glint_4s_linear_infinite]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* подпись/уровень */}
      <div className="mt-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-md px-3 py-1 bg-[#2a2a33]/60 ring-1 ring-[#2a2a33]/70 shadow-[inset_0_1px_0_rgba(255,255,255,.05)]">
          <span className="font-ui tracking-wide" style={{background:"linear-gradient(180deg,#fde8a7,#8a5a18)",WebkitBackgroundClip:"text",color:"transparent"}}>MMLXD</span>
          <span className="text-ash/80">Воин • 4</span>
        </div>
      </div>
    </div>
  );
}
