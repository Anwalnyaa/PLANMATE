export interface Trip {
  id: string;
  destination: string;
  duration: number;
  creator: string;
  members: string[];
}

export interface Preferences {
  tripId: string;
  userId: string;
  adventure: number;
  food: number;
  culture: number;
  relaxation: number;
  shopping: number;
  budget: number;
}

export interface Activity {
  name: string;
  time: string;
  category: string;
}

export interface ItineraryOption {
  id: string;
  title: string;
  description: string;
  activities: Activity[];
  score: number;
}

export interface Vote {
  tripId: string;
  userId: string;
  rankings: string[]; // ordered option IDs
}

export interface VoteResult {
  tripId: string;
  winner: ItineraryOption;
  scores: Record<string, number>;
}
