import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showBack?: boolean;
}

const PageShell = ({ title, subtitle, children, showBack = true }: PageShellProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        )}

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-muted-foreground text-lg">{subtitle}</p>
          )}
        </motion.div>

        {children}
      </div>
    </div>
  );
};

export default PageShell;
