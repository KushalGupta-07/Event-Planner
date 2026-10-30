"use client";
import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

// ─── Types ───────────────────────────────────────────────────────────────────

interface BudgetCategory {
  name: string;
  amount: number;
  percentage: number;
  description: string;
  tips: string;
}

interface BudgetData {
  categories: BudgetCategory[];
  perPersonCost: number;
  contingency: number;
  totalAllocated: number;
  advice: string;
}

interface TimelineMilestone {
  id: string;
  title: string;
  description: string;
  daysBeforeEvent: number;
  category: string;
  priority: string;
  estimatedTime: string;
  completed?: boolean;
}

interface Vendor {
  id: string;
  name: string;
  description: string;
  estimatedCost: string;
  bookingLeadTime: string;
  questions: string[];
  tips: string;
  priority: string;
  booked?: boolean;
}

interface VendorCategory {
  id: string;
  category: string;
  vendors: Vendor[];
}

interface Theme {
  name: string;
  description: string;
  vibe: string;
  suitability: string;
}

interface Decoration {
  idea: string;
  diy: boolean;
  estimatedCost: string;
  impact: string;
}

interface Activity {
  name: string;
  description: string;
  duration: string;
  guestEngagement: string;
}

interface Favor {
  idea: string;
  estimatedCost: string;
  diy: boolean;
}

interface IdeasData {
  themes: Theme[];
  decorations: Decoration[];
  activities: Activity[];
  food: {
    appetizers: string[];
    mains: string[];
    desserts: string[];
    drinks: string[];
    dietaryNotes: string;
  };
  favors: Favor[];
  uniqueTouches: string[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface EventDetails {
  name: string;
  date: string;
  guestCount: string;
  budget: string;
  currency: string;
  location: string;
  theme: string;
  preferences: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const EVENT_META: Record<string, { emoji: string; title: string; gradient: string }> = {
  wedding: {
    emoji: "💍",
    title: "Wedding",
    gradient: "from-rose-500 to-pink-600",
  },
  birthday: {
    emoji: "🎂",
    title: "Birthday Party",
    gradient: "from-amber-500 to-orange-500",
  },
  community: {
    emoji: "🏘️",
    title: "Community Event",
    gradient: "from-emerald-500 to-teal-600",
  },
};

const TABS = ["Budget", "Timeline", "Vendors", "Ideas", "AI Chat"] as const;
type Tab = (typeof TABS)[number];

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
  essential: "bg-red-100 text-red-700",
  recommended: "bg-blue-100 text-blue-700",
  optional: "bg-slate-100 text-slate-600",
};

const CATEGORY_ICONS: Record<string, string> = {
  venue: "🏛️",
  vendors: "🤝",
  invitations: "✉️",
  decor: "🎨",
  catering: "🍽️",
  misc: "📋",
};

const CHAT_SUGGESTIONS = [
  "What's a realistic budget for my event?",
  "How far in advance should I book vendors?",
  "Give me unique decoration ideas",
  "What should I do 3 months before?",
];

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-14 text-center">
      <div className="text-5xl mb-3" aria-hidden="true">{icon}</div>
      <h3 className="font-semibold text-slate-700 mb-1">{title}</h3>
      <p className="text-slate-500 text-sm">{desc}</p>
    </div>
  );
}

function LoadingState({ text }: { text: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-14 text-center" role="status" aria-live="polite">
      <div className="text-5xl animate-bounce mb-3" aria-hidden="true">🤖</div>
      <p className="text-slate-600">{text}</p>
    </div>
  );
}

function GenerateBtn({
  onClick,
  loading,
  label,
}: {
  onClick: () => void;
  loading: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-busy={loading}
      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
    >
      <span className={loading ? "animate-spin inline-block" : ""} aria-hidden="true">
        {loading ? "⟳" : "✨"}
      </span>
      {loading ? "Generating…" : label}
    </button>
  );
}

function TabHeader({
  icon,
  title,
  desc,
  onGenerate,
  loading,
  btnLabel,
}: {
  icon: string;
  title: string;
  desc: string;
  onGenerate: () => void;
  loading: boolean;
  btnLabel: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-bold text-slate-800">
          <span aria-hidden="true">{icon}</span> {title}
        </h2>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
      <GenerateBtn onClick={onGenerate} loading={loading} label={btnLabel} />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PlanPage() {
  const params = useParams();
  const eventType = (params?.type as string) || "wedding";
  const meta = EVENT_META[eventType] ?? EVENT_META.wedding;

  const [activeTab, setActiveTab] = useState<Tab>("Budget");
  const [showDetails, setShowDetails] = useState(true);
  const [details, setDetails] = useState<EventDetails>({
    name: "",
    date: "",
    guestCount: "50",
    budget: "10000",
    currency: "$",
    location: "",
    theme: "",
    preferences: "",
  });

  // Per-tab state
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [budgetLoading, setBudgetLoading] = useState(false);

  const [timeline, setTimeline] = useState<TimelineMilestone[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  const [vendors, setVendors] = useState<VendorCategory[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null);

  const [ideas, setIdeas] = useState<IdeasData | null>(null);
  const [ideasLoading, setIdeasLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi! I'm your ${meta.title} planning assistant powered by Gemini AI. I can help with budgets, vendor selection, timeline planning, creative ideas, and any questions about your ${eventType}. What would you like to know? 🎉`,
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── API helpers ────────────────────────────────────────────────────────

  const generateBudget = async () => {
    setBudgetLoading(true);
    try {
      const res = await fetch("/api/gemini/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType,
          totalBudget: details.budget,
          guestCount: details.guestCount,
          currency: details.currency,
          preferences: details.preferences,
        }),
      });
      if (!res.ok) throw new Error("API error");
      setBudgetData(await res.json());
    } catch {
      alert("Failed to generate budget. Please check your Gemini API key in .env.local and try again.");
    } finally {
      setBudgetLoading(false);
    }
  };

  const generateTimeline = async () => {
    if (!details.date) {
      alert("Please enter your event date first.");
      return;
    }
    setTimelineLoading(true);
    try {
      const res = await fetch("/api/gemini/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType,
          eventDate: details.date,
          guestCount: details.guestCount,
          location: details.location,
          preferences: details.preferences,
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data: TimelineMilestone[] = await res.json();
      setTimeline(data.map((m) => ({ ...m, completed: false })));
    } catch {
      alert("Failed to generate timeline. Please check your Gemini API key and try again.");
    } finally {
      setTimelineLoading(false);
    }
  };

  const generateVendors = async () => {
    setVendorsLoading(true);
    try {
      const res = await fetch("/api/gemini/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType,
          guestCount: details.guestCount,
          budget: `${details.currency}${details.budget}`,
          location: details.location,
          preferences: details.preferences,
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data: VendorCategory[] = await res.json();
      setVendors(
        data.map((cat) => ({
          ...cat,
          vendors: cat.vendors.map((v) => ({ ...v, booked: false })),
        }))
      );
    } catch {
      alert("Failed to generate vendor list. Please check your Gemini API key and try again.");
    } finally {
      setVendorsLoading(false);
    }
  };

  const generateIdeas = async () => {
    setIdeasLoading(true);
    try {
      const res = await fetch("/api/gemini/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType,
          theme: details.theme,
          guestCount: details.guestCount,
          budget: `${details.currency}${details.budget}`,
          preferences: details.preferences,
          season: details.date
            ? new Date(details.date).toLocaleString("default", { month: "long" })
            : "",
        }),
      });
      if (!res.ok) throw new Error("API error");
      setIdeas(await res.json());
    } catch {
      alert("Failed to generate ideas. Please check your Gemini API key and try again.");
    } finally {
      setIdeasLoading(false);
    }
  };

  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          eventContext: { eventType, ...details },
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please check your API key and try again.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // ─── Derived values ─────────────────────────────────────────────────────

  const completedMilestones = timeline.filter((m) => m.completed).length;
  const allVendors = vendors.flatMap((c) => c.vendors);
  const bookedVendors = allVendors.filter((v) => v.booked).length;
  const totalVendors = allVendors.length;

  const updateDetail = (key: keyof EventDetails, value: string) =>
    setDetails((d) => ({ ...d, [key]: value }));

  const toggleMilestone = (id: string) =>
    setTimeline((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
    );

  const toggleVendorBooked = (catId: string, vendorId: string) =>
    setVendors((prev) =>
      prev.map((cat) =>
        cat.id === catId
          ? {
              ...cat,
              vendors: cat.vendors.map((v) =>
                v.id === vendorId ? { ...v, booked: !v.booked } : v
              ),
            }
          : cat
      )
    );

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Sticky Header ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-slate-400 hover:text-slate-600 text-sm"
            >
              ← Back
            </Link>
            <div className="w-px h-5 bg-slate-200" />
            <div
              className={`w-8 h-8 rounded-lg bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-lg`}
            >
              {meta.emoji}
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-sm">
                {details.name || `My ${meta.title}`}
              </h1>
              <p className="text-xs text-slate-500">
                {meta.title} Planner · Gemini AI
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            {timeline.length > 0 && (
              <span>
                📅 {completedMilestones}/{timeline.length} tasks
              </span>
            )}
            {totalVendors > 0 && (
              <span>
                ✅ {bookedVendors}/{totalVendors} vendors booked
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* ── Event Details Panel ── */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <button
            type="button"
            aria-expanded={showDetails}
            aria-controls="event-details-form"
            aria-label="Toggle event details"
            onClick={() => setShowDetails((s) => !s)}
            className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{meta.emoji}</span>
              <div className="text-left">
                <h2 className="font-semibold text-slate-800">Event Details</h2>
                <p className="text-sm text-slate-500">
                  Configure your event for personalised AI output
                </p>
              </div>
            </div>
            <span className="text-slate-400 text-xs">
              {showDetails ? "▲ Hide" : "▼ Show"}
            </span>
          </button>

          {showDetails && (
            <div id="event-details-form" className="px-5 pb-5 border-t border-slate-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {/* Event Name */}
                <div>
                  <label htmlFor="event-name" className="block text-xs font-medium text-slate-600 mb-1">
                    Event Name
                  </label>
                  <input
                    id="event-name"
                    aria-label="Event name"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder={`My ${meta.title}`}
                    value={details.name}
                    onChange={(e) => updateDetail("name", e.target.value)}
                  />
                </div>
                {/* Event Date */}
                <div>
                  <label htmlFor="event-date" className="block text-xs font-medium text-slate-600 mb-1">
                    Event Date
                  </label>
                  <input
                    id="event-date"
                    type="date"
                    aria-label="Event date"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={details.date}
                    onChange={(e) => updateDetail("date", e.target.value)}
                  />
                </div>
                {/* Guest Count */}
                <div>
                  <label htmlFor="guest-count" className="block text-xs font-medium text-slate-600 mb-1">
                    Guest Count
                  </label>
                  <input
                    id="guest-count"
                    type="number"
                    aria-label="Guest count"
                    min={1}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={details.guestCount}
                    onChange={(e) => updateDetail("guestCount", e.target.value)}
                  />
                </div>
                {/* Budget */}
                <div>
                  <label htmlFor="currency" className="block text-xs font-medium text-slate-600 mb-1">
                    Total Budget
                  </label>
                  <div className="flex">
                    <select
                      id="currency"
                      aria-label="Currency"
                      className="border border-r-0 border-slate-200 rounded-l-lg px-2 py-2 text-sm bg-slate-50 focus:outline-none"
                      value={details.currency}
                      onChange={(e) => updateDetail("currency", e.target.value)}
                    >
                      <option>$</option>
                      <option>€</option>
                      <option>£</option>
                      <option>₹</option>
                    </select>
                    <input
                      type="number"
                      min={0}
                      id="total-budget"
                      aria-label="Total budget"
                      className="flex-1 border border-slate-200 rounded-r-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      value={details.budget}
                      onChange={(e) => updateDetail("budget", e.target.value)}
                    />
                  </div>
                </div>
                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-xs font-medium text-slate-600 mb-1">
                    Location
                  </label>
                  <input
                    id="location"
                    aria-label="Location"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="City or venue"
                    value={details.location}
                    onChange={(e) => updateDetail("location", e.target.value)}
                  />
                </div>
                {/* Theme */}
                <div>
                  <label htmlFor="theme" className="block text-xs font-medium text-slate-600 mb-1">
                    Theme / Style
                  </label>
                  <input
                    id="theme"
                    aria-label="Theme or style"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="e.g. Rustic, Modern, Boho"
                    value={details.theme}
                    onChange={(e) => updateDetail("theme", e.target.value)}
                  />
                </div>
                {/* Preferences */}
                <div className="col-span-2">
                  <label htmlFor="preferences" className="block text-xs font-medium text-slate-600 mb-1">
                    Special Preferences / Notes
                  </label>
                  <input
                    id="preferences"
                    aria-label="Special preferences and notes"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="Dietary restrictions, cultural traditions, music preferences…"
                    value={details.preferences}
                    onChange={(e) =>
                      updateDetail("preferences", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl" role="tablist" aria-label="Planning sections">
          {TABS.map((tab) => {
            const icons: Record<Tab, string> = {
              Budget: "💰",
              Timeline: "📅",
              Vendors: "✅",
              Ideas: "💡",
              "AI Chat": "🤖",
            };
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                aria-controls={`panel-${tab.toLowerCase().replace(" ", "-")}`}
                id={`tab-${tab.toLowerCase().replace(" ", "-")}`}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {icons[tab]} {tab}
              </button>
            );
          })}
        </div>

        {/* ══════════════════════════════════════════ */}
        {/*  BUDGET TAB                               */}
        {/* ══════════════════════════════════════════ */}
        {activeTab === "Budget" && (
          <div id="panel-budget" role="tabpanel" aria-labelledby="tab-budget" className="space-y-4">
            <TabHeader
              icon="💰"
              title="Budget Planner"
              desc="AI allocates your budget across event categories"
              onGenerate={generateBudget}
              loading={budgetLoading}
              btnLabel="Generate Budget"
            />

            {!budgetData && !budgetLoading && (
              <EmptyState
                icon="💰"
                title="AI Budget Planner"
                desc={`Enter your total budget above and click "Generate Budget" to get an AI-powered breakdown`}
              />
            )}
            {budgetLoading && (
              <LoadingState text="Gemini is calculating your optimal budget breakdown…" />
            )}

            {budgetData && !budgetLoading && (
              <div className="space-y-4">
                {/* Summary row */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    {
                      label: "Total Budget",
                      value: `${details.currency}${Number(details.budget).toLocaleString()}`,
                      cls: "bg-indigo-50 border-indigo-100 text-indigo-700",
                    },
                    {
                      label: "Per Person",
                      value: `${details.currency}${budgetData.perPersonCost?.toLocaleString()}`,
                      cls: "bg-emerald-50 border-emerald-100 text-emerald-700",
                    },
                    {
                      label: "Contingency",
                      value: `${details.currency}${budgetData.contingency?.toLocaleString()}`,
                      cls: "bg-amber-50 border-amber-100 text-amber-700",
                    },
                  ].map(({ label, value, cls }) => (
                    <div
                      key={label}
                      className={`rounded-xl p-4 border ${cls}`}
                    >
                      <p className="text-xs font-medium opacity-70">{label}</p>
                      <p className="text-2xl font-bold mt-1">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Breakdown table */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-800">
                      Budget Breakdown
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {budgetData.categories?.map((cat, i) => (
                      <div key={i} className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-slate-800">
                                {cat.name}
                              </span>
                              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                {cat.percentage}%
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">
                              {cat.description}
                            </p>
                          </div>
                          <span className="font-bold text-slate-800 ml-4">
                            {details.currency}
                            {cat.amount?.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                          <div
                            className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                          />
                        </div>
                        {cat.tips && (
                          <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-2">
                            <span className="text-amber-500 text-xs mt-0.5">
                              💡
                            </span>
                            <p className="text-xs text-amber-700">{cat.tips}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Advice */}
                {budgetData.advice && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex gap-3">
                    <span className="text-xl">🤖</span>
                    <div>
                      <p className="text-sm font-semibold text-indigo-800 mb-1">
                        AI Advice
                      </p>
                      <p className="text-sm text-indigo-700">
                        {budgetData.advice}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/*  TIMELINE TAB                             */}
        {/* ══════════════════════════════════════════ */}
        {activeTab === "Timeline" && (
          <div id="panel-timeline" role="tabpanel" aria-labelledby="tab-timeline" className="space-y-4">
            <TabHeader
              icon="📅"
              title="Timeline & Milestones"
              desc="AI generates a preparation checklist based on your event date"
              onGenerate={generateTimeline}
              loading={timelineLoading}
              btnLabel="Generate Timeline"
            />

            {!details.date && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 flex items-center gap-2">
                ⚠️ Enter your event date in the Event Details panel above for
                a personalised timeline.
              </div>
            )}

            {timeline.length === 0 && !timelineLoading && (
              <EmptyState
                icon="📅"
                title="AI Timeline Generator"
                desc={`Click "Generate Timeline" to get a step-by-step preparation checklist`}
              />
            )}
            {timelineLoading && (
              <LoadingState text="Gemini is creating your personalised timeline…" />
            )}

            {timeline.length > 0 && !timelineLoading && (
              <div className="space-y-3">
                {/* Progress bar */}
                <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3">
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${(completedMilestones / timeline.length) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-600 whitespace-nowrap">
                    {completedMilestones}/{timeline.length} done
                  </span>
                </div>

                {timeline.map((milestone) => {
                  const eventDate = new Date(details.date);
                  const milestoneDate = new Date(eventDate);
                  milestoneDate.setDate(
                    eventDate.getDate() - milestone.daysBeforeEvent
                  );

                  return (
                    <div
                      key={milestone.id}
                      className={`bg-white rounded-xl border p-4 transition-colors ${
                        milestone.completed
                          ? "border-emerald-200 bg-emerald-50/50"
                          : "border-slate-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleMilestone(milestone.id)}
                          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs transition-all ${
                            milestone.completed
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-slate-300 hover:border-emerald-400"
                          }`}
                        >
                          {milestone.completed ? "✓" : ""}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span
                              className={`font-medium ${
                                milestone.completed
                                  ? "line-through text-slate-400"
                                  : "text-slate-800"
                              }`}
                            >
                              {CATEGORY_ICONS[milestone.category] ?? "📋"}{" "}
                              {milestone.title}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                PRIORITY_COLORS[milestone.priority] ??
                                "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {milestone.priority}
                            </span>
                            <span className="text-xs text-slate-400">
                              ⏱ {milestone.estimatedTime}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-1">
                            {milestone.description}
                          </p>
                          <p className="text-xs text-slate-400">
                            📅{" "}
                            {milestoneDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}{" "}
                            ({milestone.daysBeforeEvent} days before)
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/*  VENDORS TAB                              */}
        {/* ══════════════════════════════════════════ */}
        {activeTab === "Vendors" && (
          <div id="panel-vendors" role="tabpanel" aria-labelledby="tab-vendors" className="space-y-4">
            <TabHeader
              icon="✅"
              title="Vendor Checklist"
              desc="AI-generated vendor list with booking status tracking"
              onGenerate={generateVendors}
              loading={vendorsLoading}
              btnLabel="Generate Vendor List"
            />

            {vendors.length === 0 && !vendorsLoading && (
              <EmptyState
                icon="✅"
                title="AI Vendor Checklist"
                desc={`Click "Generate Vendor List" to get a complete vendor checklist with booking tips`}
              />
            )}
            {vendorsLoading && (
              <LoadingState text="Gemini is compiling your vendor checklist…" />
            )}

            {vendors.length > 0 && !vendorsLoading && (
              <div className="space-y-4">
                {/* Progress bar */}
                {totalVendors > 0 && (
                  <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3">
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${(bookedVendors / totalVendors) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-600 whitespace-nowrap">
                      {bookedVendors}/{totalVendors} booked
                    </span>
                  </div>
                )}

                {vendors.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
                  >
                    <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                      <h3 className="font-semibold text-slate-800">
                        {cat.category}
                      </h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {cat.vendors.map((vendor) => (
                        <div
                          key={vendor.id}
                          className={`p-4 transition-colors ${
                            vendor.booked ? "bg-emerald-50/50" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="font-medium text-slate-800">
                                  {vendor.name}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${
                                    PRIORITY_COLORS[vendor.priority] ??
                                    "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {vendor.priority}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600 mb-1">
                                {vendor.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                                <span>💰 {vendor.estimatedCost}</span>
                                <span>⏰ Book {vendor.bookingLeadTime}</span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 flex-shrink-0">
                              <button
                                onClick={() =>
                                  toggleVendorBooked(cat.id, vendor.id)
                                }
                                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                                  vendor.booked
                                    ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-emerald-300"
                                }`}
                              >
                                {vendor.booked ? "✓ Booked" : "Mark Booked"}
                              </button>
                              <button
                                onClick={() =>
                                  setExpandedVendor(
                                    expandedVendor === vendor.id
                                      ? null
                                      : vendor.id
                                  )
                                }
                                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                              >
                                {expandedVendor === vendor.id
                                  ? "▲ Less"
                                  : "▼ Details"}
                              </button>
                            </div>
                          </div>

                          {expandedVendor === vendor.id && (
                            <div className="mt-3 space-y-2">
                              {vendor.tips && (
                                <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                                  <p className="text-xs font-medium text-amber-700 mb-0.5">
                                    💡 Pro Tip
                                  </p>
                                  <p className="text-xs text-amber-600">
                                    {vendor.tips}
                                  </p>
                                </div>
                              )}
                              {vendor.questions?.length > 0 && (
                                <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                                  <p className="text-xs font-medium text-blue-700 mb-1">
                                    ❓ Questions to Ask
                                  </p>
                                  <ul className="space-y-0.5">
                                    {vendor.questions.map((q, i) => (
                                      <li
                                        key={i}
                                        className="text-xs text-blue-600"
                                      >
                                        • {q}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/*  IDEAS TAB                                */}
        {/* ══════════════════════════════════════════ */}
        {activeTab === "Ideas" && (
          <div id="panel-ideas" role="tabpanel" aria-labelledby="tab-ideas" className="space-y-4">
            <TabHeader
              icon="💡"
              title="Personalized Ideas"
              desc="AI-generated themes, décor, activities, food & more"
              onGenerate={generateIdeas}
              loading={ideasLoading}
              btnLabel="Generate Ideas"
            />

            {!ideas && !ideasLoading && (
              <EmptyState
                icon="💡"
                title="AI Idea Generator"
                desc="Get personalised theme suggestions, decoration ideas, activities, food menus, and more"
              />
            )}
            {ideasLoading && (
              <LoadingState text="Gemini is crafting personalised ideas for your event…" />
            )}

            {ideas && !ideasLoading && (
              <div className="space-y-5">
                {/* Themes */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="px-5 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-800">
                      🎨 Theme Suggestions
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    {ideas.themes?.slice(0, 4).map((theme, i) => (
                      <div key={i} className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-slate-800">
                            {theme.name}
                          </span>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                            {theme.vibe}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">
                          {theme.description}
                        </p>
                        <p className="text-xs text-slate-400">
                          {theme.suitability}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Decorations */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="px-5 py-3 bg-gradient-to-r from-rose-50 to-orange-50 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-800">
                      ✨ Decoration Ideas
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
                    {ideas.decorations?.map((dec, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <span className="text-xl mt-0.5">
                          {dec.diy ? "🔨" : "🛍️"}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {dec.idea}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400">
                              {dec.estimatedCost}
                            </span>
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded-full ${
                                dec.impact === "high"
                                  ? "bg-red-100 text-red-600"
                                  : dec.impact === "medium"
                                  ? "bg-yellow-100 text-yellow-600"
                                  : "bg-green-100 text-green-600"
                              }`}
                            >
                              {dec.impact} impact
                            </span>
                            {dec.diy && (
                              <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">
                                DIY
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activities */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="px-5 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-800">
                      🎉 Activities & Entertainment
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {ideas.activities?.map((act, i) => (
                      <div key={i} className="p-4 flex items-start gap-3">
                        <span className="text-2xl">🎯</span>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-medium text-slate-800">
                              {act.name}
                            </span>
                            <span className="text-xs text-slate-400">
                              ⏱ {act.duration}
                            </span>
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded-full ${
                                act.guestEngagement === "high"
                                  ? "bg-green-100 text-green-600"
                                  : act.guestEngagement === "medium"
                                  ? "bg-yellow-100 text-yellow-600"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {act.guestEngagement} engagement
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">
                            {act.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Food */}
                {ideas.food && (
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="px-5 py-3 bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-slate-100">
                      <h3 className="font-semibold text-slate-800">
                        🍽️ Food & Drinks Menu
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                      {(
                        [
                          { label: "🥗 Appetizers", items: ideas.food.appetizers },
                          { label: "🍖 Mains", items: ideas.food.mains },
                          { label: "🍰 Desserts", items: ideas.food.desserts },
                          { label: "🥂 Drinks", items: ideas.food.drinks },
                        ] as { label: string; items: string[] }[]
                      ).map(({ label, items }) => (
                        <div key={label}>
                          <p className="text-xs font-semibold text-slate-600 mb-2">
                            {label}
                          </p>
                          <ul className="space-y-1">
                            {items?.map((item, i) => (
                              <li key={i} className="text-sm text-slate-700">
                                • {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    {ideas.food.dietaryNotes && (
                      <div className="px-4 pb-4">
                        <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2 text-xs text-green-700">
                          🌱 {ideas.food.dietaryNotes}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Unique Touches + Favors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ideas.uniqueTouches && (
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-5">
                      <h3 className="font-semibold text-slate-800 mb-3">
                        ⭐ Unique Touches
                      </h3>
                      <ul className="space-y-2">
                        {ideas.uniqueTouches.map((touch, i) => (
                          <li
                            key={i}
                            className="text-sm text-slate-700 flex items-start gap-2"
                          >
                            <span className="text-indigo-500 mt-0.5">✦</span>
                            {touch}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {ideas.favors && (
                    <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl border border-rose-100 p-5">
                      <h3 className="font-semibold text-slate-800 mb-3">
                        🎁 Guest Favors
                      </h3>
                      <ul className="space-y-2">
                        {ideas.favors.map((favor, i) => (
                          <li
                            key={i}
                            className="text-sm text-slate-700 flex items-center gap-2"
                          >
                            <span>{favor.diy ? "🔨" : "🛍️"}</span>
                            <span>{favor.idea}</span>
                            <span className="text-xs text-slate-400">
                              {favor.estimatedCost}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/*  AI CHAT TAB                              */}
        {/* ══════════════════════════════════════════ */}
        {activeTab === "AI Chat" && (
          <div id="panel-ai-chat" role="tabpanel" aria-labelledby="tab-ai-chat" className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                🤖 AI Planning Assistant
              </h2>
              <p className="text-sm text-slate-500">
                Chat with Gemini about your {meta.title} — ask anything!
              </p>
            </div>

            <div
              className="bg-white rounded-2xl border border-slate-200 flex flex-col"
              style={{ height: "520px" }}
            >
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs mr-2 flex-shrink-0 mt-0.5">
                        ✨
                      </div>
                    )}
                    <div
                      className={`max-w-lg px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white rounded-tr-sm"
                          : "bg-slate-100 text-slate-800 rounded-tl-sm"
                      }`}
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs">
                      ✨
                    </div>
                    <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1">
                        {[0, 150, 300].map((delay) => (
                          <span
                            key={delay}
                            className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${delay}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input area */}
              <div className="border-t border-slate-100 p-3">
                <div className="flex gap-2">
                  <input
                    id="chat-input"
                    aria-label={`Ask about your ${meta.title}`}
                    className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder={`Ask about your ${meta.title} — budget, vendors, ideas…`}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !e.shiftKey && sendChat()
                    }
                    disabled={chatLoading}
                  />
                  <button
                    type="button"
                    onClick={sendChat}
                    disabled={chatLoading || !chatInput.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  >
                    Send →
                  </button>
                </div>

                {/* Quick-prompt chips */}
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1 no-scrollbar">
                  {CHAT_SUGGESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setChatInput(q)}
                      className="flex-shrink-0 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-full transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
