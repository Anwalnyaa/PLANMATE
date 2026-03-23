import supabase from "../config/supabaseClient.js";

// ─── POST /api/votes/submit ───────────────────────────────────────────────────

export const submitVote = async (req, res) => {
  try {
    const { tripId, userName, itineraryId } = req.body;

    if (!tripId || !userName || !itineraryId) {
      return res.status(400).json({
        error: "tripId, userName, and itineraryId are required",
      });
    }

    // Verify the itinerary belongs to this trip
    const { data: itinerary, error: itnError } = await supabase
      .from("itineraries")
      .select("id, trip_id")
      .eq("id", itineraryId)
      .eq("trip_id", tripId)
      .single();

    if (itnError || !itinerary) {
      return res.status(404).json({ error: "Itinerary not found for this trip" });
    }

    // Upsert — each participant gets one vote, can change their mind
    const { data: vote, error: voteError } = await supabase
      .from("votes")
      .upsert(
        {
          trip_id:      tripId,
          user_name:    userName,
          itinerary_id: itineraryId,
          voted_at:     new Date().toISOString(),
        },
        { onConflict: "trip_id, user_name" }
      )
      .select()
      .single();

    if (voteError) throw voteError;

    return res.status(200).json({
      success: true,
      message: "Vote submitted",
      vote,
    });

  } catch (err) {
    console.error("[submitVote]", err);
    return res.status(500).json({ error: "Failed to submit vote" });
  }
};

// ─── GET /api/votes/result/:tripId ────────────────────────────────────────────

export const getVotingResult = async (req, res) => {
  try {
    const { tripId } = req.params;

    if (!tripId) {
      return res.status(400).json({ error: "tripId is required" });
    }

    // Fetch all votes for this trip
    const { data: votes, error: voteError } = await supabase
      .from("votes")
      .select("user_name, itinerary_id, voted_at")
      .eq("trip_id", tripId);

    if (voteError) throw voteError;

    if (!votes || votes.length === 0) {
      return res.status(200).json({
        message:    "No votes submitted yet",
        voteCount:  0,
        results:    [],
        winner:     null,
      });
    }

    // Count votes per itinerary
    const voteCounts = {};
    votes.forEach(v => {
      voteCounts[v.itinerary_id] = (voteCounts[v.itinerary_id] || 0) + 1;
    });

    // Find winner (most votes)
    const winnerId = Object.entries(voteCounts)
      .sort(([, a], [, b]) => b - a)[0][0];

    // Fetch winner itinerary details
    const { data: winnerItinerary } = await supabase
      .from("itineraries")
      .select("id, city, days, content")
      .eq("id", winnerId)
      .single();

    // Update trip status to confirmed
    await supabase
      .from("trips")
      .update({ status: "confirmed", winning_itinerary_id: winnerId })
      .eq("id", tripId);

    // Build results array sorted by votes desc
    const results = Object.entries(voteCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([itineraryId, count]) => ({
        itineraryId,
        votes: count,
        percentage: Math.round((count / votes.length) * 100),
      }));

    return res.status(200).json({
      success:          true,
      totalVotes:       votes.length,
      results,
      winner: {
        itineraryId:  winnerId,
        votes:        voteCounts[winnerId],
        itinerary:    winnerItinerary,
      },
    });

  } catch (err) {
    console.error("[getVotingResult]", err);
    return res.status(500).json({ error: "Failed to compute voting result" });
  }
};
