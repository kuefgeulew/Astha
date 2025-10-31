// src/screens/qr/QRPayOverlay.tsx
import React from "react";
import PinModal from "../../components/PinModal";
import { parseQrPayload } from "../../services/qrPay";
import { type Account } from "../../services/bankApi";
import ReceiptCard from "./ReceiptCard";

type Props = { onClose: () => void };

/* ----------------------------- MOCK ACCOUNTS ----------------------------- */
const MOCK_ACCOUNTS: (Account & { balance?: number })[] = [
  { id: "1074165690001", name: "Savings Account Staff (BDT)", balance: 171155.0 } as Account,
  { id: "1074165690002", name: "Current Account (BDT)",        balance: 84520.75 }  as Account,
  { id: "1074165690003", name: "Salary Wallet (BDT)",          balance: 32450.0 }   as Account,
];

/* --------------------------- Save suggestion rules ----------------------- */
/** Return the amount to save, based on your final rules:
 *  - 1–100:     total debit → multiple of 5
 *  - 101–1,000: total debit → multiple of 10
 *  - 1,001–10,000: total debit → multiple of 20
 *  - 10,001–100,000: total debit → multiple of 50
 *  - >100,000:  save exactly 1% of amount (no rounding to a unit), debit 101%
 */
function saveSuggestion(amount: number): number {
  if (!(amount > 0)) return 0;

  const whole = Math.ceil(amount);

  // helper to get how much to add so that (whole + add) is a multiple of 'unit'
  const toNextMultiple = (unit: number) => {
    const rem = whole % unit;
    return rem === 0 ? 0 : unit - rem;
  };

  if (amount <= 100) {
    return toNextMultiple(5);
  } else if (amount <= 1000) {
    return toNextMultiple(10);
  } else if (amount <= 10000) {
    return toNextMultiple(20);
  } else if (amount <= 100000) {
    return toNextMultiple(50);
  }

  // > 100,000 → exactly 1%
  // (use nearest whole taka; keeps total ≈ 101% while staying in integers)
  return Math.round(amount * 0.01);
}

export default function QRPayOverlay({ onClose }: Props) {
  const [stage, setStage] = React.useState<"scan" | "details" | "success">("scan");
  const [videoSupported, setVideoSupported] = React.useState<boolean>(false);
  const [scanError, setScanError] = React.useState<string | null>(null);

  const [merchantId, setMerchantId] = React.useState<string>("");

  // dropdown + balances (mock)
  const [accounts] = React.useState<Account[]>(MOCK_ACCOUNTS as Account[]);
  const [fromId, setFromId] = React.useState<string>(MOCK_ACCOUNTS[0].id);
  const fromBalance =
    (MOCK_ACCOUNTS.find((a) => a.id === fromId)?.balance as number | undefined) ?? null;

  const [amount, setAmount] = React.useState<string>("");
  const [note, setNote] = React.useState<string>("bKash QR");

  const [confirming, setConfirming] = React.useState(false);
  const [txId, setTxId] = React.useState<string | null>(null);

  // SmartSave & Rewards
  const [showRoundup, setShowRoundup] = React.useState(false);
  const [miniTopUp, setMiniTopUp] = React.useState<number>(0);
  const [rewardPoints, setRewardPoints] = React.useState<number>(0);
  const [roundupEnabled, setRoundupEnabled] = React.useState(true);

  // camera refs
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const detectorRef = React.useRef<any>(null);
  const rafRef = React.useRef<number | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  /* ---------------- camera + QR detection ------------------- */
  React.useEffect(() => {
    if (stage !== "scan") {
      stopCamera();
      return;
    }
    let cancelled = false;

    async function start() {
      try {
        // @ts-ignore
        const BarcodeDetector = (window as any).BarcodeDetector;
        if (BarcodeDetector) detectorRef.current = new BarcodeDetector({ formats: ["qr_code"] });

        const constraints: MediaStreamConstraints = {
          video: { facingMode: { ideal: "environment" } }, audio: false,
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints).catch(async (err) => {
          if (err?.name === "OverconstrainedError" || err?.name === "NotFoundError") {
            return navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          }
          throw err;
        });

        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setVideoSupported(true);
          setScanError(null);
          tick();
        }
      } catch (err: any) {
        setVideoSupported(false);
        const msg =
          err?.name === "NotAllowedError" ? "Permission blocked. Allow camera access, then press Retry."
          : err?.name === "NotFoundError" ? "No camera found on this device."
          : err?.message || "Camera not available";
        setScanError(msg);
      }
    }

    async function tick() {
      if (!videoRef.current) return;
      if (detectorRef.current) {
        try {
          const codes = await detectorRef.current.detect(videoRef.current);
          const first = codes?.[0]?.rawValue as string | undefined;
          if (first) {
            const parsed = parseQrPayload(first);
            if (parsed) {
              setMerchantId(parsed.merchantId);
              stopCamera();
              setStage("details");
              return;
            }
          }
        } catch {}
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    start();
    return () => { cancelled = true; stopCamera(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  function stopCamera() {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  /* -------- SmartSave preview (uses your tier rules) -------- */
  const previewMiniTopUp = React.useMemo(() => {
    const amt = Number.parseFloat(amount);
    if (!(amt > 0)) return 0;
    return saveSuggestion(amt);
  }, [amount]);

  function handleConfirmPressed() {
    const amt = Number.parseFloat(amount);
    if (!fromId || !merchantId || !(amt > 0)) return;

    if (roundupEnabled) {
      const suggestion = saveSuggestion(amt);
      if (suggestion > 0) {
        setMiniTopUp(suggestion);
        setShowRoundup(true);
        return;
      }
    }
    setMiniTopUp(0);
    setShowRoundup(false);
    setConfirming(true);
  }

  /* ---------------- simulate payment locally (no backend) --------------- */
  async function submitPayment(pin: string) {
    setConfirming(true);
    try {
      const amt = Number.parseFloat(amount) || 0;
      setRewardPoints(Math.floor(amt / 80));
      await new Promise((r) => setTimeout(r, 500));
      setTxId("TX" + Date.now());
      setStage("success");
    } catch (e: any) {
      alert(e?.message ?? "Payment failed");
    } finally {
      setConfirming(false);
    }
  }

  /* --------------------- receipt helpers -------------------- */
  function downloadReceipt() {
    const el = document.getElementById("qr-receipt");
    if (!el) return;
    const html =
      "<!doctype html><meta charset='utf-8'><title>QR Receipt</title>" +
      document.head.innerHTML +
      "<body>" + el.outerHTML + "</body>";
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `astha-qr-receipt-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function shareReceipt() {
    try {
      const amt = Number.parseFloat(amount) || 0;
      const text =
        `BRAC Bank Astha — Payment Success\n` +
        `Merchant: ${merchantId}\n` +
        `Amount: BDT ${amt.toFixed(2)}\n` +
        (miniTopUp > 0 ? `Mini-Savings: BDT ${miniTopUp}\n` : "") +
        `From: ${accounts.find((a) => a.id === fromId)?.name ?? fromId}\n` +
        `Reference: ${txId ?? "—"}\n` +
        `When: ${new Date().toLocaleString()}\n` +
        `Reward Points: ${rewardPoints}`;
      if (navigator.share) {
        await navigator.share({ title: "Astha QR Payment", text });
      } else {
        await navigator.clipboard.writeText(text);
        alert("Receipt copied to clipboard.");
      }
    } catch {
      alert("Share failed.");
    }
  }

  const handleClose = () => { stopCamera(); onClose(); };

  /* --------------------------------- UI --------------------------------- */
  return (
    <div className="
      fixed inset-0 z-50 flex items-center justify-center
      bg-[radial-gradient(ellipse_at_top,rgba(11,102,176,0.55),rgba(0,0,0,0.65))]
      backdrop-blur-md
    ">
      <div className="absolute inset-0" onClick={handleClose} />

      <div className="
        relative z-10 h-[90vh] w-[min(980px,95vw)] overflow-hidden
        rounded-3xl border border-white/20 bg-white/12 backdrop-blur-2xl
        shadow-[0_24px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/10
      ">
        <header className="
          flex items-center justify-between px-5 py-3
          border-b border-white/20 bg-white/10 backdrop-blur text-white
        ">
          <h2 className="text-base font-semibold tracking-wide">Scan &amp; Pay</h2>
          <button
            onClick={handleClose}
            className="rounded-full border border-white/30 bg-white/20 px-4 py-1.5 text-sm hover:bg-white/30"
          >
            Close
          </button>
        </header>

        {/* SCAN */}
        {stage === "scan" && (
          <div className="grid flex-1 grid-cols-1 md:grid-cols-2">
            {/* camera pane */}
            <div className="relative grid place-items-center bg-black/80">
              {videoSupported ? (
                <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
              ) : (
                <div className="p-6 text-center text-white">
                  Camera unavailable
                  <br />
                  <span className="text-sm opacity-80">{scanError}</span>
                </div>
              )}

              {/* scan frame */}
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="
                  h-[70%] max-h-[380px] w-[70%] max-w-[380px]
                  rounded-2xl border border-white/60 bg-white/5 backdrop-blur
                  shadow-[0_10px_40px_rgba(255,255,255,0.18)]
                " />
              </div>
            </div>

            {/* manual entry */}
            <div className="space-y-4 p-5 text-white bg-gradient-to-br from-white/10 to-white/5 backdrop-blur">
              <h3 className="font-semibold">Scan and Pay</h3>
              <p className="text-sm text-white/80">
                Hold your camera on the QR code. If scanning isn’t supported, enter the merchant code manually.
              </p>

              <label className="mb-1 block text-sm text-white/80">Enter Merchant Code/ID</label>
              <input
                value={merchantId}
                onChange={(e) => setMerchantId(e.target.value)}
                placeholder="01XXXXXXXXX or MERCHANT123"
                className="
                  w-full rounded-xl border border-white/30
                  bg-white/15 px-3 py-2 text-white placeholder-white/60
                  backdrop-blur focus:outline-none focus:ring-2 focus:ring-cyan-300/50
                "
              />

              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => merchantId.trim() && setStage("details")}
                  className="rounded-xl bg-cyan-500/90 px-4 py-2 text-white shadow hover:bg-cyan-400 disabled:opacity-50"
                  disabled={!merchantId.trim()}
                >
                  Continue
                </button>
                {!videoSupported && (
                  <button
                    onClick={() => setStage("scan")}
                    className="rounded-xl border border-white/30 bg-white/15 px-4 py-2 text-white hover:bg-white/25"
                    title="Retry camera"
                  >
                    Retry camera
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DETAILS */}
        {stage === "details" && (
          <div className="flex-1 overflow-auto p-5">
            <div className="mx-auto max-w-xl space-y-4">
              <div className="rounded-2xl border border-white/25 bg-white/15 p-4 backdrop-blur shadow-[0_10px_30px_rgba(0,0,0,0.15)] text-white">
                <div className="text-sm text-white/70">Merchant</div>
                <div className="font-semibold">{merchantId || "—"}</div>
              </div>

              <div className="space-y-3 rounded-2xl border border-white/25 bg-white/12 p-4 backdrop-blur text-white shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm text-white/80">
                    <span>Payment Amount (BDT)</span>
                    <label className="flex select-none items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={roundupEnabled}
                        onChange={(e) => setRoundupEnabled(e.target.checked)}
                      />
                      Ask to save change
                    </label>
                  </div>
                  <input
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="
                      w-full rounded-xl border border-white/30 bg-white/15
                      px-3 py-2 text-white placeholder-white/60 backdrop-blur
                      focus:outline-none focus:ring-2 focus:ring-cyan-300/50
                    "
                    placeholder="0.00"
                  />
                  {roundupEnabled && previewMiniTopUp > 0 && (
                    <div className="mt-1 text-xs text-amber-200">
                      We’ll suggest saving <b>BDT {previewMiniTopUp}</b> to your Mini-Savings jar.
                    </div>
                  )}
                </div>

                <div>
                  <div className="mb-1 text-sm text-white/80">Pay From</div>
                  <select
                    value={fromId}
                    onChange={(e) => setFromId(e.target.value)}
                    className="w-full rounded-xl border border-white/30 bg-white/15 px-3 py-2 text-white backdrop-blur focus:outline-none"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id} className="bg-slate-800 text-white">
                        {a.name}
                      </option>
                    ))}
                  </select>
                  <div className="mt-1 text-xs text-white/70">
                    Avl Bal. {fromBalance != null ? `BDT ${fromBalance.toFixed(2)}` : "—"}
                  </div>
                </div>

                <div>
                  <div className="mb-1 text-sm text-white/80">Select Authorization Mode</div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1 backdrop-blur">
                      <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" /> Card PIN
                    </span>
                  </div>
                </div>

                <div>
                  <div className="mb-1 text-sm text-white/80">Note (optional)</div>
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full rounded-xl border border-white/30 bg-white/15 px-3 py-2 text-white placeholder-white/60 backdrop-blur"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setStage("scan")}
                    className="rounded-xl border border-white/30 bg-white/15 px-4 py-2 text-white hover:bg-white/25"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmPressed}
                    className="rounded-xl bg-cyan-500/90 px-4 py-2 text-white shadow hover:bg-cyan-400 disabled:opacity-50"
                    disabled={!fromId || !merchantId || !(Number.parseFloat(amount) > 0)}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS — scrollable receipt */}
        {stage === "success" && (
          <div className="flex-1 p-5">
            <div className="mx-auto max-w-[880px] max-h-[calc(90vh-120px)] overflow-auto rounded-2xl">
              <ReceiptCard
                merchant={{
                  name: merchantId,
                  walletMask:
                    merchantId && /^\d+$/.test(merchantId)
                      ? merchantId.replace(/(\d{2})\d+(?=\d{2}$)/, "$1XXXXXXXX")
                      : undefined,
                }}
                fromAccount={accounts.find((a) => a.id === fromId)?.name ?? fromId}
                amount={Number.parseFloat(amount || "0")}
                miniTopUp={miniTopUp}
                rewardPoints={rewardPoints}
                date={new Date()}
                reference={txId ?? "—"}
                onDownload={downloadReceipt}
                onShare={shareReceipt}
                onAnother={() => {
                  setMerchantId("");
                  setAmount("");
                  setNote("bKash QR");
                  setMiniTopUp(0);
                  setRewardPoints(0);
                  setStage("scan");
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* PIN modal */}
      <PinModal open={confirming} onClose={() => setConfirming(false)} onVerify={submitPayment} />

      {/* SmartSave prompt */}
      {showRoundup && (
        <div className="fixed inset-0 z-[60] grid place-items-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowRoundup(false)} />
          <div className="
            relative z-[61] w-[min(560px,92vw)] rounded-2xl
            border border-white/25 bg-white/15 p-5 text-white
            shadow-2xl backdrop-blur-2xl ring-1 ring-white/10
          ">
            <div className="text-lg font-semibold">Save your change?</div>
            <p className="mt-2 text-sm text-white/85">
              We’ll set aside a SmartSave amount based on your payment size. You’re paying{" "}
              <b>BDT {(Number.parseFloat(amount) || 0).toFixed(2)}</b>. Save{" "}
              <b>BDT {miniTopUp}</b> to your <b>Mini-Savings</b> account?
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                className="rounded-xl border border-white/30 bg-white/15 px-4 py-2 text-white hover:bg-white/25"
                onClick={() => { setMiniTopUp(0); setShowRoundup(false); setConfirming(true); }}
              >
                Just pay {(Number.parseFloat(amount) || 0).toFixed(0)}
              </button>
              <button
                className="rounded-xl bg-amber-500 px-4 py-2 font-medium text-white shadow hover:bg-amber-600"
                onClick={() => { setShowRoundup(false); setConfirming(true); }}
              >
                Save BDT {miniTopUp} &amp; Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
