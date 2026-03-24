import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Compass, UtensilsCrossed, Landmark, Palmtree, ShoppingBag, Wallet } from "lucide-react";

const CATEGORIES = [
  { key: "adventure", label: "Adventure", icon: Compass },
  { key: "food", label: "Food", icon: UtensilsCrossed },
  { key: "culture", label: "Culture", icon: Landmark },
  { key: "relaxation", label: "Relaxation", icon: Palmtree },
  { key: "shopping", label: "Shopping", icon: ShoppingBag },
  { key: "budget", label: "Budget", icon: Wallet },
];

interface PreferenceFormProps {
  onSubmit: (prefs: Record<string, number>) => void;
  loading?: boolean;
}

const PreferenceForm = ({ onSubmit, loading }: PreferenceFormProps) => {
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(CATEGORIES.map((c) => [c.key, 2.5]))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {CATEGORIES.map((cat, i) => {
        const Icon = cat.icon;
        return (
          <motion.div
            key={cat.key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Icon className="h-4 w-4 text-primary" />
                {cat.label}
              </Label>
              <span className="text-sm font-display text-muted-foreground">
                {values[cat.key]}%
              </span>
            </div>
            <Slider
              value={[values[cat.key]]}
              onValueChange={([v]) => setValues((prev) => ({ ...prev, [cat.key]: v }))}
              max={5}
              step={0.1}
              className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
            />
          </motion.div>
        );
      })}

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 text-base font-display gradient-warm text-primary-foreground hover:opacity-90 transition-opacity"
      >
        {loading ? "Submitting..." : "Submit Preferences"}
      </Button>
    </motion.form>
  );
};

export default PreferenceForm;
