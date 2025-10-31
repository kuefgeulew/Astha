import React from "react";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
};

export default function GlassCard({ title, subtitle, className = "", children }: Props) {
  return (
    <div
      className={[
        "rounded-2xl border border-white/25 bg-white/60 backdrop-blur-md",
        "shadow-[0_10px_30px_rgba(0,0,0,0.06)]",
        "p-4",
        className,
      ].join(" ")}
    >
      <div className="mb-3">
        <h3 className="text-[15px] font-semibold tracking-tight text-slate-900">{title}</h3>
        {subtitle && <p className="text-[11px] text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
