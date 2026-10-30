"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const events = [
  {
    type: "wedding",
    emoji: "💍",
    title: "Wedding",
    description:
      "Plan your perfect wedding day with AI-powered budgets, vendor lists, timelines, and personalized themes.",
    color: "from-rose-400 to-pink-600",
    bgLight: "bg-rose-50",
    border: "border-rose-200 hover:border-rose-400",
    features: [
      "Venue & Catering",
      "Vendor Coordination",
      "Guest Management",
      "Theme & Decor",
    ],
  },
  {
    type: "birthday",
    emoji: "🎂",
    title: "Birthday Party",
    description:
      "Create unforgettable birthday celebrations with themed ideas, activity planning, and budget management.",
    color: "from-amber-400 to-orange-500",
    bgLight: "bg-amber-50",
    border: "border-amber-200 hover:border-amber-400",
    features: [
      "Theme Selection",
      "Activity Planning",
      "Cake & Food Ideas",
      "Entertainment",
    ],
  },
  {
    type: "community",
    emoji: "🏘️",
    title: "Community Event",
    description:
      "Organize successful community gatherings, festivals, fundraisers, and public events with ease.",
    color: "from-emerald-400 to-teal-600",
    bgLight: "bg-emerald-50",
    border: "border-emerald-200 hover:border-emerald-400",
    features: [
      "Volunteer Coordination",
      "Permit Planning",
      "Sponsorship Ideas",
      "Logistics",
    ],
  },
];

export default function Home() {
  const router = useRouter();
  const [, setHoveredType] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg">
              <span aria-hidden="true">✨</span>
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-lg leading-tight">
                EventMind AI
              </h1>
              <p className="text-xs text-slate-500">Powered by Gemini</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" aria-hidden="true"></span>
            AI Ready
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          <span aria-hidden="true">✨</span> Gemini AI-Powered Planning
        </div>
        <h2 className="text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
          Plan Your Perfect Event
          <br />
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            with AI Intelligence
          </span>
        </h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
          Budgets, timelines, vendor checklists, and personalized ideas — all
          generated instantly by AI, tailored to your event.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
          {[
            "💰 Smart Budgeting",
            "📅 Auto Timeline",
            "✅ Vendor Lists",
            "💡 Creative Ideas",
            "🤖 AI Chat",
          ].map((f) => (
            <span key={f}>{f}</span>
          ))}
        </div>
      </section>

      {/* Event Type Cards */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h3 className="text-center text-slate-500 text-sm font-medium mb-8 uppercase tracking-wider">
          Choose Your Event Type
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((event) => (
            <button
              key={event.type}
              onClick={() => router.push(`/plan/${event.type}`)}
              onMouseEnter={() => setHoveredType(event.type)}
              onMouseLeave={() => setHoveredType(null)}
              className={`text-left rounded-2xl border-2 ${event.border} ${event.bgLight} p-6 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer group`}
            >
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${event.color} flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}
              >
                {event.emoji}
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-2">
                {event.title}
              </h4>
              <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                {event.description}
              </p>
              <div className="space-y-1.5">
                {event.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="text-green-500" aria-hidden="true">✓</span> {f}
                  </div>
                ))}
              </div>
              <div
                className={`mt-5 text-sm font-semibold bg-gradient-to-r ${event.color} bg-clip-text text-transparent`}
              >
                Start Planning →
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/60 py-6 text-center text-sm text-slate-400">
        EventMind AI — Powered by Google Gemini
      </footer>
    </div>
  );
}
