// src/screens/calc/FabSavingsCalculatorsOverlay.tsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useAnimation, useDragControls } from "framer-motion";
import GlassCard from "./components/GlassCard";
import WishesList from "./components/WishesList";
import type { Wish } from "./components/WishItem";

type Props = {
  onClose: () => void;
  accountBalance: number;                      // 🔸 live balance from App
  setAccountBalance: (n: number) => void;      // 🔸 setter from App
};

// ✅ Formatter: always two decimals (BDT)
const fmtBDT2 = (n: number) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(Math.max(0, Number(n)))
    .replace("BDT", "")
    .trim();

/**
 * Full-screen, phone-bound overlay:
 * - Uses real account balance (no separate wallet)
 * - Spring slide-in/out + pull-to-close
 */
export default function FabSavingsCalculatorsOverlay({
  onClose,
  accountBalance,
  setAccountBalance,
}: Props) {
  const [wishes, setWishes] = useState<Wish[]>([
    {
      id: "w-perfume",
      title: "YSL Black Opium & Zara Nude Bouquet",
      target: 22000,
      saved: 6000,
      priority: 2,
      deadline: "2026-02-01",
      starred: true,
    },
    {
      id: "w-handbag",
      title: "Michael Kors Bedford Tote (Vanilla/Gold)",
      target: 45000,
      saved: 10000,
      priority: 1,
      deadline: "2026-06-15",
      starred: true,
    },
    {
      id: "w-boho-room",
      title: "Boho Bedroom Makeover",
      target: 18000,
      saved: 4000,
      priority: 2,
      deadline: "2026-04-30",
    },
    {
      id: "w-anaiza-bday",
      title: "Anaiza’s Birthday Celebration",
      target: 15000,
      saved: 3000,
      priority: 1,
      deadline: "2026-01-20",
      starred: true,
    },
    {
      id: "w-srimangal",
      title: "Weekend Getaway — Srimangal",
      target: 30000,
      saved: 8000,
      priority: 2,
      deadline: "2026-05-10",
    },
    {
      id: "w-retail-group",
      title: "Treat for Retail Group",
      target: 12000,
      saved: 2000,
      priority: 2,
      deadline: "2026-03-15",
    },
    {
      id: "w-mawa-trip",
      title: "Mawa Trip Sponsorship",
      target: 20000,
      saved: 5000,
      priority: 3,
      deadline: "2026-02-28",
    },
  ]);

  /* ----------------------------- Core Actions ----------------------------- */

  const createWish = (
    title: string,
    target: number,
    priority: 1 | 2 | 3 = 2,
    deadline?: string
  ) => {
    const id = "w" + Date.now();
    setWishes((w) => [
      { id, title, target: Math.max(0, Math.round(target)), saved: 0, priority, deadline },
      ...w,
    ]);
  };

  const allocateWish = (id: string, amount: number) => {
    const amt = Math.max(0, Math.round(amount));
    if (amt <= 0) return;
    if (amt > accountBalance) return;

    const targetWish = wishes.find((w) => w.id === id);
    if (!targetWish) return;

    const remaining = Math.max(0, targetWish.target - targetWish.saved);
    const add = Math.min(remaining, amt);
    if (add <= 0) return;

    setWishes((arr) =>
      arr.map((w) => (w.id === id ? { ...w, saved: w.saved + add } : w))
    );
    setAccountBalance(Math.max(0, accountBalance - add));
  };

  const deleteWish = (id: string) =>
    setWishes((arr) => arr.filter((w) => w.id !== id));

  const starWish = (id: string) =>
    setWishes((arr) =>
      arr.map((w) => (w.id === id ? { ...w, starred: !w.starred } : w))
    );

  /* ----------------------------- Anim + Drag ----------------------------- */

  const controls = useAnimation();
  const dragControls = useDragControls();

  useEffect(() => {
    controls.start({
      y: 0,
      transition: { type: "spring", stiffness: 520, damping: 38 },
    });
  }, [controls]);

  const closeSheet = () => {
    controls
      .start({
        y: "100%",
        transition: { type: "spring", stiffness: 520, damping: 42 },
      })
      .then(() => onClose());
  };

  const onDragEnd = (_: any, info: { velocity: { y: number }; offset: { y: number } }) => {
    const draggedFar = info.offset.y > 120;
    const flungFast = info.velocity.y > 800;
    if (draggedFar || flungFast) closeSheet();
    else
      controls.start({
        y: 0,
        transition: { type: "spring", stiffness: 700, damping: 40 },
      });
  };

  const startDragFromHandle = (e: React.PointerEvent) => {
    dragControls.start(e, { snapToCursor: false });
  };

  /* ----------------------------- Render ----------------------------- */

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50">
        {/* scrim */}
        <motion.div
          className="absolute inset-0 bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeSheet}
        />

        {/* FULL-SCREEN SHEET */}
        <motion.div
          className="
            absolute inset-0 h-full rounded-none
            bg-gradient-to-b from-white/80 to-white/65
            backdrop-blur-xl ring-1 ring-black/10
            shadow-[0_-12px_40px_rgba(0,0,0,0.25)]
            flex flex-col overflow-hidden
          "
          initial={{ y: "100%" }}
          animate={controls}
          exit={{ y: "100%", transition: { type: 'spring', stiffness: 520, damping: 42 } }}
          drag="y"
          dragControls={dragControls}
          dragListener={false}
          dragElastic={0.12}
          onDragEnd={onDragEnd}
        >
          {/* HEADER */}
          <div className="px-4 pt-3 pb-2 border-b border-white/50 bg-white/50 backdrop-blur select-none">
            <div
              className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-slate-300/70"
              onPointerDown={startDragFromHandle}
              role="button"
              aria-label="Drag to close"
            />
            <div className="flex items-center justify-between">
              <div className="pr-2">
                <h2 className="text-[16px] font-semibold tracking-tight text-slate-900">
                  Goal-based Savings (Wishes)
                </h2>
                <p className="text-[11px] text-slate-500">
                  Allocate from your account balance and track progress to goals.
                </p>
              </div>
              <button
                className="rounded-full p-2 hover:bg-white/70"
                onClick={closeSheet}
                aria-label="Close"
                title="Close"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5">
                  <path
                    fill="currentColor"
                    d="M6.225 4.811a1 1 0 0 1 1.414 0L12 9.172l4.361-4.361a1 1 0 0 1 1.415 1.414L13.414 10.586l4.362 4.361a1 1 0 1 1-1.415 1.415L12 12l-4.361 4.362a1 1 0 0 1-1.414-1.415L10.586 10.586 6.225 6.225a1 1 0 0 1 0-1.414Z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* BODY */}
          <div className="flex-1 overflow-y-auto px-4 py-4 overscroll-contain touch-pan-y [scrollbar-gutter:stable]">
            <GlassCard title="Your Account" subtitle="Available funds you can allocate to wishes.">
              <div className="mb-3 text-[13px] text-slate-700">
                Available:{" "}
                <span className="font-semibold">{fmtBDT2(accountBalance)}</span> BDT
              </div>

              <WishesList
                wishes={wishes}
                wallet={accountBalance}
                onCreate={createWish}
                onAllocate={allocateWish}
                onDelete={deleteWish}
                onStar={starWish}
              />
            </GlassCard>

            <div className="h-8" />
          </div>

          {/* FOOTER */}
          <div className="border-t border-white/50 bg-white/50 px-3 py-2 text-[10px] text-slate-600 backdrop-blur flex items-center justify-between">
            <div>Demo only: Balance & wishes persist in this session.</div>
            <div className="rounded-full border border-slate-200 bg-white/80 px-3 py-1">
              BRAC Savings
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
