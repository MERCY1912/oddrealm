import React from "react";
import CornerBase from '@/assets/ornaments/corner-01.svg?react';
import CornerStrong from '@/assets/ornaments/corner-02.svg?react';
import CornerEpic from '@/assets/ornaments/corner-epic.svg?react';
import EdgeBase from '@/assets/ornaments/edge-01.svg?react';

type Tone = "muted" | "subtle" | "accent" | "epic";
type Corners = 0 | 2 | 4;

type Props = React.PropsWithChildren<{
  title?: string;
  tone?: Tone;
  corners?: Corners;
  colorClass?: string; // напр. "text-gold"
  padded?: boolean;
  edges?: boolean; // показывать ли боковые накладки
  className?: string;
}>;

const Corner = ({ variant, className, tone }: { variant: "base" | "strong" | "epic"; className?: string; tone?: Tone }) => {
  const C = variant === "epic" ? CornerEpic : variant === "strong" ? CornerStrong : CornerBase;
  
  const getToneClasses = (tone: Tone) => {
    switch (tone) {
      case "epic":
        return { color: "text-amber-300", glow: "shadow-[0_0_22px_rgba(251,191,36,.14)]", opacity: "opacity-90" };
      case "accent":
        return { color: "text-amber-300/80", glow: "shadow-[0_0_16px_rgba(251,191,36,.08)]", opacity: "opacity-80" };
      case "subtle":
        return { color: "text-amber-300/55", glow: "", opacity: "opacity-70" };
      default: // muted
        return { color: "text-stone-300/35", glow: "", opacity: "opacity-70" };
    }
  };

  const toneClasses = getToneClasses(tone || "muted");
  
  return (
    <C 
      className={`w-[64px] h-[64px] ${toneClasses.color} ${toneClasses.glow} ${toneClasses.opacity} ornament-boost ${className}`}
      style={{
        filter: "saturate(.85) brightness(.9) contrast(.95) drop-shadow(0 0 6px rgba(251,191,36,.10))"
      }}
    />
  );
};

// Позиционирование углов
const cornerPos = {
  tl: "absolute -top-2 -left-2 rotate-0",
  tr: "absolute -top-2 -right-2 rotate-90",
  br: "absolute -bottom-2 -right-2 rotate-180",
  bl: "absolute -bottom-2 -left-2 -rotate-90",
};

// Позиции для разных количеств углов
const pos2 = ["tl", "br"] as const; // 2 угла
const pos4 = ["tl", "tr", "br", "bl"] as const; // 4 угла

export default function OrnateFrame({
  title,
  tone = "muted",
  corners = 0,
  colorClass = "text-gold",
  padded = true,
  edges = false,
  className = "",
  children,
}: Props) {
  // Определяем стили для разных тонов
  const getToneStyles = () => {
    switch (tone) {
      case "epic":
        return {
          shadow: "shadow-[0_10px_28px_rgba(0,0,0,.34),0_0_24px_rgba(251,191,36,.12)]",
          ring: "ring-1 ring-[#83622c]",
          variant: "epic" as const,
          titleColor: "linear-gradient(180deg,#fde8a7,#8a5a18)",
          isQuiet: false
        };
      case "accent":
        return {
          shadow: "shadow-[0_8px_24px_rgba(0,0,0,.28),0_0_16px_rgba(251,191,36,.08)]",
          ring: "ring-1 ring-[#4a5568]",
          variant: "strong" as const,
          titleColor: "linear-gradient(180deg,#e2e8f0,#94a3b8)",
          isQuiet: false
        };
      case "subtle":
        return {
          shadow: "shadow-[0_6px_20px_rgba(0,0,0,.22)]",
          ring: "ring-1 ring-[#2a2a33]",
          variant: "base" as const,
          titleColor: "linear-gradient(180deg,#cbd5e1,#64748b)",
          isQuiet: false
        };
      default: // muted
        return {
          shadow: "shadow-[0_4px_16px_rgba(0,0,0,.18)]",
          ring: "ring-1 ring-[#2a2a33]",
          variant: "base" as const,
          titleColor: "linear-gradient(180deg,#9ca3af,#6b7280)",
          isQuiet: true
        };
    }
  };

  const toneStyles = getToneStyles();
  const positions = corners === 4 ? pos4 : corners === 2 ? pos2 : [];

  return (
    <div className={`group relative rounded-2xl bg-[#1b1b22]/88 ${toneStyles.ring} ${toneStyles.shadow} ${padded ? "p-4 md:p-5" : ""} ${className}
      before:absolute before:inset-[1px] before:rounded-[14px] before:pointer-events-none
      before:ring-1 before:ring-white/5
      after:absolute after:inset-0 after:rounded-2xl after:pointer-events-none
      ${toneStyles.isQuiet 
        ? 'after:shadow-[inset_0_1px_0_rgba(255,255,255,.03),inset_0_-8px_24px_rgba(0,0,0,.25)]' 
        : 'after:bg-[radial-gradient(1200px_800px_at_20%_-10%,rgba(181,42,42,.08),transparent_60%),radial-gradient(1200px_800px_at_80%_110%,rgba(181,42,42,.06),transparent_60%)] after:opacity-[.35]'
      }`}>
      
      {/* углы - только для не-тихих панелей */}
      {!toneStyles.isQuiet && positions.map(pos => (
        <Corner key={pos} variant={toneStyles.variant} tone={tone} className={cornerPos[pos]} />
      ))}

      {/* декоративные накладки по середине сторон (опционально) */}
      {edges && (
        <>
          <EdgeBase className={`absolute left-1/2 -translate-x-1/2 top-[-2px] ornament-boost ${colorClass}`} 
                    style={{ filter: "saturate(.85) brightness(.9) contrast(.95) drop-shadow(0 0 6px rgba(251,191,36,.10))" }} />
          <EdgeBase className={`absolute left-1/2 -translate-x-1/2 bottom-[-2px] rotate-180 ornament-boost ${colorClass}`} 
                    style={{ filter: "saturate(.85) brightness(.9) contrast(.95) drop-shadow(0 0 6px rgba(251,191,36,.10))" }} />
          <EdgeBase className={`absolute top-1/2 -translate-y-1/2 left-[-2px] -rotate-90 ornament-boost ${colorClass}`} 
                    style={{ filter: "saturate(.85) brightness(.9) contrast(.95) drop-shadow(0 0 6px rgba(251,191,36,.10))" }} />
          <EdgeBase className={`absolute top-1/2 -translate-y-1/2 right-[-2px] rotate-90 ornament-boost ${colorClass}`} 
                    style={{ filter: "saturate(.85) brightness(.9) contrast(.95) drop-shadow(0 0 6px rgba(251,191,36,.10))" }} />
        </>
      )}

      {/* маленькие перемычки для тихих панелей */}
      {toneStyles.isQuiet && (
        <>
          <EdgeBase className="absolute left-1/2 -translate-x-1/2 top-[-1px] text-stone-300/25" 
                    style={{ filter: "saturate(.6) brightness(.8) contrast(.9)" }} />
          <EdgeBase className="absolute left-1/2 -translate-x-1/2 bottom-[-1px] rotate-180 text-stone-300/25" 
                    style={{ filter: "saturate(.6) brightness(.8) contrast(.9)" }} />
        </>
      )}

      {title && (
        <div className="mb-3 -mt-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md
                          ring-1 ring-[#2a2a33]/70 bg-[#2a2a33]/60
                          shadow-[inset_0_1px_0_rgba(255,255,255,.05)]">
            <span className="font-ui tracking-wide"
                  style={{ 
                    background: toneStyles.titleColor,
                    WebkitBackgroundClip: "text", 
                    color: "transparent" 
                  }}>
              {title}
            </span>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
