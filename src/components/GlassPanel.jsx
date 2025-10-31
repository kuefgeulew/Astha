// src/components/GlassPanel.jsx
export default function GlassPanel({ className = "", children }) {
  return (
    <div
      className={
        "backdrop-blur-lg bg-white/10 border border-white/20 " +
        "shadow-[0_10px_30px_rgba(0,0,0,0.12)] ring-1 ring-white/10 " +
        className
      }
    >
      {children}
    </div>
  );
}
