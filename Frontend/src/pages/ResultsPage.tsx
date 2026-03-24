import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Trophy, PartyPopper, MapPin, ExternalLink, ChevronDown, ChevronUp, Clock, IndianRupee, Home } from "lucide-react";
import { getVotingResult } from "@/services/api";
import { AnimatePresence } from "framer-motion";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

function mapsUrl(name: string, city: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${city}`)}`;
}

// ── Collapsible day card (reused from ItineraryOptions) ───────────────────────
function DayCard({ day, city }: { day: any; city: string }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-5 py-4 bg-muted/30 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="text-left">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Day {day.day}</p>
          <p className="font-display font-semibold text-base mt-0.5">{day.theme}</p>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-border">
              {["morning", "afternoon", "evening"].map(slot => {
                const slotData = day[slot];
                if (!slotData?.activities?.length) return null;
                return (
                  <div key={slot} className="px-5 py-4 space-y-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {slot} · {slotData.time_range}
                    </p>
                    {slotData.activities.map((act: any, j: number) => (
                      <div key={j} className="space-y-1">
                        <div className="flex items-start gap-3">
                          <span className="text-xs text-muted-foreground font-mono w-12 shrink-0 pt-0.5">
                            {act.start_time}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm">{act.name}</span>
                              {act.requires_booking && (
                                <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                  ⚠️ Book ahead
                                </span>
                              )}
                            </div>
                            {act.narrative && (
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                {act.narrative}
                              </p>
                            )}
                            {act.practical_tip && (
                              <p className="text-xs text-primary mt-1">💡 {act.practical_tip}</p>
                            )}
                            {act.must_try?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {act.must_try.map((item: string, k: number) => (
                                  <span key={k} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                    {item}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {act.estimated_cost_inr_pp > 0 && (
                              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                                <IndianRupee className="w-3 h-3" />
                                {act.estimated_cost_inr_pp.toLocaleString()}
                              </span>
                            )}
                            <a
                              href={mapsUrl(act.name, city)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                    {slot === "morning" && slotData.transition_to_afternoon && (
                      <p className="text-xs text-muted-foreground italic border-l-2 border-border pl-3">
                        {slotData.transition_to_afternoon}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            {day.day_summary && (
              <div className="px-5 py-3 bg-muted/10 border-t border-border space-y-1">
                <p className="text-xs text-muted-foreground">{day.day_summary.theme_description}</p>
                {day.day_summary.insider_tip && (
                  <p className="text-xs text-primary">🌟 {day.day_summary.insider_tip}</p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const ResultsPage = () => {
  const { tripId }  = useParams();
  const navigate    = useNavigate();

  const [winner, setWinner]     = useState<any>(null);
  const [votes, setVotes]       = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!tripId) return;
    fetchResult();
  }, [tripId]);

  const fetchResult = async () => {
    setLoading(true);
    try {
      const res = await getVotingResult(tripId!) as any;

      if (!res.winner) throw new Error("No winner found yet — voting may still be in progress");

      // winner.itinerary is the full Supabase row with .content = AI JSON
      const itineraryRow = res.winner.itinerary;
      const content      = itineraryRow?.content ?? itineraryRow;

      setWinner({ ...content, id: res.winner.itineraryId, votes: res.winner.votes });
      setVotes(res.results ?? []);

    } catch (err: any) {
      console.error(err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <PageShell title="Calculating Results..." subtitle="">
        <div className="flex flex-col items-center py-20 gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent"
          />
          <p className="text-muted-foreground text-sm">Computing the winning itinerary...</p>
        </div>
      </PageShell>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !winner) {
    return (
      <PageShell title="Results" subtitle="">
        <div className="flex flex-col items-center py-16 gap-4 text-center">
          <p className="text-muted-foreground text-sm">{error ?? "No results yet."}</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={fetchResult}>Try again</Button>
            <Button variant="outline" onClick={() => navigate(`/vote/${tripId}`)}>Back to voting</Button>
          </div>
        </div>
      </PageShell>
    );
  }

  const days: any[] = winner.itinerary ?? [];
  const city        = winner.city ?? "";

  return (
    <PageShell
      title="Results Are In!"
      subtitle="The group has voted — here's your winning itinerary."
    >
      <div className="space-y-6">

        {/* Winner badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-3">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <div className="flex items-center justify-center gap-2 text-primary mb-1">
            <PartyPopper className="h-4 w-4" />
            <span className="font-display font-semibold text-sm">Winning itinerary</span>
            <PartyPopper className="h-4 w-4" />
          </div>
          <h2 className="font-display font-bold text-2xl">
            {winner.theme_label ?? winner.city}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {city} · {winner.days} days
            {winner.estimated_total_inr_pp && ` · ~₹${winner.estimated_total_inr_pp.toLocaleString()} per person`}
          </p>
        </motion.div>

        {/* Vote breakdown */}
        {votes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border p-4 space-y-2"
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Vote breakdown
            </p>
            {votes.map((v: any, i: number) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Option {i + 1}</span>
                  <span className="font-medium">{v.votes} vote{v.votes !== 1 ? "s" : ""} · {v.percentage}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${v.percentage}%` }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                    className={`h-full rounded-full ${i === 0 ? "bg-primary" : "bg-muted-foreground/30"}`}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Full winning itinerary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {days.map((day: any) => (
            <DayCard key={day.day} day={day} city={city} />
          ))}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-3 pb-6"
        >
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="flex-1 h-12 font-display"
          >
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="flex-1 h-12 font-display gradient-warm text-primary-foreground hover:opacity-90"
          >
            Plan another trip
          </Button>
        </motion.div>
      </div>
    </PageShell>
  );
};

export default ResultsPage;