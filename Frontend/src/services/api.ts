
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(`${API_BASE}${cleanPath}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `API error: ${res.status}` }));
    throw new Error(err.error || `API error: ${res.status}`);
  }
  return res.json();
}

// ── Trips ────────────────────────────────────────────────────

export const createTrip = (data: {
  name:        string;   // e.g. "Ravi's Jaipur Trip"
  destination: string;   // e.g. "Jaipur"
  days:        number;   // was: duration
  creator:     string;
  emails?:      string[];
  creatorEmail?: string;
}) => request("/trips/create", { method: "POST", body: JSON.stringify(data) });

export const joinTrip = (data: {
  tripId: string;
  name:   string;  
  email?: string;       // was: userId
}) => request("/trips/join", { method: "POST", body: JSON.stringify(data) });

export const getTrip = (tripId: string) =>
  request(`/trips/${tripId}`);

// ── Preferences ──────────────────────────────────────────────

export const submitPreference = (data: {
  trip_id:    string;
  user_name:  string;
  adventure:  number;    // 0–5
  food:       number;
  culture:    number;
  relaxation: number;
  shopping:   number;
  budget:     number;
}) => request("/preferences/submit", { method: "POST", body: JSON.stringify(data) });

export const getTripPreferences = (tripId: string) =>
  request(`/preferences/${tripId}`);



// ── Votes ────────────────────────────────────────────────────

export const submitVote = (data: {
  tripId:       string;
  userName:     string;  // was: userId
  itineraryId:  string;  // was: rankings array
}) => request("/votes/submit", { method: "POST", body: JSON.stringify(data) });

export const getVotingResult = (tripId: string) =>
  request(`/votes/result/${tripId}`);