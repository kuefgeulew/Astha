// src/components/TopBar.jsx
import { Menu, Search, Power, MoreVertical, ChevronDown } from "lucide-react";
import GlassPanel from "./GlassPanel";

export default function TopBar({ onBnClick }) {
  return (
    <GlassPanel className="mx-4 mt-2 rounded-2xl px-4 py-2 text-white/95">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="hover:opacity-90">
            <Menu size={22} />
          </button>
          <div className="font-medium flex items-center gap-1">
            <span>Offers</span>
            <ChevronDown size={16} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* BN triggers promo */}
          <button onClick={onBnClick} className="text-sm font-semibold hover:opacity-90">
            BN
          </button>
          <Search size={20} />
          <Power size={20} />
          <MoreVertical size={20} />
        </div>
      </div>
    </GlassPanel>
  );
}
