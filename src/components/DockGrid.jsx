// src/components/DockGrid.jsx
export function DockGrid() {
  return (
    <div
      className="
        grid grid-cols-4 grid-rows-2
        px-3 py-4                     /* ⬇️ narrower padding to push icons outward */
        gap-x-8 gap-y-5               /* ⬆️ slightly wider horizontal gap for balance */
        justify-between               /* ✅ evenly stretch icons from left to right */
        place-items-center
        scale-[0.9]                   /* keeps proportions consistent */
      "
    >
      {DOCK_ITEMS.map((it) => (
        <DockItem key={it.label} label={it.label} imgSrc={it.imgSrc} />
      ))}
    </div>
  );
}

function DockItem({ label, imgSrc }) {
  return (
    <div className="flex flex-col items-center justify-center text-white">
      <div
        className="
          rounded-2xl
          backdrop-blur-md bg-white/10
          border border-white/20
          shadow-[0_4px_16px_rgba(0,0,0,0.12)]
          transition
          hover:bg-white/15 hover:shadow-[0_6px_20px_rgba(0,0,0,0.16)]
          flex items-center justify-center
        "
        style={{ width: 60, height: 60 }} // same size, no visual change
      >
        <img
          src={imgSrc}
          alt={label}
          style={{
            width: 36,
            height: 36,
            objectFit: "contain",
            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))",
          }}
        />
      </div>

      <div
        className="mt-2 leading-tight text-white/95 font-light tracking-tight"
        style={{ fontSize: 11 }}
      >
        {label}
      </div>
    </div>
  );
}

const DOCK_ITEMS = [
  { label: "bKash Pay", imgSrc: "/brand/bkash.svg" },
  { label: "Mobile Top-up", imgSrc: "/brand/mobile.svg" },
  { label: "Payment", imgSrc: "/brand/payment.svg" },
  { label: "Open FD/DPS", imgSrc: "/brand/bars.svg" },
  { label: "Sheba", imgSrc: "/brand/sheba.svg" },
  { label: "Transfer", imgSrc: "/brand/transfer.svg" },
  { label: "Other Apps", imgSrc: "/brand/apps.svg" },
  { label: "Astha Lifestyle", imgSrc: "/brand/astha-lifestyle.svg" },
];
