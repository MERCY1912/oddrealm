import React from 'react';

interface SlotProps {
  icon: React.ReactNode;
  rarity?: "common" | "rare" | "epic";
  className?: string;
  onClick?: () => void;
  equipped?: boolean;
}

export function Slot({ icon, rarity = "common", className = "", onClick, equipped = false }: SlotProps) {
  const getRarityStyles = () => {
    switch (rarity) {
      case "epic":
        return "ring-1 ring-[#83622c] shadow-[inset_0_0_12px_rgba(251,191,36,.25),0_0_10px_rgba(251,191,36,.15)]";
      case "rare":
        return "ring-1 ring-[#83622c] shadow-[inset_0_0_12px_rgba(251,191,36,.25),0_0_10px_rgba(251,191,36,.15)]";
      default:
        return "ring-1 ring-[#2a2a33] shadow-[inset_0_0_10px_rgba(255,255,255,.04)]";
    }
  };

  const getEquippedStyles = () => {
    return equipped ? "medieval-item-slot equipped" : "medieval-item-slot";
  };

  const getRarityClass = () => {
    return `rarity-${rarity}`;
  };

  return (
    <button 
      className={`aspect-square rounded-xl bg-[#1b1b22]/88 ${getRarityStyles()} ${getEquippedStyles()} ${getRarityClass()} grid place-items-center transition-all duration-200 ${className}
        before:absolute before:inset-[1px] before:rounded-[10px] before:pointer-events-none
        before:ring-1 before:ring-white/5
        after:absolute after:inset-0 after:rounded-xl after:pointer-events-none
        after:bg-[radial-gradient(600px_400px_at_20%_-10%,rgba(181,42,42,.06),transparent_60%),radial-gradient(600px_400px_at_80%_110%,rgba(181,42,42,.04),transparent_60%)] after:opacity-[.25]`}
      onClick={onClick}
    >
      <span className="opacity-95 text-2xl">{icon}</span>
    </button>
  );
}
