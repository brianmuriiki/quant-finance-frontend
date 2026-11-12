import { useEffect, useMemo, useState } from "react";
import { api } from "./services/api";

export interface IdeaItem {
  _id: string;
  order: number;
  slotType: "gap" | "improve" | "unused_dataset" | "stretch";
  title: string;
  thesis: string;
  region: string;
  delay: number;
  category: string;
  datasets: string[];
  datafields: string[];
  expressionSketch: string;
  suggestedSettings?: {
    universe?: string;
    neutralization?: string;
    decay?: number;
    truncation?: number;
  };
  reasons: string[];
  correlationRisk: "low" | "medium" | "high";
  turnoverRisk: "low" | "medium" | "high";
  difficulty: "easy" | "medium" | "hard";
  estimatedMinutes: number;
  xpReward: number;
  status: "new" | "started" | "saved" | "dismissed";
  dismissReason?: string;
  feedback?: "helpful" | "not_helpful" | null;
  linkedAlphaIds?: string[];
  outcome: "none" | "tried" | "submitted" | "qualifying";
  createdAt?: string;
}

export interface IdeaBatchData {
  _id?: string;
  day: string;
  status: "generating" | "ready" | "failed";
  source: "ai" | "rule_based";
  regenerations: number;
  swaps: number;
  model?: string;
}

export interface DailyIdeasProps {
  go: (p: any) => void;
  toast: (msg: string) => void;
  onCopy: (text: string, label: string) => void;
  onStartIdea: (prefill: any) => void;
  onAskAi: (prompt: string) => void;
  activeRegion?: string;
}

export function DailyIdeas({
  go,
  toast,
  onCopy,
  onStartIdea,
  onAskAi,
  activeRegion = "USA",
}: DailyIdeasProps) {
  const [tab, setTab] = useState<"Today" | "Saved" | "History">("Today");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [batch, setBatch] = useState<IdeaBatchData | null>(null);
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [todayStr, setTodayStr] = useState<string>("");
  const [historyItems, setHistoryItems] = useState<IdeaItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [knownRegions, setKnownRegions] = useState<string[]>([activeRegion]);
  const [stats, setStats] = useState<{
    triedThisWeek: number;
    tryRatePct: number;
    submittedRatePct: number;
    qualifyingRatePct: number;
  }>({
    triedThisWeek: 0,
    tryRatePct: 0,
    submittedRatePct: 0,
    qualifyingRatePct: 0,
  });

  // Action states
  const [expandedWhy, setExpandedWhy] = useState<Record<string, boolean>>({});
  const [dismissModalId, setDismissModalId] = useState<string | null>(null);
  const [dismissReason, setDismissReason] = useState<string>("Not interested");
  const [regenerating, setRegenerating] = useState(false);
  const [swappingId, setSwappingId] = useState<string | null>(null);

  // History filters
  const [histRegion, setHistRegion] = useState("All");
  const [histCategory, setHistCategory] = useState("All");
  const [histStatus, setHistStatus] = useState("All");

  // Countdown timer to midnight UTC/local
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diffMs = tomorrow.getTime() - now.getTime();
      const hrs = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemaining(`${hrs}h ${mins}m`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch today's batch and stats
  const fetchToday = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.ideas.getToday();
      if (res && res.ideas && res.ideas.length > 0) {
        setBatch(res.batch);
        setIdeas(res.ideas);
        setTodayStr(res.today || new Date().toISOString().slice(0, 10));
      } else {
        setError("No daily ideas available from server. Click Regenerate to fetch your personalized ideas.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load ideas from server");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const s = await api.ideas.getStats();
      if (s) {
        setStats({
          triedThisWeek: s.triedThisWeek || 0,
          tryRatePct: s.tryRatePct || 0,
          submittedRatePct: s.submittedRatePct || 0,
          qualifyingRatePct: s.qualifyingRatePct || 0,
        });
      }
    } catch {}
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const res = await api.ideas.list({ limit: 50 });
      setHistoryItems(Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : "Could not load idea history");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchToday();
    fetchStats();
    api.regions.list().then((res) => setKnownRegions(res.regions.map((region) => region.code))).catch(() => {});
  }, []);

  useEffect(() => {
    if (tab === "History") {
      fetchHistory();
    }
  }, [tab]);

  // Derived metrics
  const triedCount = useMemo(() => {
    return ideas.filter((i) => i.status === "started" || i.outcome !== "none").length;
  }, [ideas]);

  const allHandled = useMemo(() => {
    return ideas.length > 0 && ideas.every((i) => i.status !== "new");
  }, [ideas]);

  // Handlers
  const handleStart = async (idea: IdeaItem) => {
    try {
      toast(`Starting "${idea.title}"...`);
      const res = await api.ideas.start(idea._id);
      setIdeas((prev) =>
        prev.map((i) => (i._id === idea._id ? { ...i, status: "started", outcome: "tried" } : i))
      );
      onStartIdea(res.prefill);
      fetchStats();
    } catch (err: any) {
      toast(`Failed to start idea: ${err.message}`);
    }
  };

  const handleSaveLater = async (idea: IdeaItem) => {
    const nextStatus = idea.status === "saved" ? "new" : "saved";
    try {
      await api.ideas.update(idea._id, { status: nextStatus });
      setIdeas((prev) =>
        prev.map((i) => (i._id === idea._id ? { ...i, status: nextStatus } : i))
      );
      toast(nextStatus === "saved" ? `Saved "${idea.title}" to your list` : `Unsaved "${idea.title}"`);
    } catch {
      setIdeas((prev) =>
        prev.map((i) => (i._id === idea._id ? { ...i, status: nextStatus } : i))
      );
      toast(nextStatus === "saved" ? `Saved "${idea.title}"` : `Unsaved "${idea.title}"`);
    }
  };

  const handleDismiss = async () => {
    if (!dismissModalId) return;
    try {
      await api.ideas.update(dismissModalId, { status: "dismissed", dismissReason });
      setIdeas((prev) =>
        prev.map((i) => (i._id === dismissModalId ? { ...i, status: "dismissed", dismissReason } : i))
      );
      toast("Idea dismissed");
    } catch {
      setIdeas((prev) =>
        prev.map((i) => (i._id === dismissModalId ? { ...i, status: "dismissed", dismissReason } : i))
      );
      toast("Idea dismissed");
    } finally {
      setDismissModalId(null);
    }
  };

  const handleFeedback = async (idea: IdeaItem, feedback: "helpful" | "not_helpful") => {
    const nextFeedback = idea.feedback === feedback ? null : feedback;
    try {
      await api.ideas.update(idea._id, { feedback: nextFeedback });
      setIdeas((prev) =>
        prev.map((i) => (i._id === idea._id ? { ...i, feedback: nextFeedback } : i))
      );
      if (nextFeedback) toast(nextFeedback === "helpful" ? "Marked helpful 👍" : "Feedback noted 👎");
    } catch {
      setIdeas((prev) =>
        prev.map((i) => (i._id === idea._id ? { ...i, feedback: nextFeedback } : i))
      );
    }
  };

  const handleSwap = async (idea: IdeaItem) => {
    setSwappingId(idea._id);
    try {
      const res = await api.ideas.swap(idea._id);
      if (res && res.idea) {
        setIdeas((prev) => prev.map((i) => (i._id === idea._id ? res.idea : i)));
        if (res.batch) setBatch(res.batch);
        toast(`Swapped with fresh idea "${res.idea.title}"`);
      } else {
        toast("Swap limit reached for today or server offline");
      }
    } catch (err: any) {
      toast(err?.message || "Could not swap idea");
    } finally {
      setSwappingId(null);
    }
  };

  const handleRegenerate = async () => {
    if (batch && batch.regenerations >= 1) {
      toast("Daily limit reached: only 1 full batch regeneration allowed per day");
      return;
    }
    setRegenerating(true);
    try {
      const res = await api.ideas.regenerateToday();
      if (res && res.ideas) {
        setBatch(res.batch);
        setIdeas(res.ideas);
        toast("Generated 5 fresh ideas for today!");
      }
    } catch (err: any) {
      toast(err?.message || "Regeneration failed");
    } finally {
      setRegenerating(false);
    }
  };

  const handleAskAi = (idea: IdeaItem) => {
    const prompt = `Evaluate this alpha idea for ${idea.region} (Delay-${idea.delay}):
Title: ${idea.title}
Thesis: ${idea.thesis}
Expression sketch: ${idea.expressionSketch}
Datasets: ${idea.datasets.join(", ")}
Datafields: ${idea.datafields.join(", ")}
Suggested settings: universe=${idea.suggestedSettings?.universe || "TOP3000"}, neutralization=${idea.suggestedSettings?.neutralization || "SUBINDUSTRY"}.

How can I refine this formula to maximize Sharpe ratio and minimize turnover/correlation?`;
    onAskAi(prompt);
    go("AI Assistant");
  };

  // Filtered saved and history lists
  const savedIdeas = useMemo(() => ideas.filter((i) => i.status === "saved"), [ideas]);

  const filteredHistory = useMemo(() => {
    return historyItems.filter((i) => {
      const matchReg = histRegion === "All" || i.region === histRegion;
      const matchCat = histCategory === "All" || i.category === histCategory.toLowerCase();
      const matchStat = histStatus === "All" || i.status === histStatus.toLowerCase() || i.outcome === histStatus.toLowerCase();
      return matchReg && matchCat && matchStat;
    });
  }, [historyItems, histRegion, histCategory, histStatus]);

  // Format date display
  const todayFormatted = useMemo(() => {
    try {
      const date = todayStr ? new Date(`${todayStr}T00:00:00`) : new Date();
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).toUpperCase();
    } catch {
      return "TODAY";
    }
  }, [todayStr]);

  return (
    <div className="page daily-ideas-page">
      {/* Page Header */}
      <header className="page-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: "8px", letterSpacing: "0.08em" }}>
            <span>{todayFormatted}</span>
            <span>·</span>
            <span style={{ color: "var(--accent)" }}>{activeRegion} REGION</span>
          </div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
            <span>5 ideas for today</span>
            <span style={{ fontSize: "14px", fontWeight: "600", padding: "4px 10px", borderRadius: "20px", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--muted)" }}>
              Hypotheses, not promises
            </span>
          </h1>
          <p style={{ maxWidth: "700px", color: "var(--muted)", margin: "4px 0 0 0", fontSize: "13.5px" }}>
            Personalized alpha hypotheses built from your uploaded datasets, pyramid gaps, and unutilized fields. AI-generated suggestions — test before relying on them.
          </p>
        </div>

        {/* Progress Ring & Countdown Widget */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "var(--surface)", border: "1px solid var(--border)", padding: "10px 18px", borderRadius: "14px", boxShadow: "var(--shadow)" }}>
          <div style={{ position: "relative", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="48" height="48" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--border)"
                strokeWidth="3.2"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="3.2"
                strokeDasharray={`${(triedCount / 5) * 100}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <div style={{ position: "absolute", textAlign: "center", lineHeight: "1" }}>
              <span style={{ fontSize: "14px", fontWeight: "800", color: "var(--text)" }}>{triedCount}</span>
              <span style={{ fontSize: "10px", color: "var(--muted)" }}>/5</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: triedCount >= 5 ? "var(--green)" : "var(--accent)" }}>
              {triedCount >= 5 ? "All 5 explored!" : `${triedCount} of 5 tried`}
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--muted)", marginTop: "2px" }}>
              Next batch in <strong style={{ color: "var(--text)" }}>{timeRemaining || "tonight"}</strong>
            </div>
          </div>
          {batch && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: "12px", padding: "6px 12px", marginLeft: "6px" }}
              disabled={regenerating || batch.regenerations >= 1}
              onClick={handleRegenerate}
              title={batch.regenerations >= 1 ? "1 regeneration limit reached today" : "Regenerate today's ideas"}
            >
              {regenerating ? "Generating..." : "Regenerate batch"}
            </button>
          )}
        </div>
      </header>

      {/* AI Fallback / Offline Notice Banner */}
      {batch?.source === "rule_based" && (
        <div style={{ background: "rgba(214, 138, 22, 0.08)", border: "1px solid rgba(214, 138, 22, 0.3)", borderRadius: "10px", padding: "10px 16px", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "var(--amber)" }}>
          <span style={{ fontSize: "16px" }}>⚡</span>
          <span>
            <strong>Showing rule-based ideas today:</strong> AI generation fallback engaged. You still receive 5 personalized, gap-targeted hypotheses built deterministically from your dataset catalog.
          </span>
        </div>
      )}

      {/* Personal Stats Strip */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "1.25rem" }}>
        <div className="card" style={{ padding: "14px 18px", display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "11.5px", fontWeight: "600", textTransform: "uppercase", color: "var(--muted)" }}>Ideas tried this week</span>
          <span style={{ fontSize: "22px", fontWeight: "800", marginTop: "4px", color: "var(--text)" }}>{stats.triedThisWeek}</span>
          <span style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>Aiming for 10+ weekly</span>
        </div>
        <div className="card" style={{ padding: "14px 18px", display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "11.5px", fontWeight: "600", textTransform: "uppercase", color: "var(--muted)" }}>Try rate</span>
          <span style={{ fontSize: "22px", fontWeight: "800", marginTop: "4px", color: "var(--accent)" }}>{stats.tryRatePct}%</span>
          <span style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>Of daily batches loaded</span>
        </div>
        <div className="card" style={{ padding: "14px 18px", display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "11.5px", fontWeight: "600", textTransform: "uppercase", color: "var(--muted)" }}>Submitted share</span>
          <span style={{ fontSize: "22px", fontWeight: "800", marginTop: "4px", color: "var(--blue)" }}>{stats.submittedRatePct}%</span>
          <span style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>Converted to vault alphas</span>
        </div>
        <div className="card" style={{ padding: "14px 18px", display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "11.5px", fontWeight: "600", textTransform: "uppercase", color: "var(--muted)" }}>Qualifying share</span>
          <span style={{ fontSize: "22px", fontWeight: "800", marginTop: "4px", color: "var(--green)" }}>{stats.qualifyingRatePct}%</span>
          <span style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>Passed Sharpe & fitness checks</span>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", marginBottom: "1.25rem", paddingBottom: "2px" }}>
        <div style={{ display: "flex", gap: "20px" }}>
          {(["Today", "Saved", "History"] as const).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: tab === t ? "2px solid var(--accent)" : "2px solid transparent",
                padding: "8px 4px",
                fontWeight: tab === t ? "700" : "500",
                color: tab === t ? "var(--text)" : "var(--muted)",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>{t}</span>
              {t === "Today" && <span style={{ fontSize: "11px", padding: "1px 6px", borderRadius: "10px", background: "var(--surface-2)", color: "var(--muted)" }}>5</span>}
              {t === "Saved" && savedIdeas.length > 0 && <span style={{ fontSize: "11px", padding: "1px 6px", borderRadius: "10px", background: "rgba(214, 138, 22, 0.15)", color: "var(--amber)", fontWeight: "700" }}>{savedIdeas.length}</span>}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ fontSize: "12px", padding: "4px 8px" }}
            onClick={() => go("Settings")}
          >
            Preferences
          </button>
        </div>
      </div>

      {/* TAB CONTENT: TODAY */}
      {tab === "Today" && (
        <>
          {/* Calm completion banner when all 5 handled */}
          {allHandled && (
            <div className="card" style={{ padding: "14px 20px", marginBottom: "1.25rem", background: "rgba(24, 166, 106, 0.05)", border: "1px solid rgba(24, 166, 106, 0.2)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>✨</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: "14px", color: "var(--green)" }}>You've reviewed all 5 ideas today</h4>
                  <p style={{ margin: 0, fontSize: "12.5px", color: "var(--muted)" }}>Great work expanding your coverage pyramid. Tomorrow's fresh batch arrives in {timeRemaining || "a few hours"}.</p>
                </div>
              </div>
              <button type="button" className="btn btn-secondary" style={{ fontSize: "12px" }} onClick={() => go("Alpha Vault")}>
                Go to Alpha Vault
              </button>
            </div>
          )}

          {/* Skeleton Loading State */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[1, 2, 3].map((n) => (
                <div key={n} className="card" style={{ padding: "24px", opacity: 0.6 }}>
                  <div style={{ height: "20px", width: "40%", background: "var(--border)", borderRadius: "4px", marginBottom: "12px" }} />
                  <div style={{ height: "14px", width: "70%", background: "var(--border)", borderRadius: "4px", marginBottom: "16px" }} />
                  <div style={{ height: "40px", width: "100%", background: "var(--border)", borderRadius: "6px" }} />
                </div>
              ))}
              <div style={{ textAlign: "center", color: "var(--muted)", fontSize: "13px", padding: "1rem" }}>
                Preparing your personalized ideas...
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="card" style={{ padding: "32px", textAlign: "center" }}>
              <p style={{ color: "var(--red)", marginBottom: "1rem" }}>{error}</p>
              <button type="button" className="btn btn-primary" onClick={fetchToday}>
                Retry loading ideas
              </button>
            </div>
          )}

          {/* Ideas List */}
          {!loading && !error && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {ideas.map((idea, idx) => (
                <article
                  key={idea._id}
                  className="card"
                  style={{
                    padding: "20px 24px",
                    position: "relative",
                    borderLeft: idea.status === "started" || idea.outcome !== "none"
                      ? "4px solid var(--accent)"
                      : idea.status === "saved"
                        ? "4px solid var(--amber)"
                        : "4px solid transparent",
                    opacity: idea.status === "dismissed" ? 0.5 : 1,
                    transition: "all 0.2s ease",
                  }}
                >
                  {/* Top Bar: Order & Slot Badge, Risk and Status */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "800", color: "var(--muted)" }}>#{idx + 1}</span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          background: idea.slotType === "gap"
                            ? "rgba(109, 92, 231, 0.12)"
                            : idea.slotType === "improve"
                              ? "rgba(214, 138, 22, 0.12)"
                              : idea.slotType === "unused_dataset"
                                ? "rgba(78, 140, 247, 0.12)"
                                : "rgba(24, 166, 106, 0.12)",
                          color: idea.slotType === "gap"
                            ? "var(--accent)"
                            : idea.slotType === "improve"
                              ? "var(--amber)"
                              : idea.slotType === "unused_dataset"
                                ? "var(--blue)"
                                : "var(--green)",
                        }}
                      >
                        {idea.slotType === "gap" && "Pyramid Gap"}
                        {idea.slotType === "improve" && "Improve Quality"}
                        {idea.slotType === "unused_dataset" && "Fresh Dataset"}
                        {idea.slotType === "stretch" && "Cross-Category Stretch"}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {/* Status Badge */}
                      <span
                        className={`badge ${
                          idea.status === "started" || idea.outcome === "tried"
                            ? "badge-blue"
                            : idea.outcome === "submitted"
                              ? "badge-violet"
                              : idea.outcome === "qualifying"
                                ? "badge-green"
                                : idea.status === "saved"
                                  ? "badge-amber"
                                  : idea.status === "dismissed"
                                    ? "badge-neutral"
                                    : "badge-neutral"
                        }`}
                        style={{ textTransform: "capitalize", fontWeight: "600" }}
                      >
                        {idea.outcome === "qualifying"
                          ? "Qualifying ⭐"
                          : idea.outcome === "submitted"
                            ? "Submitted 🚀"
                            : idea.status === "started" || idea.outcome === "tried"
                              ? "Started ⚡"
                              : idea.status}
                      </span>
                    </div>
                  </div>

                  {/* Title and Thesis */}
                  <div style={{ marginBottom: "12px" }}>
                    <h3 style={{ margin: "0 0 6px 0", fontSize: "16px", fontWeight: "700", color: "var(--text)" }}>
                      {idea.title}
                    </h3>
                    <p style={{ margin: 0, fontSize: "13.5px", lineHeight: "1.45", color: "var(--muted)" }}>
                      {idea.thesis}
                    </p>
                  </div>

                  {/* Metadata Chips Row */}
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px", marginBottom: "14px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "4px", background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                      {idea.region}
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "4px", background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                      Delay-{idea.delay}
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: "600", textTransform: "capitalize", padding: "2px 8px", borderRadius: "4px", background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                      {idea.category}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        textTransform: "capitalize",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background: idea.difficulty === "easy" ? "rgba(24, 166, 106, 0.1)" : idea.difficulty === "medium" ? "rgba(214, 138, 22, 0.1)" : "rgba(225, 75, 86, 0.1)",
                        color: idea.difficulty === "easy" ? "var(--green)" : idea.difficulty === "medium" ? "var(--amber)" : "var(--red)",
                      }}
                    >
                      {idea.difficulty}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--muted)", padding: "2px 6px" }}>
                      ⏱ ~{idea.estimatedMinutes || 15}m
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--accent)", padding: "2px 6px" }}>
                      +{idea.xpReward || 25} XP
                    </span>
                  </div>

                  {/* Datasets and Datafields Chips */}
                  <div style={{ marginBottom: "14px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "11.5px", color: "var(--muted)", marginRight: "4px" }}>Datafields:</span>
                    {idea.datasets.map((ds) => (
                      <span key={ds} style={{ fontSize: "11px", fontWeight: "600", background: "var(--surface-2)", border: "1px dashed var(--border)", padding: "2px 8px", borderRadius: "4px", color: "var(--text)" }}>
                        📁 {ds}
                      </span>
                    ))}
                    {idea.datafields.map((f) => {
                      // Check if field is already used
                      const isUsed = f.includes("close") || f.includes("volume") || f.includes("turnover");
                      return (
                        <span
                          key={f}
                          title={isUsed ? "used in submitted alphas (heuristic check)" : "unused fresh datafield"}
                          style={{
                            fontSize: "11px",
                            fontFamily: "var(--font-mono)",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            background: isUsed ? "rgba(225, 75, 86, 0.12)" : "var(--surface-2)",
                            border: isUsed ? "1px solid rgba(225, 75, 86, 0.25)" : "1px solid var(--border)",
                            color: isUsed ? "var(--red)" : "var(--text)",
                          }}
                        >
                          {f}
                        </span>
                      );
                    })}
                  </div>

                  {/* Expression Sketch Monospace Box */}
                  <div style={{ position: "relative", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 14px", marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", fontWeight: "600" }}>
                        Expression sketch (starting point)
                      </span>
                      <button
                        type="button"
                        onClick={() => onCopy(idea.expressionSketch, "Expression sketch")}
                        style={{ background: "transparent", border: "none", color: "var(--accent)", fontSize: "11.5px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        Copy
                      </button>
                    </div>
                    <code style={{ fontSize: "13px", color: "var(--text)", wordBreak: "break-all", display: "block" }}>
                      {idea.expressionSketch}
                    </code>
                  </div>

                  {/* Suggested Settings & Risk Heuristics */}
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px", fontSize: "11.5px", color: "var(--muted)", marginBottom: "14px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                      <span>Universe: <strong style={{ color: "var(--text)" }}>{idea.suggestedSettings?.universe || "TOP3000"}</strong></span>
                      <span>Neut: <strong style={{ color: "var(--text)" }}>{idea.suggestedSettings?.neutralization || "SUBINDUSTRY"}</strong></span>
                      <span>Decay: <strong style={{ color: "var(--text)" }}>{idea.suggestedSettings?.decay ?? 4}</strong></span>
                      <span>Trunc: <strong style={{ color: "var(--text)" }}>{idea.suggestedSettings?.truncation ?? 0.08}</strong></span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span title="Datafield-overlap heuristic estimate">
                        Overlap Risk: <strong style={{ color: idea.correlationRisk === "low" ? "var(--green)" : idea.correlationRisk === "medium" ? "var(--amber)" : "var(--red)" }}>{idea.correlationRisk}</strong>
                      </span>
                      <span>
                        Turnover Risk: <strong style={{ color: idea.turnoverRisk === "low" ? "var(--green)" : idea.turnoverRisk === "medium" ? "var(--amber)" : "var(--red)" }}>{idea.turnoverRisk}</strong>
                      </span>
                    </div>
                  </div>

                  {/* "Why Today" Expandable Section */}
                  {idea.reasons && idea.reasons.length > 0 && (
                    <div style={{ marginBottom: "14px" }}>
                      <button
                        type="button"
                        onClick={() => setExpandedWhy((prev) => ({ ...prev, [idea._id]: !prev[idea._id] }))}
                        style={{
                          background: "transparent",
                          border: "none",
                          padding: 0,
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "var(--accent)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span>{expandedWhy[idea._id] ? "▾ Hide why today" : "▸ Why today?"}</span>
                      </button>
                      {expandedWhy[idea._id] && (
                        <ul style={{ margin: "6px 0 0 0", paddingLeft: "18px", fontSize: "12px", color: "var(--muted)", lineHeight: "1.5" }}>
                          {idea.reasons.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", borderTop: "1px solid var(--border)", paddingTop: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ fontSize: "12.5px", padding: "6px 14px" }}
                        onClick={() => handleStart(idea)}
                      >
                        Start alpha
                      </button>

                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ fontSize: "12.5px", padding: "6px 12px" }}
                        onClick={() => handleSaveLater(idea)}
                      >
                        {idea.status === "saved" ? "Saved ✓" : "Save for later"}
                      </button>

                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ fontSize: "12px", padding: "6px 10px" }}
                        onClick={() => handleAskAi(idea)}
                      >
                        Ask AI about this idea
                      </button>

                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ fontSize: "12px", padding: "6px 8px" }}
                        disabled={swappingId === idea._id || Boolean(batch && batch.swaps >= 2)}
                        onClick={() => handleSwap(idea)}
                        title={batch && batch.swaps >= 2 ? "Swap limit reached for today" : "Swap with alternative idea"}
                      >
                        {swappingId === idea._id ? "Swapping..." : "Swap"}
                      </button>

                      {idea.status !== "dismissed" && (
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{ fontSize: "12px", padding: "6px 8px", color: "var(--muted)" }}
                          onClick={() => setDismissModalId(idea._id)}
                        >
                          Dismiss
                        </button>
                      )}
                    </div>

                    {/* Feedback Buttons */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => handleFeedback(idea, "helpful")}
                        title="Helpful idea"
                        style={{
                          background: idea.feedback === "helpful" ? "rgba(24, 166, 106, 0.15)" : "transparent",
                          border: "1px solid",
                          borderColor: idea.feedback === "helpful" ? "var(--green)" : "var(--border)",
                          borderRadius: "6px",
                          padding: "4px 8px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        👍
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFeedback(idea, "not_helpful")}
                        title="Not helpful"
                        style={{
                          background: idea.feedback === "not_helpful" ? "rgba(225, 75, 86, 0.15)" : "transparent",
                          border: "1px solid",
                          borderColor: idea.feedback === "not_helpful" ? "var(--red)" : "var(--border)",
                          borderRadius: "6px",
                          padding: "4px 8px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        👎
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB CONTENT: SAVED */}
      {tab === "Saved" && (
        <div>
          {savedIdeas.length === 0 ? (
            <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>📌</div>
              <h3 style={{ margin: "0 0 6px 0", color: "var(--text)" }}>No saved ideas</h3>
              <p style={{ margin: 0, fontSize: "13px" }}>Click "Save for later" on any idea card to keep it in this list.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {savedIdeas.map((idea) => (
                <div key={idea._id} className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h4 style={{ margin: "0 0 4px 0", fontSize: "15px" }}>{idea.title}</h4>
                    <p style={{ margin: 0, fontSize: "12.5px", color: "var(--muted)" }}>{idea.thesis}</p>
                    <code style={{ fontSize: "12px", marginTop: "6px", display: "inline-block", color: "var(--accent)" }}>{idea.expressionSketch}</code>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button type="button" className="btn btn-primary" style={{ fontSize: "12px" }} onClick={() => handleStart(idea)}>
                      Start alpha
                    </button>
                    <button type="button" className="btn btn-ghost" style={{ fontSize: "12px" }} onClick={() => handleSaveLater(idea)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: HISTORY */}
      {tab === "History" && (
        <div>
          {/* History Filters */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
            <select
              value={histRegion}
              onChange={(e) => setHistRegion(e.target.value)}
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", padding: "6px 12px", fontSize: "12.5px" }}
            >
              <option value="All">All Regions</option>
              {[...new Set([...knownRegions, ...historyItems.map((idea) => idea.region)])].filter(Boolean).map((region) => <option key={region} value={region}>{region}</option>)}
            </select>

            <select
              value={histCategory}
              onChange={(e) => setHistCategory(e.target.value)}
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", padding: "6px 12px", fontSize: "12.5px" }}
            >
              <option value="All">All Categories</option>
              <option value="fundamentals">Fundamentals</option>
              <option value="market">Market (Price-Vol)</option>
              <option value="analyst">Analyst</option>
              <option value="news">News</option>
              <option value="options">Options</option>
            </select>

            <select
              value={histStatus}
              onChange={(e) => setHistStatus(e.target.value)}
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", padding: "6px 12px", fontSize: "12.5px" }}
            >
              <option value="All">All Outcomes</option>
              <option value="tried">Tried</option>
              <option value="submitted">Submitted</option>
              <option value="qualifying">Qualifying</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>

          {historyLoading ? (
            <div style={{ textAlign: "center", padding: "30px", color: "var(--muted)" }}>Loading history...</div>
          ) : historyError ? (
            <div className="card" role="alert" style={{ padding: "30px", textAlign: "center", color: "var(--red)" }}>{historyError}<div><button type="button" className="btn btn-secondary" onClick={fetchHistory}>Retry</button></div></div>
          ) : filteredHistory.length === 0 ? (
            <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>📜</div>
              <h3 style={{ margin: "0 0 6px 0", color: "var(--text)" }}>No past ideas recorded</h3>
              <p style={{ margin: 0, fontSize: "13px" }}>As daily ideas are generated and tested, your progression will appear here.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {filteredHistory.map((item) => (
                <div key={item._id} className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong style={{ fontSize: "14px" }}>{item.title}</strong>
                      <span className="badge badge-neutral" style={{ fontSize: "10px" }}>{item.region}</span>
                      <span className="badge badge-neutral" style={{ fontSize: "10px" }}>{item.category}</span>
                    </div>
                    <p style={{ margin: "3px 0 0 0", fontSize: "12px", color: "var(--muted)" }}>{item.thesis}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      className={`badge ${
                        item.outcome === "qualifying"
                          ? "badge-green"
                          : item.outcome === "submitted"
                            ? "badge-violet"
                            : item.outcome === "tried" || item.status === "started"
                              ? "badge-blue"
                              : "badge-neutral"
                      }`}
                    >
                      {item.outcome === "qualifying"
                        ? "Qualifying"
                        : item.outcome === "submitted"
                          ? "Submitted"
                          : item.outcome === "tried" || item.status === "started"
                            ? "Tried"
                            : item.status}
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: "11.5px", padding: "4px 8px" }}
                      onClick={() => handleStart(item)}
                    >
                      Use
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dismiss Modal Dialog */}
      {dismissModalId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => setDismissModalId(null)}
        >
          <div
            className="card"
            style={{ width: "100%", maxWidth: "420px", padding: "24px", background: "var(--surface)", boxShadow: "var(--shadow)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>Dismiss idea</h3>
            <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "var(--muted)" }}>
              Why are you dismissing this idea? Your feedback helps tailor future daily recommendations.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "18px" }}>
              {[
                "Not interested",
                "Too high correlation to existing alphas",
                "Insufficient data available",
                "Turnover too high for my strategy",
                "Other",
              ].map((r) => (
                <label key={r} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="dismissReason"
                    value={r}
                    checked={dismissReason === r}
                    onChange={(e) => setDismissReason(e.target.value)}
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button type="button" className="btn btn-ghost" onClick={() => setDismissModalId(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDismiss}>
                Confirm dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
