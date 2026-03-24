import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { getTrip, getTripPreferences } from "@/services/api";
import { Button } from "@/components/ui/button";

type TripState =
  | "loading"
  | "not_member"       // user is not a participant
  | "needs_prefs"      // joined but hasn't submitted preferences
  | "waiting"          // submitted but waiting for others
  | "itinerary_ready"  // all prefs in, itinerary generated
  | "voting"           // itinerary shown, voting in progress
  | "confirmed"        // winner chosen
  | "error";

const TripStatus = () => {
  const { tripId }  = useParams();
  const navigate    = useNavigate();
  const userName    = localStorage.getItem("planmate_user_name");

  const [state, setState]   = useState<TripState>("loading");
  const [trip, setTrip]     = useState<any>(null);
  const [prefStatus, setPrefStatus] = useState<any>(null);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!tripId) return;
    checkTripStatus();
  }, [tripId]);

  const checkTripStatus = async () => {
    try {
      setState("loading");

      // 1. Fetch trip + participants
      const tripData = await getTrip(tripId!) as any;
      setTrip(tripData);

      const participants: any[] = tripData.participants ?? [];
      const isMember = participants.some(
        (p: any) => p.name?.toLowerCase() === userName?.toLowerCase()
      );

      // 2. Not a participant at all
      if (!isMember) {
        setState("not_member");
        return;
      }

      // 3. Fetch preference status
      const prefData = await getTripPreferences(tripId!) as any;
      setPrefStatus(prefData);

      const hasSubmittedPrefs = (prefData.preferences ?? []).some(
        (p: any) => p.user_name?.toLowerCase() === userName?.toLowerCase()
      );

      // 4. Member but hasn't submitted preferences yet
      if (!hasSubmittedPrefs) {
        setState("needs_prefs");
        return;
      }

      // 5. Check trip status from backend
      const tripStatus = tripData.trip?.status;

      if (tripStatus === "confirmed") {
        setState("confirmed");
        return;
      }

      if (tripStatus === "voting") {
        setState("voting");
        return;
      }

      // 6. Still planning — check if all prefs are in
      if (prefData.allSubmitted) {
        setState("itinerary_ready");
      } else {
        setState("waiting");
      }

    } catch (err: any) {
      console.error("[TripStatus]", err);
      setError(err.message ?? "Failed to load trip");
      setState("error");
    }
  };

  // ── Render states ──────────────────────────────────────────────────────────

  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent"
        />
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-destructive text-sm">{error}</p>
        <Button variant="outline" onClick={checkTripStatus}>Try again</Button>
      </div>
    );
  }

  if (state === "not_member") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
        <div>
          <h2 className="text-xl font-display font-semibold mb-2">You're not in this trip</h2>
          <p className="text-muted-foreground text-sm">
            {userName
              ? `"${userName}" is not a participant of this trip.`
              : "We don't know who you are — join the trip first."}
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate(`/join-trip`)}>
            Join this trip
          </Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            Go home
          </Button>
        </div>
      </div>
    );
  }

  if (state === "needs_prefs") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
        <div>
          <h2 className="text-xl font-display font-semibold mb-2">
            You haven't submitted your preferences yet
          </h2>
          <p className="text-muted-foreground text-sm">
            {prefStatus?.totalParticipants - prefStatus?.memberCount} other participant(s) are waiting for you.
          </p>
        </div>
        <Button onClick={() => navigate(`/preferences/${tripId}`)}>
          Submit preferences
        </Button>
      </div>
    );
  }

  if (state === "waiting") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
        <div>
          <h2 className="text-xl font-display font-semibold mb-2">
            Waiting for the group
          </h2>
          <p className="text-muted-foreground text-sm">
            {prefStatus?.memberCount ?? 0} of {prefStatus?.totalParticipants ?? 0} preferences submitted.
            <br />
            {prefStatus?.remaining ?? 0} participant(s) still to go.
          </p>
        </div>
        <Button onClick={() => navigate(`/waiting/${tripId}`)}>
          Open waiting room
        </Button>
      </div>
    );
  }

  if (state === "itinerary_ready" || state === "voting") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
        <div>
          <h2 className="text-xl font-display font-semibold mb-2">
            Itinerary is ready!
          </h2>
          <p className="text-muted-foreground text-sm">
            All preferences are in. View the options and cast your vote.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate(`/itinerary/${tripId}`)}>
            View itinerary
          </Button>
          <Button variant="outline" onClick={() => navigate(`/vote/${tripId}`)}>
            Go to voting
          </Button>
        </div>
      </div>
    );
  }

  if (state === "confirmed") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
        <div>
          <h2 className="text-xl font-display font-semibold mb-2">
            Trip confirmed!
          </h2>
          <p className="text-muted-foreground text-sm">
            The group has voted and your itinerary is locked in.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate(`/results/${tripId}`)}>
            See final itinerary
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default TripStatus;
