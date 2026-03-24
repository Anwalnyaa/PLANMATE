import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { submitVote } from "@/services/api";

const VotingPage = () => {
  const { tripId }  = useParams();
  const navigate    = useNavigate();
  const userName    = localStorage.getItem("planmate_user_name") ?? "";

  const [itineraries, setItineraries] = useState<any[]>([]);
  const [selected, setSelected]       = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);
  const [fetching, setFetching]       = useState(true);

  // ── Load real itineraries for this trip ──────────────────────────────────
  useEffect(() => {
    if (!tripId) return;

    const load = async () => {
      try {
        const res = await fetch(
          `${(import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "")}/itinerary/${tripId}`
        );
        const data = await res.json();
        // backend returns array or single itinerary
        const list = Array.isArray(data) ? data : data.itinerary ? [data] : [];
        setItineraries(list);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load itineraries");
      } finally {
        setFetching(false);
      }
    };

    load();
  }, [tripId]);

  // ── Submit single-choice vote ─────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!tripId) { toast.error("Invalid trip"); return; }
    if (!selected) { toast.error("Please select an itinerary first"); return; }
    if (!userName) { toast.error("We don't know your name"); return; }

    setLoading(true);
    try {
      await submitVote({
        tripId,
        userName,
        itineraryId: selected,   // single ID — matches backend exactly
      });

      toast.success("Vote submitted!");
      navigate(`/results/${tripId}`);

    } catch (error) {
      console.error(error);
      toast.error("Failed to submit vote");
    } finally {
      setLoading(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (fetching) {
    return (
      <PageShell title="Cast Your Vote" subtitle="Loading itinerary options...">
        <div className="flex justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent"
          />
        </div>
      </PageShell>
    );
  }

  // ── No itineraries found ──────────────────────────────────────────────────
  if (itineraries.length === 0) {
    return (
      <PageShell title="Cast Your Vote" subtitle="No itineraries found for this trip.">
        <p className="text-muted-foreground text-sm text-center py-8">
          The itinerary hasn't been generated yet. Make sure all participants have submitted their preferences.
        </p>
        <Button variant="outline" onClick={() => navigate(`/trip/${tripId}`)}>
          Back to trip
        </Button>
      </PageShell>
    );
  }

  // ── Main vote UI ──────────────────────────────────────────────────────────
  return (
    <PageShell
      title="Cast Your Vote"
      subtitle="Pick the itinerary you'd most like to go on."
    >
      <div className="space-y-4">
        {itineraries.map((itn, i) => {
          const isSelected = selected === itn.id;
          const content    = itn.content ?? itn;
          const theme      = content?.itinerary?.[0]?.theme ?? `Option ${i + 1}`;

          return (
            <motion.button
              key={itn.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setSelected(itn.id)}
              className={`w-full text-left rounded-xl border-2 p-5 transition-all ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 bg-background"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-display font-semibold text-base mb-1">
                    {content?.city ?? "Trip"} — {theme}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {content?.days ?? itn.days} days ·{" "}
                    {content?.itinerary?.length ?? 0} day plans ·{" "}
                    Est. ₹{content?.estimated_total_inr_pp?.toLocaleString() ?? "—"} per person
                  </p>

                  {/* Day themes preview */}
                  {content?.itinerary?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {content.itinerary.map((day: any) => (
                        <span
                          key={day.day}
                          className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                        >
                          Day {day.day}: {day.theme}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selection indicator */}
                <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        <Button
          onClick={handleSubmit}
          disabled={loading || !selected}
          className="w-full h-12 text-base font-display gradient-warm text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          <Check className="h-5 w-5 mr-2" />
          {loading ? "Submitting..." : "Submit Vote"}
        </Button>
      </motion.div>
    </PageShell>
  );
};

export default VotingPage;