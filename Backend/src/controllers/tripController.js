import supabase from "../config/supabaseClient.js";
import { sendTripInviteEmail } from "../services/emailService.js";

// ─── POST /api/trips/create ───────────────────────────────────────────────────

export const createTrip = async (req, res) => {
  try {
    const { name, destination, days, creator, emails ,creatorEmail} = req.body; // ← emails destructured here

    

    if (!name || !destination || !days || !creator) {
      return res.status(400).json({
        error: "name, destination, days, and creator are all required",
      });
    }

    if (!Number.isInteger(Number(days)) || days < 1 || days > 14) {
      return res.status(400).json({ error: "days must be between 1 and 14" });
    }

    const { data: city, error: cityError } = await supabase
      .from("cities")
      .select("id, name, state")
      .ilike("name", destination.trim())
      .single();

    if (cityError || !city) {
      return res.status(404).json({
        error: `"${destination}" is not in our dataset. Available cities: Delhi, Mumbai, Jaipur, Agra, Goa, Udaipur, Varanasi, Bangalore, Chennai, Kolkata, Hyderabad, Mysore, Rishikesh, Amritsar, Jodhpur`,
      });
    }

    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .insert([{
        name,
        destination: city.name,
        city_id:     city.id,
        days:        Number(days),
        creator,
        status:      "planning",
      }])
      .select()
      .single();

    if (tripError) throw tripError;

    await supabase
      .from("participants")
      .insert([{ trip_id: trip.id, name: creator, is_creator: true , email:   creatorEmail ?? null,   }]);

    // ── Send invite email BEFORE return ───────────────────────────────────
    await sendTripInviteEmail({
      tripId:      trip.id,
      tripName:    trip.name,
      destination: trip.destination,
      days:        trip.days,
      creator,
      creatorEmail ,
      emails:      emails ?? [],
    });

    return res.status(201).json({
      success: true,
      message: "Trip created successfully",
      tripId:  trip.id,
      trip: {
        ...trip,
        city:  city.name,
        state: city.state,
      },
    });

  } catch (err) {
    console.error("[createTrip]", err);
    return res.status(500).json({ error: "Failed to create trip" });
  }
};

// ─── POST /api/trips/join ─────────────────────────────────────────────────────

export const joinTrip = async (req, res) => {
  try {
    const { tripId, name , email } = req.body;

    if (!tripId || !name) {
      return res.status(400).json({ error: "tripId and name are required" });
    }

    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("id, name, status, days, city_id, destination")
      .eq("id", tripId)
      .single();

    if (tripError || !trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    if (trip.status !== "planning") {
      return res.status(400).json({
        error: `Cannot join trip — it is currently in '${trip.status}' status`,
      });
    }

    const { data: existing } = await supabase
      .from("participants")
      .select("id")
      .eq("trip_id", tripId)
      .eq("name", name)
      .single();

    if (existing) {
      return res.status(409).json({ error: "A participant with this name already joined" });
    }

    const { data: participant, error: joinError } = await supabase
      .from("participants")
      .insert([{ trip_id: tripId, name, is_creator: false , email:      email ?? null,}])
      .select()
      .single();

    if (joinError) throw joinError;

    return res.status(200).json({
      success:     true,
      message:     `${name} joined trip "${trip.name}" successfully`,
      participant,
      trip: {                     // ← needed by JoinTrip.tsx saveSession
        name:        trip.name,
        destination: trip.destination,
      },
    });

  } catch (err) {
    console.error("[joinTrip]", err);
    return res.status(500).json({ error: "Failed to join trip" });
  }
};

// ─── GET /api/trips/:id ───────────────────────────────────────────────────────

export const getTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("*")
      .eq("id", id)
      .single();

    if (tripError || !trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    const { data: participants } = await supabase
      .from("participants")
      .select("id, name, is_creator, joined_at")
      .eq("trip_id", id)
      .order("joined_at", { ascending: true });

    const { data: city } = await supabase
      .from("cities")
      .select("name, state, region")
      .eq("id", trip.city_id)
      .single();

    const { count: prefCount } = await supabase
      .from("preferences")
      .select("id", { count: "exact", head: true })
      .eq("trip_id", id);

    return res.status(200).json({
      trip:                 { ...trip, city },
      participants:         participants || [],
      memberCount:          participants?.length || 0,
      preferencesSubmitted: prefCount || 0,
      allPrefsIn:           prefCount === participants?.length,
    });

  } catch (err) {
    console.error("[getTrip]", err);
    return res.status(500).json({ error: "Failed to fetch trip" });
  }
};