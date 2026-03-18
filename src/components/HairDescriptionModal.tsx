import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Scissors, Sparkles } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";

interface HairDescriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const HairDescriptionModal = ({ open, onOpenChange, onConfirm }: HairDescriptionModalProps) => {
  const { hairDescription, setHairDescription } = useCartStore();
  const [localDescription, setLocalDescription] = useState(hairDescription);
  const isValid = localDescription.trim().length >= 10;

  const handleConfirm = () => {
    if (isValid) {
      setHairDescription(localDescription.trim());
      onConfirm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <Scissors className="h-5 w-5 text-primary" />
            Tell Us About Your Hair
          </DialogTitle>
          <DialogDescription>
            Help us ensure you get the perfect match! Please describe your hair before adding items to your cart.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="hair-desc" className="text-sm font-medium">
              Your Hair Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="hair-desc"
              placeholder="Describe your current hair texture (straight, wavy, curly), natural color, current length, and any specific styling preferences or concerns you have..."
              value={localDescription}
              onChange={(e) => setLocalDescription(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            <div className="flex justify-between text-xs">
              <span className={localDescription.trim().length < 10 ? "text-muted-foreground" : "text-primary"}>
                {localDescription.trim().length}/10 minimum characters
              </span>
              {localDescription.trim().length > 0 && localDescription.trim().length < 10 && (
                <span className="text-destructive">Please provide more detail</span>
              )}
            </div>
          </div>

          <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Tips for a great description:
            </div>
            <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
              <li>Your natural hair texture and porosity</li>
              <li>Current hair color and any treatments</li>
              <li>Desired styling (bone straight, curly, etc.)</li>
              <li>Any allergies or sensitivities</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!isValid}
              className="flex-1 bg-gradient-gold hover:opacity-90 text-primary-foreground"
            >
              Continue to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
