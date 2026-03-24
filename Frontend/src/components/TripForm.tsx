import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, User, Mail } from "lucide-react";

interface TripFormProps {
  onSubmit: (data: {
    destination: string;
    duration:    number;
    creator:     string;
    emails:      string[];
    creatorEmail: string;    // ← added
  }) => void;
  loading?: boolean;
}

const TripForm = ({ onSubmit, loading }: TripFormProps) => {
  const [destination, setDestination] = useState("");
  const [duration,    setDuration]    = useState(3);
  const [creator,     setCreator]     = useState("");
  const [emails,      setEmails]      = useState("");
  const [creatorEmail, setCreatorEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !creator) return;

    // Parse emails here — form is responsible for cleaning the input
    const emailList = emails
      .split(",")
      .map(e => e.trim())
      .filter(e => e.includes("@"));

  
    onSubmit({ destination, duration, creator, emails: emailList, creatorEmail });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="destination" className="flex items-center gap-2 text-sm font-medium">
          <MapPin className="h-4 w-4 text-primary" />
          Destination
        </Label>
        <Input
          id="destination"
          placeholder="Where are you headed?"
          value={destination}
          onChange={e => setDestination(e.target.value)}
          className="h-12 text-base"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration" className="flex items-center gap-2 text-sm font-medium">
          <Clock className="h-4 w-4 text-primary" />
          Duration (days)
        </Label>
        <Input
          id="duration"
          type="number"
          min={1}
          max={14}
          value={duration}
          onChange={e => setDuration(Number(e.target.value))}
          className="h-12 text-base"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="creator" className="flex items-center gap-2 text-sm font-medium">
          <User className="h-4 w-4 text-primary" />
          Your Name
        </Label>
        <Input
          id="creator"
          placeholder="Enter your name"
          value={creator}
          onChange={e => setCreator(e.target.value)}
          className="h-12 text-base"
          required
        />
      </div>

      <div className="space-y-2">
  <Label htmlFor="creatorEmail" className="flex items-center gap-2 text-sm font-medium">
    <Mail className="h-4 w-4 text-primary" />
    Your Email
    <span className="text-muted-foreground font-normal">(for notifications)</span>
  </Label>
  <Input
    id="creatorEmail"
    type="email"
    placeholder="your@email.com"
    value={creatorEmail}
    onChange={e => setCreatorEmail(e.target.value)}
    className="h-12 text-base"
  />
</div>

      {/* Optional — invite friends by email */}
      <div className="space-y-2">
        <Label htmlFor="emails" className="flex items-center gap-2 text-sm font-medium">
          <Mail className="h-4 w-4 text-primary" />
          Invite friends by email
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="emails"
          placeholder="friend1@email.com, friend2@email.com"
          value={emails}
          onChange={e => setEmails(e.target.value)}
          className="h-12 text-base"
        />
        <p className="text-xs text-muted-foreground">
          Separate multiple emails with commas
        </p>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 text-base font-display gradient-warm text-primary-foreground hover:opacity-90 transition-opacity"
      >
        {loading ? "Creating..." : "Create Trip"}
      </Button>
    </motion.form>
  );
};

export default TripForm;