import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export type Wish = {
  id: string;
  title: string;
  target: number;
  saved: number;
  priority: 1 | 2 | 3;
  deadline?: string;
  starred?: boolean;
};

export const currency = (n: number) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(n)));

type ItemProps = {
  w: Wish;
  wallet: number;
  readOnly?: boolean;
  onAllocate?: (id: string, amount: number) => void;
  onDelete?: (id: string) => void;
  onStar?: (id: string) => void;

  // reordering controls
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  isFirst?: boolean;
  isLast?: boolean;
};

export default function WishItem({
  w,
  wallet,
  readOnly,
  onAllocate,
  onDelete,
  onStar,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: ItemProps) {
  const pct = Math.min(100, Math.round((w.saved / w.target) * 100));
  const canAct = !!onAllocate && !readOnly;

  const GlassBtn = ({
    children,
    disabled,
    onClick,
    title,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    title?: string;
  }) => (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`h-8 w-8 grid place-items-center rounded-lg border backdrop-blur
      ${disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-white/70"}
      bg-white/60 border-white/40 shadow-sm`}
    >
      {children}
    </button>
  );

  return (
    <div className="rounded-2xl border border-white/30 bg-white/70 backdrop-blur p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg viewBox="0 0 92 92" className="w-10 h-10">
              <circle cx="46" cy="46" r="34" stroke="currentColor" strokeWidth="10" className="text-slate-200" fill="none" />
              <circle
                cx="46" cy="46" r="34"
                stroke="currentColor" strokeWidth="10" className="text-violet-600" fill="none"
                strokeDasharray={`${2 * Math.PI * 34} ${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 - (pct / 100) * (2 * Math.PI * 34)}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold">
              {pct}%
            </span>
          </div>

          <div>
            <div className="text-[13px] font-medium text-slate-900">{w.title}</div>
            <div className="text-[11px] text-slate-500">
              Priority: {w.priority === 1 ? "High" : w.priority === 2 ? "Medium" : "Low"} • Goal: {currency(w.target)} • Saved: {currency(w.saved)}
              {w.deadline && <> • Due: {w.deadline}</>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* reorder glass buttons */}
          <GlassBtn
            title="Move up"
            disabled={isFirst}
            onClick={() => onMoveUp?.(w.id)}
          >
            <ChevronUp className="w-4 h-4" />
          </GlassBtn>
          <GlassBtn
            title="Move down"
            disabled={isLast}
            onClick={() => onMoveDown?.(w.id)}
          >
            <ChevronDown className="w-4 h-4" />
          </GlassBtn>

          {/* star / delete */}
          <button
            disabled={!onStar || readOnly}
            onClick={() => onStar?.(w.id)}
            className={`h-8 w-8 grid place-items-center rounded-lg border
              ${w.starred ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-white/60 border-white/40 hover:bg-white/70"}`}
            title={w.starred ? "Unstar" : "Star as priority"}
          >
            {w.starred ? (
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-amber-400">
                <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.173L12 18.896l-7.336 3.874 1.402-8.173L.132 9.21l8.2-1.192L12 .587z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4">
                <path
                  fill="currentColor"
                  d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                />
              </svg>
            )}
          </button>

          {onDelete && !readOnly && (
            <button
              onClick={() => onDelete(w.id)}
              className="h-8 w-8 grid place-items-center rounded-lg bg-rose-50 text-rose-600"
              title="Delete wish"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4">
                <path
                  fill="currentColor"
                  d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zm3.46-9h1.5v8h-1.5zm3.58 0h1.5v8h-1.5zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Quick amounts */}
      <div className="mt-3 grid grid-cols-5 gap-1.5">
        {[50, 100, 200, 500].map((q) => (
          <button
            key={q}
            disabled={!canAct || q > wallet}
            onClick={() => onAllocate?.(w.id, q)}
            className={`px-2 py-1.5 rounded-xl border text-[11px] ${canAct && q <= wallet ? "bg-white hover:bg-slate-50" : "opacity-50 cursor-not-allowed"}`}
          >
            {currency(q)}
          </button>
        ))}
        <button
          disabled={!canAct || wallet <= 0}
          onClick={() => onAllocate?.(w.id, wallet)}
          className={`px-2 py-1.5 rounded-xl border text-[11px] ${canAct && wallet > 0 ? "bg-white hover:bg-slate-50" : "opacity-50 cursor-not-allowed"}`}
        >
          Max
        </button>
      </div>

      {/* Custom allocate */}
      <div className="mt-2 flex items-center gap-2">
        <input
          type="number"
          min={0}
          defaultValue={100}
          disabled={!canAct}
          className="px-3 py-2 rounded-xl border bg-white w-24 disabled:opacity-50 text-[13px]"
        />
        <button
          disabled={!canAct}
          onClick={(e) => {
            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
            const amt = parseInt(input.value || "0", 10);
            if (!isNaN(amt) && amt > 0) onAllocate?.(w.id, Math.min(wallet, amt));
          }}
          className="px-3 py-2 bg-violet-600 text-white rounded-xl flex-1 disabled:opacity-50 text-[13px]"
          title="Allocate custom amount"
        >
          Allocate
        </button>
        <div className="text-[11px] text-slate-500">Wallet: {currency(wallet)}</div>
      </div>
    </div>
  );
}
