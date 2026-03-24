import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Calendar, Users, ArrowRight, X, User } from "lucide-react";
import { getTrip } from "@/services/api";

type SavedSession = {
  tripId:      string;
  userName:    string;
  tripName:    string;
  destination: string;
  joinedAt:    string;
};

// ── localStorage helpers — export so CreateTrip/JoinTrip can use them ─────────

export function saveSession(session: Omit<SavedSession, "joinedAt">) {
  const existing = getSessions();
  const filtered = existing.filter(
    s => !(s.tripId === session.tripId && s.userName === session.userName)
  );
  filtered.unshift({ ...session, joinedAt: new Date().toISOString() });
  localStorage.setItem("planmate_sessions", JSON.stringify(filtered));
}

export function getSessions(): SavedSession[] {
  try {
    return JSON.parse(localStorage.getItem("planmate_sessions") || "[]");
  } catch { return []; }
}

export function removeSession(tripId: string, userName: string) {
  const filtered = getSessions().filter(
    s => !(s.tripId === tripId && s.userName === userName)
  );
  localStorage.setItem("planmate_sessions", JSON.stringify(filtered));
}

// ─────────────────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SavedSession[]>(getSessions());
  const [selected, setSelected] = useState<SavedSession | null>(null);
  const [trip, setTrip]         = useState<any>(null);
  const [loadingTrip, setLoadingTrip]     = useState(false);
  const [lookupId, setLookupId]           = useState("");
  const [lookupName, setLookupName]       = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);

  // Auto-open if only one session
  useEffect(() => {
    const s = getSessions();
    if (s.length === 1) openSession(s[0]);
  }, []);

  const openSession = async (session: SavedSession) => {
    setSelected(session);
    setLoadingTrip(true);
    // set active session for other pages
    localStorage.setItem("planmate_user_name", session.userName);
    localStorage.setItem("planmate_trip_id",   session.tripId);
    try {
      const data = await getTrip(session.tripId) as any;
      setTrip(data);
    } catch {
      toast.error("Could not load this trip");
      removeSession(session.tripId, session.userName);
      setSessions(getSessions());
      setSelected(null);
    } finally {
      setLoadingTrip(false);
    }
  };

  const handleRemove = (s: SavedSession, e: React.MouseEvent) => {
    e.stopPropagation();
    removeSession(s.tripId, s.userName);
    setSessions(getSessions());
    if (selected?.tripId === s.tripId && selected?.userName === s.userName) {
      setSelected(null);
      setTrip(null);
    }
    toast.success("Removed from your trips");
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupId.trim() || !lookupName.trim()) return;
    setLookupLoading(true);
    try {
      const data        = await getTrip(lookupId.trim()) as any;
      const participants = data.participants ?? [];
      const isMember    = participants.some(
        (p: any) => p.name?.toLowerCase() === lookupName.trim().toLowerCase()
      );
      if (!isMember) {
        toast.error(`"${lookupName}" is not a participant of this trip`);
        return;
      }
      const session = {
        tripId:      lookupId.trim(),
        userName:    lookupName.trim(),
        tripName:    data.trip.name,
        destination: data.trip.destination,
      };
      saveSession(session);
      setSessions(getSessions());
      await openSession({ ...session, joinedAt: new Date().toISOString() });
    } catch {
      toast.error("Trip not found — check the ID and try again");
    } finally {
      setLookupLoading(false);
    }
  };

  // ── Trip detail view ──────────────────────────────────────────────────────

  if (selected && loadingTrip) {
    return (
      <PageShell title="Loading..." subtitle="">
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

  if (selected && trip) {
    const tripInfo     = trip.trip;
    const participants = trip.participants ?? [];
    const prefsIn      = trip.preferencesSubmitted ?? 0;
    const allPrefsIn   = trip.allPrefsIn ?? false;

    return (
      <PageShell title="Your Trip" subtitle={`Viewing as ${selected.userName}`}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

          <button
            onClick={() => { setSelected(null); setTrip(null); }}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            ← All trips
          </button>

          <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display font-semibold text-lg">{tripInfo.name}</h2>
                <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  {tripInfo.destination}
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                tripInfo.status === "confirmed" ? "bg-green-100 text-green-700" :
                tripInfo.status === "voting"    ? "bg-blue-100 text-blue-700"  :
                                                  "bg-amber-100 text-amber-700"
              }`}>
                {tripInfo.status}
              </span>
            </div>

            <div className="flex gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {tripInfo.days} day{tripInfo.days > 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {participants.length} participant{participants.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {participants.map((p: any) => (
                <span key={p.id} className={`text-xs px-2.5 py-1 rounded-full ${
                  p.name === selected.userName
                    ? "bg-primary/10 text-primary font-medium"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {p.name}{p.is_creator ? " ★" : ""}
                </span>
              ))}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Preferences submitted</span>
                <span>{prefsIn} / {participants.length}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${participants.length > 0 ? (prefsIn / participants.length) * 100 : 0}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={() => navigate(`/trip/${selected.tripId}`)}
            className="w-full h-12 text-base font-display gradient-warm text-primary-foreground hover:opacity-90"
          >
            {tripInfo.status === "confirmed" ? "See final itinerary" :
             tripInfo.status === "voting"    ? "Go to voting"        :
             allPrefsIn                      ? "View itinerary"      :
                                              "Continue trip"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </PageShell>
    );
  }

  // ── Sessions list ─────────────────────────────────────────────────────────

  return (
    <PageShell title="My Trips" subtitle="Pick who you are to continue your trip.">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

        {sessions.length > 0 ? (
          <div className="space-y-2">
            {sessions.map((s, i) => (
              <motion.button
                key={`${s.tripId}-${s.userName}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => openSession(s)}
                className="w-full text-left rounded-xl border border-border bg-background hover:border-primary/40 hover:bg-muted/30 transition-all p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{s.userName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {s.tripName} · {s.destination}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <button
                    onClick={(e) => handleRemove(s, e)}
                    className="p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No saved trips yet.</p>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            onClick={() => navigate("/create-trip")}
            className="flex-1 h-11 gradient-warm text-primary-foreground hover:opacity-90"
          >
            Create trip
          </Button>
          <Button variant="outline" onClick={() => navigate("/join-trip")} className="flex-1 h-11">
            Join trip
          </Button>
        </div>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-3 text-xs text-muted-foreground">
              reopen from another device
            </span>
          </div>
        </div>

        <form onSubmit={handleLookup} className="space-y-3">
          <div className="space-y-2">
            <Label className="text-sm">Trip ID</Label>
            <Input
              placeholder="Paste trip ID"
              value={lookupId}
              onChange={e => setLookupId(e.target.value)}
              className="h-11 font-mono text-sm tracking-wider"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Your name in that trip</Label>
            <Input
              placeholder="e.g. Zara"
              value={lookupName}
              onChange={e => setLookupName(e.target.value)}
              className="h-11"
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            disabled={lookupLoading || !lookupId.trim() || !lookupName.trim()}
            className="w-full h-11"
          >
            {lookupLoading ? "Loading..." : "Open trip"}
          </Button>
        </form>

      </motion.div>
    </PageShell>
  );
};

export default Dashboard;