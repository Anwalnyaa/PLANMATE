import supabase from "../config/supabaseClient.js";
import { generateItinerary } from "../services/aiService.js";

const PREF_MAP = {
  adventure:  "pref_adventure",
  food:       "pref_food_lover",
  culture:    "pref_history_buff",
  relaxation: "pref_romantic",
  shopping:   "pref_shopping",
  budget:     "pref_budget",
};

// Re-used from preferenceController — aggregate member preferences into one object
function aggregatePreferences(preferences) {
  const totals = Object.fromEntries(Object.keys(PREF_MAP).map(k => [k, 0]));
  preferences.forEach(p => {
    Object.keys(totals).forEach(key => { totals[key] += Number(p[key]) || 0; });
  });
  const count = preferences.length;
  const averaged = {};
  Object.keys(totals).forEach(key => {
    averaged[key] = parseFloat((totals[key] / count).toFixed(2));
  });
  return averaged;
}

// Score and rank activities from the dataset against group preferences
async function fetchRankedActivities(cityId, groupPref) {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("city_id", cityId)
    .order("rating", { ascending: false })
    .limit(60);

  if (error) throw error;
  if (!data || data.length === 0) return [];

  return data
    .map(activity => {
      let score = 0;
      Object.entries(PREF_MAP).forEach(([prefKey, datasetKey]) => {
        score += (groupPref[prefKey] || 0) * (activity[datasetKey] || 1);
      });
      return { ...activity, _score: parseFloat(score.toFixed(3)) };
    })
    .sort((a, b) => b._score - a._score)
    .slice(0, 15);
}

// POST /api/itinerary/generate/:tripId
export async function createItinerary(req, res) {
  try {
    const { tripId } = req.params;

    if (!tripId) {
      return res.status(400).json({ error: "tripId is required" });
    }

    // 1. Fetch trip (need city_id and days)
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("id, city_id, days, name")
      .eq("id", tripId)
      .single();

    if (tripError || !trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    // 2. Fetch all member preferences for this trip
    const { data: preferences, error: prefError } = await supabase
      .from("preferences")
      .select("adventure, food, culture, relaxation, shopping, budget")
      .eq("trip_id", tripId);

    if (prefError) throw prefError;

    if (!preferences || preferences.length === 0) {
      return res.status(400).json({
        error: "No preferences submitted yet. All members must submit preferences first.",
      });
    }

    // 3. Average preferences across group
    const groupPref = aggregatePreferences(preferences);

    // 4. Fetch city name
    const { data: city, error: cityError } = await supabase
      .from("cities")
      .select("name")
      .eq("id", trip.city_id)
      .single();

    if (cityError || !city) {
      return res.status(404).json({ error: "City not found for this trip" });
    }

    // 5. Fetch and rank activities from dataset
    const activities = await fetchRankedActivities(trip.city_id, groupPref);

    if (activities.length === 0) {
      return res.status(404).json({
        error: `No activities found for this city. Check that city_id ${trip.city_id} exists in the activities table.`,
      });
    }

    // 6. Call AI with real activities + trip context
    const itineraryResult = await generateItinerary(
      activities,
      trip.days,
      city.name,
      {
        preferences: {
          food_lover:   groupPref.food,
          history_buff: groupPref.culture,
          adventure:    groupPref.adventure,
          nightlife:    groupPref.relaxation,
          shopping:     groupPref.shopping,
          budget:       groupPref.budget,
        },
        groupSize: preferences.length,
      }
    );

    // 7. Save itinerary to Supabase
    const { error: insertError } = await supabase
      .from("itineraries")
      .insert({
        trip_id:    tripId,
        city:       city.name,
        days:       trip.days,
        content:    itineraryResult,
        status:     "pending_vote",
        created_at: new Date().toISOString(),
      });

    if (insertError) throw insertError;

    return res.status(201).json({
      success:         true,
      tripId,
      city:            city.name,
      days:            trip.days,
      memberCount:     preferences.length,
      activitiesUsed:  activities.length,
      groupPreference: groupPref,
      itinerary:       itineraryResult,
    });

  } catch (err) {
    console.error("[createItinerary]", err);
    return res.status(500).json({
      error:   "Failed to generate itinerary",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
}
