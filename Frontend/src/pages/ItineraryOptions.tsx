import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Sparkles, Vote, MapPin, ChevronDown, ChevronUp, ExternalLink, Clock, IndianRupee } from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

// ── Google Maps link builder ──────────────────────────────────────────────────
function mapsUrl(activityName: string, city: string) {
  const query = encodeURIComponent(`${activityName} ${city}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

// ── Category color pill ───────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  food:      "bg-orange-50 text-orange-600",
  heritage:  "bg-purple-50 text-purple-600",
  adventure: "bg-green-50 text-green-600",
  nightlife: "bg-blue-50 text-blue-600",
  shopping:  "bg-pink-50 text-pink-600",
};

function CategoryPill({ category }: { category: string }) {
  const color = CATEGORY_COLORS[category] ?? "bg-muted text-muted-foreground";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      {category}
    </span>
  );
}

// ── Single activity row ───────────────────────────────────────────────────────
function ActivityRow({ act, city }: { act: any; city: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-2">
      {/* Summary — always visible */}
      <div className="flex items-start gap-3">
        <span className="text-xs text-muted-foreground font-mono w-12 shrink-0 pt-0.5">
          {act.start_time}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{act.name}</span>
            {act.requires_booking && (
              <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
                ⚠️ Book ahead
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {act.category && <CategoryPill category={act.category} />}
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {act.duration_mins} mins
            </span>
            {act.estimated_cost_inr_pp > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <IndianRupee className="w-3 h-3" />
                {act.estimated_cost_inr_pp.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Google Maps link */}
          <a
            href={mapsUrl(act.name, city)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Expand/collapse detail */}
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            {expanded
              ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
              : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pl-15 ml-15 space-y-2"
            style={{ paddingLeft: "3.75rem" }}
          >
            {act.narrative && (
              <p className="text-xs text-muted-foreground leading-relaxed">{act.narrative}</p>
            )}
            {act.practical_tip && (
              <p className="text-xs text-primary">💡 {act.practical_tip}</p>
            )}
            {act.must_try?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {act.must_try.map((item: string, k: number) => (
                  <span key={k} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {item}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Day card (collapsible) ────────────────────────────────────────────────────
function DayCard({ day, city, defaultOpen }: { day: any; city: string; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  const allActivities = ["morning", "afternoon", "evening"]
    .flatMap(s => day[s]?.activities ?? []);
  const totalCost = allActivities
    .reduce((sum: number, a: any) => sum + (a.estimated_cost_inr_pp ?? 0), 0);

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
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground">{allActivities.length} activities</p>
            {totalCost > 0 && <p className="text-xs text-primary">~₹{totalCost.toLocaleString()}</p>}
          </div>
          {open
            ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
        </div>
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
                    <div className="space-y-4">
                      {slotData.activities.map((act: any, j: number) => (
                        <ActivityRow key={j} act={act} city={city} />
                      ))}
                    </div>
                    {slot === "morning" && slotData.transition_to_afternoon && (
                      <p className="text-xs text-muted-foreground italic border-l-2 border-border pl-3">
                        {slotData.transition_to_afternoon}
                      </p>
                    )}
                    {slot === "afternoon" && slotData.transition_to_evening && (
                      <p className="text-xs text-muted-foreground italic border-l-2 border-border pl-3">
                        {slotData.transition_to_evening}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            {day.day_summary && (
              <div className="px-5 py-3 bg-muted/10 border-t border-border space-y-1">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {day.day_summary.theme_description}
                </p>
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

// ── Option card ───────────────────────────────────────────────────────────────
function ItineraryOptionCard({ item, index, city }: { item: any; index: number; city: string }) {
  const [expanded, setExpanded] = useState(index === 0);
  const content = item.content ?? item;
  const days: any[] = content.itinerary ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-xl border-2 border-border overflow-hidden"
    >
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full px-5 py-4 bg-primary/5 border-b border-border flex items-center justify-between hover:bg-primary/8 transition-colors"
      >
        <div className="text-left">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Option {index + 1}
          </p>
          <h2 className="font-display font-semibold text-lg mt-0.5">
            {content.theme_label ?? `Itinerary ${index + 1}`}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground">
              {content.city} · {content.days ?? days.length} days
            </p>
            {content.estimated_total_inr_pp && (
              <p className="text-xs text-primary mt-0.5">
                ~₹{content.estimated_total_inr_pp.toLocaleString()} / person
              </p>
            )}
          </div>
          {expanded
            ? <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
            : <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {days.map((day: any, i: number) => (
                <DayCard
                  key={day.day}
                  day={day}
                  city={content.city ?? city}
                  defaultOpen={i === 0}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const ItineraryOptions = () => {
  const { tripId }  = useParams();
  const navigate    = useNavigate();
  const [itinerary, setItinerary] = useState<any[]>([]);
  const [city, setCity]           = useState("");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    if (!tripId) return;
    fetchItinerary();
  }, [tripId]);

  const fetchItinerary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${API_BASE}/itinerary/${tripId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch itinerary");
      const list = Array.isArray(data) ? data : [data];
      if (list.length === 0) throw new Error("No itinerary found for this trip");
      setItinerary(list);
      setCity(list[0]?.city ?? list[0]?.content?.city ?? "");
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageShell title="Itinerary Options" subtitle="Loading your group itinerary...">
        <div className="flex flex-col items-center py-20 gap-4">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
            <Sparkles className="h-8 w-8 text-primary" />
          </motion.div>
          <p className="text-muted-foreground font-display text-sm">Fetching AI-generated itineraries...</p>
        </div>
      </PageShell>
    );
  }

  if (error || itinerary.length === 0) {
    return (
      <PageShell title="Itinerary Options" subtitle="">
        <div className="flex flex-col items-center py-16 gap-4 text-center">
          <p className="text-muted-foreground text-sm">{error ?? "No itinerary found."}</p>
          <p className="text-xs text-muted-foreground">
            Make sure all participants have submitted their preferences.
          </p>
          <div className="flex gap-3 mt-2">
            <Button variant="outline" onClick={fetchItinerary}>Try again</Button>
            <Button variant="outline" onClick={() => navigate(`/trip/${tripId}`)}>Back to trip</Button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Itinerary Options"
      subtitle={`${itinerary.length} AI-generated plans for ${city} — review then vote`}
    >
      <div className="space-y-6">
        {itinerary.map((item, i) => (
          <ItineraryOptionCard key={item.id} item={item} index={i} city={city} />
        ))}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pb-6"
        >
          <Button
            onClick={() => navigate(`/vote/${tripId}`)}
            className="w-full h-12 text-base font-display gradient-warm text-primary-foreground hover:opacity-90"
          >
            <Vote className="h-5 w-5 mr-2" />
            Proceed to Vote
          </Button>
        </motion.div>
      </div>
    </PageShell>
  );
};

export default ItineraryOptions;