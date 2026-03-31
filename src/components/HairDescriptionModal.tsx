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
  texture: {
    label: "Hair Texture",
    options: ["Straight", "Wavy", "Curly", "Coily/Kinky"],
  },
  color: {
    label: "Natural Hair Color",
    options: ["Black", "Dark Brown", "Light Brown", "Blonde", "Red/Auburn", "Gray"],
  },
  length: {
    label: "Current Length",
    options: ["Short (0–6\")", "Medium (8–14\")", "Long (16–22\")", "Extra Long (24\"+)"],
  },
  concern: {
    label: "Main Concern",
    options: ["Volume", "Edges/Hairline", "Color Match", "Comfort/Fit", "Heat Protection", "First-Time Buyer"],
  },
};

type CategoryKey = keyof typeof HAIR_OPTIONS;

export const HairDescriptionModal = ({ open, onOpenChange, onConfirm }: HairDescriptionModalProps) => {
  const { hairDescription, setHairDescription } = useCartStore();
  const isMobile = useIsMobile();

  const parseExisting = (): Record<CategoryKey, string[]> => {
    const result: Record<CategoryKey, string[]> = { texture: [], color: [], length: [], concern: [] };
    if (!hairDescription) return result;
    for (const key of Object.keys(HAIR_OPTIONS) as CategoryKey[]) {
      for (const opt of HAIR_OPTIONS[key].options) {
        if (hairDescription.includes(opt)) result[key].push(opt);
      }
    }
    return result;
  };

  const [selections, setSelections] = useState<Record<CategoryKey, string[]>>(parseExisting);

  const toggle = (category: CategoryKey, value: string) => {
    setSelections((prev) => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
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
        Describe Your Hair
      </div>
      <p className="text-sm text-muted-foreground">
        Select options that best describe your hair so we can ensure the perfect match.
      </p>

      {(Object.keys(HAIR_OPTIONS) as CategoryKey[]).map((key) => (
        <div key={key} className="space-y-2">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
            {HAIR_OPTIONS[key].label}
          </span>
          <div className="flex flex-wrap gap-2">
            {HAIR_OPTIONS[key].options.map((opt) => {
              const selected = selections[key].includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => toggle(key, opt)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="sr-only">
          <DialogTitle>Describe Your Hair</DialogTitle>
          <DialogDescription>Select options that describe your hair</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};
