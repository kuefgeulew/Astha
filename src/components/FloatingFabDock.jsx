// src/components/FloatingFabDock.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PiggyBank,
  PieChart,
  SplitSquareVertical,
  BarChart2,
  Wallet,
  Plus,
  X,
} from "lucide-react";
import ReactDOM from "react-dom";

// Keep the FAB locked between the card & dock
const FAB_TOP = 460; // px from top of the phone frame; tweak if you move sections

const BTN_BASE =
  "pointer-events-auto grid place-items-center rounded-full transition-all duration-300";

function DockContent({ hidden = false }) {
  const [open, setOpen] = useState(false);
  const [hoverId, setHoverId] = useState(null);

  useEffect(() => {
    const fn = () => setOpen(false);
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);

  if (hidden) return null;

  // ✅ PFM-only fan (5 items) — Savings icon switched to PiggyBank
  const items = [
    { id: "savings", label: "Savings", icon: PiggyBank, hash: "#savings" },
    { id: "budget", label: "Budgets", icon: PieChart, hash: "#budget" },
    { id: "split", label: "Split / Request", icon: SplitSquareVertical, hash: "#split" },
    { id: "summary", label: "Summary", icon: BarChart2, hash: "#summary" },
    { id: "manager", label: "Manager", icon: Wallet, hash: "#manager" },
  ];

  // ---- Upward arc so nothing overlaps the dock/QR area ----
  const COUNT = items.length;
  const R = 120;
  const START_DEG = -160;
  const END_DEG = -20;
  const angleAt = (i) =>
    START_DEG + ((END_DEG - START_DEG) * (COUNT === 1 ? 0 : i / (COUNT - 1)));

  const delayFor = (i) => i * 0.03;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="fab-mask"
            className="absolute inset-0 z-[9998] bg-black/25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="absolute inset-0 z-[9999] pointer-events-none">
        <div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ top: FAB_TOP }}
        >
          {/* Fan buttons */}
          <AnimatePresence>
            {open &&
              items.map((it, i) => {
                const Icon = it.icon;
                const theta = (angleAt(i) * Math.PI) / 180;
                const x = Math.cos(theta) * R;
                const y = Math.sin(theta) * R;
                const lx = Math.cos(theta) * (R + 38);
                const ly = Math.sin(theta) * (R + 38);

                return (
                  <div key={it.id}>
                    <motion.button
                      initial={{ opacity: 0, x: 0, y: 0, scale: 0.6 }}
                      animate={{ opacity: 1, x, y, scale: 1 }}
                      exit={{ opacity: 0, x: 0, y: 0, scale: 0.6 }}
                      transition={{
                        type: "spring",
                        stiffness: 520,
                        damping: 32,
                        delay: delayFor(i),
                      }}
                      onMouseEnter={() => setHoverId(it.id)}
                      onMouseLeave={() =>
                        setHoverId((h) => (h === it.id ? null : h))
                      }
                      onClick={() => {
                        window.location.hash = it.hash;
                        setOpen(false);
                      }}
                      aria-label={it.label}
                      title={it.label}
                      className={`${BTN_BASE} absolute h-14 w-14 backdrop-blur-md bg-white/12 border border-white/25 shadow-[0_6px_18px_rgba(0,0,0,0.22)]`}
                      style={{ left: 0, top: 0 }}
                    >
                      <Icon className="h-6 w-6 text-white drop-shadow" />
                    </motion.button>

                    <motion.span
                      initial={{ opacity: 0, scale: 0.85, x: 0, y: 0 }}
                      animate={{
                        opacity: hoverId === it.id ? 1 : 0,
                        scale: hoverId === it.id ? 1 : 0.85,
                        x: lx,
                        y: ly,
                      }}
                      transition={{ type: "spring", stiffness: 420, damping: 28 }}
                      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-md bg-black/75 px-2 py-1 text-xs text-white shadow"
                      style={{ left: 0, top: 0, whiteSpace: "nowrap" }}
                    >
                      {it.label}
                    </motion.span>
                  </div>
                );
              })}
          </AnimatePresence>

          {/* Premium FAB */}
          <motion.button
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((s) => !s)}
            className={`${BTN_BASE} pointer-events-auto h-16 w-16 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.25)]`}
            style={{
              background:
                "radial-gradient(circle at 30% 30%, #2563eb 0%, #1e40af 80%)",
              border: "2.5px solid #d7a728",
              boxShadow:
                "0 0 20px rgba(15,90,200,0.4), 0 4px 20px rgba(0,0,0,0.25)",
            }}
            whileHover={{
              scale: 1.08,
              boxShadow:
                "0 0 28px rgba(215,167,40,0.55), 0 6px 24px rgba(0,0,0,0.35)",
            }}
            whileTap={{ scale: 0.94 }}
          >
            <motion.div
              initial={false}
              animate={{ rotate: open ? 45 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {open ? <X className="h-7 w-7 text-white" /> : <Plus className="h-8 w-8 text-white" />}
            </motion.div>
          </motion.button>

          {/* soft halo */}
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-full blur-2xl opacity-60 pointer-events-none"
            style={{
              top: -12,
              width: 80,
              height: 80,
              background:
                "radial-gradient(circle, rgba(30,58,138,0.45) 0%, rgba(0,0,0,0) 70%)",
            }}
          />
        </div>
      </div>
    </>
  );
}

export default function FloatingFabDock({ hidden }) {
  const anchor =
    (typeof document !== "undefined" && document.getElementById("fab-anchor")) ||
    document.body;
  return ReactDOM.createPortal(<DockContent hidden={hidden} />, anchor);
}
