import supabase from "../config/supabaseClient.js";
import { generateItinerary } from "../services/aiService.js";
import { sendItineraryReadyEmail } from "../services/emailService.js"; // ← was missing

const PREF_MAP = {
  adventure:  "pref_adventure",
  food:       "pref_food_lover",
  culture:    "pref_history_buff",
  relaxation: "pref_romantic",
  shopping:   "pref_shopping",
  budget:     "pref_budget",
};

const PREF_THEME_LABELS = {
  food:       "Food & Flavours",
  culture:    "Culture & Heritage",
  adventure:  "Adventure & Thrills",
  relaxation: "Relax & Unwind",
  shopping:   "Shop & Explore",
  budget:     "Budget Smart",
};

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

async function fetchRankedActivities(cityId, groupPref, days = 1) {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("city_id", cityId)
    .order("rating", { ascending: false })
    .limit(60);

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const needed = Math.max(15, days * 5);

  return data
    .map(activity => {
      let score = 0;
      Object.entries(PREF_MAP).forEach(([prefKey, datasetKey]) => {
        score += (groupPref[prefKey] || 0) * (activity[datasetKey] || 1);
      });
      return { ...activity, _score: parseFloat(score.toFixed(3)) };
    })
    .sort((a, b) => b._score - a._score)
    .slice(0, needed);
}

async function triggerItineraryGeneration(tripId, trip, allPreferences) {
  const groupPref = aggregatePreferences(allPreferences);

  const { data: city, error: cityError } = await supabase
    .from("cities")
    .select("name")
    .eq("id", trip.city_id)
    .single();

  if (cityError || !city) throw new Error("City not found for this trip");

  const topThemes = Object.entries(groupPref)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([key]) => key);

  console.log(`[generateItinerary] Top themes for trip ${tripId}:`, topThemes);

  const days = Number(trip.days);

  const itineraryPromises = topThemes.map(async (focusTheme) => {
    const boostedPrefs = { ...groupPref };
    boostedPrefs[focusTheme] = Math.min(5, (boostedPrefs[focusTheme] ?? 1) * 2);

    const activities = await fetchRankedActivities(trip.city_id, boostedPrefs, days);
    if (activities.length === 0) throw new Error(`No activities found for city_id ${trip.city_id}`);

    const itineraryResult = await generateItinerary(
      activities,
      days,
      city.name,
      {
        preferences: {
          food_lover:   boostedPrefs.food,
          history_buff: boostedPrefs.culture,
          adventure:    boostedPrefs.adventure,
          nightlife:    boostedPrefs.relaxation,
          shopping:     boostedPrefs.shopping,
          budget:       boostedPrefs.budget,
        },
        groupSize: allPreferences.length,
      }
    );

    return { result: itineraryResult, focusTheme, themeLabel: PREF_THEME_LABELS[focusTheme] ?? focusTheme };
  });

  const generated = await Promise.all(itineraryPromises);

  const inserts = generated.map(({ result, themeLabel }) => ({
    trip_id:    tripId,
    city:       city.name,
    days,
    content:    { ...result, theme_label: themeLabel },
    status:     "pending_vote",
    created_at: new Date().toISOString(),
  }));

  const { data: savedItineraries, error: insertError } = await supabase
    .from("itineraries")
    .insert(inserts)
    .select();

  if (insertError) throw insertError;

  await supabase
    .from("trips")
    .update({ status: "voting" })
    .eq("id", tripId);

  console.log(`[generateItinerary] Saved ${savedItineraries.length} options for trip ${tripId}`);

  // ── Send itinerary ready email ─────────────────────────────────────────
  const { data: participantsWithEmail } = await supabase
    .from("participants")
    .select("name, email")
    .eq("trip_id", tripId);

  await sendItineraryReadyEmail({
    tripId,
    tripName:     trip.name,
    destination:  city.name,
    days,
    themes:       generated.map(g => g.themeLabel),
    participants: participantsWithEmail ?? [],
  });

  return {
    itineraries: savedItineraries,
    groupPref,
    city:        city.name,
    themes:      generated.map(g => g.themeLabel),
  };
}

// ─── POST /api/preferences/submit ────────────────────────────────────────────

export const submitPreference = async (req, res) => {
  try {
    const { trip_id, user_name, adventure, food, culture, relaxation, shopping, budget } = req.body;

    if (!trip_id || !user_name) {
      return res.status(400).json({ error: "trip_id and user_name are required" });
    }

    const prefFields = { adventure, food, culture, relaxation, shopping, budget };
    for (const [key, val] of Object.entries(prefFields)) {
      const num = Number(val);
      if (isNaN(num) || num < 0 || num > 5) {
        return res.status(400).json({ error: `${key} must be a number between 0 and 5` });
      }
    }

    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("id, city_id, days, name, status")
      .eq("id", trip_id)
      .single();

    if (tripError || !trip) return res.status(404).json({ error: "Trip not found" });

    if (trip.status === "voting" || trip.status === "confirmed") {
      return res.status(400).json({
        error: "Itinerary already generated for this trip. Voting is in progress.",
      });
    }

    const { data: participant } = await supabase
      .from("participants")
      .select("id")
      .eq("trip_id", trip_id)
      .eq("name", user_name)
      .single();

    if (!participant) {
      return res.status(403).json({
        error: `${user_name} is not a participant of this trip. Join the trip first.`,
      });
    }

    const { error: upsertError } = await supabase
      .from("preferences")
      .upsert(
        {
          trip_id,
          user_name,
          adventure:    Number(adventure),
          food:         Number(food),
          culture:      Number(culture),
          relaxation:   Number(relaxation),
          shopping:     Number(shopping),
          budget:       Number(budget),
          submitted_at: new Date().toISOString(),
        },
        { onConflict: "trip_id, user_name" }
      );

    if (upsertError) throw upsertError;

    const { count: totalParticipants } = await supabase
      .from("participants")
      .select("id", { count: "exact", head: true })
      .eq("trip_id", trip_id);

    const { count: totalPreferences } = await supabase
      .from("preferences")
      .select("id", { count: "exact", head: true })
      .eq("trip_id", trip_id);

    const allSubmitted = totalParticipants === totalPreferences;

    console.log(`[submitPreference] Trip ${trip_id}: ${totalPreferences}/${totalParticipants} preferences in`);

    if (allSubmitted) {
      console.log(`[submitPreference] All ${totalParticipants} submitted. Generating 3 itineraries...`);

      const { data: allPrefs, error: prefFetchError } = await supabase
        .from("preferences")
        .select("adventure, food, culture, relaxation, shopping, budget")
        .eq("trip_id", trip_id);

      if (prefFetchError) throw prefFetchError;

      const { itineraries, groupPref, city, themes } = await triggerItineraryGeneration(
        trip_id, trip, allPrefs
      );

      return res.status(200).json({
        success:          true,
        message:          `All preferences submitted. ${itineraries.length} itinerary options generated!`,
        allSubmitted:     true,
        totalParticipants,
        totalPreferences,
        groupPreference:  groupPref,
        city,
        themes,
        itineraryCount:   itineraries.length,
      });
    }

    return res.status(200).json({
      success:          true,
      message:          `Preference saved. Waiting for ${totalParticipants - totalPreferences} more participant(s) to submit.`,
      allSubmitted:     false,
      totalParticipants,
      totalPreferences,
      remaining:        totalParticipants - totalPreferences,
    });

  } catch (err) {
    console.error("[submitPreference]", err);
    return res.status(500).json({
      error:   "Failed to submit preferences",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// ─── GET /api/preferences/:tripId ────────────────────────────────────────────

export const getTripPreferences = async (req, res) => {
  try {
    const { tripId } = req.params;

    if (!tripId) return res.status(400).json({ error: "tripId is required" });

    const { data: preferences, error } = await supabase
      .from("preferences")
      .select("*")
      .eq("trip_id", tripId)
      .order("submitted_at", { ascending: true });

    if (error) throw error;

    const { count: totalParticipants } = await supabase
      .from("participants")
      .select("id", { count: "exact", head: true })
      .eq("trip_id", tripId);

    if (!preferences || preferences.length === 0) {
      return res.status(200).json({
        memberCount:      0,
        totalParticipants,
        preferences:      [],
        groupProfile:     null,
        allSubmitted:     false,
        remaining:        totalParticipants,
        message:          "No preferences submitted yet",
      });
    }

    const totals = Object.fromEntries(Object.keys(PREF_MAP).map(k => [k, 0]));
    preferences.forEach(p => {
      Object.keys(totals).forEach(key => { totals[key] += Number(p[key]) || 0; });
    });

    const count = preferences.length;
    const groupProfile = {};
    Object.keys(totals).forEach(key => {
      groupProfile[key] = parseFloat((totals[key] / count).toFixed(2));
    });

    const dominant = Object.entries(groupProfile)
      .sort(([, a], [, b]) => b - a)[0][0];

    return res.status(200).json({
      memberCount:        count,
      totalParticipants,
      allSubmitted:       count === totalParticipants,
      remaining:          totalParticipants - count,
      preferences,
      groupProfile,
      dominantPreference: dominant,
    });

  } catch (err) {
    console.error("[getTripPreferences]", err);
    return res.status(500).json({
      error:   "Failed to fetch preferences",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};