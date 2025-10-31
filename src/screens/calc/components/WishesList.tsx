import React, { useMemo, useState } from "react";
import WishItem, { Wish } from "./WishItem";

type Props = {
  wishes: Wish[];
  wallet: number;
  readOnly?: boolean;
  onCreate?: (title: string, target: number, priority?: 1 | 2 | 3, deadline?: string) => void;
  onAllocate?: (id: string, amount: number) => void;
  onDelete?: (id: string) => void;
  onStar?: (id: string) => void;

  // receive reorders from item up/down actions
  onReorder?: (next: Wish[]) => void;
};

export default function WishesList({
  wishes,
  wallet,
  readOnly,
  onCreate,
  onAllocate,
  onDelete,
  onStar,
  onReorder,
}: Props) {
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState(1000);
  const [priority, setPriority] = useState<1 | 2 | 3>(2);
  const [deadline, setDeadline] = useState<string>("");

  const list = useMemo(() => wishes, [wishes]);

  const moveBy = (id: string, delta: number) => {
    const idx = list.findIndex((w) => w.id === id);
    if (idx === -1) return;
    const newIdx = Math.min(list.length - 1, Math.max(0, idx + delta));
    if (newIdx === idx) return;
    const next = [...list];
    const [item] = next.splice(idx, 1);
    next.splice(newIdx, 0, item);
    onReorder?.(next);
  };

  return (
    <div className="space-y-3">
      {/* Create new (compact, phone-first) */}
      <div className={`rounded-2xl p-3 border ${readOnly ? "bg-slate-50/60" : "bg-fuchsia-50 border-fuchsia-200"}`}>
        <div className="font-semibold mb-2 text-[13px]">
          Create a Wish {readOnly && <span className="text-[11px] text-slate-500">(view only)</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            disabled={!onCreate}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Wish title"
            className="px-3 py-2 border rounded-xl flex-1 min-w-[150px] text-[13px]"
          />
          <input
            disabled={!onCreate}
            type="number"
            value={target}
            onChange={(e) => setTarget(parseInt(e.target.value || "0"))}
            className="px-3 py-2 border rounded-xl w-[96px] text-[13px]"
            title="Target (BDT)"
          />
          <select
            disabled={!onCreate}
            value={priority}
            onChange={(e) => setPriority(parseInt(e.target.value) as 1 | 2 | 3)}
            className="px-3 py-2 border rounded-xl text-[13px]"
            title="Priority"
          >
            <option value={1}>High</option>
            <option value={2}>Medium</option>
            <option value={3}>Low</option>
          </select>
          <input
            disabled={!onCreate}
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="px-3 py-2 border rounded-xl text-[13px]"
            title="Deadline"
          />
          <button
            disabled={!onCreate || !title.trim()}
            onClick={() => {
              onCreate?.(title.trim(), Math.max(0, target), priority, deadline || undefined);
              setTitle("");
              setTarget(1000);
              setPriority(2);
              setDeadline("");
            }}
            className="px-3 py-2 bg-fuchsia-600 text-white rounded-xl disabled:opacity-50 text-[13px]"
          >
            + Add Wish
          </button>
        </div>
      </div>

      {list.map((w, i) => (
        <WishItem
          key={w.id}
          w={w}
          wallet={wallet}
          readOnly={readOnly}
          onAllocate={onAllocate}
          onDelete={onDelete}
          onStar={onStar}
          onMoveUp={() => moveBy(w.id, -1)}
          onMoveDown={() => moveBy(w.id, +1)}
          isFirst={i === 0}
          isLast={i === list.length - 1}
        />
      ))}
    </div>
  );
}
