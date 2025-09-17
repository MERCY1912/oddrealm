export default function AmbientLight() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute -top-24 -left-24 h-[60vh] w-[60vw] rounded-full blur-[80px] opacity-40
                      animate-[pulse_8s_ease-in-out_infinite]"
           style={{ background:"radial-gradient(closest-side, rgba(181,42,42,.22), transparent 70%)" }} />
      <div className="absolute -bottom-24 -right-24 h-[55vh] w-[55vw] rounded-full blur-[80px] opacity-35
                      animate-[pulse_10s_ease-in-out_infinite_2s]"
           style={{ background:"radial-gradient(closest-side, rgba(181,42,42,.18), transparent 70%)" }} />
    </div>
  );
}
