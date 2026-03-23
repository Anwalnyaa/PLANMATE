import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = "PlanMate <onboarding@resend.dev>";
const APP_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ─── Helper: send with error swallowing ───────────────────────────────────────
// Emails are non-critical — if they fail, the main flow should not break

async function sendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping email");
    return;
  }
  if (!to || to.length === 0) {
    console.warn("[email] No recipients — skipping email");
    return;
  }
  try {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) throw error;
    console.log(`[email] Sent "${subject}" to ${to.join(", ")}`);
    return data;
  } catch (err) {
    console.error("[email] Failed to send:", err.message);
    // Don't rethrow — email failure should never crash the main request
  }
}

// ─── Email 1: Trip created — invite link ──────────────────────────────────────
// Called after createTrip succeeds
// recipients: array of email strings (from req.body.emails if provided)

export async function sendTripInviteEmail({ tripId, tripName, destination, days, creator, emails ,creatorEmail }) {

  const joinUrl  = `${APP_URL}/join-trip`;
  const dashUrl  = `${APP_URL}/dashboard`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { margin: 0; padding: 0; background: #f9f7f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .container { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e8e4de; }
    .header { background: linear-gradient(135deg, #f97316, #ea580c); padding: 32px 32px 24px; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; color: rgba(255,255,255,0.85); font-size: 14px; }
    .body { padding: 32px; }
    .trip-card { background: #f9f7f4; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e8e4de; }
    .trip-card h2 { margin: 0 0 12px; font-size: 18px; color: #1a1a1a; font-weight: 600; }
    .trip-meta { display: flex; gap: 16px; flex-wrap: wrap; }
    .meta-item { font-size: 13px; color: #6b6b6b; }
    .meta-item strong { color: #1a1a1a; }
    .trip-id { background: #1a1a1a; color: #ffffff; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px; font-family: monospace; font-size: 15px; text-align: center; letter-spacing: 2px; }
    .btn { display: block; background: linear-gradient(135deg, #f97316, #ea580c); color: #ffffff !important; text-decoration: none; text-align: center; padding: 14px 24px; border-radius: 10px; font-weight: 600; font-size: 15px; margin-bottom: 12px; }
    .btn-secondary { display: block; background: transparent; color: #f97316 !important; text-decoration: none; text-align: center; padding: 12px 24px; border-radius: 10px; font-weight: 500; font-size: 14px; border: 1.5px solid #f97316; margin-bottom: 24px; }
    .steps { margin: 24px 0; }
    .step { display: flex; gap: 12px; margin-bottom: 16px; align-items: flex-start; }
    .step-num { width: 24px; height: 24px; background: #f97316; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
    .step-text { font-size: 13px; color: #444; padding-top: 4px; line-height: 1.5; }
    .footer { padding: 20px 32px; border-top: 1px solid #e8e4de; text-align: center; }
    .footer p { margin: 0; font-size: 12px; color: #9e9e9e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✈️ PlanMate</h1>
      <p>You've been invited to plan a trip together</p>
    </div>
    <div class="body">
      <p style="margin: 0 0 20px; font-size: 15px; color: #333;">
        <strong>${creator}</strong> has created a group trip and wants you to join!
      </p>

      <div class="trip-card">
        <h2>${tripName}</h2>
        <div class="trip-meta">
          <div class="meta-item">📍 <strong>${destination}</strong></div>
          <div class="meta-item">📅 <strong>${days} day${days > 1 ? "s" : ""}</strong></div>
          <div class="meta-item">👤 Created by <strong>${creator}</strong></div>
        </div>
      </div>

      <p style="font-size: 13px; color: #666; margin: 0 0 8px;">Your Trip ID</p>
      <div class="trip-id">${tripId}</div>

      <a href="${joinUrl}" class="btn">Join This Trip →</a>
      <a href="${dashUrl}" class="btn-secondary">Open Dashboard</a>

      <div class="steps">
        <p style="font-size: 13px; font-weight: 600; color: #333; margin: 0 0 12px;">How it works</p>
        <div class="step">
          <div class="step-num">1</div>
          <div class="step-text">Click "Join This Trip" and enter the Trip ID above</div>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <div class="step-text">Submit your travel preferences (food, adventure, culture, etc.)</div>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <div class="step-text">Once everyone submits, AI generates 3 personalised itineraries</div>
        </div>
        <div class="step">
          <div class="step-num">4</div>
          <div class="step-text">The group votes and the winning plan is confirmed!</div>
        </div>
      </div>
    </div>
    <div class="footer">
      <p>PlanMate · AI-powered group travel planning</p>
    </div>
  </div>
</body>
</html>`;
  const allRecipients = [
    ...(creatorEmail ? [creatorEmail] : []),  // ← always notify creator
    ...(emails ?? []),
  ].filter(Boolean);

  if (allRecipients.length === 0) return;

  await sendEmail({
    to:      allRecipients,
    subject: `  trip Created ${tripName} to ${destination} ✈️`,
    html,
  });
}

// ─── Email 2: Itinerary generated — notify all participants ───────────────────
// Called after triggerItineraryGeneration succeeds
// recipients: array of { name, email } objects

export async function sendItineraryReadyEmail({ tripId, tripName, destination, days, themes, participants }) {
  const validRecipients = (participants ?? []).filter(p => p.email);
  if (validRecipients.length === 0) return;

  const itineraryUrl = `${APP_URL}/itinerary/${tripId}`;
  const themeList    = (themes ?? []).map(t => `<li style="margin-bottom:6px">${t}</li>`).join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { margin: 0; padding: 0; background: #f9f7f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .container { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e8e4de; }
    .header { background: linear-gradient(135deg, #f97316, #ea580c); padding: 32px 32px 24px; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; }
    .header p { margin: 6px 0 0; color: rgba(255,255,255,0.85); font-size: 14px; }
    .body { padding: 32px; }
    .highlight { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .highlight h2 { margin: 0 0 8px; font-size: 16px; color: #ea580c; }
    .highlight p { margin: 0; font-size: 14px; color: #7c3908; }
    .themes { background: #f9f7f4; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .themes h3 { margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #333; }
    .themes ul { margin: 0; padding-left: 20px; }
    .themes li { font-size: 14px; color: #555; }
    .btn { display: block; background: linear-gradient(135deg, #f97316, #ea580c); color: #ffffff !important; text-decoration: none; text-align: center; padding: 14px 24px; border-radius: 10px; font-weight: 600; font-size: 15px; margin-bottom: 24px; }
    .footer { padding: 20px 32px; border-top: 1px solid #e8e4de; text-align: center; }
    .footer p { margin: 0; font-size: 12px; color: #9e9e9e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Your itinerary is ready!</h1>
      <p>Time to review and vote on your trip plans</p>
    </div>
    <div class="body">
      <p style="margin: 0 0 20px; font-size: 15px; color: #333;">
        All group members have submitted their preferences for
        <strong>${tripName}</strong>. The AI has generated
        <strong>3 personalised itineraries</strong> for your ${days}-day trip to
        <strong>${destination}</strong>.
      </p>

      <div class="highlight">
        <h2>🗺️ 3 itinerary options generated</h2>
        <p>Each option is tailored to the group's combined preferences</p>
      </div>

      ${themeList ? `
      <div class="themes">
        <h3>Your itinerary themes</h3>
        <ul>${themeList}</ul>
      </div>` : ""}

      <a href="${itineraryUrl}" class="btn">View Itineraries & Vote →</a>

      <p style="font-size: 13px; color: #666; line-height: 1.6;">
        Review all 3 options, explore the day-by-day plans, and cast your vote.
        The option with the most votes will be confirmed as your group's itinerary!
      </p>
    </div>
    <div class="footer">
      <p>PlanMate · AI-powered group travel planning</p>
    </div>
  </div>
</body>
</html>`;

  // Send individually so each person gets a personalised greeting
  for (const participant of validRecipients) {
    await sendEmail({
      to:      [participant.email],
      subject: `🎉 Your ${destination} itinerary is ready — time to vote!`,
      html:    html.replace("All group members", `Hi ${participant.name}! All group members`),
    });
  }
}