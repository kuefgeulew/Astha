import { Coffee, ShoppingBag, Film, Award, Target } from "lucide-react";

export const OFFERS = [
  {
    id: "coffee",
    title: "10% OFF on Coffee",
    body: "Sip & save at Gloria Jean’s, North End & Crimson Cup when you pay with Astha QR.",
    badge: "Freshly brewed deal • Limited time",
    Icon: Coffee,
  },
  {
    id: "aarong",
    title: "Aarong Weekend • 15% OFF",
    body: "Flat 5% discount at Aarong outlets Friday–Saturday when you scan QR with Astha Pay.",
    badge: "Weekend special",
    Icon: ShoppingBag,
  },
  {
    id: "cineplex",
    title: "Star Cineplex Saver",
    body: "5% off on movie tickets booked via Astha QR",
    badge: "Lights, camera, savings",
    Icon: Film,
  },
  {
    id: "daraz",
    title: "Daraz Fest Bonus",
    body: "Get Tk 200 cashback on Daraz orders above Tk 1,500 when paid with BRAC Bank cards",
    badge: "Limited-time cashback",
    Icon: ShoppingBag,
  },
  {
    id: "xp",
    title: "Astha XP Challenge",
    body: "Complete 5 QR payments in a week and unlock 100 XP + 1 Lucky Draw ticket for a Galaxy Buds giveaway.",
    badge: "Level up with XP",
    Icon: Award,
  },
  {
    id: "goal",
    title: "Savings Goal Bonus",
    body: "Complete Five of your savings goal and earn Tk 250 Star Tech voucher.",
    badge: "Hit your target, get rewards",
    Icon: Target,
  },
];

export const pickRandomOfferIndex = (len) => Math.floor(Math.random() * len);
