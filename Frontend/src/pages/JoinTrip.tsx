import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import PageShell from "@/components/PageShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Hash, User ,Mail} from "lucide-react";
import { joinTrip } from "@/services/api";
import { saveSession } from "./Dashboard";

const JoinTrip = () => {
  const navigate = useNavigate();
  const [tripId, setTripId] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!tripId || !name) return;
  setLoading(true);
  try {
    const result = await joinTrip({ tripId, name , email}) as any;

   saveSession({
      tripId,
      userName:    name,
      tripName:    result.trip?.name        ?? `Trip ${tripId}`,   // fallback
      destination: result.trip?.destination ?? "",
    });
    toast.success("Joined trip!")
    navigate(`/trip/${tripId}`);    


  } catch (error) {
    console.error(error);
    toast.error("Failed to join trip. Check the trip ID and try again."); // was: silently succeeding
  } finally {
    setLoading(false);
  }
};

  return (
    <PageShell title="Join a Trip" subtitle="Enter the trip ID shared by your friend.">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="space-y-2">
          <Label htmlFor="tripId" className="flex items-center gap-2 text-sm font-medium">
            <Hash className="h-4 w-4 text-primary" />
            Trip ID
          </Label>
          <Input
            id="tripId"
            placeholder="e.g. ABC123"
            value={tripId}
            onChange={(e) => setTripId(e.target.value.toUpperCase())}
            className="h-12 text-base font-mono tracking-wider"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
            <User className="h-4 w-4 text-primary" />
            Your Name
          </Label>
          <Input
            id="name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 text-base"
            required
          />
        </div>
        <div className="space-y-2">
  <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
    <Mail className="h-4 w-4 text-primary" />
    Your Email
    <span className="text-muted-foreground font-normal">(for notifications)</span>
  </Label>
  <Input
    id="email"
    type="email"
    placeholder="your@email.com"
    value={email}
    onChange={e => setEmail(e.target.value)}
    className="h-12 text-base"
  />
</div>

        

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 text-base font-display gradient-warm text-primary-foreground hover:opacity-90 transition-opacity"
        >
          {loading ? "Joining..." : "Join Trip"}
        </Button>
      </motion.form>
    </PageShell>
  );
};

export default JoinTrip;
