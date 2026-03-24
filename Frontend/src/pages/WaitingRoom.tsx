import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getTripPreferences } from "@/services/api";

const POLL_INTERVAL_MS = 4000;

const WaitingRoom = () => {
  const { tripId } = useParams();
  const navigate   = useNavigate();

  const [status, setStatus] = useState({
    totalParticipants: 0,
    totalPreferences:  0,
    remaining:         0,
    memberNames:       [] as string[],
  });
  const [dots, setDots] = useState(".");
  const [error, setError] = useState<string | null>(null);

  // Animated dots for the waiting indicator
  useEffect(() => {
    const id = setInterval(() => {
      setDots(d => d.length >= 3 ? "." : d + ".");
    }, 600);
    return () => clearInterval(id);
  }, []);

  // Poll backend every 4 seconds
  useEffect(() => {
    if (!tripId) return;

    const poll = async () => {
      try {
        const data = await getTripPreferences(tripId) as any;

        setStatus({
          totalParticipants: data.totalParticipants ?? 0,
          totalPreferences:  data.memberCount ?? 0,
          remaining:         data.remaining ?? 0,
          memberNames:       (data.preferences ?? []).map((p: any) => p.user_name),
        });

        // Everyone submitted → navigate to itinerary
        if (data.allSubmitted) {
          navigate(`/itinerary/${tripId}`, { replace: true });
        }

      } catch (err) {
        setError("Could not reach the server. Retrying...");
      }
    };

    poll(); // run immediately on mount
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [tripId, navigate]);

  const submitted  = status.totalPreferences;
  const total      = status.totalParticipants;
  const percentage = total > 0 ? Math.round((submitted / total) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-2xl font-display font-semibold mb-2">
          Waiting for the group{dots}
        </h1>
        <p className="text-muted-foreground text-sm">
          The itinerary will be generated once everyone submits their preferences.
        </p>
      </motion.div>

      {/* Progress circle */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative mb-10"
      >
        <svg width="140" height="140" viewBox="0 0 140 140">
          {/* Background ring */}
          <circle
            cx="70" cy="70" r="58"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/20"
          />
          {/* Progress ring */}
          <circle
            cx="70" cy="70" r="58"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 58}`}
            strokeDashoffset={`${2 * Math.PI * 58 * (1 - percentage / 100)}`}
            className="text-primary transition-all duration-700"
            style={{ transform: "rotate(-90deg)", transformOrigin: "70px 70px" }}
          />
          {/* Count text */}
          <text
            x="70" y="65"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-foreground"
            style={{ fontSize: "28px", fontWeight: 600 }}
          >
            {submitted}/{total}
          </text>
          <text
            x="70" y="90"
            textAnchor="middle"
            className="fill-muted-foreground"
            style={{ fontSize: "11px" }}
          >
            submitted
          </text>
        </svg>
      </motion.div>

      {/* Participant pills */}
      {total > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-2 mb-10 max-w-sm"
        >
          {/* Show who has submitted (from preferences list) */}
          {status.memberNames.map(name => (
            <span
              key={name}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              {name}
            </span>
          ))}

          {/* Placeholder pills for members yet to submit */}
          {Array.from({ length: status.remaining }).map((_, i) => (
            <span
              key={`pending-${i}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-muted text-muted-foreground"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 inline-block" />
              Waiting{dots}
            </span>
          ))}
        </motion.div>
      )}

      {/* Status message */}
      <AnimatePresence mode="wait">
        <motion.p
          key={status.remaining}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="text-sm text-muted-foreground text-center"
        >
          {status.remaining > 0
            ? `${status.remaining} participant${status.remaining > 1 ? "s" : ""} yet to submit`
            : "All submitted! Generating itinerary…"}
        </motion.p>
      </AnimatePresence>

      {/* Trip ID copy */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-10 text-center"
      >
        <p className="text-xs text-muted-foreground mb-1">Share this trip ID with your group</p>
        <button
          onClick={() => {
            navigator.clipboard.writeText(tripId ?? "");
          }}
          className="font-mono text-sm font-medium tracking-wider px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
        >
          {tripId}
        </button>
      </motion.div>

      {/* Error banner */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-xs text-destructive"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default WaitingRoom;