import { Crown } from "lucide-react";

const items = [
  "100% Human Hair",
  "Free Worldwide Shipping",
  "Premium Quality",
  "30-Day Returns",
  "Visa Payments Accepted Worldwide",
  "Caribbean Born",
  "Affordable Luxury",
];

export const Marquee = () => {
  return (
    <div className="bg-espresso py-3 overflow-hidden">
      <div className="flex animate-[marquee_30s_linear_infinite]">
        {[...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-6 shrink-0">
            <Crown className="w-3.5 h-3.5 text-primary" />
            <span className="text-cream/80 text-sm font-medium tracking-wide whitespace-nowrap">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
