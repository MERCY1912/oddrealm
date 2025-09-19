import React from 'react';

export function InventorySlot({ rarity="common", icon }:{
  rarity?: "common"|"rare"|"epic"|"legend";
  icon?: React.ReactNode;
}) {
  const aura = {
    common:  "inset_0_0_10px_rgba(255,255,255,.04)",
    rare:    "inset_0_0_12px_rgba(56,189,248,.25),0_0_10px_rgba(56,189,248,.15)",
    epic:    "inset_0_0_12px_rgba(167,139,250,.3),0_0_10px_rgba(167,139,250,.2)",
    legend:  "inset_0_0_14px_rgba(251,191,36,.35),0_0_12px_rgba(251,191,36,.25)",
  }[rarity];

  return (
    <button className={`inventory-empty-slot group aspect-square my-0.5`}>
      <div className="absolute inset-0 rounded-xl" style={{ boxShadow: aura }} />
      <div className="grid place-items-center h-full">{icon ?? <span className="text-ash/60">◆</span>}</div>
      {/* искры при hover */}
      <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition">
        <i className="absolute left-1/4 top-1/3 w-1 h-1 bg-white/40 rounded-full animate-[spark_800ms_ease-out]" />
        <i className="absolute right-1/4 top-2/3 w-1 h-1 bg-white/25 rounded-full animate-[spark_900ms_ease-out_200ms]" />
      </span>
    </button>
  );
}
