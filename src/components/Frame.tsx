import React from "react";

type Props = React.PropsWithChildren<{ 
  title?: string; 
  accent?: boolean;
  className?: string;
}>;

export default function Frame({ title, accent, children, className = "" }: Props) {
  return (
    <div className={`relative rounded-2xl p-4 md:p-5 bg-iron/80 ring-1 ring-stone
                     before:absolute before:inset-0 before:rounded-2xl before:pointer-events-none
                     before:border before:border-stone/60
                     after:absolute after:inset-0 after:rounded-2xl after:pointer-events-none
                     ${accent ? "ring-blood/60 shadow-glow" : "ring-stone/60"}
                     ${className}`}>
      {/* угловые «скобы» */}
      {["tl","tr","bl","br"].map((pos)=>(
        <span key={pos} className={`absolute w-5 h-5 border-gold/70`} style={{
          [pos.includes("t")?"top":"bottom"]: "-2px",
          [pos.includes("l")?"left":"right"]: "-2px",
          borderTop: pos.includes("t") ? "2px solid #b58b46" : undefined,
          borderLeft: pos.includes("l") ? "2px solid #b58b46" : undefined,
          borderRight: pos.includes("r") ? "2px solid #b58b46" : undefined,
          borderBottom: pos.includes("b") ? "2px solid #b58b46" : undefined,
        }} />
      ))}
      {title && (
        <div className="mb-3 -mt-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-stone/60 ring-1 ring-stone/70">
            <span className="font-ui tracking-wide text-gold">{title}</span>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
