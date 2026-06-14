# 🌍 PlanMate – AI-Powered Group Travel Planner

PlanMate is an intelligent group travel planning platform that simplifies the process of organizing trips with friends, families, and teams. Instead of manually coordinating preferences through chats and calls, PlanMate uses Artificial Intelligence to collect participant preferences, generate balanced travel itineraries, and enable collaborative decision-making.

## 🚀 Problem Statement

Planning a group trip is often challenging because every participant has different:

* Budgets
* Interests
* Travel styles
* Time constraints

Traditional planning methods involve endless discussions, making it difficult to satisfy everyone.

PlanMate solves this problem by leveraging AI to generate fair and optimized travel plans based on the collective preferences of all participants.

---

## ✨ Features

### 👥 Collaborative Trip Planning

* Create trips and invite participants using a unique Trip ID.
* Collect preferences from multiple users.
* Track participant submissions in real-time.

### 🤖 AI-Powered Itinerary Generation

* Uses Groq LLM to generate personalized travel itineraries.
* Produces structured day-wise travel plans.
* Generates multiple itinerary options for comparison.

### ⚖️ Fair Preference Aggregation

* Combines preferences from all participants.
* Handles conflicting interests intelligently.
* Ensures balanced recommendations for the entire group.

### 🗳️ Voting-Based Decision Making

* Participants can review generated itineraries.
* Vote on their preferred option.
* Automatically selects the most popular itinerary.

### 📍 Google Maps Integration

* Visualize locations directly on maps.
* Explore attractions and activities easily.

### 📧 Email Notifications

* Notify users when:

  * All preferences are submitted
  * Itineraries are generated
  * Voting begins
  * Final itinerary is selected

---

## 🏗️ System Architecture

```text
User Preferences
        │
        ▼
Preference Collection
        │
        ▼
Preference Aggregation
        │
        ▼
Constraint Processing
(Budget, Time, Interests)
        │
        ▼
AI Itinerary Generation
(Groq API)
        │
        ▼
Multiple Travel Plans
        │
        ▼
Voting & Decision Making
        │
        ▼
Final Group Itinerary
```

---

## 🔄 Workflow

### 1. Preference Collection

Users join a trip using a Trip ID and submit:

* Budget
* Interests
* Travel constraints
* Duration preferences

### 2. Preference Aggregation

The backend combines all responses and creates a unified group profile.

### 3. Constraint Handling

The system applies:

* Budget constraints
* Time constraints
* Activity preferences
* Group fairness considerations

### 4. AI-Based Generation

A structured prompt is sent to the Groq LLM which generates:

* Day-wise itineraries
* Activity schedules
* Estimated costs
* Travel recommendations

### 5. Collaborative Selection

Participants review generated plans and vote for their favorite itinerary.

### 6. Final Confirmation

The winning itinerary becomes the official group travel plan.

---

## 🛠️ Tech Stack

### Frontend

* HTML
* CSS
* JavaScript
* React.js

### Backend

* Node.js
* Express.js

### Database

* Supabase

### AI & APIs

* Groq API (Llama Models)
* Google Maps API

### Additional Services

* Email Notifications
* Real-Time Trip Tracking

---

## 🎯 Key Innovations

### Hybrid AI + Backend Logic

PlanMate combines traditional backend processing with AI-generated recommendations.

Benefits:

* Better reliability
* Controlled outputs
* Structured itinerary generation

### Group Decision Intelligence

Instead of planning for a single traveler, PlanMate optimizes recommendations for an entire group.

### Interactive Collaboration

* Live participation tracking
* Voting system
* Notifications
* Map integration

---

## 📈 Future Enhancements

* WebSocket-based real-time collaboration
* Flight and hotel booking integrations
* Mobile application
* Multi-language support
* Advanced itinerary optimization
* Real-time pricing agents
* Personalized recommendation engine

---

## 📸 Screenshots

<img width="1713" height="827" alt="Screenshot 2026-06-14 105543" src="https://github.com/user-attachments/assets/d7980dfb-2ec4-4895-8da0-2b02cd053a7e" />

## 👨‍💻 Author

**Ananya Khandelwal**

B.Tech – Artificial Intelligence & Machine Learning
Manipal University Jaipur

---

## ⭐ Project Vision

PlanMate aims to transform group travel planning through AI-driven preference modeling, collaborative decision-making, and intelligent itinerary generation, making travel planning fair, efficient, and enjoyable for everyone.
