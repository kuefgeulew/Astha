import React from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onVerify: (pin: string) => void;
};

export default function PinModal({ open, onClose, onVerify }: Props) {
  const [pin, setPin] = React.useState("");

  React.useEffect(() => {
    if (!open) setPin("");
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-[71] w-[min(420px,92vw)] rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-black/10">
        <h3 className="text-lg font-semibold text-slate-800">Enter PIN</h3>

        <input
          type="password"               // ← mask digits as ****
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="••••"
          className="mt-3 w-full rounded-xl border border-neutral-300 px-3 py-2 text-center text-2xl tracking-widest"
        />

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border px-4 py-2">
            Cancel
          </button>
          <button
            onClick={() => pin && onVerify(pin)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            disabled={!pin}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
