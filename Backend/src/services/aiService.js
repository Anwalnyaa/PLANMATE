
import Groq from "groq-sdk";

const client = new Groq({ 
    apiKey: process.env.GROQ_API_KEY // Use a Groq-specific variable name for clarity
});
// ─── Constants ───────────────────────────────────────────────────────────────

const TIME_BUDGETS = {
  morning:   { start: "08:00", end: "12:00", maxMins: 240 },
  afternoon: { start: "12:00", end: "17:00", maxMins: 300 },
  evening:   { start: "17:00", end: "22:00", maxMins: 300 },
};

const PRICE_LABELS = {
  free:    "Free",
  budget:  "Under ₹500",
  mid:     "₹500–₹1500",
  premium: "₹1500–₹3000",
  luxury:  "₹3000+",
};

// ─── Input validation ─────────────────────────────────────────────────────────

function validateInputs(activities, days, city, preferences) {
  const errors = [];
  const daysNum = Number(days);
  if (!Number.isInteger(daysNum) || daysNum < 1 || daysNum > 14) errors.push("days must be an integer between 1 and 14");
  if (!city || typeof city !== "string") errors.push("city must be a non-empty string");
  if (!Array.isArray(activities) || activities.length === 0) errors.push("activities must be a non-empty array");
  if (preferences && typeof preferences !== "object") errors.push("preferences must be an object");
  if (errors.length) throw new Error(`Invalid inputs: ${errors.join("; ")}`);
}

// ─── Activity pre-processing ──────────────────────────────────────────────────

/**
 * Strips heavy/irrelevant fields before sending to the model.
 * Keeps only what the AI needs to write a good itinerary.
 */
function sanitizeActivity(a) {
  return {
    id:               a.id,
    name:             a.name,
    category:         a.category,
    subcategory:      a.subcategory,
    description:      a.description,
    area:             a.area,
    duration_mins:    a.duration_mins,
    price_range:      PRICE_LABELS[a.price_range] ?? a.price_range,
    price_inr_pp:     a.price_inr_pp ?? 0,
    best_time_of_day: a.best_time_of_day,
    must_try:         a.must_try ?? [],
    tags:             a.tags ?? [],
    rating:           a.rating,
    requires_booking: a.requires_booking ?? false,
    accessibility:    a.accessibility ?? "moderate",
  };
}

/**
 * Assigns activities to days as evenly as possible,
 * respecting best_time_of_day and daily time budgets.
 */
function distributeActivities(activities, days) {
  const slots = Array.from({ length: days }, () => ({
    morning: [], afternoon: [], evening: [],
  }));

  const slotMins = Array.from({ length: days }, () => ({
    morning: 0, afternoon: 0, evening: 0,
  }));

  // Sort: time-specific activities first, then by rating desc
  const sorted = [...activities].sort((a, b) => {
    const aHasTime = a.best_time_of_day !== "anytime";
    const bHasTime = b.best_time_of_day !== "anytime";
    if (aHasTime !== bHasTime) return aHasTime ? -1 : 1;
    return (b.rating ?? 0) - (a.rating ?? 0);
  });

  const usedIds = new Set();

  for (const activity of sorted) {
    if (usedIds.has(activity.id)) continue;

    const preferredSlot = activity.best_time_of_day === "anytime"
      ? null
      : activity.best_time_of_day;

    // Try to find a day + slot with capacity
    let placed = false;
    for (let day = 0; day < days; day++) {
      const slotsToTry = preferredSlot
        ? [preferredSlot, ...Object.keys(TIME_BUDGETS).filter(s => s !== preferredSlot)]
        : Object.keys(TIME_BUDGETS);

      for (const slot of slotsToTry) {
        const budget = TIME_BUDGETS[slot].maxMins;
        const used   = slotMins[day][slot];
        if (used + activity.duration_mins <= budget) {
          slots[day][slot].push(sanitizeActivity(activity));
          slotMins[day][slot] += activity.duration_mins;
          usedIds.add(activity.id);
          placed = true;
          break;
        }
      }
      if (placed) break;
    }
  }

  return slots;
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildSystemPrompt() {
  return `You are an expert travel itinerary writer specialising in Indian tourism.
Your job is to transform a structured list of pre-selected activities into a vivid, 
detailed, day-by-day travel itinerary.

RULES:
- Write in an engaging, warm, second-person voice ("You'll start your morning…")
- For each activity write: suggested start time, a 2–3 sentence description bringing 
  it to life, must-try highlights, practical tips (booking, best spot, crowd advice)
- Sequence activities within each slot logically by proximity where possible
- Add short transition notes between activities ("From here, it's a 10-minute auto 
  ride to…")
- Include a brief Day Summary at the end of each day (mood, theme, estimated spend)
- Flag activities that require advance booking with ⚠️ BOOK AHEAD
- Never invent activities not in the provided list
- Output ONLY valid JSON — no markdown fences, no prose outside the JSON`;
}

function buildUserPrompt(city, days, distributedSlots, preferences, groupSize) {
  const prefSummary = preferences
    ? Object.entries(preferences)
        .filter(([, v]) => v > 0.3)
        .sort(([, a], [, b]) => b - a)
        .map(([k, v]) => `${k} (${Math.round(v * 100)}%)`)
        .join(", ")
    : "general sightseeing";

  return `Generate a ${days}-day itinerary for ${city}.
Group size: ${groupSize ?? 2} people
Group preferences: ${prefSummary}

Pre-assigned activities by day and time slot:
${JSON.stringify(distributedSlots, null, 2)}

Return a JSON object matching EXACTLY this structure:
{
  "city": "${city}",
  "days": ${days},
  "group_preferences": "${prefSummary}",
  "estimated_total_inr_pp": <number>,
  "itinerary": [
    {
      "day": 1,
      "theme": "<short evocative theme e.g. 'Forts & Flavours'>",
      "morning": {
        "time_range": "08:00 – 12:00",
        "activities": [
          {
            "id": <activity_id>,
            "name": "<name>",
            "start_time": "HH:MM",
            "duration_mins": <number>,
            "narrative": "<2-3 sentences bringing this place to life>",
            "must_try": ["<item1>", "<item2>"],
            "practical_tip": "<one actionable tip>",
            "requires_booking": <boolean>,
            "estimated_cost_inr_pp": <number>
          }
        ],
        "transition_to_afternoon": "<how to get from morning's last spot to afternoon's first>"
      },
      "afternoon": { ... },
      "evening": { ... },
      "day_summary": {
        "theme_description": "<2 sentences on the day's mood and highlights>",
        "estimated_spend_inr_pp": <number>,
        "insider_tip": "<one local secret or timing tip for this day>"
      }
    }
  ]
}`;
}

// ─── Token estimation ─────────────────────────────────────────────────────────

function estimateTokens(text) {
  // ~4 chars per token (rough estimate)
  return Math.ceil(text.length / 4);
}

// ─── Retry with exponential backoff ──────────────────────────────────────────

async function callWithRetry(fn, maxRetries = 3) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isRetryable =
        err?.status === 429 ||   // rate limit
        err?.status === 503 ||   // service unavailable
        err?.code === "ECONNRESET";
      if (!isRetryable || attempt === maxRetries) throw err;
      const delay = Math.min(1000 * 2 ** attempt, 16000);
      console.warn(`[itinerary] Attempt ${attempt} failed (${err.status ?? err.code}). Retrying in ${delay}ms…`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastError;
}

// ─── Response parser ──────────────────────────────────────────────────────────

function parseItineraryResponse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    // Try extracting JSON if the model wrapped it in markdown despite instructions
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      try { return JSON.parse(match[1]); } catch {}
    }
    // Last resort: find first { … } block
    const start = raw.indexOf("{");
    const end   = raw.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      try { return JSON.parse(raw.slice(start, end + 1)); } catch {}
    }
    throw new Error("Model returned unparseable response. Raw output: " + raw.slice(0, 200));
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * @param {Object[]} activities   - Array of activity rows from your Supabase dataset
 * @param {number}   days         - Number of trip days (1–14)
 * @param {string}   city         - City name
 * @param {Object}   [options]
 * @param {Object}   [options.preferences]  - e.g. { food_lover: 0.5, history_buff: 0.3 }
 * @param {number}   [options.groupSize]    - Number of travellers
 * @param {string}   [options.model]        - OpenAI model override
 * @returns {Promise<Object>}  Parsed itinerary JSON
 */
export async function generateItinerary(activities, days, city, options = {}) {
  const {
    preferences = null,
    groupSize   = 2,
    model       = "llama-3.3-70b-versatile",
  } = options;

  const daysInt = Number(days); // ← add this
  // 1. Validate
  validateInputs(activities, daysInt, city, preferences);

  // 2. Pre-process: distribute activities across days/slots
  const distributedSlots = distributeActivities(activities, daysInt);

  // 3. Build prompts
  const systemPrompt = buildSystemPrompt();
  const userPrompt   = buildUserPrompt(city, daysInt, distributedSlots, preferences, groupSize);

  // 4. Estimate token usage
  const estimatedInputTokens = estimateTokens(systemPrompt + userPrompt);
  console.log(`[itinerary] ~${estimatedInputTokens} input tokens for ${days}-day ${city} itinerary`);

  // 5. Call OpenAI with retry
  const response = await callWithRetry(() =>
    client.chat.completions.create({
      model,
      temperature:     0.7,
      max_tokens:      4000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt   },
      ],
    })
  );

  // 6. Parse and return
  const raw    = response.choices[0].message.content;
  const result = parseItineraryResponse(raw);

  // 7. Attach usage metadata
  result._meta = {
    model:             response.model,
    usage:             response.usage,
    generated_at:      new Date().toISOString(),
    activities_used:   activities.length,
    days,
    city,
  };

  return result;
}