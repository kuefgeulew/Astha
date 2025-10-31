// src/screens/profile/ProfileQROverlay.tsx
import React, { useEffect, useMemo, useState } from "react";
import { X, BadgeCheck } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

const USER_ID = "nazia325";
const QR_LIFETIME_MS = 2 * 60 * 1000; // 2 minutes

type Account = { id: string; name: string; number: string };

const MOCK_ACCOUNTS: Account[] = [
  { id: "savings_staff", name: "Savings (Staff)", number: "0123 4567 8901" },
  { id: "current_001", name: "Current Account", number: "2011 3344 5566" },
  { id: "micro_savings", name: "Micro Savings", number: "7788 9900 1122" },
];

export default function ProfileQROverlay({ onClose }: { onClose: () => void }) {
  const [linkedAcct, setLinkedAcct] = useState<Account>(MOCK_ACCOUNTS[0]);

  // OTP flow
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [verified, setVerified] = useState(true); // default verified for first account

  // QR lifecycle (not shown in UI)
  const [expiryAt, setExpiryAt] = useState<number | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [qrNonce, setQrNonce] = useState<string>(() =>
    Math.random().toString(36).slice(2, 10)
  );

  useEffect(() => {
    if (verified && expiryAt == null) setExpiryAt(Date.now() + QR_LIFETIME_MS);
  }, [verified, expiryAt]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const sendOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpCode(code);
    setOtpSent(true);
    setOtpInput("");
    setVerified(false);
    setExpiryAt(null);
    alert("Mock OTP sent: " + code);
  };

  const onChangeAccount = (id: string) => {
    const acct = MOCK_ACCOUNTS.find((a) => a.id === id)!;
    setLinkedAcct(acct);
    sendOtp();
  };

  const verifyOtp = () => {
    if (otpInput === otpCode) {
      setVerified(true);
      setOtpSent(false);
      setOtpCode("");
      setQrNonce(Math.random().toString(36).slice(2, 10));
      setExpiryAt(Date.now() + QR_LIFETIME_MS);
      alert("OTP Verified! Linked account updated.");
    } else {
      alert("Incorrect OTP, try again.");
    }
  };

  const msLeft = useMemo(() => {
    if (!expiryAt) return 0;
    return Math.max(0, expiryAt - now);
  }, [expiryAt, now]);
  const expired = verified && expiryAt !== null && msLeft <= 0;

  const regenerate = () => {
    if (!verified) return;
    setQrNonce(Math.random().toString(36).slice(2, 10));
    setExpiryAt(Date.now() + QR_LIFETIME_MS);
  };

  const qrValue = `astha://link/${USER_ID}?acct=${linkedAcct.id}&t=${qrNonce}`;

  return (
    <div
      className="
        fixed inset-0 z-50 flex items-center justify-center
        bg-[radial-gradient(ellipse_at_top,rgba(15,76,129,0.55),rgba(0,0,0,0.65))]
        backdrop-blur-md
      "
    >
      {/* card */}
      <div
        className="
          relative w-[392px] max-w-[94%]
          rounded-3xl p-6
          bg-white/15
          backdrop-blur-2xl
          border border-white/25
          shadow-[0_20px_80px_rgba(0,0,0,0.45)]
          ring-1 ring-white/10
        "
      >
        {/* subtle top glow */}
        <div
          className="pointer-events-none absolute -top-12 left-1/2 h-24 w-40 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "radial-gradient(ellipse, rgba(255,255,255,0.45), rgba(255,255,255,0))" }}
        />

        {/* Close */}
        <button
          onClick={onClose}
          className="
            absolute right-3 top-3 grid h-9 w-9 place-items-center
            rounded-full bg-white/20 hover:bg-white/30
            border border-white/30 text-white
            transition
          "
          aria-label="Close"
          title="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-2 flex items-center gap-2 text-white">
          <div className="text-lg font-semibold">Profile QR</div>
          <BadgeCheck className="h-5 w-5 text-cyan-300" title="Verified user" />
        </div>

        {/* Permanent ID */}
        <div className="mb-1 text-[12px] text-white/70">Permanent ID</div>
        <div className="mb-3 font-mono text-[18px] font-bold text-white">{USER_ID}</div>

        {/* QR block */}
        <div className="mb-4">
          {verified ? (
            <div
              className="
                relative mx-auto w-fit rounded-2xl
                border border-white/30
                bg-white/50 backdrop-blur-md
                p-4 shadow-lg
              "
            >
              <div className={expired ? "blur-[2px] opacity-60" : ""}>
                <QRCodeCanvas value={qrValue} size={192} includeMargin={true} />
              </div>

              {/* tiny badge at corner */}
              <div
                className="
                  absolute -right-2 -top-2 rounded-full
                  bg-emerald-500/90 px-2 py-[2px] text-[10px] font-semibold text-white
                  shadow
                "
              >
                Active
              </div>
            </div>
          ) : (
            <div
              className="
                mx-auto w-fit rounded-2xl border border-dashed border-white/30
                bg-white/10 p-6 text-sm text-white/80
              "
            >
              Verify OTP to generate QR for the selected account.
            </div>
          )}
        </div>

        {/* Linked Account */}
        <label className="mb-1 block text-[12px] text-white/80">Linked Account</label>
        <div className="mb-3 relative">
          <select
            value={linkedAcct.id}
            onChange={(e) => onChangeAccount(e.target.value)}
            className="
              w-full appearance-none rounded-xl
              border border-white/30 bg-white/15 text-white
              backdrop-blur-md px-3 py-2 pr-10
              placeholder-white/70
              focus:outline-none focus:ring-2 focus:ring-cyan-300/50
            "
          >
            {MOCK_ACCOUNTS.map((a) => (
              <option key={a.id} value={a.id} className="bg-slate-800 text-white">
                {a.name} — {a.number}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/70">
            ▾
          </div>
        </div>

        {/* OTP area */}
        {otpSent && !verified && (
          <div className="mb-3">
            <label className="mb-1 block text-[12px] text-white/80">Enter OTP</label>
            <input
              type="text"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              className="
                mb-2 w-full rounded-xl border border-white/30 bg-white/15
                px-3 py-2 text-white placeholder-white/60 backdrop-blur-md
                focus:outline-none focus:ring-2 focus:ring-cyan-300/50
              "
              placeholder="6-digit OTP"
            />
            <button
              onClick={verifyOtp}
              className="
                w-full rounded-xl bg-cyan-500/90 py-2 text-white
                hover:bg-cyan-400 transition shadow
              "
            >
              Verify
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 flex items-center justify-between">
          <div className="text-[11px] text-white/80">
            Public link:{" "}
            <span className="font-mono text-cyan-200">astha://link/{USER_ID}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                const link = `astha://link/${USER_ID}`;
                navigator.clipboard.writeText(link);
                alert("Copied: " + link);
              }}
              className="
                rounded-xl border border-white/30 bg-white/15
                px-3 py-1.5 text-sm text-white hover:bg-white/25
                backdrop-blur-md
              "
              title="Copy public link"
            >
              Copy link
            </button>

            <button
              onClick={regenerate}
              disabled={!verified}
              className={`
                rounded-xl px-3 py-1.5 text-sm text-white shadow
                ${verified ? "bg-indigo-600/90 hover:bg-indigo-500" : "bg-white/25 cursor-not-allowed"}
                border border-white/30 backdrop-blur-md
              `}
              title={verified ? "Generate a fresh QR" : "Verify OTP first"}
            >
              Regenerate QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
