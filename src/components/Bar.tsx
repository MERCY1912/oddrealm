export function Bar({ label, value, max, color = "blood" }: {
  label: string;
  value: number;
  max: number;
  color?: "blood" | "gold";
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  
  const getBarStyle = () => {
    switch (color) {
      case "blood":
        return {
          background: "linear-gradient(90deg, #dc2626, #ef4444, #f87171)",
          boxShadow: "inset 0 0 6px rgba(0,0,0,.6), 0 0 8px rgba(220,38,38,.3)"
        };
      case "gold":
        return {
          background: "linear-gradient(90deg, #b58b46, #d4af37, #f4d03f)",
          boxShadow: "inset 0 0 6px rgba(0,0,0,.6), 0 0 8px rgba(181,139,70,.3)"
        };
      default:
        return {
          background: "linear-gradient(90deg, #dc2626, #ef4444, #f87171)",
          boxShadow: "inset 0 0 6px rgba(0,0,0,.6), 0 0 8px rgba(220,38,38,.3)"
        };
    }
  };
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-ash/80">
        <span className="font-ui">{label}</span>
        <span>{value}/{max}</span>
      </div>
      <div className="h-3 rounded bg-stone/60 ring-1 ring-stone/70 overflow-hidden relative">
        {/* Алхимическая подложка */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone/40 via-stone/20 to-stone/40 opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-stone/10 to-stone/30" />
        
        {/* Основная полоска */}
        <div 
          className="h-full transition-all duration-500 relative"
          style={{ 
            width: `${pct}%`,
            ...getBarStyle()
          }}
        >
          {/* Внутреннее свечение */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-sm" />
          
          {/* Текстура */}
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'><rect width='1' height='1' fill='white' opacity='0.3'/></svg>")`,
            backgroundSize: '4px 4px'
          }} />
        </div>
        
        {/* Блеск при заполнении */}
        {pct > 0 && (
          <div 
            className="absolute top-0 left-0 h-full w-1 bg-white/40 rounded-sm"
            style={{ 
              left: `${Math.max(0, pct - 2)}%`,
              animation: 'shimmer 2s ease-in-out infinite'
            }}
          />
        )}
      </div>
    </div>
  );
}
