import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PageShell from "@/components/PageShell";
import TripForm from "@/components/TripForm";
import { createTrip } from "@/services/api";
import { saveSession } from "./Dashboard";

const CreateTrip = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: { destination: string; duration: number; creator: string ; emails: string[] ; creatorEmail: string; }) => {
    setLoading(true);
    try {
      const tripName = `${data.creator}'s ${data.destination} Trip`;

      const result = await createTrip({
        name:        tripName,
        destination: data.destination,
        days:        data.duration,
        creator:     data.creator,
        emails :     data.emails,
        creatorEmail: data.creatorEmail,
      }) as any;

      const tripId = result.tripId;
      if (!tripId) throw new Error("No trip ID returned");

      saveSession({
        tripId,
        userName:    data.creator,
        tripName,              // ✅ use the local variable, not data.name
        destination: data.destination,
      });

      toast.success("Trip created! Share the ID with friends.");
      navigate(`/trip/${tripId}`);  // ✅ only one navigate

    } catch (err) {
      console.error(err);
      toast.error("Failed to create trip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell title="Create a Trip" subtitle="Set up your trip and invite friends to plan together.">
      <TripForm onSubmit={handleSubmit} loading={loading} />
    </PageShell>
  );
};

export default CreateTrip;