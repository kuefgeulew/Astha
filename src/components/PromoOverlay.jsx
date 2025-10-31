import { AnimatePresence, motion } from "framer-motion";
import { X, Tag } from "lucide-react";

export default function PromoOverlay({ open, onClose, offer, offsetTop = -220 }) {
  const Icon = offer?.Icon || Tag;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-[10000] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/35" onClick={onClose} />
          <motion.div
            className="relative mx-6 w-[86%] max-w-sm rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden"
            style={{ marginTop: offsetTop }}
            initial={{ y: 40, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 40, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            <div className="h-2 w-full bg-[#0B66B0]" />
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-[#0B66B0] text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="text-[#0B66B0] font-extrabold text-lg leading-tight">
                    {offer?.title || "Special Offer"}
                  </div>
                  <div className="mt-1 text-sm text-slate-700">{offer?.body || ""}</div>
                  {offer?.badge && (
                    <div className="mt-3 rounded-xl border border-amber-300 bg-amber-100/60 px-3 py-2 text-[#0B66B0] text-sm font-semibold w-fit">
                      {offer.badge}
                    </div>
                  )}
                </div>
                <button aria-label="Close" onClick={onClose} className="text-slate-500 hover:text-slate-700">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <button
                onClick={onClose}
                className="mt-4 w-full rounded-full bg-[#0B66B0] py-2 text-white font-semibold shadow"
              >
                Scan & Pay Now
              </button>
              <div className="mt-2 text-center text-[11px] text-slate-500">T&Cs apply • Offer period limited</div>
            </div>
            <div className="h-2 w-full bg-amber-400" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
