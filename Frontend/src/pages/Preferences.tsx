import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PageShell from "@/components/PageShell";
import PreferenceForm from "@/components/PreferenceForm";
import { submitPreference } from "@/services/api";

type PreferencesData = {
  adventure:  number;
  food:       number;
  culture:    number;
  relaxation: number;
  shopping:   number;
  budget:     number;
};

const Preferences = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Name was saved to localStorage when user created or joined the trip
  const userName = localStorage.getItem("planmate_user_name");

  const handleSubmit = async (prefs: PreferencesData) => {
    if (!tripId) {
      toast.error("Invalid trip ID");
      return;
    }

    if (!userName) {
      toast.error("We don't know your name — please create or join a trip first");
      navigate("/");
      return;
    }

    setLoading(true);
    try {
      const result = await submitPreference({
        trip_id:   tripId,
        user_name: userName,
        ...prefs,
      }) as any;

      // ── NEW: check if everyone has submitted ──
      if (result.allSubmitted) {
        toast.success("All preferences in! Generating your itinerary...");
        navigate(`/itinerary/${tripId}`);
      } else {
        toast.success(result.message); // "Waiting for 2 more participant(s)..."
        navigate(`/waiting/${tripId}`);
      }

    } catch (error) {
      console.error(error);
      toast.error("Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      title="Your Preferences"
      subtitle={`Trip ${tripId} — Tell us what matters most to you.`}
    >
      <PreferenceForm onSubmit={handleSubmit} loading={loading} />
    </PageShell>
  );
};

export default Preferences;
