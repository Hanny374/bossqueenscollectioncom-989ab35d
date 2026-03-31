import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Scissors, Check } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useIsMobile } from "@/hooks/use-mobile";

interface HairDescriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const HAIR_OPTIONS = {
  density: {
    label: "Density",
    options: ["180%", "200%", "210%", "250%", "300%"],
  },
  length: {
    label: "Length",
    options: ["8\"", "10\"", "12\"", "14\"", "16\"", "18\"", "20\"", "22\"", "24\"", "26\"", "28\"", "30\"", "34\"", "36\"", "40\""],
  },
  wigCap: {
    label: "Wig Cap Size",
    options: ["Small (21\")", "Medium (22\")", "Large (23\")", "Average"],
  },
  laceType: {
    label: "Lace Type",
    options: ["13x4", "13x6", "4x4", "5x5", "360"],
  },
  color: {
    label: "Color",
    options: ["Natural Black", "1B", "613 Blonde", "Honey Blonde", "Brown", "Dark Brown", "Burgundy", "Ombre", "Highlight", "Ginger", "Red", "Piano"],
  },
};

type CategoryKey = keyof typeof HAIR_OPTIONS;

export const HairDescriptionModal = ({ open, onOpenChange, onConfirm }: HairDescriptionModalProps) => {
  const { hairDescription, setHairDescription } = useCartStore();
  const isMobile = useIsMobile();

  const parseExisting = (): Record<CategoryKey, string[]> => {
    const result: Record<CategoryKey, string[]> = { density: [], length: [], wigCap: [], laceType: [], color: [] };
    if (!hairDescription) return result;
    for (const key of Object.keys(result) as CategoryKey[]) {
      const opts = HAIR_OPTIONS[key]?.options;
      if (!opts) continue;
      for (const opt of opts) {
        if (hairDescription.includes(opt)) result[key].push(opt);
      }
    }
    return result;
  };

  const [selections, setSelections] = useState<Record<CategoryKey, string[]>>(parseExisting);

  const toggle = (category: CategoryKey, value: string) => {
    setSelections((prev) => {
      const current = prev[category] || [];
      // Single select for density, wigCap, laceType; multi for color
      if (category === "color") {
        const updated = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        return { ...prev, [category]: updated };
      }
      // Single select toggle
      return { ...prev, [category]: current.includes(value) ? [] : [value] };
    });
  };

  const totalSelected = Object.values(selections).flat().length;
  const isValid = totalSelected >= 2;

  const handleConfirm = () => {
    if (!isValid) return;
    const desc = (Object.keys(HAIR_OPTIONS) as CategoryKey[])
      .map((key) => {
        const vals = selections[key];
        return vals.length ? `${HAIR_OPTIONS[key].label}: ${vals.join(", ")}` : null;
      })
      .filter(Boolean)
      .join(" · ");
    setHairDescription(desc);
    onConfirm();
    onOpenChange(false);
  };

  const content = (
    <div className="space-y-4">
      <div className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
        <Scissors className="h-5 w-5 text-primary" />
        Customize Your Wig
      </div>
      <p className="text-sm text-muted-foreground">
        Select your preferences so we can prepare the perfect wig for you.
      </p>

      {(Object.keys(HAIR_OPTIONS) as CategoryKey[]).map((key) => (
        <div key={key} className="space-y-1.5">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
            {HAIR_OPTIONS[key].label}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {HAIR_OPTIONS[key].options.map((opt) => {
              const selected = (selections[key] || []).includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => toggle(key, opt)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1 ${
                    selected
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border/60 text-foreground hover:border-primary/50"
                  }`}
                >
                  {selected && <Check className="w-3 h-3" />}
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!isValid}
          className="flex-1 bg-gradient-gold hover:opacity-90 text-primary-foreground"
        >
          Continue ({totalSelected} selected)
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh] overflow-hidden">
          <div className="overflow-y-auto max-h-[calc(85vh-2rem)] p-4 pb-safe">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>Customize Your Wig</DialogTitle>
          <DialogDescription>Select your wig preferences</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};
