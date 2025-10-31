import { Share2 } from "lucide-react";

const fmtBDT = (n = 0) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(Math.max(0, Number(n)))
    .replace("BDT", "")
    .trim();

export default function AccountCard({
  title = "SAVINGS ACCOUNT STAFF",
  accountNo = "1074165690001",
  balance = 0,
}) {
  return (
    <div
      className="
        relative mx-auto w-[88%] max-w-[320px]
        rounded-2xl px-4 pb-3 pt-4
        bg-white
        border border-gray-200
        shadow-[0_8px_24px_rgba(0,0,0,0.12)]
        transition
      "
    >
      {/* Active ribbon */}
      <div className="absolute -right-2 top-6 rotate-45">
        <div className="bg-emerald-500 px-7 py-[2px] text-[9px] tracking-widest text-white shadow-lg">
          Active
        </div>
      </div>

      {/* Account info */}
      <div>
        <div className="text-[14px] font-semibold tracking-wide text-slate-900">
          {title}
        </div>
        <div className="mt-1 text-[11px] text-slate-500">{accountNo}</div>
      </div>

      {/* Balance */}
      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="text-[12px] text-slate-500">Available Balance</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">
            {fmtBDT(balance)}{" "}
            <span className="ml-1 align-middle text-sm font-medium text-slate-500">
              BDT
            </span>
          </div>
        </div>

        <button
          aria-label="Share"
          className="
            grid h-9 w-9 place-items-center rounded-full
            border border-slate-200 text-slate-600
            hover:bg-slate-50 hover:shadow
            transition
          "
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      {/* Bank label */}
      <div className="mt-5 flex items-center gap-2">
        <div className="text-[12px] font-black tracking-widest text-slate-800">
          BRAC BANK
        </div>
      </div>
    </div>
  );
}
