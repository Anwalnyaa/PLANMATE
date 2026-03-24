import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plane, Users, MapPin, Brain, Scale, BarChart3, Star, Clock, CheckCircle2, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6 },
  }),
};

const floatAnim = {
  animate: {
    y: [0, -8, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
  },
};

const Home = () => {
  const navigate = useNavigate();
  const hasActiveTrip = !!localStorage.getItem("planmate_trip_id");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* ─── Hero ─── */}
      <section className="pt-32 pb-20 px-6 gradient-hero">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-display mb-6">
              <Sparkles className="h-4 w-4" />
              AI-powered group travel planning
            </div>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="text-5xl md:text-7xl font-display font-bold text-foreground leading-tight"
          >
            Plan<span className="text-primary">Mate</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-lg mx-auto"
          >
            Create a trip, invite friends, submit preferences — and let AI build the perfect itinerary everyone votes on.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            {hasActiveTrip && (
    <Button
      onClick={() => navigate("/dashboard")}
      className="h-14 px-8 text-base font-display gradient-warm text-primary-foreground rounded-xl hover:scale-[1.03] hover:shadow-elevated transition-all duration-200"
    >
      <Plane className="h-5 w-5 mr-2" />
      Open my trip
    </Button>
  )}

            <Button
              onClick={() => navigate("/create-trip")}
              className="h-14 px-8 text-base font-display gradient-warm text-primary-foreground rounded-xl hover:scale-[1.03] hover:shadow-elevated transition-all duration-200"
            >
              <MapPin className="h-5 w-5 mr-2" />
              Create Trip
            </Button>
            <Button
              onClick={() => navigate("/join-trip")}
              variant="outline"
              className="h-14 px-8 text-base font-display rounded-xl border-2 hover:bg-muted hover:scale-[1.03] hover:shadow-elevated transition-all duration-200"
            >
              <Users className="h-5 w-5 mr-2" />
              Join Trip
            </Button>
          </motion.div>

          {/* Floating illustration */}
          <motion.div {...floatAnim} className="mt-16 flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Plane className="h-10 w-10 text-primary" />
              </div>
              <div className="absolute -top-3 -right-6 w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-accent" />
              </div>
              <div className="absolute -bottom-2 -left-5 w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Users className="h-5 w-5 text-secondary-foreground" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-24 px-6 bg-card/50">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-3xl md:text-4xl font-display font-bold text-foreground text-center mb-4"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
            className="text-muted-foreground text-center mb-16 max-w-md mx-auto"
          >
            Three simple steps to the perfect group trip
          </motion.p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: "Pick a destination",
                desc: "Create a trip and share the invite link with your friends.",
                step: "01",
              },
              {
                icon: Users,
                title: "Invite your crew",
                desc: "Everyone joins and submits their travel preferences.",
                step: "02",
              },
              {
                icon: Plane,
                title: "Vote & go",
                desc: "AI generates itineraries and the group votes on the best one.",
                step: "03",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i + 2}
                className="relative bg-card border border-border rounded-2xl p-8 text-center hover:shadow-elevated hover:-translate-y-1 transition-all duration-300"
              >
                <span className="absolute top-4 right-4 text-5xl font-display font-bold text-muted/50">
                  {item.step}
                </span>
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-display font-semibold text-card-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI Features ─── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-display mb-4">
              <Sparkles className="h-4 w-4" />
              Powered by AI
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Smarter travel planning
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              PlanMate analyzes everyone's travel preferences and generates optimized itinerary options so the whole group can enjoy the trip.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "Smart Recommendations",
                desc: "AI considers budgets, interests, and travel styles to craft unique itineraries.",
              },
              {
                icon: Scale,
                title: "Fair Group Decisions",
                desc: "Ranked-choice voting ensures the winning plan represents everyone.",
              },
              {
                icon: BarChart3,
                title: "Preference Matching",
                desc: "Activities are scored against each member's preferences for maximum satisfaction.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i + 1}
                className="bg-card border border-border rounded-2xl p-8 hover:shadow-elevated hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl gradient-warm flex items-center justify-center mb-5">
                  <item.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-display font-semibold text-card-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Demo Preview ─── */}
      <section className="py-24 px-6 bg-card/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              See PlanMate in Action
            </h2>
            <p className="text-muted-foreground">A preview of AI-generated itinerary options</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Option A — Culture & Coast",
                score: 0.92,
                activities: [
                  { time: "9:00 AM", name: "City Food Tour", cat: "Food" },
                  { time: "1:00 PM", name: "Museum Visit", cat: "Culture" },
                  { time: "5:00 PM", name: "Beach Sunset", cat: "Relaxation" },
                ],
              },
              {
                title: "Option B — Adventure Day",
                score: 0.87,
                activities: [
                  { time: "8:00 AM", name: "Mountain Hike", cat: "Adventure" },
                  { time: "12:00 PM", name: "Local Market", cat: "Shopping" },
                  { time: "4:00 PM", name: "Kayaking", cat: "Adventure" },
                ],
              },
            ].map((opt, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i + 1}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-elevated transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-5">
                  <h3 className="text-lg font-display font-semibold text-card-foreground">
                    {opt.title}
                  </h3>
                  <div className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-sm font-display">
                    <Star className="h-3.5 w-3.5" />
                    {opt.score}
                  </div>
                </div>
                <div className="space-y-2">
                  {opt.activities.map((a, j) => (
                    <div key={j} className="flex items-center gap-3 text-sm py-2 px-3 rounded-lg bg-muted/50">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">{a.time}</span>
                      <span className="text-card-foreground font-medium">{a.name}</span>
                      <span className="ml-auto text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                        {a.cat}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why PlanMate ─── */}
      <section id="why" className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-3xl md:text-4xl font-display font-bold text-foreground mb-12"
          >
            Why PlanMate?
          </motion.h2>

          <div className="grid sm:grid-cols-2 gap-6 text-left">
            {[
              "No endless group chats",
              "Everyone's preferences matter",
              "AI-powered itinerary suggestions",
              "Fair ranked-choice voting",
            ].map((text, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i + 1}
                className="flex items-center gap-3 bg-card border border-border rounded-xl p-5 hover:shadow-card transition-shadow"
              >
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                <span className="text-card-foreground font-medium">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-20 px-6 gradient-hero">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="max-w-xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Ready to plan together?
          </h2>
          <p className="text-muted-foreground mb-8">
            Start your first trip in under a minute.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
  <Button
    onClick={() => navigate(hasActiveTrip ? "/dashboard" : "/create-trip")}
    className="h-14 px-10 text-base font-display gradient-warm text-primary-foreground rounded-xl hover:scale-[1.03] hover:shadow-elevated transition-all duration-200 w-full sm:w-auto"
  >
    <Plane className="h-5 w-5 mr-2" />
    {hasActiveTrip ? "Back to my trip" : "Get Started — It's Free"}
  </Button>

  <Button
    onClick={() => navigate("/create-trip")}
    className="h-14 px-10 text-base font-display gradient-warm text-primary-foreground rounded-xl hover:scale-[1.03] hover:shadow-elevated transition-all duration-200 w-full sm:w-auto"
  >
    <Plane className="h-5 w-5 mr-2" />
    Get Started — It's Free
  </Button>
</div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
