import { motion } from "framer-motion";
import { ItineraryOption } from "@/types/types";
import { Star, Clock } from "lucide-react";

interface ItineraryCardProps {
  option: ItineraryOption;
  index: number;
  selected?: boolean;
  onClick?: () => void;
}

const ItineraryCard = ({ option, index, selected, onClick }: ItineraryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.4 }}
      onClick={onClick}
      className={`rounded-xl border-2 p-6 cursor-pointer transition-all duration-200 shadow-card hover:shadow-elevated ${
        selected
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-display font-semibold text-card-foreground">
            {option.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
        </div>
        <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-lg text-sm font-display">
          <Star className="h-3.5 w-3.5" />
          {option.score}
        </div>
      </div>

      <div className="space-y-2">
        {option.activities.map((activity, i) => (
          <div
            key={i}
            className="flex items-center gap-3 text-sm py-2 px-3 rounded-lg bg-muted/50"
          >
            <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">{activity.time}</span>
            <span className="text-card-foreground font-medium">{activity.name}</span>
            <span className="ml-auto text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
              {activity.category}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ItineraryCard;
