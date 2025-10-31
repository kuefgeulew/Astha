import { useEffect, useMemo, useState } from "react";
import { QrCode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import QRPayOverlay from "./screens/qr/QRPayOverlay";
import ProfileQROverlay from "./screens/profile/ProfileQROverlay";

import TopBar from "./components/TopBar";
import ProfilePicture from "./components/ProfilePicture";
import AccountCard from "./components/AccountCard";
import { DockGrid } from "./components/DockGrid";
import FloatingFabDock from "./components/FloatingFabDock";
import PromoOverlay from "./components/PromoOverlay";
import FabSavingsCalculatorsOverlay from "./screens/calc/FabSavingsCalculatorsOverlay";
import { OFFERS, pickRandomOfferIndex } from "./data/offers";
import {
  QR_WHITE_BOTTOM,
  QR_BLUE_BOTTOM,
  QR_SIZE,
  QR_ICON_SIZE,
  QR_BORDER_PX,
  DOCK_RADIUS,
  DOCK_TOP_PAD,
  DOCK_BOTTOM_PAD,
} from "./constants/ui";

export default function BracAppPrototype() {
  const [accountBalance, setAccountBalance] = useState(171155.29);

  const bgSquares = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        size: Math.floor(Math.random() * 120) + 60,
        x: Math.floor(Math.random() * 280) + 20,
        y: Math.floor(Math.random() * 560) + 120,
        rotate: Math.floor(Math.random() * 30),
        opacity: Math.random() * 0.2 + 0.05,
      })),
    []
  );

  const [hash, setHash] = useState(
    typeof window !== "undefined" ? window.location.hash : ""
  );
  const [promoIndex, setPromoIndex] = useState(0);
  const [showPromo, setShowPromo] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setPromoIndex(pickRandomOfferIndex(OFFERS.length));
      setShowPromo(true);
    }, 5000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    onHash();
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const modalActive =
    hash === "#qrpay" || hash === "#profileqr" || hash === "#savings" || showPromo;

  function closeOverlay() {
    if (history.replaceState) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    } else {
      window.location.hash = "";
    }
    setHash("");
  }

  return (
    <div className="w-full min-h-screen flex items-start justify-center bg-neutral-100 py-6">
      <div className="relative w-[390px] h-[844px] rounded-3xl overflow-hidden shadow-2xl border border-black/10 bg-[#0B66B0]">
        <TopBar
          onBnClick={() => {
            setPromoIndex(pickRandomOfferIndex(OFFERS.length));
            setShowPromo(true);
          }}
        />

        {/* portal anchor */}
        <div id="fab-anchor" className="absolute inset-0 pointer-events-none" />

        {/* background shapes */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {bgSquares.map((s) => (
            <div
              key={s.id}
              className="absolute bg-white/10 rounded-md"
              style={{
                width: s.size,
                height: s.size,
                left: s.x,
                top: s.y,
                transform: `rotate(${s.rotate}deg)`,
                opacity: s.opacity,
              }}
            />
          ))}
        </div>

        <div className="relative h-full overflow-hidden z-10">
          {/* profile row */}
          <div className="px-4 mt-4 flex items-center gap-3">
            <ProfilePicture />
            <div>
              <div className="text-white/80 text-sm">Welcome</div>
              <div className="text-white font-semibold text-xl -mt-0.5">Nazia Haque</div>
              <button className="text-sky-200 underline text-sm">View Profile</button>
            </div>
          </div>

          {/* tabs */}
          <div className="px-4 mt-5 flex items-center gap-4">
            <Tab label="Accounts" active />
            <Tab label="FDR/DPS" />
            <Tab label="Credit Card" />
            <Tab label="Loans" />
          </div>

          {/* account card */}
          <div className="px-4 mt-6">
            <AccountCard balance={accountBalance} />
          </div>

          {/* QR cutout + button */}
          <AnimatePresence>
            {!modalActive && (
              <motion.div
                key="qr-cutout"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="relative z-10"
              >
                {/* Blue halo */}
                <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: QR_BLUE_BOTTOM }}>
                  <div
                    className="rounded-full bg-[#0B66B0]"
                    style={{ width: QR_SIZE + 8, height: QR_SIZE + 8 }}
                  />
                </div>

                {/* White QR circle (clickable) */}
                <button
                  type="button"
                  aria-label="Scan & Pay"
                  onClick={() => (window.location.hash = "#qrpay")}
                  className="absolute left-1/2 -translate-x-1/2 pointer-events-auto cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-white/60 z-20"
                  style={{ bottom: QR_WHITE_BOTTOM }}
                >
                  <div
                    className="rounded-full bg-white shadow-lg flex items-center justify-center"
                    style={{
                      width: QR_SIZE,
                      height: QR_SIZE,
                      border: `${QR_BORDER_PX}px solid #d7a728`,
                    }}
                  >
                    <QrCode size={QR_ICON_SIZE} className="text-[#d7a728]" />
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* GLASS DOCK */}
          <AnimatePresence mode="wait">
            {!modalActive && (
              <motion.div
                key="glass-dock"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="absolute bottom-0 left-0 right-0 
                           backdrop-blur-lg bg-white/10 
                           border-t border-white/20 
                           shadow-[0_-4px_20px_rgba(255,255,255,0.1)]"
                style={{
                  borderTopLeftRadius: DOCK_RADIUS,
                  borderTopRightRadius: DOCK_RADIUS,
                  paddingTop: 12,                 // partition line closer to icons
                  paddingBottom: DOCK_BOTTOM_PAD,
                }}
              >
                <DockGrid />
                <div className="mt-4 flex justify-center">
                  <div className="w-24 h-1.5 rounded-full bg-black/20" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FAB fan */}
          <AnimatePresence>
            {!modalActive && (
              <motion.div
                key="fab-fan"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
                className="pointer-events-none"
              >
                <FloatingFabDock hidden={false} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Offer promo */}
          <PromoOverlay
            open={showPromo}
            onClose={() => setShowPromo(false)}
            offer={OFFERS[promoIndex]}
            offsetTop={-240}
          />

          {/* Overlays */}
          {hash === "#qrpay" && <QRPayOverlay onClose={closeOverlay} />}
          {hash === "#profileqr" && <ProfileQROverlay onClose={closeOverlay} />}
          {hash === "#savings" && (
            <FabSavingsCalculatorsOverlay
              onClose={closeOverlay}
              accountBalance={accountBalance}
              setAccountBalance={setAccountBalance}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Tab({ label, active }) {
  return (
    <button
      className={
        "px-4 py-2 rounded-full text-sm font-medium transition " +
        (active
          ? "bg-white/20 text-white shadow border border-white/20 backdrop-blur"
          : "text-white/90 hover:bg-white/10 border border-white/10")
      }
    >
      {label}
    </button>
  );
}
