import { motion, AnimatePresence } from "framer-motion";

export default function PromoModal({ visible, onClose }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <img
              src="/assets/brac-promo.png"
              alt="BRAC Bank Offer"
              className="w-[380px] sm:w-[480px] rounded-2xl shadow-2xl ring-1 ring-black/10"
            />
            <button
              onClick={onClose}
              className="absolute right-3 top-3 rounded-full bg-white/80 p-1 hover:bg-white"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
