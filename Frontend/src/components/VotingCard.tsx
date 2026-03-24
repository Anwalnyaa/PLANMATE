import { motion } from "framer-motion";
import { GripVertical } from "lucide-react";

interface VotingCardProps {
  title: string;
  rank: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  showUp: boolean;
  showDown: boolean;
}

const VotingCard = ({ title, rank, onMoveUp, onMoveDown, showUp, showDown }: VotingCardProps) => {
  const rankColors = [
    "bg-primary text-primary-foreground",
    "bg-accent text-accent-foreground",
    "bg-muted text-muted-foreground",
  ];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card shadow-card"
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-display font-bold ${rankColors[rank] || rankColors[2]}`}>
        {rank + 1}
      </div>

      <GripVertical className="h-4 w-4 text-muted-foreground" />

      <span className="flex-1 font-display font-medium text-card-foreground">{title}</span>

      <div className="flex gap-1">
        {showUp && (
          <button
            onClick={onMoveUp}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            ↑
          </button>
        )}
        {showDown && (
          <button
            onClick={onMoveDown}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            ↓
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default VotingCard;
