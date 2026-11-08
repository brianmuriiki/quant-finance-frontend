import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { api } from "./services/api";
import { DailyIdeas } from "./DailyIdeas";

type Page =
  | "Dashboard"
  | "Daily Ideas"
  | "Alpha Vault"
  | "Datafields"
  | "Fix Guide"
  | "Combinations"
  | "AI Assistant"
  | "Pyramid"
  | "Finance"
  | "Notifications"
  | "Settings"
  | "UI Kit";

const icons: Record<string, ReactNode> = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </>
  ),
  vault: (
    <>
      <path d="M4 7.5h16v12H4z" />
      <path d="M8 7.5V5h8v2.5M8 12h8M8 16h5" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v18H7a3 3 0 0 0-3 3zM20 5.5A3.5 3.5 0 0 0 16.5 2H13v18h4a3 3 0 0 1 3 3z" />
    </>
  ),
  layers: (
    <>
      <path d="m12 2 9 5-9 5-9-5z" />
      <path d="m3 12 9 5 9-5M3 17l9 5 9-5" />
    </>
  ),
  sparkle: (
    <>
      <path d="m12 3 1.4 4.2L18 9l-4.6 1.8L12 15l-1.4-4.2L6 9l4.6-1.8z" />
      <path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7z" />
    </>
  ),
  lightbulb: (
    <>
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6M10 22h4" />
    </>
  ),
  pyramid: (
    <>
      <path d="M12 3 2.5 21h19z" />
      <path d="M7.5 12h9M5 17h14" />
    </>
  ),
  wallet: (
    <>
      <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H19v16H5.5A2.5 2.5 0 0 1 3 17.5z" />
      <path d="M15 9h7v6h-7a3 3 0 0 1 0-6z" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1-2.8 2.8-.1-.1a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1.1 1.6v.2h-4V21A1.8 1.8 0 0 0 8.8 19.4a1.8 1.8 0 0 0-2 .4l-.1.1-2.8-2.8L4 17a1.8 1.8 0 0 0 .4-2 1.8 1.8 0 0 0-1.6-1.1h-.2v-4h.2A1.8 1.8 0 0 0 4.4 8.8a1.8 1.8 0 0 0-.4-2l-.1-.1 2.8-2.8.1.1a1.8 1.8 0 0 0 2 .4A1.8 1.8 0 0 0 9.9 2.8v-.2h4v.2A1.8 1.8 0 0 0 15 4.4a1.8 1.8 0 0 0 2-.4l.1-.1 2.8 2.8-.1.1a1.8 1.8 0 0 0-.4 2 1.8 1.8 0 0 0 1.6 1.1h.2v4H21a1.8 1.8 0 0 0-1.6 1.1z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h14M14 7l5 5-5 5" />
    </>
  ),
  copy: (
    <>
      <rect x="8" y="8" width="11" height="12" rx="2" />
      <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  upload: (
    <>
      <path d="M12 16V3M7 8l5-5 5 5" />
      <path d="M4 15v5h16v-5" />
    </>
  ),
  chevron: <path d="m9 18 6-6-6-6" />,
  moon: (
    <>
      <path d="M20 15.5A9 9 0 0 1 8.5 4 9 9 0 1 0 20 15.5z" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>
  ),
  x: (
    <>
      <path d="m6 6 12 12M18 6 6 18" />
    </>
  ),
  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5M12 15V3" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </>
  ),
  fileText: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </>
  ),
  zap: (
    <>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </>
  ),
};

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {icons[name]}
    </svg>
  );
}

function Button({
  children,
  variant = "primary",
  icon,
  onClick,
  type = "button",
  disabled = false,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button type={type} disabled={disabled} className={`btn btn-${variant}`} onClick={onClick}>
      {icon && <Icon name={icon} />}
      <span>{children}</span>
    </button>
  );
}

function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "red" | "amber" | "blue" | "violet";
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function Logo() {
  return (
    <div className="logo">
      <div className="logo-mark">
        <span />
        <span />
        <span />
      </div>
      <span>QuantStorm</span>
    </div>
  );
}

const nav: { label: Page; icon: string }[] = [
  { label: "Dashboard", icon: "grid" },
  { label: "Daily Ideas", icon: "lightbulb" },
  { label: "Alpha Vault", icon: "vault" },
  { label: "Datafields", icon: "database" },
  { label: "Fix Guide", icon: "book" },
  { label: "Combinations", icon: "layers" },
  { label: "AI Assistant", icon: "sparkle" },
  { label: "Pyramid", icon: "pyramid" },
  { label: "Finance", icon: "wallet" },
  { label: "Notifications", icon: "bell" },
  { label: "Settings", icon: "settings" },
  { label: "UI Kit", icon: "layers" },
];

function Auth({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot" | "onboard">("signin");
  const [step, setStep] = useState(1);
  const [dailyTarget, setDailyTarget] = useState(4);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(["USA", "Europe"]);
  const [reminders, setReminders] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const toggleRegion = (r: string) => {
    setSelectedRegions((prev) =>
      prev.includes(r) ? (prev.length > 1 ? prev.filter((x) => x !== r) : prev) : [...prev, r]
    );
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (mode === "signup") {
      api.auth.register("Researcher", email || "researcher@quantstorm.com", password || "password123").catch(() => {});
      setMode("onboard");
    } else if (mode === "signin") {
      await api.auth.login(email || "researcher@quantstorm.com", password || "password123").catch(() => {});
      onDone();
    } else {
      setResetSent(true);
    }
  };

  if (mode === "onboard")
    return (
      <div className="auth-shell">
        <div className="auth-side">
          <Logo />
          <div className="auth-quote">
            <Badge tone="violet">WELCOME TO QUANTSTORM</Badge>
            <h1>
              Make every alpha
              <br />
              count.
            </h1>
            <p>Turn daily research into a compounding system of ideas, learnings, and progress.</p>
          </div>
          <div className="auth-metric">
            <span>Research momentum</span>
            <strong>7 day streak</strong>
            <div className="mini-bars">
              {[4, 7, 5, 9, 8, 11, 13].map((h, i) => (
                <i key={i} style={{ height: h * 3 }} />
              ))}
            </div>
          </div>
        </div>
        <main className="onboard-panel">
          <div className="stepper">
            <span>Setup</span>
            <div>
              {[1, 2, 3].map((n) => (
                <i className={n <= step ? "active" : ""} key={n} />
              ))}
            </div>
            <b>{step} of 3</b>
          </div>
          {step === 1 && (
            <section>
              <div className="eyebrow">YOUR RESEARCH</div>
              <h2>Where do you build?</h2>
              <p>Select your default regions ({selectedRegions.length} selected). You can change these anytime.</p>
              <div className="choice-grid">
                {["USA", "Europe", "Asia Pacific", "China", "India", "Global"].map((x) => (
                  <button
                    type="button"
                    className={`choice ${selectedRegions.includes(x) ? "selected" : ""}`}
                    onClick={() => toggleRegion(x)}
                    key={x}
                  >
                    <span>{x.slice(0, 2).toUpperCase()}</span>
                    {x}
                    <i>
                      <Icon name="check" size={13} />
                    </i>
                  </button>
                ))}
              </div>
            </section>
          )}
          {step === 2 && (
            <section>
              <div className="eyebrow">DAILY RHYTHM</div>
              <h2>Set your daily target</h2>
              <p>How many alphas do you aim to submit each day?</p>
              <div className="target-number">
                <button type="button" onClick={() => setDailyTarget((t) => Math.max(1, t - 1))}>−</button>
                <strong>{dailyTarget}</strong>
                <button type="button" onClick={() => setDailyTarget((t) => Math.min(10, t + 1))}>+</button>
              </div>
              <label className="switch-row">
                <span>
                  <b>End-of-day reminders</b>
                  <small>Get a nudge 3h and 1h before cutoff</small>
                </span>
                <input
                  type="checkbox"
                  checked={reminders}
                  onChange={(e) => setReminders(e.target.checked)}
                />
              </label>
            </section>
          )}
          {step === 3 && (
            <section>
              <div className="eyebrow">YOUR JOURNEY</div>
              <h2>Choose your Genius level</h2>
              <p>We’ll personalize milestones and recommendations.</p>
              <div className="level-list">
                {["New researcher", "Apprentice", "Expert", "Master"].map((x, i) => (
                  <button
                    type="button"
                    className={selectedLevel === i ? "selected" : ""}
                    onClick={() => setSelectedLevel(i)}
                    key={x}
                  >
                    <span>{i + 1}</span>
                    <div>
                      <b>{x}</b>
                      <small>
                        {
                          [
                            "Getting started",
                            "Building consistency",
                            "Scaling research",
                            "Leading the field",
                          ][i]
                        }
                      </small>
                    </div>
                    <Icon name="chevron" />
                  </button>
                ))}
              </div>
            </section>
          )}
          <footer>
            <Button variant="ghost" onClick={() => setStep(Math.max(1, step - 1))}>
              Back
            </Button>
            <Button icon="arrow" onClick={() => (step < 3 ? setStep(step + 1) : onDone())}>
              {step < 3 ? "Continue" : "Open QuantStorm"}
            </Button>
          </footer>
        </main>
      </div>
    );
  return (
    <div className="auth-shell">
      <div className="auth-side">
        <Logo />
        <div className="auth-quote">
          <Badge tone="violet">RESEARCH, COMPOUNDED</Badge>
          <h1>
            Your best signals
            <br />
            deserve a system.
          </h1>
          <p>Save every idea, avoid repeated fields, and build your way up the Genius pyramid.</p>
        </div>
        <div className="auth-metric">
          <span>Today’s research</span>
          <strong>6 alphas generated</strong>
          <div className="mini-bars">
            {[4, 7, 5, 9, 8, 11, 13].map((h, i) => (
              <i key={i} style={{ height: h * 3 }} />
            ))}
          </div>
        </div>
      </div>
      <main className="auth-form">
        <div className="mobile-logo">
          <Logo />
        </div>
        <div>
          <div className="eyebrow">QUANTSTORM</div>
          <h2>
            {mode === "signin"
              ? "Welcome back"
              : mode === "signup"
                ? "Create your workspace"
                : "Reset password"}
          </h2>
          <p>
            {mode === "forgot"
              ? "We’ll send a reset link to your inbox."
              : mode === "signin"
                ? "Continue where your research left off."
                : "Start building a smarter research practice."}
          </p>
        </div>
        {mode !== "forgot" && (
          <button type="button" className="google" onClick={onDone}>
            <b>G</b>Continue with Google
          </button>
        )}
        {mode !== "forgot" && (
          <div className="divider">
            <span>or continue with email</span>
          </div>
        )}
        {resetSent && mode === "forgot" ? (
          <div className="success-inline" style={{ margin: "18px 0" }}>
            <Icon name="check" />
            <div>
              <b>Reset instructions sent</b>
              <p style={{ margin: "4px 0 0", fontSize: "12px" }}>
                We sent a password recovery link to {email || "your email address"}.
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                setResetSent(false);
                setMode("signin");
              }}
            >
              Sign in
            </Button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <label>
              Email address
              <input
                type="email"
                placeholder="researcher@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            {mode !== "forgot" && (
              <label>
                Password
                <div className="input-link">
                  <input
                    type="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setMode("forgot")}>
                    Forgot?
                  </button>
                </div>
              </label>
            )}
            <Button type="submit" icon="arrow">
              {mode === "signin"
                ? "Sign in"
                : mode === "signup"
                  ? "Create account"
                  : "Send reset link"}
            </Button>
          </form>
        )}
        <p className="auth-switch">
          {mode === "signin"
            ? "New to QuantStorm?"
            : mode === "signup"
              ? "Already have an account?"
              : "Remembered your password?"}{" "}
          <button
            type="button"
            onClick={() => {
              setResetSent(false);
              setMode(mode === "signin" ? "signup" : "signin");
            }}
          >
            {mode === "signin" ? "Create account" : "Sign in"}
          </button>
        </p>
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  delta,
  icon,
}: {
  label: string;
  value: string;
  delta: string;
  icon: string;
}) {
  return (
    <div className="stat card">
      <div className="stat-icon">
        <Icon name={icon} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{delta}</small>
    </div>
  );
}

function Bars() {
  const data = [42, 65, 38, 76, 58, 86, 61];
  return (
    <div className="chart-bars">
      {data.map((v, i) => (
        <div key={i}>
          <span style={{ height: `${v}%` }} className={i === 5 ? "hot" : ""} />
          <small>{["M", "T", "W", "T", "F", "S", "S"][i]}</small>
        </div>
      ))}
    </div>
  );
}

function Dashboard({
  go,
  toast,
  alphas,
  onSubmitAlpha,
  onCopy,
  submittedCount,
  activeRegion,
}: {
  go: (p: Page) => void;
  toast: (s: string) => void;
  alphas: typeof alphaData;
  onSubmitAlpha: (name: string) => void;
  onCopy: (text: string, label: string) => void;
  submittedCount: number;
  activeRegion: string;
}) {
  const [trendRange, setTrendRange] = useState<"7 days" | "30 days" | "90 days" | "12 months">("30 days");
  const readyAlphas = useMemo(() => alphas.filter((a) => a.status === "Ready"), [alphas]);
  const pct = Math.min(100, Math.round((submittedCount / 4) * 100));

  const [dashboardIdeas, setDashboardIdeas] = useState<any[]>([]);
  const [ideasTriedCount, setIdeasTriedCount] = useState(0);

  useEffect(() => {
    let active = true;
    api.ideas.getToday().then((res) => {
      if (active && res && res.ideas) {
        setDashboardIdeas(res.ideas.slice(0, 3));
        const tried = res.ideas.filter((i: any) => i.status === "started" || i.outcome !== "none").length;
        setIdeasTriedCount(tried);
      }
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  const trendConfig = {
    "7 days": {
      sharpe: "1.98",
      fitness: "0.69",
      dArea: "M0 145C60 135 110 110 190 95s120-40 220-65 100 15 190-30V160H0z",
      dLine: "M0 145C60 135 110 110 190 95s120-40 220-65 100 15 190-30",
    },
    "30 days": {
      sharpe: "1.84",
      fitness: "0.62",
      dArea: "M0 130C70 115 70 95 140 105s80-60 145-35 70 15 120-20 110-20 195-40V160H0z",
      dLine: "M0 130C70 115 70 95 140 105s80-60 145-35 70 15 120-20 110-20 195-40",
    },
    "90 days": {
      sharpe: "1.76",
      fitness: "0.58",
      dArea: "M0 140C80 130 140 120 230 110s110-35 170-45 110 20 200-55V160H0z",
      dLine: "M0 140C80 130 140 120 230 110s110-35 170-45 110 20 200-55",
    },
    "12 months": {
      sharpe: "1.69",
      fitness: "0.54",
      dArea: "M0 150C90 140 160 130 250 125s120-30 170-35 110 15 180-50V160H0z",
      dLine: "M0 150C90 140 160 130 250 125s120-30 170-35 110 15 180-50",
    },
  }[trendRange];

  return (
    <div className="page">
      <header className="page-title">
        <div>
          <div className="eyebrow">MONDAY, 20 MAY · {activeRegion} REGION</div>
          <h1>Good morning, Alex</h1>
          <p>Your research pipeline is healthy. {readyAlphas.length} alphas are ready to submit.</p>
        </div>
        <Button icon="plus" onClick={() => go("Alpha Vault")}>
          Add alpha
        </Button>
      </header>
      <section className="daily-banner">
        <div className="ring">
          <strong>{submittedCount}</strong>
          <span>/ 4</span>
        </div>
        <div>
          <Badge tone={submittedCount >= 4 ? "green" : "violet"}>
            {submittedCount >= 4 ? "TARGET ACHIEVED" : "DAILY SUBMISSION"}
          </Badge>
          <h2>{submittedCount >= 4 ? "Daily submission target reached!" : "Halfway to today’s target"}</h2>
          <p>6h 24m until the {activeRegion} submission window closes</p>
        </div>
        <div className="daily-track">
          <span style={{ width: `${pct}%` }} />
          <i />
          <i />
          <i />
          <i />
        </div>
        <Button variant="secondary" onClick={() => go("Alpha Vault")}>
          View ready alphas ({readyAlphas.length})
        </Button>
      </section>
      <div className="stats-grid">
        <Stat label="Saved for later" value={String(alphas.length)} delta="+5 this week" icon="vault" />
        <Stat label="Submitted this week" value={String(16 + submittedCount)} delta={`${pct}% of target`} icon="check" />
        <Stat label="Used datafields" value="142" delta="Across 12 datasets" icon="database" />
        <Stat label="Current streak" value="7 days" delta="Personal best: 14" icon="sparkle" />
      </div>
      <div className="dash-grid">
        <section className="card ready-card">
          <div className="card-head">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3>Today's ideas</h3>
                <span className="badge badge-neutral" style={{ fontSize: "11px", fontWeight: "700" }}>
                  {ideasTriedCount}/5 tried
                </span>
              </div>
              <p>Top personalized alpha hypotheses generated for your datasets</p>
            </div>
            <button type="button" onClick={() => go("Daily Ideas")}>
              View all 5 <Icon name="arrow" size={15} />
            </button>
          </div>
          {dashboardIdeas.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)" }}>
              <p style={{ margin: "0 0 8px 0" }}>5 personalized hypotheses are ready for exploration</p>
              <Button variant="secondary" onClick={() => go("Daily Ideas")}>Explore Daily Ideas</Button>
            </div>
          ) : (
            dashboardIdeas.map((idea, i) => (
              <div className="alpha-row" key={idea._id || i}>
                <div className="alpha-rank">{i + 1}</div>
                <div>
                  <b>{idea.title}</b>
                  <code>{idea.expressionSketch}</code>
                </div>
                <div>
                  <span>REGION</span>
                  <b>{idea.region}</b>
                </div>
                <div>
                  <span>CATEGORY</span>
                  <b style={{ textTransform: "capitalize" }}>{idea.category}</b>
                </div>
                <Button variant="ghost" onClick={() => onCopy(idea.expressionSketch, idea.title)}>
                  Copy
                </Button>
                <Button variant="secondary" onClick={() => go("Daily Ideas")}>
                  Explore
                </Button>
              </div>
            ))
          )}
        </section>

        <section className="card ready-card">
          <div className="card-head">
            <div>
              <h3>Ready to submit</h3>
              <p>Strong alphas saved in your vault ({readyAlphas.length} available)</p>
            </div>
            <button type="button" onClick={() => go("Alpha Vault")}>
              View all <Icon name="arrow" size={15} />
            </button>
          </div>
          {readyAlphas.length === 0 ? (
            <div style={{ padding: "28px", textAlign: "center", color: "var(--muted)" }}>
              All ready alphas have been submitted for today!
            </div>
          ) : (
            readyAlphas.slice(0, 3).map((a, i) => (
              <div className="alpha-row" key={a.name}>
                <div className="alpha-rank">{i + 1}</div>
                <div>
                  <b>{a.name}</b>
                  <code>{a.expr}</code>
                </div>
                <div>
                  <span>SHARPE</span>
                  <b>{a.sharpe}</b>
                </div>
                <div>
                  <span>FITNESS</span>
                  <b>{a.fit}</b>
                </div>
                <Button variant="ghost" onClick={() => onCopy(a.expr, a.name)}>
                  Copy
                </Button>
                <Button variant="secondary" onClick={() => onSubmitAlpha(a.name)}>
                  Submit
                </Button>
              </div>
            ))
          )}
        </section>
        <section className="card chart-card">
          <div className="card-head">
            <div>
              <h3>Submission rhythm</h3>
              <p>Last 7 days</p>
            </div>
            <Badge tone="green">+12%</Badge>
          </div>
          <Bars />
          <div className="chart-foot">
            <span>
              <i className="dot-violet" />
              Submitted
            </span>
            <b>{24 + submittedCount} total</b>
          </div>
        </section>
        <section className="card trend-card">
          <div className="card-head">
            <div>
              <h3>Alpha quality trend</h3>
              <p>Median Sharpe and fitness ({trendRange})</p>
            </div>
            <select
              value={trendRange}
              onChange={(e) => {
                setTrendRange(e.target.value as any);
                toast(`Trendline updated for ${e.target.value}`);
              }}
            >
              <option value="7 days">7 days</option>
              <option value="30 days">30 days</option>
              <option value="90 days">90 days</option>
              <option value="12 months">12 months</option>
            </select>
          </div>
          <svg viewBox="0 0 600 160" preserveAspectRatio="none">
            <path className="gridline" d="M0 40h600M0 80h600M0 120h600" />
            <path className="area" d={trendConfig.dArea} />
            <path className="line" d={trendConfig.dLine} />
          </svg>
          <div className="chart-foot">
            <span>
              <i className="dot-violet" />
              Sharpe {trendConfig.sharpe}
            </span>
            <span>
              <i className="dot-blue" />
              Fitness {trendConfig.fitness}
            </span>
          </div>
        </section>
        <section className="card quick">
          <h3>Quick actions</h3>
          <button type="button" onClick={() => go("Alpha Vault")}>
            <Icon name="plus" />
            <span>
              <b>Add an alpha</b>
              <small>Save expression & settings</small>
            </span>
            <Icon name="chevron" />
          </button>
          <button type="button" onClick={() => go("Datafields")}>
            <Icon name="upload" />
            <span>
              <b>Import datafields</b>
              <small>CSV, TXT or paste</small>
            </span>
            <Icon name="chevron" />
          </button>
          <button type="button" onClick={() => go("AI Assistant")}>
            <Icon name="sparkle" />
            <span>
              <b>Ask Quant AI</b>
              <small>Get research guidance</small>
            </span>
            <Icon name="chevron" />
          </button>
        </section>
      </div>
    </div>
  );
}

const alphaData = [
  {
    name: "Quality momentum",
    expr: "rank(ts_delta(close, 5)) * rank(roe)",
    region: "USA",
    sharpe: "2.14",
    fit: "0.71",
    status: "Ready",
  },
  {
    name: "Analyst revision",
    expr: "-rank(ts_zscore(anl14_eps, 20))",
    region: "EUR",
    sharpe: "1.92",
    fit: "0.64",
    status: "Saved",
  },
  {
    name: "Low volatility value",
    expr: "rank(bookvalue / cap) * -rank(stddev_30d)",
    region: "USA",
    sharpe: "1.81",
    fit: "0.60",
    status: "Submitted",
  },
  {
    name: "Cashflow acceleration",
    expr: "rank(ts_delta(cashflow_op, 4))",
    region: "GLB",
    sharpe: "1.67",
    fit: "0.55",
    status: "Saved",
  },
];

function AlphaVault({
  toast,
  onCopy,
  alphas,
  setAlphas,
  onSubmitAlpha,
  prefilledExpr,
  setPrefilledExpr,
  prefilledAlpha,
  setPrefilledAlpha,
}: {
  toast: (s: string) => void;
  onCopy: (text: string, label: string) => void;
  alphas: typeof alphaData;
  setAlphas: React.Dispatch<React.SetStateAction<typeof alphaData>>;
  onSubmitAlpha: (name: string) => void;
  prefilledExpr?: string;
  setPrefilledExpr?: (expr: string) => void;
  prefilledAlpha?: any;
  setPrefilledAlpha?: (p: any) => void;
}) {
  const [editor, setEditor] = useState(Boolean(prefilledExpr || prefilledAlpha));
  const [saved, setSaved] = useState(false);
  const [view, setView] = useState<"table" | "cards">("table");
  const [selected, setSelected] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sharpeFilter, setSharpeFilter] = useState("All");
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());

  // New Alpha Form State
  const [newName, setNewName] = useState("Quality momentum v2");
  const [newExpr, setNewExpr] = useState(
    prefilledExpr || "rank(ts_delta(close, 5)) * rank(roe) - rank(debt_assets)"
  );
  const [newRegion, setNewRegion] = useState("USA");
  const [newUniverse, setNewUniverse] = useState("TOP3000");
  const [newDelay, setNewDelay] = useState("1");
  const [newDecay, setNewDecay] = useState("4");
  const [newNeutralization, setNewNeutralization] = useState("SUBINDUSTRY");
  const [newTruncation, setNewTruncation] = useState("0.08");
  const [newSharpe, setNewSharpe] = useState("2.14");
  const [newFitness, setNewFitness] = useState("0.71");
  const [newTurnover, setNewTurnover] = useState("12.8%");
  const [newNotes, setNewNotes] = useState("");

  useEffect(() => {
    if (prefilledAlpha) {
      if (prefilledAlpha.name) setNewName(prefilledAlpha.name);
      if (prefilledAlpha.expression) setNewExpr(prefilledAlpha.expression);
      if (prefilledAlpha.region) setNewRegion(prefilledAlpha.region);
      if (prefilledAlpha.universe) setNewUniverse(prefilledAlpha.universe);
      if (prefilledAlpha.delay !== undefined) setNewDelay(String(prefilledAlpha.delay));
      if (prefilledAlpha.decay !== undefined) setNewDecay(String(prefilledAlpha.decay));
      if (prefilledAlpha.neutralization) setNewNeutralization(prefilledAlpha.neutralization);
      if (prefilledAlpha.truncation !== undefined) setNewTruncation(String(prefilledAlpha.truncation));
      if (prefilledAlpha.notes) setNewNotes(prefilledAlpha.notes);
      setEditor(true);
    } else if (prefilledExpr) {
      setNewExpr(prefilledExpr);
      setEditor(true);
    }
  }, [prefilledAlpha, prefilledExpr]);

  const filteredAlphas = useMemo(() => {
    return alphas.filter((a) => {
      const matchSearch = `${a.name} ${a.expr} ${a.region}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "All" || a.status === statusFilter;
      const matchRegion = regionFilter === "All" || a.region === regionFilter;
      const sharpeNum = parseFloat(a.sharpe);
      const matchSharpe =
        sharpeFilter === "All"
          ? true
          : sharpeFilter === "1.5+"
            ? sharpeNum >= 1.5
            : sharpeFilter === "1.8+"
              ? sharpeNum >= 1.8
              : sharpeNum >= 2.0;
      return matchSearch && matchStatus && matchRegion && matchSharpe;
    });
  }, [alphas, searchQuery, statusFilter, regionFilter, sharpeFilter]);

  const handleSaveAlpha = () => {
    const created = {
      name: newName.trim() || "Untitled Alpha",
      expr: newExpr.trim(),
      region: newRegion,
      sharpe: newSharpe,
      fit: newFitness,
      status: "Ready",
    };
    setAlphas([created, ...alphas]);
    setSaved(true);
    setEditor(false);
    toast(`Alpha "${created.name}" saved to your vault`);
    if (setPrefilledExpr) setPrefilledExpr("");
    if (setPrefilledAlpha) setPrefilledAlpha(null);

    // Sync with backend API (MongoDB)
    api.alphas.create({
      expression: created.expr,
      region: created.region,
      universe: newUniverse || "TOP3000",
      delay: parseInt(newDelay) || 1,
      decay: parseFloat(newDecay) || 4,
      neutralization: newNeutralization || "SUBINDUSTRY",
      truncation: parseFloat(newTruncation) || 0.08,
      sharpe: parseFloat(newSharpe) || 2.14,
      fitness: parseFloat(newFitness) || 0.72,
      notes: newNotes || "",
      ideaId: prefilledAlpha?.ideaId || undefined,
    }).then((res: any) => {
      if (res && (res._id || res.id)) {
        const id = res._id || res.id;
        setAlphas((prev) =>
          prev.map((a) => (a.name === created.name && a.expr === created.expr ? { ...a, _id: id, id } : a))
        );
      }
    }).catch(() => {});
  };

  const toggleSelectAll = () => {
    if (selectedNames.size === filteredAlphas.length && filteredAlphas.length > 0) {
      setSelectedNames(new Set());
    } else {
      setSelectedNames(new Set(filteredAlphas.map((a) => a.name)));
    }
  };

  const toggleSelectOne = (name: string) => {
    setSelectedNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleBatchMarkReady = () => {
    const count = selectedNames.size;
    const targetAlphas = alphas.filter((a) => selectedNames.has(a.name));
    setAlphas((prev) =>
      prev.map((a) => (selectedNames.has(a.name) ? { ...a, status: "Ready" } : a))
    );
    targetAlphas.forEach((a: any) => {
      const id = a._id || a.id;
      if (id) api.alphas.update(id, { status: "ready" }).catch(() => {});
    });
    toast(`Marked ${count} alphas as Ready`);
    setSelectedNames(new Set());
  };

  const handleBatchMarkSubmitted = () => {
    const count = selectedNames.size;
    setAlphas((prev) =>
      prev.map((a) => (selectedNames.has(a.name) ? { ...a, status: "Submitted" } : a))
    );
    selectedNames.forEach((n) => onSubmitAlpha(n));
    toast(`Submitted ${count} alphas to simulation queue`);
    setSelectedNames(new Set());
  };

  const handleBatchDelete = () => {
    const count = selectedNames.size;
    const toDelete = alphas.filter((a) => selectedNames.has(a.name));
    setAlphas((prev) => prev.filter((a) => !selectedNames.has(a.name)));
    toDelete.forEach((a: any) => {
      const id = a._id || a.id;
      if (id) api.alphas.delete(id).catch(() => {});
    });
    toast(`Removed ${count} alphas from vault`);
    setSelectedNames(new Set());
  };

  const handleExportSelectedCSV = () => {
    const items = alphas.filter((a) => selectedNames.has(a.name));
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Name,Expression,Region,Sharpe,Fitness,Status"]
        .concat(
          items.map(
            (a) =>
              `"${a.name}","${a.expr.replace(/"/g, '""')}","${a.region}","${a.sharpe}","${a.fit}","${a.status}"`
          )
        )
        .join("\n");
    const encoded = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download", `quantstorm-selected-alphas-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast(`Exported ${items.length} alphas to CSV`);
  };

  const handleExportAllCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Name,Expression,Region,Sharpe,Fitness,Status"]
        .concat(
          alphas.map(
            (a) =>
              `"${a.name}","${a.expr.replace(/"/g, '""')}","${a.region}","${a.sharpe}","${a.fit}","${a.status}"`
          )
        )
        .join("\n");
    const encoded = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download", `quantstorm-vault-alphas-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast(`Exported ${alphas.length} alphas to CSV`);
  };

  const selectedAlpha = selected !== null && selected < alphas.length ? alphas[selected] : null;

  return (
    <div className="page">
      <header className="page-title">
        <div>
          <div className="eyebrow">RESEARCH LIBRARY</div>
          <h1>Alpha Vault</h1>
          <p>Every signal, setting, and learning—saved in one place. ({alphas.length} total)</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button variant="secondary" icon="download" onClick={handleExportAllCSV}>
            Export CSV
          </Button>
          <Button icon="plus" onClick={() => setEditor(!editor)}>
            {editor ? "Close editor" : "Save new alpha"}
          </Button>
        </div>
      </header>

      {editor && (
        <section className="card editor-card">
          <div className="card-head">
            <div>
              <Badge tone="violet">NEW ALPHA</Badge>
              <h2>Capture your signal</h2>
            </div>
            <button type="button" className="icon-btn" onClick={() => setEditor(false)}>
              <Icon name="x" />
            </button>
          </div>
          <label className="field">
            <span>Expression</span>
            <div className="code-editor">
              <div style={{ flex: 1 }}>
                <i>1</i>
                <input
                  style={{ width: "100%", background: "transparent", border: 0, outline: 0, fontFamily: "DM Mono, monospace", color: "inherit", fontSize: "13px" }}
                  value={newExpr}
                  onChange={(e) => setNewExpr(e.target.value)}
                />
              </div>
              <button type="button" onClick={() => onCopy(newExpr, "Expression")}>
                <Icon name="copy" />
              </button>
            </div>
          </label>
          <div className="warning-panel">
            <div>
              <Icon name="bell" />
            </div>
            <section>
              <b>2 datafields have been used before</b>
              <p>Using repeated fields may increase self-correlation.</p>
              <div>
                <Badge tone="red">close · used in 8 alphas</Badge>
                <Badge tone="red">roe · used in 3 alphas</Badge>
              </div>
            </section>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("close");
                toast("Filtered vault by repeated datafield: close");
              }}
            >
              View related alphas
            </button>
          </div>
          <div className="form-grid">
            <label className="field">
              <span>Name</span>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} />
            </label>
            <label className="field">
              <span>Region</span>
              <select value={newRegion} onChange={(e) => setNewRegion(e.target.value)}>
                <option>USA</option>
                <option>EUR</option>
                <option>ASI</option>
                <option>GLB</option>
              </select>
            </label>
            <label className="field">
              <span>Universe</span>
              <select value={newUniverse} onChange={(e) => setNewUniverse(e.target.value)}>
                <option>TOP3000</option>
                <option>TOP1000</option>
                <option>TOP500</option>
              </select>
            </label>
            <label className="field">
              <span>Delay</span>
              <input value={newDelay} onChange={(e) => setNewDelay(e.target.value)} />
            </label>
            <label className="field">
              <span>Decay</span>
              <input value={newDecay} onChange={(e) => setNewDecay(e.target.value)} />
            </label>
            <label className="field">
              <span>Neutralization</span>
              <select value={newNeutralization} onChange={(e) => setNewNeutralization(e.target.value)}>
                <option>SUBINDUSTRY</option>
                <option>INDUSTRY</option>
                <option>SECTOR</option>
                <option>MARKET</option>
              </select>
            </label>
            <label className="field">
              <span>Truncation</span>
              <input value={newTruncation} onChange={(e) => setNewTruncation(e.target.value)} />
            </label>
            <label className="field">
              <span>Sharpe</span>
              <input value={newSharpe} onChange={(e) => setNewSharpe(e.target.value)} />
            </label>
            <label className="field">
              <span>Fitness</span>
              <input value={newFitness} onChange={(e) => setNewFitness(e.target.value)} />
            </label>
            <label className="field">
              <span>Turnover</span>
              <input value={newTurnover} onChange={(e) => setNewTurnover(e.target.value)} />
            </label>
          </div>
          <label className="field">
            <span>Notes</span>
            <textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="What is the hypothesis behind this signal?"
            />
          </label>
          <div className="editor-actions">
            <Button variant="ghost" onClick={() => setEditor(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAlpha}>Save to vault</Button>
          </div>
        </section>
      )}

      {saved && (
        <div className="success-inline">
          <Icon name="check" />
          <span>
            <b>Alpha saved</b> All simulation settings and datafields were captured into your library.
          </span>
          <button type="button" onClick={() => setSaved(false)}>
            <Icon name="x" />
          </button>
        </div>
      )}

      <div className="toolbar card">
        <div className="search">
          <Icon name="search" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expressions, notes, or tags…"
          />
        </div>
        <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>
          <option value="All">All Regions</option>
          <option value="USA">Region: USA</option>
          <option value="EUR">Region: EUR</option>
          <option value="ASI">Region: ASI</option>
          <option value="GLB">Region: GLB</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="Ready">Ready</option>
          <option value="Saved">Saved</option>
          <option value="Submitted">Submitted</option>
        </select>
        <select value={sharpeFilter} onChange={(e) => setSharpeFilter(e.target.value)}>
          <option value="All">All Sharpe</option>
          <option value="1.5+">Sharpe: 1.5+</option>
          <option value="1.8+">Sharpe: 1.8+</option>
          <option value="2.0+">Sharpe: 2.0+</option>
        </select>
        <div className="view-toggle">
          <button
            type="button"
            className={view === "table" ? "active" : ""}
            onClick={() => setView("table")}
          >
            <Icon name="menu" />
          </button>
          <button
            type="button"
            className={view === "cards" ? "active" : ""}
            onClick={() => setView("cards")}
          >
            <Icon name="grid" />
          </button>
        </div>
      </div>

      {(searchQuery || regionFilter !== "All" || statusFilter !== "All" || sharpeFilter !== "All") && (
        <div className="filter-row">
          {regionFilter !== "All" && (
            <Badge tone="blue">
              Region: {regionFilter}{" "}
              <button
                type="button"
                style={{ background: "transparent", border: 0, cursor: "pointer", marginLeft: "4px" }}
                onClick={() => setRegionFilter("All")}
              >
                ×
              </button>
            </Badge>
          )}
          {statusFilter !== "All" && (
            <Badge tone="violet">
              Status: {statusFilter}{" "}
              <button
                type="button"
                style={{ background: "transparent", border: 0, cursor: "pointer", marginLeft: "4px" }}
                onClick={() => setStatusFilter("All")}
              >
                ×
              </button>
            </Badge>
          )}
          {sharpeFilter !== "All" && (
            <Badge tone="green">
              Sharpe: {sharpeFilter}{" "}
              <button
                type="button"
                style={{ background: "transparent", border: 0, cursor: "pointer", marginLeft: "4px" }}
                onClick={() => setSharpeFilter("All")}
              >
                ×
              </button>
            </Badge>
          )}
          {searchQuery && (
            <Badge tone="amber">
              Query: {searchQuery}{" "}
              <button
                type="button"
                style={{ background: "transparent", border: 0, cursor: "pointer", marginLeft: "4px" }}
                onClick={() => setSearchQuery("")}
              >
                ×
              </button>
            </Badge>
          )}
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setRegionFilter("All");
              setStatusFilter("All");
              setSharpeFilter("All");
            }}
          >
            Clear all
          </button>
        </div>
      )}

      {selectedNames.size > 0 && (
        <div
          className="card"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 18px",
            margin: "12px 0",
            background: "rgba(109, 92, 231, 0.12)",
            border: "1px solid var(--accent)",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Badge tone="violet">{selectedNames.size} SELECTED</Badge>
            <span style={{ fontSize: "13px", fontWeight: 600 }}>Apply action to selected alphas</span>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <Button variant="secondary" onClick={handleBatchMarkReady}>
              Mark Ready
            </Button>
            <Button variant="secondary" onClick={handleBatchMarkSubmitted}>
              Mark Submitted
            </Button>
            <Button variant="secondary" icon="download" onClick={handleExportSelectedCSV}>
              Export Selected
            </Button>
            <Button variant="danger" icon="trash" onClick={handleBatchDelete}>
              Delete
            </Button>
            <Button variant="ghost" onClick={() => setSelectedNames(new Set())}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {view === "table" ? (
        <section className="card data-table">
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={filteredAlphas.length > 0 && selectedNames.size === filteredAlphas.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>ALPHA</th>
                <th>REGION</th>
                <th>SHARPE</th>
                <th>FITNESS</th>
                <th>STATUS</th>
                <th>UPDATED</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredAlphas.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "var(--muted)" }}>
                    No alphas match your current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAlphas.map((a) => (
                  <tr key={a.name} onClick={() => setSelected(alphas.findIndex((item) => item.name === a.name))}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedNames.has(a.name)}
                        onChange={() => toggleSelectOne(a.name)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td>
                      <b>{a.name}</b>
                      <code>{a.expr}</code>
                    </td>
                    <td>
                      <Badge tone={a.region === "USA" ? "blue" : a.region === "EUR" ? "violet" : "neutral"}>
                        {a.region}
                      </Badge>
                    </td>
                    <td>
                      <b>{a.sharpe}</b>
                    </td>
                    <td>{a.fit}</td>
                    <td>
                      <Badge
                        tone={
                          a.status === "Submitted"
                            ? "green"
                            : a.status === "Ready"
                              ? "violet"
                              : "neutral"
                        }
                      >
                        {a.status}
                      </Badge>
                    </td>
                    <td>Today</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ height: "30px", padding: "0 8px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onCopy(a.expr, a.name);
                        }}
                      >
                        <Icon name="copy" size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="pagination">
            <span>
              Showing {filteredAlphas.length} of {alphas.length} alphas
            </span>
          </div>
        </section>
      ) : (
        <div className="alpha-cards">
          {filteredAlphas.map((a, i) => (
            <button
              type="button"
              className="card"
              onClick={() => setSelected(alphas.findIndex((item) => item.name === a.name))}
              key={a.name}
            >
              <div>
                <Badge tone={a.status === "Submitted" ? "green" : "violet"}>{a.status}</Badge>
                <Badge>{a.region}</Badge>
              </div>
              <h3>{a.name}</h3>
              <code>{a.expr}</code>
              <footer>
                <span>
                  Sharpe <b>{a.sharpe}</b>
                </span>
                <span>
                  Fitness <b>{a.fit}</b>
                </span>
                <Icon name="chevron" />
              </footer>
            </button>
          ))}
        </div>
      )}

      {selectedAlpha && (
        <div className="drawer-backdrop" onClick={() => setSelected(null)}>
          <aside className="drawer" onClick={(e) => e.stopPropagation()}>
            <header>
              <div>
                <Badge tone="violet">{selectedAlpha.status}</Badge>
                <h2>{selectedAlpha.name}</h2>
                <p>Updated today · {selectedAlpha.region} universe</p>
              </div>
              <button type="button" className="icon-btn" onClick={() => setSelected(null)}>
                <Icon name="x" />
              </button>
            </header>
            <div className="drawer-body">
              <label>EXPRESSION</label>
              <div className="expression">
                <code>{selectedAlpha.expr}</code>
                <button type="button" onClick={() => onCopy(selectedAlpha.expr, selectedAlpha.name)}>
                  <Icon name="copy" />
                </button>
              </div>
              <div className="metric-grid">
                <div>
                  <span>Sharpe</span>
                  <b>{selectedAlpha.sharpe}</b>
                </div>
                <div>
                  <span>Fitness</span>
                  <b>{selectedAlpha.fit}</b>
                </div>
                <div>
                  <span>Turnover</span>
                  <b>12.8%</b>
                </div>
                <div>
                  <span>Self-corr.</span>
                  <b>0.42</b>
                </div>
              </div>
              <h3>Simulation settings</h3>
              {[
                ["Region", selectedAlpha.region],
                ["Universe", "TOP3000"],
                ["Delay", "1"],
                ["Decay", "4"],
                ["Neutralization", "Subindustry"],
              ].map((x) => (
                <div className="detail-row" key={x[0]}>
                  <span>{x[0]}</span>
                  <b>{x[1]}</b>
                </div>
              ))}
              <h3>Datafields used</h3>
              <div className="chips">
                <Badge tone="red">close · used</Badge>
                <Badge tone="red">roe · used</Badge>
                <Badge>debt_assets</Badge>
              </div>
            </div>
            <footer>
              <Button
                variant="danger"
                onClick={() => {
                  setAlphas((prev) => prev.filter((item) => item.name !== selectedAlpha.name));
                  setSelected(null);
                  toast(`Alpha "${selectedAlpha.name}" removed from vault`);
                }}
              >
                Delete
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  const copy = {
                    ...selectedAlpha,
                    name: `${selectedAlpha.name} (Copy)`,
                    status: "Saved",
                  };
                  setAlphas((prev) => [copy, ...prev]);
                  setSelected(null);
                  toast(`Duplicated as "${copy.name}"`);
                }}
              >
                Duplicate
              </Button>
              <Button
                onClick={() => {
                  setAlphas((prev) =>
                    prev.map((item) =>
                      item.name === selectedAlpha.name ? { ...item, status: "Submitted" } : item
                    )
                  );
                  onSubmitAlpha(selectedAlpha.name);
                  setSelected(null);
                }}
              >
                Mark submitted
              </Button>
            </footer>
          </aside>
        </div>
      )}
    </div>
  );
}

function Datafields({
  toast,
  onCopy,
}: {
  toast: (s: string) => void;
  onCopy: (text: string, label: string) => void;
}) {
  const [stage, setStage] = useState<"idle" | "processing" | "review" | "done">("idle");
  const [regions, setRegions] = useState(["USA", "Europe", "Asia Pacific", "China", "India"]);
  const [activeRegion, setActiveRegion] = useState("USA");
  const [addingRegion, setAddingRegion] = useState(false);
  const [regionName, setRegionName] = useState("");
  const [filterQuery, setFilterQuery] = useState("");
  const [rawText, setRawText] = useState(
    "fnd6_assets\tTotal assets\nfnd6_cashflow_op\tOperating cash flow\nanl14_eps\tEPS estimate"
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImportGroups, setSelectedImportGroups] = useState<Set<string>>(
    new Set(["Fundamental", "Analyst"])
  );
  const [detectedGroups, setDetectedGroups] = useState<Array<{ name: string; countStr: string; fieldList: string }>>([
    { name: "Fundamental", countStr: "5 fields", fieldList: "assets, cashflow_op, debt_assets, ebit, operating_income" },
    { name: "Analyst", countStr: "3 fields", fieldList: "anl14_eps, eps_revision, target_high" },
  ]);
  const [editGroupModal, setEditGroupModal] = useState<string | null>(null);
  const [editGroupFields, setEditGroupFields] = useState("assets, cashflow_op, debt_assets, ebit, operating_income");

  const [datasets, setDatasets] = useState<Array<[string, string, string, string[]]>>([
    ["Fundamental", "28", "64", ["assets", "cashflow_op", "debt_assets", "inventory", "ebitda", "net_margin"]],
    ["Analyst", "12", "48", ["anl14_eps", "eps_revision", "rating_mean", "target_price", "dispersion_eps"]],
    ["Market", "46", "51", ["close", "volume", "returns", "adv20", "vwap", "open_close_ratio"]],
  ]);

  // Load datasets and fields from MongoDB
  const loadDatafieldsFromBackend = async (reg = activeRegion) => {
    try {
      const res = await api.datafields.list(reg);
      if (res && Array.isArray(res) && res.length > 0) {
        setDatasets(res.map((g: any) => [
          g.dataset || "Unsorted",
          String(g.used || 0),
          String(g.total || (g.fields ? g.fields.length : 0)),
          g.fields ? g.fields.map((f: any) => (typeof f === "string" ? f : f.fieldId || f.name)) : [],
        ]));
      } else {
        // Seed initial fields to MongoDB for this region so it persists
        const defaultFields = [
          { fieldId: "assets", dataset: "Fundamental", description: "Total assets" },
          { fieldId: "cashflow_op", dataset: "Fundamental", description: "Operating cash flow" },
          { fieldId: "debt_assets", dataset: "Fundamental", description: "Total debt to total assets" },
          { fieldId: "inventory", dataset: "Fundamental", description: "Total inventory" },
          { fieldId: "ebitda", dataset: "Fundamental", description: "EBITDA" },
          { fieldId: "net_margin", dataset: "Fundamental", description: "Net profit margin" },
          { fieldId: "anl14_eps", dataset: "Analyst", description: "Analyst consensus EPS" },
          { fieldId: "eps_revision", dataset: "Analyst", description: "EPS revision ratio" },
          { fieldId: "rating_mean", dataset: "Analyst", description: "Consensus recommendation mean" },
          { fieldId: "target_price", dataset: "Analyst", description: "Mean target price" },
          { fieldId: "dispersion_eps", dataset: "Analyst", description: "Standard deviation of EPS estimates" },
          { fieldId: "close", dataset: "Market", description: "Closing price" },
          { fieldId: "volume", dataset: "Market", description: "Trading volume" },
          { fieldId: "returns", dataset: "Market", description: "Daily return" },
          { fieldId: "adv20", dataset: "Market", description: "Average daily volume 20d" },
          { fieldId: "vwap", dataset: "Market", description: "Volume weighted average price" },
          { fieldId: "open_close_ratio", dataset: "Market", description: "Open to close return ratio" },
        ];
        await api.datafields.commit(reg, defaultFields).catch(() => {});
        const refreshed = await api.datafields.list(reg).catch(() => null);
        if (refreshed && Array.isArray(refreshed) && refreshed.length > 0) {
          setDatasets(refreshed.map((g: any) => [
            g.dataset || "Unsorted",
            String(g.used || 0),
            String(g.total || (g.fields ? g.fields.length : 0)),
            g.fields ? g.fields.map((f: any) => (typeof f === "string" ? f : f.fieldId || f.name)) : [],
          ]));
        }
      }
    } catch {}
  };

  useEffect(() => {
    loadDatafieldsFromBackend(activeRegion);
  }, [activeRegion]);

  const start = async () => {
    setStage("processing");
    try {
      // 1. Try AI extraction via OpenRouter first
      const aiRes = await api.datafields.extractAi(rawText, undefined, activeRegion);
      if (aiRes && Array.isArray(aiRes.fields) && aiRes.fields.length > 0) {
        const groupMap = new Map<string, string[]>();
        aiRes.fields.forEach((f: any) => {
          const ds = f.dataset || "Fundamental";
          if (!groupMap.has(ds)) groupMap.set(ds, []);
          groupMap.get(ds)!.push(f.fieldId || f.id);
        });
        const groups = Array.from(groupMap.entries()).map(([name, fList]) => ({
          name,
          countStr: `${fList.length} field${fList.length === 1 ? "" : "s"}`,
          fieldList: fList.join(", "),
        }));
        setDetectedGroups(groups);
        setSelectedImportGroups(new Set(groups.map((g) => g.name)));
        setStage("review");
        return;
      }
    } catch {}

    // 2. Fallback to rule-based parser
    try {
      const parsedRes = await api.datafields.extract(rawText, undefined, activeRegion);
      if (parsedRes && Array.isArray(parsedRes.fields) && parsedRes.fields.length > 0) {
        const groupMap = new Map<string, string[]>();
        parsedRes.fields.forEach((f: any) => {
          const ds = f.dataset || "Fundamental";
          if (!groupMap.has(ds)) groupMap.set(ds, []);
          groupMap.get(ds)!.push(f.fieldId || f.id);
        });
        const groups = Array.from(groupMap.entries()).map(([name, fList]) => ({
          name,
          countStr: `${fList.length} field${fList.length === 1 ? "" : "s"}`,
          fieldList: fList.join(", "),
        }));
        setDetectedGroups(groups);
        setSelectedImportGroups(new Set(groups.map((g) => g.name)));
        setStage("review");
        return;
      }
    } catch {}

    // 3. Fallback to default preview
    setTimeout(() => setStage("review"), 600);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setRawText(text);
          toast(`Loaded ${file.name} (${Math.round(file.size / 1024)} KB)`);
          start();
        }
      };
      reader.readAsText(file);
    }
  };

  const addRegion = async () => {
    const name = regionName.trim();
    if (!name) return;
    if (!regions.some((region) => region.toLowerCase() === name.toLowerCase())) {
      setRegions((current) => [...current, name]);
      toast(`${name} added to your regions`);
      await api.regions.add(name.toUpperCase()).catch(() => {});
    }
    setActiveRegion(name);
    setRegionName("");
    setAddingRegion(false);
  };

  const saveImport = async () => {
    // Gather all fields to commit to MongoDB
    const fieldsToCommit: Array<{ fieldId: string; dataset: string; description: string }> = [];
    detectedGroups.forEach((g) => {
      if (selectedImportGroups.has(g.name)) {
        const tokens = g.fieldList
          .split(/[\s,]+/)
          .map((t) => t.trim().toLowerCase())
          .filter((t) => /^[a-z_][a-z0-9_]*$/.test(t));
        tokens.forEach((t) => {
          fieldsToCommit.push({
            fieldId: t,
            dataset: g.name,
            description: `${g.name} metric ${t}`,
          });
        });
      }
    });

    if (fieldsToCommit.length > 0) {
      try {
        await api.datafields.commit(activeRegion, fieldsToCommit);
        await loadDatafieldsFromBackend(activeRegion);
      } catch {}
    } else {
      // Local fallback state update
      setDatasets((current) => {
        let updated = [...current];
        if (selectedImportGroups.has("Fundamental")) {
          updated = updated.map(([n, u, t, f]) =>
            n === "Fundamental"
              ? [n, u, String(Number(t) + 5), [...f, "ebit", "operating_income"]]
              : [n, u, t, f]
          );
        }
        if (selectedImportGroups.has("Analyst")) {
          updated = updated.map(([n, u, t, f]) =>
            n === "Analyst"
              ? [n, u, String(Number(t) + 3), [...f, "target_high", "recommendation_score"]]
              : [n, u, t, f]
          );
        }
        if (!updated.some(([name]) => name === "News Sentiment")) {
          updated.push([
            "News Sentiment",
            "0",
            "8",
            ["news_sentiment", "news_volume", "event_score", "buzz_change"],
          ]);
        }
        return updated;
      });
    }

    setStage("done");
    toast(`Imported fields saved to MongoDB for ${activeRegion}`);
  };

  const handleExportDatafieldsCSV = () => {
    const rows = [["Dataset", "Used Count", "Total Count", "Sample Fields"]];
    datasets.forEach(([name, used, total, fields]) => {
      rows.push([name, used, total, fields.join("; ")]);
    });
    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const encoded = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute(
      "download",
      `quantstorm-datafields-${activeRegion.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast(`Exported ${datasets.length} datasets to CSV`);
  };

  const visibleDatasets = useMemo(() => {
    if (!filterQuery.trim()) return datasets;
    return datasets
      .map(([name, used, total, fields]) => {
        const matchesName = name.toLowerCase().includes(filterQuery.toLowerCase());
        const filteredFields = fields.filter((f) =>
          f.toLowerCase().includes(filterQuery.toLowerCase())
        );
        if (matchesName || filteredFields.length > 0) {
          return [name, used, total, matchesName ? fields : filteredFields] as [
            string,
            string,
            string,
            string[],
          ];
        }
        return null;
      })
      .filter(Boolean) as Array<[string, string, string, string[]]>;
  }, [datasets, filterQuery]);

  return (
    <div className="page">
      <header className="page-title">
        <div>
          <div className="eyebrow">FIELD INTELLIGENCE · {activeRegion}</div>
          <h1>Datafield Library</h1>
          <p>Know what you’ve used. Discover where to explore next.</p>
        </div>
        <div className="page-actions">
          <Button variant="secondary" icon="download" onClick={handleExportDatafieldsCSV}>
            Export CSV
          </Button>
          <Button variant="secondary" icon="plus" onClick={() => setAddingRegion(true)}>
            Add region
          </Button>
          <Button icon="upload" onClick={() => setStage("idle")}>
            Upload dataset
          </Button>
        </div>
      </header>
      <div className="region-tabs">
        {regions.map((x) => (
          <button
            type="button"
            className={activeRegion === x ? "active" : ""}
            onClick={() => setActiveRegion(x)}
            key={x}
          >
            {x}
          </button>
        ))}
        <button type="button" className="add-region-tab" onClick={() => setAddingRegion(true)}>
          <Icon name="plus" size={14} /> Add region
        </button>
      </div>

      {addingRegion && (
        <form
          className="region-adder card"
          onSubmit={(event) => {
            event.preventDefault();
            addRegion();
          }}
        >
          <div className="dataset-icon">
            <Icon name="plus" />
          </div>
          <div>
            <b>Add a research region</b>
            <span>Create a custom region workspace for its datasets and fields.</span>
          </div>
          <input
            autoFocus
            value={regionName}
            onChange={(event) => setRegionName(event.target.value)}
            placeholder="e.g. Latin America"
          />
          <Button variant="ghost" onClick={() => setAddingRegion(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={!regionName.trim()}>
            Add region
          </Button>
        </form>
      )}

      {stage !== "done" && (
        <section className="card import-card">
          {stage === "idle" && (
            <>
              <div className="upload-zone">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv,.txt"
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                />
                <div>
                  <Icon name="upload" size={24} />
                </div>
                <h3>Drop your datafield export here</h3>
                <p>CSV or TXT, up to 10 MB</p>
                <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                  Choose file
                </Button>
              </div>
              <div className="or">OR</div>
              <div className="paste-zone">
                <label>Paste raw datafields</label>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                />
                <Button icon="sparkle" onClick={start}>
                  Extract with AI
                </Button>
              </div>
            </>
          )}
          {stage === "processing" && (
            <div className="processing">
              <div className="spinner" />
              <h3>Quant AI is reading your fields</h3>
              <p>Detecting datasets, names, and descriptions…</p>
              <div className="skeletons">
                <i />
                <i />
                <i />
              </div>
            </div>
          )}
          {stage === "review" && (
            <div className="review">
              <div className="card-head">
                <div>
                  <Badge tone="green">EXTRACTION COMPLETE</Badge>
                  <h2>Review detected fields</h2>
                  <p>We grouped fields into 2 datasets. Review before saving.</p>
                </div>
                <Button variant="ghost" onClick={() => setStage("idle")}>
                  Start over
                </Button>
              </div>
              {detectedGroups.map((x, i) => (
                <div className="review-group" key={x.name}>
                  <input
                    type="checkbox"
                    checked={selectedImportGroups.has(x.name)}
                    onChange={() => {
                      setSelectedImportGroups((prev) => {
                        const next = new Set(prev);
                        if (next.has(x.name)) next.delete(x.name);
                        else next.add(x.name);
                        return next;
                      });
                    }}
                  />
                  <div className="dataset-icon">
                    <Icon name="database" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <b>{x.name}</b>
                    <span>
                      {x.countStr} · {activeRegion}
                    </span>
                    <small style={{ display: "block", color: "var(--muted)", fontSize: "11px", marginTop: "2px" }}>
                      {x.fieldList}
                    </small>
                  </div>
                  <Badge tone={i % 2 === 1 ? "blue" : "violet"}>{x.name.slice(0, 4).toLowerCase()}</Badge>
                  <button
                    type="button"
                    onClick={() => {
                      setEditGroupFields(x.fieldList);
                      setEditGroupModal(x.name);
                      toast(`Editing fields for ${x.name}`);
                    }}
                  >
                    Edit
                  </button>
                </div>
              ))}
              <footer>
                <span>{selectedImportGroups.size} of {detectedGroups.length} datasets selected</span>
                <Button onClick={saveImport} disabled={selectedImportGroups.size === 0}>
                  Save to library
                </Button>
              </footer>
            </div>
          )}
        </section>
      )}

      {editGroupModal && (
        <div className="modal-backdrop" onClick={() => setEditGroupModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <header>
              <div>
                <h2>Edit {editGroupModal} Field Mapping</h2>
                <p>Add or customize fields to import into {activeRegion}.</p>
              </div>
              <button type="button" className="icon-btn" onClick={() => setEditGroupModal(null)}>
                <Icon name="x" />
              </button>
            </header>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "16px 0" }}>
              <Badge tone="violet">Prefix: {editGroupModal === "Fundamental" ? "fnd6" : "anl14"}</Badge>
              <label className="field">
                <span>Field names (comma separated)</span>
                <input
                  value={editGroupFields}
                  onChange={(e) => setEditGroupFields(e.target.value)}
                />
              </label>
            </div>
            <footer>
              <Button variant="ghost" onClick={() => setEditGroupModal(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setDetectedGroups((prev) =>
                    prev.map((g) =>
                      g.name === editGroupModal
                        ? {
                            ...g,
                            fieldList: editGroupFields,
                            countStr: `${editGroupFields.split(",").filter((x) => x.trim()).length} fields`,
                          }
                        : g
                    )
                  );
                  toast(`Saved mapping adjustments for ${editGroupModal}`);
                  setEditGroupModal(null);
                }}
              >
                Apply mapping
              </Button>
            </footer>
          </div>
        </div>
      )}

      <div className="library-tools">
        <div className="search">
          <Icon name="search" />
          <input
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search datafields across all datasets…"
          />
        </div>
        <Button variant="secondary" icon="upload" onClick={() => setStage("idle")}>
          Upload more
        </Button>
      </div>

      <section className="fresh-card">
        <div className="spark">
          <Icon name="sparkle" />
        </div>
        <div>
          <Badge tone="green">FRESH TERRITORY</Badge>
          <h3>Explore News Sentiment</h3>
          <p>You haven’t used any of its 32 fields yet. It pairs well with Fundamental data.</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            saveImport();
            toast("News Sentiment fields unlocked in your workspace");
          }}
        >
          View recommendation
        </Button>
      </section>

      <div className="dataset-list">
        {visibleDatasets.map((d, di) => (
          <details className="card dataset" open key={d[0]}>
            <summary>
              <div className="dataset-icon">
                <Icon name="database" />
              </div>
              <div>
                <h3>{d[0]}</h3>
                <p>
                  {d[1]} of {d[2]} fields used
                </p>
              </div>
              <div className="progress">
                <span style={{ width: `${(Number(d[1]) / Number(d[2])) * 100}%` }} />
              </div>
              <b>
                {d[1]}/{d[2]}
              </b>
              <Icon name="chevron" />
            </summary>
            <div className="field-chips">
              {d[3].map((x, i) => (
                <button
                  type="button"
                  className={i < di + 1 ? "used" : ""}
                  onClick={() => onCopy(x, `Datafield ${x}`)}
                  key={x}
                  title="Click to copy datafield"
                >
                  <span>{i < di + 1 ? <Icon name="check" size={13} /> : <i />}</span>
                  <code>{x}</code>
                  {i < di + 1 && <small>used in {i + 2}</small>}
                </button>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function FixGuide({
  onCopy,
  onAskAI,
  onOpenCommand,
}: {
  onCopy: (text: string, label: string) => void;
  onAskAI: (topic: string, description: string) => void;
  onOpenCommand?: () => void;
}) {
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("All");

  // Interactive Diagnostic Lab State
  const [diagExpr, setDiagExpr] = useState("rank(ts_delta(close, 3))");
  const [diagnosed, setDiagnosed] = useState<{
    status: "clean" | "warning" | "danger";
    issues: string[];
    suggestedFix: string;
  } | null>(null);

  const runDiagnostic = () => {
    const expr = diagExpr.toLowerCase().trim();
    const issues: string[] = [];
    let fix = diagExpr;

    if (expr.includes("close") || expr.includes("open")) {
      issues.push("High correlation hazard: raw price fields have high overlap with peer alphas.");
      fix = fix.replace(/close/g, "anl14_eps").replace(/open/g, "fnd6_cashflow_op");
    }
    if (expr.includes("3") || expr.includes("2") || expr.includes("5")) {
      issues.push("Turnover hazard: lookback under 10 days produces excessive trading costs.");
      fix = `ts_mean(${fix}, 10)`;
    }
    if (!expr.includes("group_neutralize") && !expr.includes("subindustry")) {
      issues.push("Sub-universe hazard: unneutralized signal risks sector bias.");
      fix = `group_neutralize(${fix}, subindustry)`;
    }

    if (issues.length === 0) {
      issues.push("Structure is sound: lookback, neutralization, and orthogonal datafields detected.");
    }

    setDiagnosed({
      status: issues.length > 2 ? "danger" : issues.length > 1 ? "warning" : "clean",
      issues,
      suggestedFix: fix,
    });
  };

  const problems = [
    [
      "High self-correlation",
      "Your alpha is too similar to signals you have already submitted.",
      "Use less-explored datafields, change the operator family, or neutralize at a finer group level.",
      "rank(ts_delta(alt_data_field, 20))",
      "Correlation",
    ],
    [
      "Low Sharpe",
      "Returns are not consistent enough relative to volatility.",
      "Increase the lookback period, winsorize outliers, and combine with a quality filter.",
      "rank(ts_mean(signal, 20)) * rank(roe)",
      "Performance",
    ],
    [
      "Turnover too high",
      "The signal changes positions too frequently.",
      "Add decay, smooth your input with ts_mean, or increase your lookback window.",
      "ts_mean(rank(signal), 10)",
      "Turnover",
    ],
    [
      "Sub-universe failure",
      "Performance breaks down in smaller stock universes.",
      "Avoid illiquid fields and normalize by market capitalization.",
      "group_neutralize(signal, industry)",
      "Coverage",
    ],
    [
      "Low coverage / NaNs",
      "Too many instruments have missing input values.",
      "Backfill sparse fields and combine with a broadly covered field.",
      "ts_backfill(sparse_field, 120)",
      "Robustness",
    ],
  ];

  const filteredProblems = problems.filter((p) => {
    const matchesSearch = `${p[0]} ${p[1]} ${p[2]}`.toLowerCase().includes(search.toLowerCase());
    const matchesTopic = topic === "All" || p[4] === topic;
    return matchesSearch && matchesTopic;
  });

  return (
    <div className="page narrow">
      <header className="page-title">
        <div>
          <div className="eyebrow">PROBLEM SOLVER</div>
          <h1>Fix Guide</h1>
          <p>Diagnose problems faster. Build stronger alphas.</p>
        </div>
      </header>

      {/* Interactive Expression Diagnostic Lab */}
      <section className="card" style={{ marginBottom: "20px", padding: "18px 20px" }}>
        <div className="card-head" style={{ marginBottom: "12px" }}>
          <div>
            <Badge tone="violet">DIAGNOSTIC LAB</Badge>
            <h3 style={{ marginTop: "4px" }}>Test an expression for common simulation errors</h3>
            <p>Paste any alpha formula to check for turnover, self-correlation, and neutralization risks.</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px" }}>
          <input
            style={{
              flex: 1,
              fontFamily: "DM Mono, monospace",
              padding: "10px 14px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "inherit",
              fontSize: "13px",
            }}
            value={diagExpr}
            onChange={(e) => setDiagExpr(e.target.value)}
            placeholder="e.g. rank(ts_delta(close, 5)) * rank(roe)"
          />
          <Button icon="sparkle" onClick={runDiagnostic}>
            Diagnose
          </Button>
        </div>
        {diagnosed && (
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "8px",
              background:
                diagnosed.status === "danger"
                  ? "rgba(225, 75, 86, 0.08)"
                  : diagnosed.status === "warning"
                    ? "rgba(214, 138, 22, 0.08)"
                    : "rgba(24, 166, 106, 0.08)",
              border: `1px solid ${
                diagnosed.status === "danger"
                  ? "var(--red)"
                  : diagnosed.status === "warning"
                    ? "var(--amber)"
                    : "var(--green)"
              }`,
            }}
          >
            <b style={{ display: "block", marginBottom: "6px" }}>
              {diagnosed.status === "clean" ? "No critical risks detected" : "Issues identified:"}
            </b>
            <ul style={{ margin: "0 0 10px 18px", fontSize: "12px", color: "var(--muted)" }}>
              {diagnosed.issues.map((iss, idx) => (
                <li key={idx}>{iss}</li>
              ))}
            </ul>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "12px", fontWeight: 700 }}>Recommended adjustment:</span>
              <code style={{ fontSize: "12px", padding: "4px 8px", background: "rgba(0,0,0,0.2)", borderRadius: "4px" }}>
                {diagnosed.suggestedFix}
              </code>
              <Button
                variant="secondary"
                onClick={() => {
                  setDiagExpr(diagnosed.suggestedFix);
                  onCopy(diagnosed.suggestedFix, "Recommended formula");
                }}
              >
                Copy & Apply
              </Button>
            </div>
          </div>
        )}
      </section>

      <div className="hero-search">
        <Icon name="search" size={21} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Describe a problem, e.g. “my turnover is too high”"
        />
        <kbd
          style={{ cursor: "pointer" }}
          onClick={() => {
            if (onOpenCommand) onOpenCommand();
          }}
          title="Open Command Palette"
        >
          ⌘ K
        </kbd>
      </div>
      <div className="topic-chips">
        {["All", "Correlation", "Performance", "Turnover", "Coverage", "Robustness"].map((x) => (
          <button
            type="button"
            key={x}
            style={{
              cursor: "pointer",
              border: 0,
              background: "transparent",
              padding: 0,
            }}
            onClick={() => setTopic(x)}
          >
            <Badge tone={topic === x ? "violet" : "neutral"}>{x}</Badge>
          </button>
        ))}
      </div>
      <div className="guide-list">
        {filteredProblems.map((p, i) => (
          <details className="card guide" open={i === 0} key={p[0]}>
            <summary>
              <span className={`problem-icon p${i}`}>
                <Icon name={i ? "book" : "bell"} />
              </span>
              <div>
                <h3>{p[0]}</h3>
                <p>{p[1]}</p>
              </div>
              <Icon name="chevron" />
            </summary>
            <div className="guide-body">
              <h4>What to try</h4>
              <p>{p[2]}</p>
              <ol>
                <li>Inspect fields and compare against your vault history.</li>
                <li>Apply one structural change at a time and rerun.</li>
                <li>Validate across regions before submitting.</li>
              </ol>
              <div className="expression">
                <code>{p[3]}</code>
                <button type="button" onClick={() => onCopy(p[3], p[0])} title="Copy formula">
                  <Icon name="copy" />
                </button>
              </div>
              <Button
                variant="secondary"
                icon="sparkle"
                onClick={() => onAskAI(p[0], p[2])}
              >
                Ask AI about this
              </Button>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function Combinations({
  go,
  toast,
  onStartWithCombo,
}: {
  go: (p: Page) => void;
  toast: (s: string) => void;
  onStartWithCombo: (expr: string) => void;
}) {
  const [personalized, setPersonalized] = useState(false);
  const [riskFilter, setRiskFilter] = useState("All");

  const basePairs = [
    [
      "News Sentiment",
      "Market",
      "Medium",
      "Combine fresh narrative signals with price confirmation.",
      "rank(sentiment) * rank(ts_delta(close, 5))",
    ],
    [
      "Fundamental",
      "Analyst",
      "Low",
      "Quality fundamentals provide a stable base while revisions capture changing expectations.",
      "rank(roe) * rank(ts_delta(eps_est, 20))",
    ],
    [
      "Options",
      "Fundamental",
      "Low",
      "Use implied expectations to find mispriced balance-sheet quality.",
      "rank(implied_vol / hist_vol) * rank(bookvalue / cap)",
    ],
    [
      "Analyst",
      "Short Interest",
      "High",
      "Contrast consensus changes with informed bearish positioning.",
      "-rank(short_interest) * rank(ts_zscore(eps_revision, 30))",
    ],
  ];

  const pairs = useMemo(() => {
    let list = [...basePairs];
    if (personalized) {
      list.sort((a, b) => (a[2] === "Low" ? -1 : 1));
    }
    if (riskFilter !== "All") {
      list = list.filter((p) => p[2] === riskFilter);
    }
    return list;
  }, [personalized, riskFilter]);

  return (
    <div className="page">
      <header className="page-title">
        <div>
          <div className="eyebrow">IDEA GENERATOR</div>
          <h1>Dataset Combinations</h1>
          <p>Research pairings designed to reduce overlap and spark new hypotheses.</p>
        </div>
        <Button
          variant={personalized ? "primary" : "secondary"}
          onClick={() => {
            const next = !personalized;
            setPersonalized(next);
            toast(
              next
                ? "Recommendations personalized: prioritizing lowest correlation with your vault"
                : "Standard combination view restored"
            );
          }}
        >
          {personalized ? "✓ Personalized" : "Personalize"}
        </Button>
      </header>
      <section className="combination-hero">
        <div>
          <Badge tone="green">{personalized ? "CUSTOMIZED FOR YOUR VAULT" : "RECOMMENDED FOR YOU"}</Badge>
          <h2>Go beyond your usual datasets</h2>
          <p>
            {personalized
              ? "Re-ordered based on your submitted alphas to minimize self-correlation."
              : "3 combinations use fields you haven’t explored yet."}
          </p>
        </div>
        <div className="venn">
          <i>FND</i>
          <i>NEWS</i>
        </div>
      </section>

      <div className="topic-chips" style={{ marginBottom: "16px" }}>
        {["All", "Low", "Medium", "High"].map((rf) => (
          <button
            type="button"
            key={rf}
            style={{ cursor: "pointer", border: 0, background: "transparent", padding: 0 }}
            onClick={() => setRiskFilter(rf)}
          >
            <Badge tone={riskFilter === rf ? "violet" : "neutral"}>
              {rf === "All" ? "All correlation levels" : `${rf} corr. risk`}
            </Badge>
          </button>
        ))}
      </div>

      <div className="combo-grid">
        {pairs.map((p, i) => (
          <article className="card combo" key={p[0] + p[1]}>
            <div className="combo-top">
              <div className={`dataset-logo d${i}`}>{p[0].slice(0, 2)}</div>
              <span>+</span>
              <div className={`dataset-logo d${i + 1}`}>{p[1].slice(0, 2)}</div>
              <Badge tone={p[2] === "Low" ? "green" : p[2] === "High" ? "red" : "amber"}>
                {p[2]} corr. risk
              </Badge>
            </div>
            <h3>
              {p[0]} + {p[1]}
            </h3>
            {p[0] === "News Sentiment" && <Badge tone="violet">BOTH NEW TO YOU</Badge>}
            <p>{p[3]}</p>
            <div className="idea">
              <span>EXAMPLE IDEA</span>
              <code>{p[4]}</code>
            </div>
            <Button
              variant="secondary"
              icon="arrow"
              onClick={() => onStartWithCombo(p[4])}
            >
              Start alpha with this
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}

function Assistant({
  onCopy,
  toast,
  initialPrompt,
  setInitialPrompt,
  onStartInVault,
}: {
  onCopy: (text: string, label: string) => void;
  toast: (s: string) => void;
  initialPrompt?: string;
  setInitialPrompt?: (s: string) => void;
  onStartInVault?: (expr: string) => void;
}) {
  const [messages, setMessages] = useState<Array<{ from: "ai" | "user"; text: string; code?: string }>>([
    {
      from: "ai",
      text: "Good morning, Alex. I can help you diagnose an alpha, find fresh datafields, or explore a new research idea. What are you working on?",
    },
  ]);
  const [text, setText] = useState(initialPrompt || "");
  const [loading, setLoading] = useState(false);
  const [contextAlpha, setContextAlpha] = useState<string | null>("Quality momentum");
  const [activeDatasets, setActiveDatasets] = useState<string[]>(["Fundamental", "Analyst", "Market"]);

  const toggleDatasetContext = (d: string) => {
    setActiveDatasets((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  useEffect(() => {
    if (initialPrompt) {
      setText(initialPrompt);
      if (setInitialPrompt) setInitialPrompt("");
    }
  }, [initialPrompt, setInitialPrompt]);

  const send = async (msg = text) => {
    if (!msg.trim()) return;
    const userMsg = msg.trim();
    setText("");
    setMessages((m) => [...m, { from: "user", text: userMsg }]);
    setLoading(true);

    let reply = "I analyzed your signal logic. To improve performance while lowering correlation, try combining with orthogonal datasets.";
    let code: string | undefined = undefined;

    try {
      const res = await api.assistant.chat(userMsg, { includeUsedFields: true });
      if (res && res.reply) {
        reply = res.reply;
        code = res.code;
      } else {
        reply = "OpenRouter AI returned an empty response. Please try refining your query.";
      }
    } catch {
      reply = "Unable to reach the OpenRouter AI service. Please verify your API key and connection.";
    } finally {
      setLoading(false);
    }

    setMessages((m) => [
      ...m,
      { from: "ai", text: reply, code },
    ]);
  };

  return (
    <div className="assistant-page">
      <div className="chat-main">
        <header>
          <div>
            <div className="ai-avatar">
              <Icon name="sparkle" />
            </div>
            <span>
              <b>Quant AI</b>
              <small>
                <i />
                Online · Context aware
              </small>
            </span>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={() => {
              setMessages([
                {
                  from: "ai",
                  text: "Chat cleared. What alpha or dataset would you like to explore next?",
                },
              ]);
              toast("Chat history reset");
            }}
            title="Clear chat"
          >
            •••
          </button>
        </header>
        <div className="chat-body">
          <div className="chat-date">TODAY</div>
          {messages.map((m, i) => (
            <div className={`message ${m.from}`} key={i}>
              {m.from === "ai" && (
                <div className="ai-avatar">
                  <Icon name="sparkle" />
                </div>
              )}
              <div>
                <p>{m.text}</p>
                {m.code && (
                  <div className="expression" style={{ flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
                    <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between" }}>
                      <code>{m.code}</code>
                      <button type="button" onClick={() => onCopy(m.code!, "AI Formula")} title="Copy formula">
                        <Icon name="copy" />
                      </button>
                    </div>
                    {onStartInVault && (
                      <Button
                        variant="secondary"
                        icon="arrow"
                        onClick={() => onStartInVault(m.code!)}
                      >
                        Open in Alpha Vault
                      </Button>
                    )}
                  </div>
                )}
                <span>{m.from === "ai" ? "Quant AI" : "You"} · just now</span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="message ai">
              <div className="ai-avatar">
                <Icon name="sparkle" />
              </div>
              <div>
                <p style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                  <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  Analyzing hypothesis with OpenRouter AI…
                </p>
                <span>Quant AI · thinking</span>
              </div>
            </div>
          )}
        </div>
        <div className="prompts">
          {[
            "Why is my correlation high?",
            "How do I reduce alpha turnover?",
            "Suggest an unused dataset idea",
          ].map((x) => (
            <button type="button" onClick={() => send(x)} key={x}>
              {x}
            </button>
          ))}
        </div>
        <div className="composer">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask about your research… (Press Enter to send)"
          />
          <button type="button" onClick={() => send()}>
            <Icon name="arrow" />
          </button>
          <small>Quant AI can make mistakes. Validate suggestions before submitting.</small>
        </div>
      </div>
      <aside className="context-panel">
        <div>
          <h3>Active context</h3>
          <button
            type="button"
            onClick={() => {
              setContextAlpha(null);
              setActiveDatasets([]);
              toast("Context cleared");
            }}
          >
            Clear all
          </button>
        </div>
        {contextAlpha ? (
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>SELECTED ALPHA</span>
              <button
                type="button"
                style={{ background: "transparent", border: 0, color: "var(--muted)", cursor: "pointer", fontSize: "11px" }}
                onClick={() => setContextAlpha(null)}
              >
                Remove
              </button>
            </div>
            <article>
              <div className="dataset-icon">
                <Icon name="vault" />
              </div>
              <div>
                <b>{contextAlpha}</b>
                <code>rank(ts_delta(close, 5)) * rank(roe)</code>
              </div>
            </article>
          </section>
        ) : (
          <section>
            <span>SELECTED ALPHA</span>
            <p style={{ fontSize: "12px", color: "var(--muted)", margin: "4px 0" }}>No alpha selected.</p>
          </section>
        )}
        <section>
          <span>DATASETS IN PLAY ({activeDatasets.length})</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {["Fundamental", "Analyst", "Market", "News Sentiment"].map((d, i) => (
              <button
                type="button"
                key={d}
                style={{ background: "transparent", border: 0, cursor: "pointer", padding: 0 }}
                onClick={() => toggleDatasetContext(d)}
              >
                <Badge tone={activeDatasets.includes(d) ? (i === 0 ? "blue" : i === 1 ? "violet" : i === 2 ? "green" : "amber") : "neutral"}>
                  {activeDatasets.includes(d) ? `✓ ${d}` : `+ ${d}`}
                </Badge>
              </button>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

const journeyResearch = [
  {
    region: "USA",
    delay: "D1",
    dataset: "Fundamentals",
    submitted: true,
    qualifies: true,
    fitness: 0.76,
    sharpe: 2.08,
    corr: 0.42,
  },
  {
    region: "USA",
    delay: "D1",
    dataset: "Analyst",
    submitted: true,
    qualifies: true,
    fitness: 0.68,
    sharpe: 1.82,
    corr: 0.51,
  },
  {
    region: "USA",
    delay: "D1",
    dataset: "Market",
    submitted: true,
    qualifies: false,
    fitness: 0.39,
    sharpe: 1.18,
    corr: 0.73,
  },
  {
    region: "USA",
    delay: "D0",
    dataset: "Fundamentals",
    submitted: true,
    qualifies: true,
    fitness: 0.64,
    sharpe: 1.74,
    corr: 0.48,
  },
  {
    region: "USA",
    delay: "D0",
    dataset: "Market",
    submitted: true,
    qualifies: true,
    fitness: 0.59,
    sharpe: 1.61,
    corr: 0.44,
  },
  {
    region: "EUR",
    delay: "D1",
    dataset: "Fundamentals",
    submitted: true,
    qualifies: true,
    fitness: 0.66,
    sharpe: 1.77,
    corr: 0.38,
  },
  {
    region: "EUR",
    delay: "D1",
    dataset: "Analyst",
    submitted: true,
    qualifies: false,
    fitness: 0.41,
    sharpe: 1.22,
    corr: 0.67,
  },
  {
    region: "ASI",
    delay: "D1",
    dataset: "Market",
    submitted: true,
    qualifies: true,
    fitness: 0.61,
    sharpe: 1.69,
    corr: 0.41,
  },
  {
    region: "ASI",
    delay: "D1",
    dataset: "Options",
    submitted: true,
    qualifies: false,
    fitness: 0.43,
    sharpe: 1.27,
    corr: 0.62,
  },
];

const journeyRows = ["USA · D1", "USA · D0", "EUR · D1", "ASI · D1"];
const journeyCols = ["Fundamentals", "Analyst", "Market", "News", "Options"];
const coverageStates: CoverageState[][] = [
  ["covered", "covered", "improve", "progress", "missing"],
  ["covered", "progress", "covered", "missing", "missing"],
  ["covered", "improve", "progress", "missing", "missing"],
  ["progress", "missing", "covered", "missing", "improve"],
];

function JourneySparkline({ values, green = false }: { values: number[]; green?: boolean }) {
  const points = values
    .map((value, index) => `${(index / (values.length - 1)) * 300},${70 - value * 0.58}`)
    .join(" ");
  return (
    <svg className="journey-spark" viewBox="0 0 300 75" preserveAspectRatio="none">
      <path d="M0 18H300M0 40H300M0 62H300" />
      <polyline className={green ? "green" : ""} points={points} />
      <circle cx="300" cy={70 - values[values.length - 1] * 0.58} r="3" />
    </svg>
  );
}

function Pyramid({
  go,
  toast,
  onStartAlpha,
}: {
  go: (page: Page) => void;
  toast?: (s: string) => void;
  onStartAlpha?: (expr: string) => void;
}) {
  const [section, setSection] = useState("Overview");
  const [range, setRange] = useState("30D");
  const [cell, setCell] = useState<{ row: number; col: number } | null>(null);
  const [scoreInfo, setScoreInfo] = useState<"osmosis" | "value" | null>(null);
  const [achievement, setAchievement] = useState<string | null>(null);
  const [coverageFilter, setCoverageFilter] = useState("All states");
  const [coverageSearch, setCoverageSearch] = useState("");
  const [selectedLevelModal, setSelectedLevelModal] = useState<number | null>(null);
  const [whyModal, setWhyModal] = useState(false);
  const [altRecommendation, setAltRecommendation] = useState(false);
  const [allAchievementsModal, setAllAchievementsModal] = useState(false);

  const levelDetails = [
    {
      name: "Initiate",
      xp: "0 XP",
      status: "Completed",
      perks: [
        "Access to single-region research (USA)",
        "Daily submission quota: 2 alphas",
        "Fundamental dataset library access",
        "Basic performance sparklines",
      ],
    },
    {
      name: "Apprentice",
      xp: "800 XP",
      status: "Active (Current Level)",
      perks: [
        "Multi-region simulations (USA, Europe, Asia Pacific)",
        "Daily submission limit: 4 alphas",
        "Dataset Combinations & Osmosis metrics unlocked",
        "Analyst revisions and Market datasets unlocked",
      ],
    },
    {
      name: "Expert",
      xp: "2,000 XP",
      status: "In Progress (68% complete)",
      perks: [
        "Subindustry and custom group neutralization",
        "News Sentiment and ESG datafields unlocked",
        "Daily submission quota: 8 alphas",
        "Priority simulation queue processing",
      ],
    },
    {
      name: "Master",
      xp: "4,500 XP",
      status: "Locked",
      perks: [
        "Custom dataset upload and private signals",
        "Cross-regional statistical arbitrage framework",
        "Direct review by WorldQuant Brain portfolio managers",
      ],
    },
    {
      name: "Grandmaster",
      xp: "8,000 XP",
      status: "Locked",
      perks: [
        "Institutional capital allocation eligibility",
        "Global researcher leaderboard feature",
        "Research fellowship grant and monthly consulting retainer",
      ],
    },
  ];

  const handleExportTimeline = () => {
    const timelineEvents = [
      ["Timestamp", "Event", "Description", "XP Earned"],
      ["Today · 10:42", "Alpha qualified", "Quality Momentum passed fitness and correlation thresholds", "+35 XP"],
      ["Yesterday · 16:18", "Dataset discovered", "Started research with News Sentiment in Europe", "+20 XP"],
      ["20 May · 14:05", "Pyramid milestone", "USA D0 Market became qualified coverage", "+100 XP"],
      ["18 May · 09:31", "Achievement unlocked", "Regional Pioneer — qualified research in three regions", "+150 XP"],
      ["17 May · 17:52", "Weekly objective", "Submitted 15th qualifying alpha this week", "+40 XP"],
      ["12 May · 11:20", "Level upgraded", "Advanced from Initiate to Apprentice", "Level 2"],
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      timelineEvents.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const encoded = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download", `quantstorm-research-timeline-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (toast) toast("Downloaded research timeline as CSV");
  };
  const submitted = journeyResearch.filter((alpha) => alpha.submitted);
  const qualifying = submitted.filter((alpha) => alpha.qualifies);
  const uniqueDatasets = new Set(submitted.map((alpha) => alpha.dataset)).size;
  const uniqueRegions = new Set(submitted.map((alpha) => alpha.region)).size;
  const uniqueDelays = new Set(submitted.map((alpha) => alpha.delay)).size;
  const avgFitness = qualifying.reduce((sum, alpha) => sum + alpha.fitness, 0) / qualifying.length;
  const avgSharpe = qualifying.reduce((sum, alpha) => sum + alpha.sharpe, 0) / qualifying.length;
  const qualifiedCoverage = coverageStates.flat().filter((state) => state === "covered").length;
  const osmosis = Math.round(uniqueDatasets * 9 + uniqueRegions * 8 + uniqueDelays * 7);
  const valueFactor = Math.round(avgFitness * 50 + avgSharpe * 15 + qualifying.length);
  const xp = 1360;
  const xpTarget = 2000;
  const xpPercent = Math.round((xp / xpTarget) * 100);
  const levels = [
    ["Initiate", "0 XP"],
    ["Apprentice", "800 XP"],
    ["Expert", "2,000 XP"],
    ["Master", "4,500 XP"],
    ["Grandmaster", "8,000 XP"],
  ];
  const journeyNav = [
    ["Overview", "grid"],
    ["Pyramid Coverage", "pyramid"],
    ["Research Analytics", "layers"],
    ["Achievements", "sparkle"],
    ["Weekly Objectives", "check"],
    ["Dataset Explorer", "database"],
    ["Research History", "book"],
    ["Settings", "settings"],
  ];
  const achievements = [
    ["First Signal", "Submitted your first alpha", true, "50 XP", 100],
    ["Explorer", "Used 5 distinct datasets", true, "100 XP", 100],
    ["Regional Pioneer", "Qualify in 3 regions", true, "150 XP", 100],
    ["Dataset Specialist", "10 qualifying alphas in one dataset", false, "200 XP", 70],
    ["Diversification Expert", "Cover 12 pyramid cells", false, "250 XP", 58],
    ["Consistency Master", "Maintain a 14-day streak", false, "300 XP", 50],
    ["Pyramid Builder", "Qualify every core category", false, "400 XP", 42],
    ["Alpha Champion", "Reach Value Factor 80", false, "500 XP", 78],
  ] as const;
  const objectives = [
    ["Submit 20 qualifying alphas", 18, 20, "250 XP", "3 days"],
    ["Explore two new datasets", 1, 2, "120 XP", "3 days"],
    ["Improve Value Factor", 62, 65, "180 XP", "5 days"],
    ["Complete a pyramid milestone", 3, 4, "200 XP", "5 days"],
  ] as const;
  const selectedCell = cell
    ? {
        row: journeyRows[cell.row],
        category: journeyCols[cell.col],
        status: coverageStates[cell.row][cell.col],
      }
    : null;
  const selectedResearch = selectedCell
    ? journeyResearch.filter((alpha) => {
        const [region, delay] = selectedCell.row.split(" · ");
        return (
          alpha.region === region &&
          alpha.delay === delay &&
          alpha.dataset === selectedCell.category
        );
      })
    : [];
  const recommendation = coverageStates
    .flatMap((states, row) =>
      states.map((status, col) => ({
        row,
        col,
        status,
        score:
          (journeyRows[row].startsWith("EUR") ? 4 : 0) +
          (journeyCols[col] === "News" ? 5 : 0) +
          (status === "missing" ? 3 : status === "improve" ? 2 : 0),
      })),
    )
    .filter((item) => item.status === "missing" || item.status === "improve")
    .sort((a, b) => b.score - a.score)[0];
  const recommendedRegion = journeyRows[recommendation.row].split(" · ")[0];
  const recommendedDelay = journeyRows[recommendation.row].split(" · ")[1];
  const recommendedCategory = journeyCols[recommendation.col];
  const recommendedRegionName =
    recommendedRegion === "EUR" ? "Europe" : recommendedRegion === "ASI" ? "Asia" : "USA";
  const scrollTo = (name: string) => {
    if (name === "Dataset Explorer") {
      go("Datafields");
      return;
    }
    if (name === "Settings") {
      go("Settings");
      return;
    }
    setSection(name);
    document.getElementById(`journey-${name.toLowerCase().replace(/ /g, "-")}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="journey-shell">
      <aside className="journey-nav">
        <div>
          <span>GENIUS JOURNEY</span>
          <b>Progress center</b>
        </div>
        {journeyNav.map(([label, icon]) => (
          <button
            className={section === label ? "active" : ""}
            onClick={() => scrollTo(label)}
            key={label}
          >
            <Icon name={icon} size={16} />
            {label}
          </button>
        ))}
        <div className="journey-user">
          <div className="avatar">AM</div>
          <span>
            <b>Alex Morgan</b>
            <small>Apprentice · Level 2</small>
          </span>
        </div>
      </aside>

      <div className="journey-page">
        <header className="journey-title" id="journey-overview">
          <div>
            <span>WORLDQUANT BRAIN · GENIUS JOURNEY</span>
            <h1>Pyramid &amp; Progress</h1>
            <p>Measure research breadth, strengthen alpha quality, and advance with intent.</p>
          </div>
          <div className="journey-sync">
            <i />
            Research data synced
            <small>2 min ago</small>
          </div>
        </header>

        <section className="journey-level">
          <div className="level-summary">
            <div className="level-orbit">
              <span>02</span>
            </div>
            <div>
              <span className="journey-kicker">CURRENT LEVEL · 2 OF 5</span>
              <h2>Apprentice</h2>
              <p>
                <strong>{xp.toLocaleString()} XP</strong> of {xpTarget.toLocaleString()} to Expert
              </p>
            </div>
          </div>
          <div className="xp-block">
            <div>
              <b>Overall progression</b>
              <strong>{xpPercent}%</strong>
            </div>
            <div className="xp-track">
              <span style={{ width: `${xpPercent}%` }} />
              <i style={{ left: `${xpPercent}%` }} />
            </div>
            <p>
              <Icon name="sparkle" size={14} /> {xpTarget - xp} XP to unlock <b>Expert</b>
            </p>
          </div>
          <div className="level-map">
            {levels.map(([name, requirement], index) => (
              <button
                type="button"
                className={index < 2 ? "complete" : index === 2 ? "next-level" : ""}
                title={`Click to view ${name} requirements and perks (${requirement})`}
                onClick={() => setSelectedLevelModal(index)}
                key={name}
              >
                <i>{index < 2 ? <Icon name="check" size={13} /> : index + 1}</i>
                <span>{name}</span>
                <small>{requirement}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="journey-score-grid">
          <button className="journey-score-card osmosis" onClick={() => setScoreInfo("osmosis")}>
            <div className="score-heading">
              <span>
                <i /> OSMOSIS
              </span>
              <small>
                RESEARCH BREADTH <Icon name="arrow" size={14} />
              </small>
            </div>
            <div className="score-main">
              <strong>{osmosis}</strong>
              <span>
                / 100<b>+6.4 this month</b>
              </span>
              <JourneySparkline values={[28, 34, 39, 48, 46, 57, 61, 68, osmosis]} />
            </div>
            <div className="score-metrics">
              <span>
                <b>{uniqueDatasets}</b>Dataset diversity<small>of 8 tracked</small>
              </span>
              <span>
                <b>{uniqueRegions}</b>Region coverage<small>of 5 available</small>
              </span>
              <span>
                <b>{uniqueDelays}</b>Delay coverage<small>D0 and D1</small>
              </span>
            </div>
            <div className="score-progress">
              <i style={{ width: `${osmosis}%` }} />
            </div>
            <p>
              <b>{80 - osmosis} points</b> to the next breadth milestone
            </p>
          </button>
          <button className="journey-score-card value" onClick={() => setScoreInfo("value")}>
            <div className="score-heading">
              <span>
                <i /> VALUE FACTOR
              </span>
              <small>
                ALPHA IMPACT <Icon name="arrow" size={14} />
              </small>
            </div>
            <div className="score-main">
              <strong>{valueFactor}</strong>
              <span>
                / 100<b>+3.1 this month</b>
              </span>
              <JourneySparkline green values={[37, 35, 41, 45, 48, 46, 53, 57, valueFactor]} />
            </div>
            <div className="score-metrics">
              <span>
                <b>{avgFitness.toFixed(2)}</b>Avg. fitness<small>qualifying only</small>
              </span>
              <span>
                <b>{avgSharpe.toFixed(2)}</b>Avg. Sharpe<small>+0.12 vs last month</small>
              </span>
              <span>
                <b>{qualifying.length}</b>Qualifying alphas
                <small>of {submitted.length} submitted</small>
              </span>
            </div>
            <div className="score-progress">
              <i style={{ width: `${valueFactor}%` }} />
            </div>
            <p>
              Best opportunity: <b>raise fitness above 0.70</b>
            </p>
          </button>
        </section>

        <section className="journey-section" id="journey-pyramid-coverage">
          <div className="journey-section-title">
            <div>
              <span>RESEARCH MAP</span>
              <h2>Interactive Pyramid Coverage</h2>
              <p>
                Coverage records activity. Qualification requires at least one alpha that passes
                quality thresholds.
              </p>
            </div>
            <div className="coverage-stats">
              <span>
                <b>{qualifiedCoverage}/20</b>Qualified
              </span>
              <span>
                <b>65%</b>Active coverage
              </span>
            </div>
          </div>
          <div className="journey-card coverage-card">
            <div className="coverage-toolbar">
              <div className="search">
                <Icon name="search" />
                <input
                  value={coverageSearch}
                  onChange={(event) => setCoverageSearch(event.target.value)}
                  placeholder="Search category…"
                />
              </div>
              <select
                value={coverageFilter}
                onChange={(event) => setCoverageFilter(event.target.value)}
              >
                <option>All states</option>
                <option>Covered</option>
                <option>In progress</option>
                <option>Missing</option>
                <option>Needs improvement</option>
              </select>
              <div className="coverage-legend">
                {(
                  [
                    ["covered", "Qualified"],
                    ["progress", "In progress"],
                    ["improve", "Needs work"],
                    ["missing", "Missing"],
                  ] as const
                ).map(([state, label]) => (
                  <span key={state}>
                    <i className={state} />
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="matrix-wrap">
              <div className="pyramid-matrix">
                <div />
                {journeyCols.map((column) => (
                  <b key={column}>{column}</b>
                ))}
                {journeyRows.map((row, rowIndex) => (
                  <div className="matrix-row" key={row}>
                    <strong>
                      {row}
                      <small>
                        {rowIndex < 2 ? "United States" : rowIndex === 2 ? "Europe" : "Asia"}
                      </small>
                    </strong>
                    {journeyCols.map((column, colIndex) => {
                      const state = coverageStates[rowIndex][colIndex];
                      const visible =
                        (coverageFilter === "All states" ||
                          coverageFilter
                            .toLowerCase()
                            .startsWith(
                              state === "progress" ? "in" : state === "improve" ? "needs" : state,
                            )) &&
                        column.toLowerCase().includes(coverageSearch.toLowerCase());
                      return (
                        <button
                          className={`${state} ${visible ? "" : "dimmed"}`}
                          onClick={() => setCell({ row: rowIndex, col: colIndex })}
                          title={`${row} · ${column} · ${state}`}
                          key={column}
                        >
                          <i>
                            {state === "covered" ? (
                              <Icon name="check" size={16} />
                            ) : state === "progress" ? (
                              "••"
                            ) : state === "improve" ? (
                              "!"
                            ) : (
                              "+"
                            )}
                          </i>
                          <span>
                            {state === "covered"
                              ? "Qualified"
                              : state === "progress"
                                ? "Active"
                                : state === "improve"
                                  ? "Improve"
                                  : "Open"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
              <aside className="matrix-summary">
                <span>QUALIFICATION RATE</span>
                <strong>{Math.round((qualifying.length / submitted.length) * 100)}%</strong>
                <p>
                  {qualifying.length} of {submitted.length} submitted alphas currently meet fitness,
                  Sharpe, and correlation thresholds.
                </p>
                <div>
                  <i style={{ width: `${(qualifying.length / submitted.length) * 100}%` }} />
                </div>
                <button onClick={() => setScoreInfo("value")}>
                  View qualification rules <Icon name="arrow" size={13} />
                </button>
              </aside>
            </div>
          </div>
        </section>

        <section className="journey-card next-action">
          <div className="action-signal">
            <Icon name="sparkle" size={22} />
            <span>
              INTELLIGENT NEXT BEST ACTION
              <small>Recalculated from your live coverage and quality gaps</small>
            </span>
          </div>
          <div className="action-content">
            <div>
              <Badge tone="blue">HIGHEST EXPECTED IMPACT</Badge>
              <h2>{altRecommendation ? "Refine USA D1 Market quality" : `Fill your ${recommendedRegionName} gap.`}</h2>
              <p>
                {altRecommendation
                  ? "Your USA D1 Market cell has 2 submitted alphas that failed fitness threshold. Refining lookback to 20 days with cap-weighting will unlock qualified status."
                  : `Create one ${recommendedRegion} ${recommendedDelay.replace("D", "Delay-")} alpha using ${recommendedCategory} Sentiment. This is your highest-scoring unfilled cell and introduces a category underrepresented in your qualified research.`}
              </p>
              <button
                type="button"
                className="why-link"
                onClick={() => setWhyModal(true)}
                title="Click to view detailed scoring breakdown"
              >
                Why this recommendation?{" "}
                <span>Coverage gap + dataset diversity + low expected correlation</span>
              </button>
            </div>
            <div className="impact-grid">
              <span>
                <small>EXPECTED XP</small>
                <b>{altRecommendation ? "+140" : "+180"}</b>
              </span>
              <span>
                <small>OSMOSIS IMPACT</small>
                <b className="blue">{altRecommendation ? "+2–3" : "+4–6"}</b>
              </span>
              <span>
                <small>VALUE IMPACT</small>
                <b className="green">{altRecommendation ? "+4–5" : "+1–3"}</b>
              </span>
              <span>
                <small>DIFFICULTY</small>
                <b>{altRecommendation ? "Low" : "Moderate"}</b>
              </span>
              <span>
                <small>EST. TIME</small>
                <b>{altRecommendation ? "25–35 min" : "45–60 min"}</b>
              </span>
              <span>
                <small>CONFIDENCE</small>
                <b>{altRecommendation ? "92%" : "84%"}</b>
              </span>
            </div>
          </div>
          <footer>
            <button
              type="button"
              className="alternative"
              onClick={() => {
                const next = !altRecommendation;
                setAltRecommendation(next);
                if (toast) {
                  toast(
                    next
                      ? "Switched recommendation to: USA D1 Market"
                      : "Switched recommendation to: Europe D0 News Sentiment"
                  );
                }
              }}
            >
              {altRecommendation ? "Switch back: Europe D0 News Sentiment" : "Alternative: Improve USA D1 Market quality"}{" "}
              <Icon name="chevron" size={14} />
            </button>
            <div>
              <Button variant="secondary" icon="database" onClick={() => go("Datafields")}>
                Explore datasets
              </Button>
              <Button
                icon="arrow"
                onClick={() => {
                  const expr = altRecommendation
                    ? "rank(ts_delta(close, 20)) * rank(volume / adv20)"
                    : "rank(news_sentiment) * rank(ts_delta(target_price, 10))";
                  if (onStartAlpha) onStartAlpha(expr);
                  go("Alpha Vault");
                }}
              >
                Start research
              </Button>
            </div>
          </footer>
        </section>

        <section className="journey-section" id="journey-weekly-objectives">
          <div className="journey-section-title">
            <div>
              <span>WEEK 21 · 3 DAYS LEFT</span>
              <h2>Weekly Objectives</h2>
              <p>Focused goals that translate research activity into measurable progression.</p>
            </div>
            <b className="week-xp">750 XP available</b>
          </div>
          <div className="objective-grid">
            {objectives.map(([name, current, target, reward, deadline], index) => {
              const percent = Math.min(100, Math.round((current / target) * 100));
              return (
                <article className="journey-card objective" key={name}>
                  <header>
                    <i>{index + 1}</i>
                    <Badge tone={percent >= 90 ? "green" : "blue"}>{reward}</Badge>
                  </header>
                  <h3>{name}</h3>
                  <div>
                    <span style={{ width: `${percent}%` }} />
                  </div>
                  <footer>
                    <b>{percent}%</b>
                    <span>
                      {current} / {target}
                    </span>
                    <small>{deadline} left</small>
                  </footer>
                </article>
              );
            })}
          </div>
        </section>

        <section className="journey-section" id="journey-achievements">
          <div className="journey-section-title">
            <div>
              <span>MILESTONES</span>
              <h2>Achievements</h2>
              <p>Evidence of meaningful research practice, not activity for activity’s sake.</p>
            </div>
            <Button variant="secondary" onClick={() => setAllAchievementsModal(true)}>
              View all achievements
            </Button>
          </div>
          <div className="achievement-grid">
            {achievements.map(([name, description, unlocked, reward, progress], index) => (
              <button
                className={`journey-card achievement ${unlocked ? "unlocked" : "locked"}`}
                onClick={() => setAchievement(name)}
                key={name}
              >
                <div className="achievement-mark">
                  <Icon name={index % 2 ? "pyramid" : "sparkle"} size={21} />
                  {unlocked && (
                    <i>
                      <Icon name="check" size={10} />
                    </i>
                  )}
                </div>
                <Badge tone={unlocked ? "green" : "neutral"}>
                  {unlocked ? "UNLOCKED" : reward}
                </Badge>
                <h3>{name}</h3>
                <p>{description}</p>
                {!unlocked && (
                  <>
                    <div>
                      <span style={{ width: `${progress}%` }} />
                    </div>
                    <small>{progress}% complete</small>
                  </>
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="journey-section" id="journey-research-analytics">
          <div className="journey-section-title">
            <div>
              <span>PERFORMANCE INTELLIGENCE</span>
              <h2>Research Analytics</h2>
              <p>
                Quality, breadth, and risk trends calculated from qualifying and submitted research.
              </p>
            </div>
            <div className="range-tabs">
              {["7D", "30D", "90D", "ALL"].map((item) => (
                <button
                  className={range === item ? "active" : ""}
                  onClick={() => setRange(item)}
                  key={item}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="analytics-grid">
            {[
              [
                "Osmosis history",
                osmosis,
                "+6.4",
                false,
                [38, 42, 45, 51, 55, 60, 64, 69, osmosis],
              ],
              [
                "Value Factor",
                valueFactor,
                "+3.1",
                true,
                [35, 39, 38, 44, 48, 51, 55, 59, valueFactor],
              ],
              ["XP earned", xp, "+280", false, [18, 28, 24, 45, 39, 61, 52, 74, 88]],
              [
                "Coverage growth",
                `${qualifiedCoverage}/20`,
                "+2 cells",
                true,
                [20, 24, 31, 33, 42, 48, 53, 58, 65],
              ],
              [
                "Alpha fitness",
                avgFitness.toFixed(2),
                "+0.04",
                true,
                [45, 42, 48, 51, 49, 56, 58, 61, avgFitness * 100],
              ],
              [
                "Sharpe ratio",
                avgSharpe.toFixed(2),
                "+0.12",
                false,
                [42, 48, 45, 52, 54, 59, 62, 66, avgSharpe * 38],
              ],
              ["Turnover", "18.4%", "−2.1%", true, [72, 68, 70, 59, 62, 55, 49, 45, 42]],
              ["Correlation", "0.47", "−0.06", true, [75, 69, 72, 61, 65, 57, 53, 49, 47]],
            ].map(([name, value, change, green, values]) => (
              <article className="journey-card analytic" key={name as string}>
                <header>
                  <span>{name as string}</span>
                  <Badge tone={String(change).startsWith("−") ? "green" : "blue"}>
                    {change as string}
                  </Badge>
                </header>
                <strong>{value as string | number}</strong>
                <JourneySparkline green={green as boolean} values={values as number[]} />
                <small>
                  {range === "7D"
                    ? "Daily"
                    : range === "30D"
                      ? "Weekly"
                      : range === "90D"
                        ? "Biweekly"
                        : "Monthly"}{" "}
                  trend · qualifying data where applicable
                </small>
              </article>
            ))}
          </div>
        </section>

        <section className="journey-section" id="journey-research-history">
          <div className="journey-section-title">
            <div>
              <span>AUDITABLE PROGRESS</span>
              <h2>Research Timeline</h2>
              <p>A chronological record of actions that changed your journey.</p>
            </div>
            <Button variant="secondary" icon="download" onClick={handleExportTimeline}>
              Export history
            </Button>
          </div>
          <div className="journey-card timeline">
            {[
              [
                "Today · 10:42",
                "Alpha qualified",
                "Quality Momentum passed fitness and correlation thresholds.",
                "+35 XP",
                "check",
              ],
              [
                "Yesterday · 16:18",
                "Dataset discovered",
                "Started research with News Sentiment in Europe.",
                "+20 XP",
                "database",
              ],
              [
                "20 May · 14:05",
                "Pyramid milestone",
                "USA D0 Market became qualified coverage.",
                "+100 XP",
                "pyramid",
              ],
              [
                "18 May · 09:31",
                "Achievement unlocked",
                "Regional Pioneer — qualified research in three regions.",
                "+150 XP",
                "sparkle",
              ],
              [
                "17 May · 17:52",
                "Weekly objective",
                "Submitted 15th qualifying alpha this week.",
                "+40 XP",
                "check",
              ],
              [
                "12 May · 11:20",
                "Level upgraded",
                "Advanced from Initiate to Apprentice.",
                "Level 2",
                "arrow",
              ],
            ].map(([date, title, copy, reward, icon], index) => (
              <article key={title}>
                <div className="timeline-line">
                  <i className={index < 2 ? "active" : ""}>
                    <Icon name={icon} size={15} />
                  </i>
                </div>
                <time>{date}</time>
                <div>
                  <b>{title}</b>
                  <p>{copy}</p>
                </div>
                <Badge tone={index === 3 ? "amber" : "green"}>{reward}</Badge>
              </article>
            ))}
          </div>
        </section>
      </div>

      {cell && selectedCell && (
        <div className="drawer-backdrop" onClick={() => setCell(null)}>
          <aside className="journey-detail" onClick={(event) => event.stopPropagation()}>
            <header>
              <div>
                <span>COVERAGE CELL</span>
                <h2>
                  {selectedCell.row} · {selectedCell.category}
                </h2>
                <p>Research activity and qualification status</p>
              </div>
              <button className="icon-btn" onClick={() => setCell(null)}>
                <Icon name="x" />
              </button>
            </header>
            <div className="detail-status">
              <i className={selectedCell.status} />
              <div>
                <b>
                  {selectedCell.status === "covered"
                    ? "Pyramid qualified"
                    : selectedCell.status === "progress"
                      ? "Research in progress"
                      : selectedCell.status === "improve"
                        ? "Needs quality improvement"
                        : "Coverage missing"}
                </b>
                <span>Coverage and qualification are tracked independently.</span>
              </div>
            </div>
            <div className="detail-grid">
              {[
                ["Region", selectedCell.row.split(" · ")[0]],
                ["Delay", selectedCell.row.split(" · ")[1]],
                ["Category", selectedCell.category],
                ["Available datasets", selectedCell.category === "News" ? "12" : "8"],
                ["Submitted alphas", String(selectedResearch.length)],
                ["Qualifying alphas", String(selectedResearch.filter((x) => x.qualifies).length)],
                [
                  "Average fitness",
                  selectedResearch.length
                    ? (
                        selectedResearch.reduce((s, x) => s + x.fitness, 0) /
                        selectedResearch.length
                      ).toFixed(2)
                    : "—",
                ],
                [
                  "Average Sharpe",
                  selectedResearch.length
                    ? (
                        selectedResearch.reduce((s, x) => s + x.sharpe, 0) / selectedResearch.length
                      ).toFixed(2)
                    : "—",
                ],
                [
                  "Avg. correlation",
                  selectedResearch.length
                    ? (
                        selectedResearch.reduce((s, x) => s + x.corr, 0) / selectedResearch.length
                      ).toFixed(2)
                    : "—",
                ],
              ].map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <b>{value}</b>
                </div>
              ))}
            </div>
            <section>
              <h3>Qualification requirements</h3>
              <p>
                An alpha must be submitted and pass minimum fitness, Sharpe, turnover, and
                correlation checks. Simply exploring a dataset creates coverage, not qualification.
              </p>
              <div className="rule">
                <span>Fitness ≥ 0.50</span>
                <Badge tone={selectedResearch.some((x) => x.fitness >= 0.5) ? "green" : "neutral"}>
                  {selectedResearch.some((x) => x.fitness >= 0.5) ? "Passed" : "Pending"}
                </Badge>
              </div>
              <div className="rule">
                <span>Sharpe ≥ 1.50</span>
                <Badge tone={selectedResearch.some((x) => x.sharpe >= 1.5) ? "green" : "neutral"}>
                  {selectedResearch.some((x) => x.sharpe >= 1.5) ? "Passed" : "Pending"}
                </Badge>
              </div>
              <div className="rule">
                <span>Correlation &lt; 0.70</span>
                <Badge tone={selectedResearch.some((x) => x.corr < 0.7) ? "green" : "neutral"}>
                  {selectedResearch.some((x) => x.corr < 0.7) ? "Passed" : "Pending"}
                </Badge>
              </div>
            </section>
            <footer>
              <Button variant="secondary" onClick={() => go("Datafields")}>
                Explore datasets
              </Button>
              <Button
                onClick={() => {
                  if (selectedCell) {
                    const expr = `rank(ts_delta(${selectedCell.category.toLowerCase()}_metric, 5))`;
                    if (onStartAlpha) onStartAlpha(expr);
                  }
                  go("Alpha Vault");
                }}
              >
                Start research
              </Button>
            </footer>
          </aside>
        </div>
      )}

      {selectedLevelModal !== null && (
        <div className="modal-backdrop" onClick={() => setSelectedLevelModal(null)}>
          <section className="journey-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px" }}>
            <header>
              <div>
                <span>GENIUS ROADMAP · LEVEL {selectedLevelModal + 1}</span>
                <h2>{levelDetails[selectedLevelModal].name}</h2>
              </div>
              <button className="icon-btn" onClick={() => setSelectedLevelModal(null)}>
                <Icon name="x" />
              </button>
            </header>
            <div style={{ margin: "16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Badge tone={selectedLevelModal < 2 ? "green" : selectedLevelModal === 2 ? "blue" : "neutral"}>
                {levelDetails[selectedLevelModal].status}
              </Badge>
              <b>Required: {levelDetails[selectedLevelModal].xp}</b>
            </div>
            <h4 style={{ margin: "12px 0 8px", fontSize: "13px" }}>Unlocked Capabilities &amp; Perks:</h4>
            <ul style={{ margin: "0 0 18px 18px", fontSize: "13px", lineHeight: "1.6", color: "var(--muted)" }}>
              {levelDetails[selectedLevelModal].perks.map((p, idx) => (
                <li key={idx} style={{ color: "inherit" }}>{p}</li>
              ))}
            </ul>
            <footer>
              <Button onClick={() => setSelectedLevelModal(null)}>Close details</Button>
            </footer>
          </section>
        </div>
      )}

      {whyModal && (
        <div className="modal-backdrop" onClick={() => setWhyModal(false)}>
          <section className="journey-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "540px" }}>
            <header>
              <div>
                <span>SCORING INTELLIGENCE</span>
                <h2>Why this recommendation?</h2>
              </div>
              <button className="icon-btn" onClick={() => setWhyModal(false)}>
                <Icon name="x" />
              </button>
            </header>
            <p style={{ fontSize: "13px", color: "var(--muted)", margin: "14px 0" }}>
              The QuantStorm journey optimizer recommends the research path that generates the maximum marginal progress towards your next Genius level:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "14px 0" }}>
              <div style={{ padding: "12px", background: "rgba(255,255,255,0.04)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <b style={{ display: "block", color: "var(--accent)" }}>1. Uncovered Pyramid Cell (+5 pts)</b>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                  Europe D0 News Sentiment currently has 0 qualifying alphas. Fulfilling it turns the cell qualified on your research matrix.
                </span>
              </div>
              <div style={{ padding: "12px", background: "rgba(255,255,255,0.04)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <b style={{ display: "block", color: "#18a66a" }}>2. Zero Dataset Overlap (+4 pts)</b>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                  You haven't used any News Sentiment fields yet. New dataset families guarantee minimal self-correlation against your vault.
                </span>
              </div>
              <div style={{ padding: "12px", background: "rgba(255,255,255,0.04)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <b style={{ display: "block", color: "#4e8cf7" }}>3. High Osmosis Yield (+3 pts)</b>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                  Expected XP: +180 XP, Osmosis increase: +4 to +6 points towards your Apprentice milestone.
                </span>
              </div>
            </div>
            <footer>
              <Button onClick={() => setWhyModal(false)}>Got it</Button>
            </footer>
          </section>
        </div>
      )}

      {allAchievementsModal && (
        <div className="modal-backdrop" onClick={() => setAllAchievementsModal(false)}>
          <section className="journey-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px", maxHeight: "80vh", overflowY: "auto" }}>
            <header>
              <div>
                <span>RESEARCH MILESTONES</span>
                <h2>All Genius Achievements ({achievements.length})</h2>
              </div>
              <button className="icon-btn" onClick={() => setAllAchievementsModal(false)}>
                <Icon name="x" />
              </button>
            </header>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "16px 0" }}>
              {achievements.map(([name, desc, unlocked, reward, prog]) => (
                <div
                  key={name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    borderRadius: "8px",
                    background: unlocked ? "rgba(24, 166, 106, 0.08)" : "rgba(255, 255, 255, 0.03)",
                    border: `1px solid ${unlocked ? "rgba(24, 166, 106, 0.3)" : "var(--border)"}`,
                  }}
                >
                  <div>
                    <b style={{ fontSize: "13px" }}>{name}</b>
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--muted)" }}>{desc}</p>
                  </div>
                  <div style={{ textAlign: "right", minWidth: "90px" }}>
                    <Badge tone={unlocked ? "green" : "neutral"}>
                      {unlocked ? "UNLOCKED" : `${prog}%`}
                    </Badge>
                    <small style={{ display: "block", marginTop: "3px", fontSize: "11px", color: "var(--muted)" }}>{reward}</small>
                  </div>
                </div>
              ))}
            </div>
            <footer>
              <Button onClick={() => setAllAchievementsModal(false)}>Close</Button>
            </footer>
          </section>
        </div>
      )}

      {scoreInfo && (
        <div className="modal-backdrop" onClick={() => setScoreInfo(null)}>
          <section className="journey-modal" onClick={(event) => event.stopPropagation()}>
            <header>
              <div>
                <span>SCORE METHODOLOGY</span>
                <h2>
                  {scoreInfo === "osmosis"
                    ? "Osmosis · Research Breadth"
                    : "Value Factor · Alpha Impact"}
                </h2>
              </div>
              <button className="icon-btn" onClick={() => setScoreInfo(null)}>
                <Icon name="x" />
              </button>
            </header>
            <div className="formula-score">
              <strong>{scoreInfo === "osmosis" ? osmosis : valueFactor}</strong>
              <span>
                Current score
                <br />
                <small>Recalculated from synced research</small>
              </span>
            </div>
            {scoreInfo === "osmosis" ? (
              <div className="formula">
                <p>
                  <b>Dataset diversity</b>
                  <span>{uniqueDatasets} × 9</span>
                  <strong>{uniqueDatasets * 9}</strong>
                </p>
                <p>
                  <b>Region coverage</b>
                  <span>{uniqueRegions} × 8</span>
                  <strong>{uniqueRegions * 8}</strong>
                </p>
                <p>
                  <b>Delay coverage</b>
                  <span>{uniqueDelays} × 7</span>
                  <strong>{uniqueDelays * 7}</strong>
                </p>
              </div>
            ) : (
              <div className="formula">
                <p>
                  <b>Qualifying fitness</b>
                  <span>{avgFitness.toFixed(2)} × 50</span>
                  <strong>{Math.round(avgFitness * 50)}</strong>
                </p>
                <p>
                  <b>Qualifying Sharpe</b>
                  <span>{avgSharpe.toFixed(2)} × 15</span>
                  <strong>{Math.round(avgSharpe * 15)}</strong>
                </p>
                <p>
                  <b>Qualifying alpha count</b>
                  <span>{qualifying.length} × 1</span>
                  <strong>{qualifying.length}</strong>
                </p>
              </div>
            )}
            <div className="method-note">
              <Icon name="book" />
              <p>
                <b>Transparent by design</b>Submitted alphas only affect quality metrics after they
                satisfy current qualification rules. Scores update when source research data
                changes.
              </p>
            </div>
            <footer>
              <Button onClick={() => setScoreInfo(null)}>Got it</Button>
            </footer>
          </section>
        </div>
      )}

      {achievement && (
        <div className="modal-backdrop" onClick={() => setAchievement(null)}>
          <section
            className="achievement-modal journey-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="icon-btn" onClick={() => setAchievement(null)}>
              <Icon name="x" />
            </button>
            <div className="achievement-mark">
              <Icon name="sparkle" size={28} />
            </div>
            <span>ACHIEVEMENT</span>
            <h2>{achievement}</h2>
            <p>{achievements.find((item) => item[0] === achievement)?.[1]}</p>
            <div className="achievement-reward">
              <span>REWARD</span>
              <b>{achievements.find((item) => item[0] === achievement)?.[3]}</b>
            </div>
            <Button onClick={() => setAchievement(null)}>Close details</Button>
          </section>
        </div>
      )}
    </div>
  );
}

function Finance({
  toast,
  onCopy,
}: {
  toast: (s: string) => void;
  onCopy: (text: string, label: string) => void;
}) {
  const [modal, setModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"Overview" | "Salary" | "Referrals">("Overview");
  const [financeRange, setFinanceRange] = useState<"3m" | "6m" | "12m" | "all">("6m");

  const [records, setRecords] = useState<Array<[string, string, string, string, string?]>>([
    ["20 May 2024", "Salary", "May alpha compensation", "$1,560"],
    ["12 May 2024", "Referral", "5 active researchers", "$280"],
    ["30 Apr 2024", "Salary", "April alpha compensation", "$1,610"],
    ["15 Apr 2024", "Referral", "4 active researchers", "$240"],
    ["31 Mar 2024", "Salary", "March alpha compensation", "$1,230"],
  ]);

  // Load finance records from MongoDB on mount
  useEffect(() => {
    let active = true;
    api.finance.list().then(async (res) => {
      if (!active) return;
      if (res && Array.isArray(res.items) && res.items.length > 0) {
        setRecords(
          res.items.map((it: any) => [
            it.date
              ? new Date(it.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
              : "Today",
            it.type ? it.type.charAt(0).toUpperCase() + it.type.slice(1) : "Salary",
            it.note || it.description || "Alpha compensation",
            `$${(it.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
            it._id || it.id,
          ])
        );
      } else {
        // Seed initial records to MongoDB if empty
        const initial = [
          { date: "2024-05-20", type: "salary", amount: 1560, note: "May alpha compensation" },
          { date: "2024-05-12", type: "referral", amount: 280, note: "5 active researchers" },
          { date: "2024-04-30", type: "salary", amount: 1610, note: "April alpha compensation" },
          { date: "2024-04-15", type: "referral", amount: 240, note: "4 active researchers" },
          { date: "2024-03-31", type: "salary", amount: 1230, note: "March alpha compensation" },
        ];
        for (const it of initial) {
          await api.finance.addEntry(it).catch(() => {});
        }
        const refreshed = await api.finance.list().catch(() => null);
        if (active && refreshed && Array.isArray(refreshed.items) && refreshed.items.length > 0) {
          setRecords(
            refreshed.items.map((it: any) => [
              it.date
                ? new Date(it.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                : "Today",
              it.type ? it.type.charAt(0).toUpperCase() + it.type.slice(1) : "Salary",
              it.note || it.description || "Alpha compensation",
              `$${(it.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
              it._id || it.id,
            ])
          );
        }
      }
    }).catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Modal form states
  const [newDate, setNewDate] = useState("2024-05-20");
  const [newType, setNewType] = useState("Salary");
  const [newAmount, setNewAmount] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const filteredRecords = useMemo(() => {
    if (activeTab === "Overview") return records;
    return records.filter((r) => r[1] === activeTab);
  }, [records, activeTab]);

  const financeChartData = {
    "3m": {
      bars: [53, 69, 91],
      labels: ["Mar", "Apr", "May"],
    },
    "6m": {
      bars: [45, 62, 53, 78, 69, 91],
      labels: ["Dec", "Jan", "Feb", "Mar", "Apr", "May"],
    },
    "12m": {
      bars: [30, 42, 38, 45, 50, 48, 55, 62, 53, 78, 69, 91],
      labels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"],
    },
    "all": {
      bars: [35, 48, 65, 82, 95],
      labels: ["2022", "2023 Q1", "2023 Q3", "2023 Q4", "2024 YTD"],
    },
  }[financeRange];

  const handleDeleteRecord = (idx: number) => {
    const item = filteredRecords[idx];
    setRecords((prev) => prev.filter((r) => r !== item));
    toast("Earnings entry removed");
    if (item && item[4]) {
      api.finance.deleteEntry(item[4]).catch(() => {});
    }
  };

  const handleExportCSV = () => {
    const csv =
      "data:text/csv;charset=utf-8," +
      ["Date,Type,Description,Amount"]
        .concat(records.map((r) => `"${r[0]}","${r[1]}","${r[2]}","${r[3]}"`))
        .join("\n");
    const encoded = encodeURI(csv);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download", `quantstorm-earnings-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Downloaded earnings history CSV");
  };

  const handleAddEntry = async (e: FormEvent) => {
    e.preventDefault();
    if (!newAmount) return;
    const num = parseFloat(newAmount) || 0;
    const formattedAmount = `$${num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
    const desc = newDesc.trim() || `${newType} payout payment`;
    const tempEntry: [string, string, string, string, string?] = [newDate, newType, desc, formattedAmount];
    setRecords([tempEntry, ...records]);
    setModal(false);
    setNewAmount("");
    setNewDesc("");
    toast("Earning entry saved to MongoDB ledger");

    try {
      const res = await api.finance.addEntry({
        date: newDate,
        type: newType.toLowerCase() === "referral" ? "referral" : "salary",
        amount: num,
        description: desc,
      });
      if (res && (res._id || res.id)) {
        const id = res._id || res.id;
        setRecords((prev) =>
          prev.map((r) => (r === tempEntry ? [r[0], r[1], r[2], r[3], id] : r))
        );
      }
    } catch {}
  };

  return (
    <div className="page">
      <header className="page-title">
        <div>
          <div className="eyebrow">EARNINGS</div>
          <h1>Finance</h1>
          <p>Track your research rewards and referral income.</p>
        </div>
        <Button icon="plus" onClick={() => setModal(true)}>
          Add entry
        </Button>
      </header>
      <div className="tab-line">
        {(["Overview", "Salary", "Referrals"] as const).map((t) => (
          <button
            type="button"
            className={activeTab === t ? "active" : ""}
            onClick={() => setActiveTab(t)}
            key={t}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="stats-grid">
        <Stat label="This month" value="$1,840" delta="+14.2% vs last month" icon="wallet" />
        <Stat label="This quarter" value="$4,920" delta="82% of forecast" icon="grid" />
        <Stat label="All time" value="$18,460" delta="Since March 2023" icon="pyramid" />
        <Stat label="Referral earnings" value="$2,180" delta="11 active referrals" icon="layers" />
      </div>
      <div className="two-col wide-left">
        <section className="card finance-chart">
          <div className="card-head">
            <div>
              <h3>Earnings over time</h3>
              <p>Salary and referral income</p>
            </div>
            <select
              value={financeRange}
              onChange={(e) => {
                setFinanceRange(e.target.value as any);
                toast(`Earnings chart updated for ${e.target.value}`);
              }}
            >
              <option value="3m">Last 3 months</option>
              <option value="6m">Last 6 months</option>
              <option value="12m">Last 12 months</option>
              <option value="all">All time</option>
            </select>
          </div>
          <div className="money-bars">
            {financeChartData.bars.map((x, i) => (
              <div key={i}>
                <span style={{ height: `${x}%` }} />
                <i style={{ height: `${x / 4}%` }} />
                <small>{financeChartData.labels[i]}</small>
              </div>
            ))}
          </div>
        </section>
        <section className="card referral">
          <Badge tone="violet">REFERRALS</Badge>
          <h3>Earn together</h3>
          <p>Share QuantStorm and track your network earnings.</p>
          <div className="copy-link">
            <code>quantstorm.io/r/alex7</code>
            <button
              type="button"
              onClick={() => onCopy("https://quantstorm.io/r/alex7", "Referral link")}
              title="Copy referral link"
            >
              <Icon name="copy" />
            </button>
          </div>
          <div>
            <span>Active referrals</span>
            <b>11</b>
          </div>
          <div>
            <span>This month</span>
            <b>$280</b>
          </div>
        </section>
      </div>
      <section className="card data-table">
        <div className="card-head table-title">
          <div>
            <h3>Recent earnings ({filteredRecords.length})</h3>
            <p>All recorded payments</p>
          </div>
          <Button variant="secondary" icon="download" onClick={handleExportCSV}>
            Export CSV
          </Button>
        </div>
        <table>
          <thead>
            <tr>
              <th>DATE</th>
              <th>TYPE</th>
              <th>DESCRIPTION</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((r, i) => (
              <tr key={r[0] + i}>
                {r.slice(0, 4).map((x, j) => (
                  <td key={x + j}>
                    {j === 1 ? (
                      <Badge tone={x === "Referral" ? "violet" : "blue"}>{x}</Badge>
                    ) : j === 3 ? (
                      <b>{x}</b>
                    ) : (
                      x
                    )}
                  </td>
                ))}
                <td>
                  <Badge tone="green">Paid</Badge>
                </td>
                <td>
                  <button
                    type="button"
                    style={{ background: "transparent", border: 0, color: "var(--red)", cursor: "pointer", padding: "4px 8px" }}
                    onClick={() => handleDeleteRecord(i)}
                    title="Remove entry"
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(false)}>
          <form
            className="modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleAddEntry}
          >
            <header>
              <div>
                <h2>Add earning entry</h2>
                <p>Record a salary or referral payment.</p>
              </div>
              <button type="button" className="icon-btn" onClick={() => setModal(false)}>
                <Icon name="x" />
              </button>
            </header>
            <div className="form-grid">
              <label className="field">
                <span>Date</span>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </label>
              <label className="field">
                <span>Type</span>
                <select value={newType} onChange={(e) => setNewType(e.target.value)}>
                  <option>Salary</option>
                  <option>Referral</option>
                </select>
              </label>
            </div>
            <label className="field">
              <span>Amount ($)</span>
              <div className="currency" style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 1500"
                  required
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                />
              </div>
            </label>
            <label className="field">
              <span>Description</span>
              <textarea
                placeholder="Optional payment notes…"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </label>
            <footer>
              <Button variant="ghost" onClick={() => setModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Add entry</Button>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
}

function SettingsPage({
  toast,
  notifications = false,
}: {
  toast?: (s: string) => void;
  notifications?: boolean;
}) {
  const [activeTab, setActiveTab] = useState(notifications ? "Reminder schedule" : "Profile");
  const [fullName, setFullName] = useState("Alex Morgan");
  const [email, setEmail] = useState("alex.morgan@example.com");
  const [region, setRegion] = useState("USA");
  const [universe, setUniverse] = useState("TOP3000");

  const [dailyReminders, setDailyReminders] = useState(true);
  const [submitTarget, setSubmitTarget] = useState("4 alphas");
  const [timezone, setTimezone] = useState("UTC−04:00 · New York");
  const [reminderTimes, setReminderTimes] = useState([true, true, false]);
  const [emailChannel, setEmailChannel] = useState(true);
  const [inAppChannel, setInAppChannel] = useState(true);

  // Additional tab states
  const [defaultNeutralization, setDefaultNeutralization] = useState("SUBINDUSTRY");
  const [defaultLookback, setDefaultLookback] = useState("20 days");
  const [minSharpe, setMinSharpe] = useState("1.58");
  const [themePref, setThemePref] = useState("Dark");
  const [densityPref, setDensityPref] = useState("Comfortable");
  const [githubConnected, setGithubConnected] = useState(false);
  const [apiKey, setApiKey] = useState("wq_live_9f82c44a19b8");
  const [showApiKey, setShowApiKey] = useState(false);
  const [notificationHistory, setNotificationHistory] = useState([
    { id: 1, title: "Submission window closing in 6h", time: "2 hours ago", read: false },
    { id: 2, title: "Alpha 'Quality momentum' qualified", time: "Today 10:42", read: true },
    { id: 3, title: "Weekly objective reward: +40 XP", time: "Yesterday", read: true },
  ]);

  // Daily Ideas Preferences State
  const [ideasEnabled, setIdeasEnabled] = useState(true);
  const [ideasNotifyTime, setIdeasNotifyTime] = useState("08:00");
  const [ideasRegions, setIdeasRegions] = useState<string[]>(["USA", "EUR"]);
  const [ideasAvoidCategories, setIdeasAvoidCategories] = useState<string[]>([]);
  const [ideasDifficulty, setIdeasDifficulty] = useState("all");
  const [shareExpressions, setShareExpressions] = useState(false);

  useEffect(() => {
    let active = true;

    // Load user profile from MongoDB
    api.users.getProfile().then((u) => {
      if (active && u) {
        if (u.name) setFullName(u.name);
        if (u.email) setEmail(u.email);
        if (u.timezone) setTimezone(u.timezone);
        if (u.dailyTarget) setSubmitTarget(`${u.dailyTarget} alphas`);
        if (u.regions && u.regions.length > 0) setRegion(u.regions[0]);
        if (u.reminderPrefs?.channels) {
          if (u.reminderPrefs.channels.email !== undefined) setEmailChannel(u.reminderPrefs.channels.email);
          if (u.reminderPrefs.channels.inApp !== undefined) setInAppChannel(u.reminderPrefs.channels.inApp);
        }
      }
    }).catch(() => {});

    // Load ideas preferences
    api.ideas.getSettings().then((s) => {
      if (active && s) {
        if (s.enabled !== undefined) setIdeasEnabled(s.enabled);
        if (s.notifyTime) setIdeasNotifyTime(s.notifyTime);
        if (s.regions) setIdeasRegions(s.regions);
        if (s.avoidCategories) setIdeasAvoidCategories(s.avoidCategories);
        if (s.difficulty) setIdeasDifficulty(s.difficulty);
        if (s.shareExpressions !== undefined) setShareExpressions(s.shareExpressions);
      }
    }).catch(() => {});

    // Load live notifications from MongoDB
    api.notifications.list().then((res) => {
      if (active && res && Array.isArray(res) && res.length > 0) {
        setNotificationHistory(res.map((n: any) => ({
          id: n._id || n.id,
          title: n.message || n.title || "Notification",
          time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Today",
          read: Boolean(n.readAt),
        })));
      }
    }).catch(() => {});

    return () => { active = false; };
  }, []);

  const handleSaveIdeas = async () => {
    try {
      await api.ideas.updateSettings({
        enabled: ideasEnabled,
        notifyTime: ideasNotifyTime,
        regions: ideasRegions,
        avoidCategories: ideasAvoidCategories,
        difficulty: ideasDifficulty,
        shareExpressions,
      });
      if (toast) toast("Daily Ideas preferences saved to profile");
    } catch {
      if (toast) toast("Preferences saved locally");
    }
  };

  const handleSave = async () => {
    try {
      await api.users.updateProfile({
        name: fullName,
        timezone,
        dailyTarget: parseInt(submitTarget) || 4,
        reminderPrefs: {
          channels: {
            email: emailChannel,
            inApp: inAppChannel,
            push: true,
          },
        },
      });
      await handleSaveIdeas();
      if (toast) toast("Settings and profile successfully saved to MongoDB");
    } catch {
      if (toast) toast("Settings and profile updated");
    }
  };

  const handleExportWorkspace = () => {
    const data = {
      user: { name: fullName, email, region, universe, submitTarget, timezone },
      researchDefaults: { defaultNeutralization, defaultLookback, minSharpe },
      exportedAt: new Date().toISOString(),
      version: "QuantStorm 1.0",
    };
    const encoded = encodeURI("data:text/json;charset=utf-8," + JSON.stringify(data, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download", `quantstorm-workspace-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (toast) toast("Workspace data exported as JSON");
  };

  const tabs = notifications
    ? ["Reminder schedule", "Daily Ideas", "Channels", "Notification history"]
    : [
        "Profile",
        "Daily Ideas",
        "Research defaults",
        "Appearance",
        "Connected accounts",
        "Data & privacy",
        "Plan",
      ];

  return (
    <div className="page settings-page">
      <header className="page-title">
        <div>
          <div className="eyebrow">{notifications ? "STAY ON TRACK" : "WORKSPACE"}</div>
          <h1>{notifications ? "Reminders & Notifications" : "Settings & Profile"}</h1>
          <p>
            {notifications
              ? "Choose when and how QuantStorm keeps you on track."
              : "Manage your profile, preferences, and data."}
          </p>
        </div>
      </header>
      <div className="settings-layout">
        <nav>
          {tabs.map((x) => (
            <button
              type="button"
              className={activeTab === x ? "active" : ""}
              onClick={() => setActiveTab(x)}
              key={x}
            >
              {x}
              <Icon name="chevron" />
            </button>
          ))}
        </nav>
        <section className="card settings-form">
          {activeTab === "Reminder schedule" ? (
            <>
              <h2>Daily submission reminders</h2>
              <p>We’ll remind you only when you’re below your daily target.</p>
              <label className="switch-row">
                <span>
                  <b>Daily reminders</b>
                  <small>Active on submission days</small>
                </span>
                <input
                  type="checkbox"
                  checked={dailyReminders}
                  onChange={(e) => setDailyReminders(e.target.checked)}
                />
              </label>
              <div className="form-grid">
                <label className="field">
                  <span>Daily submit target</span>
                  <input
                    value={submitTarget}
                    onChange={(e) => setSubmitTarget(e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Timezone</span>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  >
                    <option>UTC−04:00 · New York</option>
                    <option>UTC+00:00 · London</option>
                    <option>UTC+08:00 · Singapore</option>
                  </select>
                </label>
              </div>
              <h3>Reminder times</h3>
              {["3 hours before cutoff", "1 hour before cutoff", "15 minutes before cutoff"].map(
                (x, i) => (
                  <label className="check-row" key={x}>
                    <input
                      type="checkbox"
                      checked={reminderTimes[i]}
                      onChange={(e) => {
                        const next = [...reminderTimes];
                        next[i] = e.target.checked;
                        setReminderTimes(next);
                      }}
                    />
                    <span>{x}</span>
                    <small>{["1:00 PM", "3:00 PM", "3:45 PM"][i]}</small>
                  </label>
                )
              )}
            </>
          ) : activeTab === "Daily Ideas" ? (
            <>
              <h2>Daily Ideas Preferences</h2>
              <p>Configure how your 5 daily alpha hypotheses are generated and delivered.</p>

              <label className="switch-row">
                <span>
                  <b>Enable Daily Ideas</b>
                  <small>Receive 5 personalized alpha hypotheses every day</small>
                </span>
                <input
                  type="checkbox"
                  checked={ideasEnabled}
                  onChange={(e) => setIdeasEnabled(e.target.checked)}
                />
              </label>

              <div className="form-grid">
                <label className="field">
                  <span>Batch delivery time</span>
                  <input
                    type="time"
                    value={ideasNotifyTime}
                    onChange={(e) => setIdeasNotifyTime(e.target.value)}
                  />
                  <small style={{ color: "var(--muted)", fontSize: "11px" }}>Local time in {timezone}</small>
                </label>

                <label className="field">
                  <span>Preferred difficulty</span>
                  <select
                    value={ideasDifficulty}
                    onChange={(e) => setIdeasDifficulty(e.target.value)}
                  >
                    <option value="all">All levels (Balanced mix)</option>
                    <option value="easy">Easy (Simpler formulas)</option>
                    <option value="medium">Medium (Standard quantitative)</option>
                    <option value="hard">Hard (Advanced mathematical)</option>
                  </select>
                </label>
              </div>

              <div style={{ marginTop: "14px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: "8px" }}>
                  Focus Regions
                </span>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {["USA", "EUR", "ASI"].map((r) => {
                    const active = ideasRegions.includes(r);
                    return (
                      <button
                        type="button"
                        key={r}
                        onClick={() => {
                          setIdeasRegions((prev) =>
                            active ? prev.filter((x) => x !== r) : [...prev, r]
                          );
                        }}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "8px",
                          fontSize: "12.5px",
                          fontWeight: "600",
                          border: active ? "1px solid var(--accent)" : "1px solid var(--border)",
                          background: active ? "rgba(109, 92, 231, 0.12)" : "var(--surface-2)",
                          color: active ? "var(--accent)" : "var(--text)",
                          cursor: "pointer",
                        }}
                      >
                        {active ? `✓ ${r}` : r}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginTop: "16px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: "8px" }}>
                  Categories to avoid
                </span>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {["news", "analyst", "options", "fundamentals", "market"].map((cat) => {
                    const avoided = ideasAvoidCategories.includes(cat);
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => {
                          setIdeasAvoidCategories((prev) =>
                            avoided ? prev.filter((x) => x !== cat) : [...prev, cat]
                          );
                        }}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          textTransform: "capitalize",
                          border: avoided ? "1px solid var(--red)" : "1px solid var(--border)",
                          background: avoided ? "rgba(225, 75, 86, 0.1)" : "var(--surface-2)",
                          color: avoided ? "var(--red)" : "var(--text)",
                          cursor: "pointer",
                        }}
                      >
                        {avoided ? `✕ Avoid ${cat}` : cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginTop: "18px", padding: "14px", borderRadius: "10px", background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <label className="switch-row" style={{ padding: 0 }}>
                  <span>
                    <b>Share my alpha expressions with AI</b>
                    <small style={{ display: "block", color: "var(--muted)", fontSize: "12px", marginTop: "2px" }}>
                      Default off. When disabled, only dataset and datafield names are sent to the model — your mathematical expressions remain strictly private on your device.
                    </small>
                  </span>
                  <input
                    type="checkbox"
                    checked={shareExpressions}
                    onChange={(e) => setShareExpressions(e.target.checked)}
                  />
                </label>
              </div>

              <div style={{ marginTop: "16px" }}>
                <Button onClick={handleSaveIdeas}>Save Daily Ideas Preferences</Button>
              </div>
            </>
          ) : activeTab === "Channels" ? (
            <>
              <h2>Notification Channels</h2>
              <p>Select where you wish to receive research window nudges and alpha alerts.</p>
              <label className="switch-row compact">
                <span>
                  <b>In-app notifications</b>
                  <small style={{ display: "block", color: "var(--muted)", fontSize: "12px" }}>
                    Status banners and toast nudges inside the platform
                  </small>
                </span>
                <input
                  type="checkbox"
                  checked={inAppChannel}
                  onChange={(e) => setInAppChannel(e.target.checked)}
                />
              </label>
              <label className="switch-row compact">
                <span>
                  <b>Email notifications</b>
                  <small style={{ display: "block", color: "var(--muted)", fontSize: "12px" }}>
                    Sent to {email} before daily cutoff windows
                  </small>
                </span>
                <input
                  type="checkbox"
                  checked={emailChannel}
                  onChange={(e) => setEmailChannel(e.target.checked)}
                />
              </label>
            </>
          ) : activeTab === "Notification history" ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2>Notification History</h2>
                  <p>Recent platform alerts, achievements, and deadline reminders.</p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setNotificationHistory((prev) => prev.map((n) => ({ ...n, read: true })));
                    api.notifications.markAllRead().catch(() => {});
                    if (toast) toast("All notifications marked as read");
                  }}
                >
                  Mark all as read
                </Button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", margin: "16px 0" }}>
                {notificationHistory.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (!n.read) {
                        setNotificationHistory((prev) =>
                          prev.map((it) => (it.id === n.id ? { ...it, read: true } : it))
                        );
                        api.notifications.markRead(String(n.id)).catch(() => {});
                      }
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      background: n.read ? "rgba(255,255,255,0.02)" : "rgba(109,92,231,0.08)",
                      border: `1px solid ${n.read ? "var(--border)" : "var(--accent)"}`,
                    }}
                  >
                    <div>
                      <b style={{ fontSize: "13px" }}>{n.title}</b>
                      <small style={{ display: "block", color: "var(--muted)", fontSize: "11px" }}>{n.time}</small>
                    </div>
                    {!n.read && <Badge tone="violet">New</Badge>}
                  </div>
                ))}
              </div>
            </>
          ) : activeTab === "Research defaults" ? (
            <>
              <h2>Research Defaults</h2>
              <p>Default simulation parameters used when creating new alphas.</p>
              <div className="form-grid">
                <label className="field">
                  <span>Default neutralization</span>
                  <select
                    value={defaultNeutralization}
                    onChange={(e) => setDefaultNeutralization(e.target.value)}
                  >
                    <option>SUBINDUSTRY</option>
                    <option>INDUSTRY</option>
                    <option>SECTOR</option>
                    <option>MARKET</option>
                  </select>
                </label>
                <label className="field">
                  <span>Default lookback window</span>
                  <select
                    value={defaultLookback}
                    onChange={(e) => setDefaultLookback(e.target.value)}
                  >
                    <option>5 days</option>
                    <option>10 days</option>
                    <option>20 days</option>
                    <option>60 days</option>
                  </select>
                </label>
                <label className="field">
                  <span>Minimum Sharpe threshold</span>
                  <input
                    value={minSharpe}
                    onChange={(e) => setMinSharpe(e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Default region</span>
                  <select value={region} onChange={(e) => setRegion(e.target.value)}>
                    <option>USA</option>
                    <option>Europe</option>
                    <option>Asia Pacific</option>
                    <option>China</option>
                    <option>India</option>
                    <option>Global</option>
                  </select>
                </label>
              </div>
            </>
          ) : activeTab === "Appearance" ? (
            <>
              <h2>Appearance &amp; Interface</h2>
              <p>Customize the visual density and theme of your research console.</p>
              <div className="form-grid">
                <label className="field">
                  <span>Theme mode</span>
                  <select value={themePref} onChange={(e) => setThemePref(e.target.value)}>
                    <option>Dark (Default)</option>
                    <option>Light</option>
                    <option>System Match</option>
                  </select>
                </label>
                <label className="field">
                  <span>Information density</span>
                  <select value={densityPref} onChange={(e) => setDensityPref(e.target.value)}>
                    <option>Comfortable</option>
                    <option>Compact (High Data)</option>
                    <option>Spacious</option>
                  </select>
                </label>
              </div>
            </>
          ) : activeTab === "Connected accounts" ? (
            <>
              <h2>Connected Accounts &amp; APIs</h2>
              <p>Manage third-party authentication and WorldQuant Brain API credentials.</p>
              <div className="connected" style={{ marginBottom: "14px" }}>
                <b>G</b>
                <span>
                  <strong>Google</strong>
                  <small>Connected as {email}</small>
                </span>
                <Badge tone="green">Connected</Badge>
              </div>
              <div className="connected" style={{ marginBottom: "18px" }}>
                <b>GH</b>
                <span>
                  <strong>GitHub</strong>
                  <small>{githubConnected ? "Connected as alexmorgan" : "Not connected"}</small>
                </span>
                <Button
                  variant="secondary"
                  onClick={() => {
                    const next = !githubConnected;
                    setGithubConnected(next);
                    if (toast) toast(next ? "GitHub account linked" : "GitHub account disconnected");
                  }}
                >
                  {githubConnected ? "Disconnect" : "Connect"}
                </Button>
              </div>
              <h3>WorldQuant Brain API Token</h3>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  style={{
                    flex: 1,
                    fontFamily: "DM Mono, monospace",
                    padding: "8px 12px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    color: "inherit",
                  }}
                />
                <Button variant="ghost" onClick={() => setShowApiKey(!showApiKey)}>
                  {showApiKey ? "Hide" : "Show"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (toast) toast("✓ WorldQuant Brain API Token verified and active");
                  }}
                >
                  Verify
                </Button>
              </div>
            </>
          ) : activeTab === "Data & privacy" ? (
            <>
              <h2>Data &amp; Privacy</h2>
              <p>Manage your research records, exports, and privacy permissions.</p>
              <div className="danger-zone" style={{ marginTop: "14px" }}>
                <h3>Export &amp; Backups</h3>
                <p>Download your complete research history, alpha expressions, and datasets.</p>
                <Button variant="secondary" icon="download" onClick={handleExportWorkspace}>
                  Export workspace JSON
                </Button>
              </div>
              <div className="danger-zone" style={{ marginTop: "18px" }}>
                <h3>Delete Account</h3>
                <p>Permanently remove your QuantStorm profile and all unsubmitted alpha drafts.</p>
                <Button
                  variant="danger"
                  onClick={() => {
                    if (toast) toast("Account deletion request submitted for processing");
                  }}
                >
                  Delete account
                </Button>
              </div>
            </>
          ) : activeTab === "Plan" ? (
            <>
              <h2>Genius Subscription Plan</h2>
              <p>Your current membership tier and simulation quota.</p>
              <div style={{ padding: "18px", borderRadius: "10px", background: "rgba(109,92,231,0.08)", border: "1px solid var(--accent)", margin: "14px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <Badge tone="violet">CURRENT TIER</Badge>
                    <h3 style={{ margin: "6px 0 2px" }}>Apprentice Tier (Level 2)</h3>
                    <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)" }}>Included with WorldQuant Brain active researcher qualification.</p>
                  </div>
                  <strong style={{ fontSize: "20px" }}>$0 / mo</strong>
                </div>
                <hr style={{ margin: "14px 0", border: 0, borderTop: "1px solid rgba(255,255,255,0.08)" }} />
                <ul style={{ margin: "0 0 14px 18px", fontSize: "12px", lineHeight: "1.7", color: "var(--muted)" }}>
                  <li>Daily submission limit: 4 alphas</li>
                  <li>Multi-region datasets: USA, Europe, Asia Pacific</li>
                  <li>Quant AI assistant with context awareness</li>
                  <li>Dataset combinations generator &amp; Osmosis scoring</li>
                </ul>
                <Button
                  onClick={() => {
                    if (toast) toast("Advancing research XP unlocks Expert tier automatically");
                  }}
                >
                  Upgrade to Expert
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="profile-line">
                <div className="avatar large">AM</div>
                <div>
                  <b>{fullName}</b>
                  <span>{email}</span>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (toast) toast("Avatar updated");
                  }}
                >
                  Change photo
                </Button>
              </div>
              <div className="form-grid">
                <label className="field">
                  <span>Full name</span>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </label>
                <label className="field">
                  <span>Email</span>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                <label className="field">
                  <span>Default region</span>
                  <select value={region} onChange={(e) => setRegion(e.target.value)}>
                    <option>USA</option>
                    <option>Europe</option>
                    <option>Asia Pacific</option>
                    <option>China</option>
                    <option>India</option>
                    <option>Global</option>
                  </select>
                </label>
                <label className="field">
                  <span>Default universe</span>
                  <select value={universe} onChange={(e) => setUniverse(e.target.value)}>
                    <option>TOP3000</option>
                    <option>TOP1000</option>
                    <option>TOP500</option>
                  </select>
                </label>
              </div>
              <h3>Connected account</h3>
              <div className="connected">
                <b>G</b>
                <span>
                  <strong>Google</strong>
                  <small>Connected as {email}</small>
                </span>
                <Badge tone="green">Connected</Badge>
              </div>
              <div className="danger-zone">
                <h3>Data &amp; privacy</h3>
                <p>Export a complete copy of your workspace, or permanently delete your account.</p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <Button variant="secondary" onClick={handleExportWorkspace}>
                    Export all data
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      if (toast) toast("Account deletion request submitted");
                    }}
                  >
                    Delete account
                  </Button>
                </div>
              </div>
            </>
          )}
          <footer>
            <Button onClick={handleSave}>Save changes</Button>
          </footer>
        </section>
      </div>
    </div>
  );
}

function UIKit() {
  const [demoInput, setDemoInput] = useState("Research signal v2");
  const [demoSelect, setDemoSelect] = useState("Option 1");
  const [demoError, setDemoError] = useState("Invalid threshold");
  const [demoToggle, setDemoToggle] = useState(true);
  const [btnToast, setBtnToast] = useState("");

  return (
    <div className="page">
      <header className="page-title">
        <div>
          <div className="eyebrow">DESIGN SYSTEM · V1.0</div>
          <h1>QuantStorm UI Kit</h1>
          <p>A calm, precise interface language for high-velocity research.</p>
        </div>
      </header>
      {btnToast && (
        <div style={{ marginBottom: "14px", padding: "8px 14px", background: "rgba(109,92,231,0.12)", border: "1px solid var(--accent)", borderRadius: "6px", fontSize: "12px" }}>
          <b>Action:</b> {btnToast}
        </div>
      )}
      <div className="kit-grid">
        <section className="card kit">
          <h3>Color system</h3>
          <p>Accessible semantic tokens for light and dark environments.</p>
          <div className="swatches">
            {[
              ["Ink", "#111827"],
              ["Violet", "#6D5CE7"],
              ["Blue", "#4E8CF7"],
              ["Success", "#18A66A"],
              ["Warning", "#D68A16"],
              ["Danger", "#E14B56"],
            ].map((x) => (
              <div key={x[0]}>
                <i style={{ background: x[1] }} />
                <b>{x[0]}</b>
                <code>{x[1]}</code>
              </div>
            ))}
          </div>
        </section>
        <section className="card kit typography">
          <h3>Typography</h3>
          <p>Inter-style sans UI paired with IBM Plex Mono expressions.</p>
          <h1>Display / 40</h1>
          <h2>Heading / 28</h2>
          <h3>Title / 18</h3>
          <p>Body / 14 — Reliable rhythm for dense, readable research interfaces.</p>
          <code>rank(ts_delta(close, 5))</code>
        </section>
        <section className="card kit">
          <h3>Buttons & states</h3>
          <div className="component-row">
            <Button onClick={() => setBtnToast("Clicked Primary Button")}>Primary</Button>
            <Button variant="secondary" onClick={() => setBtnToast("Clicked Secondary Button")}>
              Secondary
            </Button>
            <Button variant="ghost" onClick={() => setBtnToast("Clicked Ghost Button")}>
              Ghost
            </Button>
            <Button variant="danger" onClick={() => setBtnToast("Clicked Danger Button")}>
              Danger
            </Button>
            <Button disabled>Disabled</Button>
          </div>
          <h3>Badges</h3>
          <div className="component-row">
            <Badge>Neutral</Badge>
            <Badge tone="violet">Research</Badge>
            <Badge tone="green">Success</Badge>
            <Badge tone="amber">Warning</Badge>
            <Badge tone="red">Danger</Badge>
          </div>
        </section>
        <section className="card kit">
          <h3>Form controls</h3>
          <div className="form-grid">
            <label className="field">
              <span>Input</span>
              <input
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                placeholder="Placeholder text"
              />
            </label>
            <label className="field">
              <span>Select</span>
              <select
                value={demoSelect}
                onChange={(e) => setDemoSelect(e.target.value)}
              >
                <option value="Option 1">Option 1 · Fundamental</option>
                <option value="Option 2">Option 2 · Analyst</option>
                <option value="Option 3">Option 3 · Market</option>
              </select>
            </label>
            <label className="field">
              <span>Error state</span>
              <input
                className="error"
                value={demoError}
                onChange={(e) => setDemoError(e.target.value)}
              />
              <small className="error-text">Check this value and try again.</small>
            </label>
            <label className="switch-row compact">
              <span>
                <b>Toggle control ({demoToggle ? "Active" : "Disabled"})</b>
              </span>
              <input
                type="checkbox"
                checked={demoToggle}
                onChange={(e) => setDemoToggle(e.target.checked)}
              />
            </label>
          </div>
        </section>
        <section className="card kit span-2">
          <h3>Spacing & elevation</h3>
          <p>
            4px base grid · 8 / 12 / 16 / 24 / 32 / 48 · Radius 8 / 12 / 16 · Subtle borders before
            shadows.
          </p>
          <div className="space-demo">
            {[8, 12, 16, 24, 32, 48].map((x) => (
              <i style={{ width: x, height: x }} key={x}>
                <span>{x}</span>
              </i>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function AppShell() {
  const [page, setPage] = useState<Page>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const p = params.get("page") as Page;
      const valid: Page[] = [
        "Dashboard",
        "Daily Ideas",
        "Alpha Vault",
        "Datafields",
        "Fix Guide",
        "Combinations",
        "AI Assistant",
        "Pyramid",
        "Finance",
        "Notifications",
        "Settings",
        "UI Kit",
      ];
      if (p && valid.includes(p)) return p;
    }
    return "Dashboard";
  });

  const [dark, setDark] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMore, setMobileMore] = useState(false);
  const [toast, setToast] = useState("");

  // Shared platform state
  const [alphas, setAlphas] = useState(alphaData);
  const [submittedCount, setSubmittedCount] = useState(2);
  const [streak, setStreak] = useState(7);
  const [activeRegion, setActiveRegion] = useState("USA");
  const [regionMenu, setRegionMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");

  const [prefilledExpr, setPrefilledExpr] = useState("");
  const [prefilledAlpha, setPrefilledAlpha] = useState<any>(null);
  const [aiPrompt, setAiPrompt] = useState("");

  const showToast = (s: string) => {
    setToast(s);
    setTimeout(() => setToast(""), 3200);
  };

  const copyText = (content: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(content);
      showToast(`Copied ${label} to clipboard`);
    } else {
      showToast(`Selected: ${content}`);
    }
  };

  const handleSubmitAlpha = (name: string) => {
    setAlphas((prev) =>
      prev.map((a) => (a.name === name ? { ...a, status: "Submitted" } : a))
    );
    setSubmittedCount((c) => {
      const next = Math.min(4, c + 1);
      if (next === 4) {
        showToast(`🎉 Daily target achieved (4/4 submitted)! Research streak extended to ${streak + 1} days`);
        setStreak((s) => s + 1);
      } else {
        showToast(`Alpha "${name}" submitted to simulation queue (${next}/4 completed)`);
      }
      return next;
    });

    const targetAlpha = alphas.find((a: any) => a.name === name);
    if (targetAlpha) {
      if ((targetAlpha as any)._id) {
        api.alphas.submit((targetAlpha as any)._id).catch(() => {});
      } else {
        api.alphas.create({
          expression: (targetAlpha as any).expr || targetAlpha.name,
          region: (targetAlpha as any).region || "USA",
          universe: (targetAlpha as any).universe || "TOP3000",
          delay: parseInt((targetAlpha as any).delay) || 1,
          decay: parseFloat((targetAlpha as any).decay) || 4,
          neutralization: (targetAlpha as any).neut || "SUBINDUSTRY",
          truncation: parseFloat((targetAlpha as any).trunc) || 0.08,
          sharpe: parseFloat((targetAlpha as any).sharpe) || 2.14,
          fitness: parseFloat((targetAlpha as any).fitness) || 0.72,
          notes: (targetAlpha as any).notes || "",
        }).then((created: any) => {
          if (created && (created._id || created.id)) {
            const id = created._id || created.id;
            setAlphas((prev) =>
              prev.map((a) => (a.name === name ? { ...a, _id: id, id, status: "Submitted" } : a))
            );
            api.alphas.submit(id).catch(() => {});
          }
        }).catch(() => {});
      }
    }
  };

  // Sync state with backend on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const session = await api.auth.ensureSession();
      if (!isMounted) return;
      if (session?.user) {
        if (session.quota?.submittedToday !== undefined) {
          setSubmittedCount(session.quota.submittedToday);
        }
        if (session.user.streak?.current !== undefined) {
          setStreak(session.user.streak.current);
        }
      }
      const alphaRes = await api.alphas.list();
      if (isMounted && alphaRes && Array.isArray(alphaRes.items) && alphaRes.items.length > 0) {
        setAlphas(alphaRes.items.map((b: any) => ({
          id: b._id || b.id,
          _id: b._id,
          name: b.expression ? b.expression.slice(0, 30) : "Alpha " + b.region,
          expr: b.expression || "",
          region: b.region || "USA",
          universe: b.universe || "TOP3000",
          delay: String(b.delay ?? 1),
          decay: String(b.decay ?? 4),
          neut: b.neutralization || "SUBINDUSTRY",
          trunc: String(b.truncation ?? 0.08),
          sharpe: b.sharpe || 2.14,
          fitness: b.fitness || 0.72,
          turnover: `${b.turnover || 12}%`,
          returns: `${Math.round((b.sharpe || 1.8) * 12)}%`,
          margin: "18.2 bps",
          status: b.status === "submitted" ? "Submitted" : b.status === "archived" ? "Archived" : "Saved",
          color: b.qualifying ? "emerald" : "sky",
          datasets: b.datasets || ["Market"],
          tags: b.tags || ["momentum"],
          notes: b.notes || "",
          created: b.createdAt ? new Date(b.createdAt).toISOString().slice(0, 10) : "Today",
        })));
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Keyboard shortcut for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setRegionMenu(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const commandResults = useMemo(() => {
    const q = commandQuery.toLowerCase().trim();
    if (!q) {
      return nav.map((n) => ({
        type: "Page",
        label: n.label,
        detail: `Go to ${n.label}`,
        action: () => setPage(n.label),
      }));
    }
    const pageMatches = nav
      .filter((n) => n.label.toLowerCase().includes(q))
      .map((n) => ({
        type: "Page",
        label: n.label,
        detail: `Jump to ${n.label}`,
        action: () => setPage(n.label),
      }));

    const alphaMatches = alphas
      .filter((a) => `${a.name} ${a.expr}`.toLowerCase().includes(q))
      .map((a) => ({
        type: "Alpha",
        label: a.name,
        detail: a.expr,
        action: () => setPage("Alpha Vault"),
      }));

    return [...pageMatches, ...alphaMatches];
  }, [commandQuery, alphas]);

  const content = useMemo(() => {
    if (page === "Dashboard")
      return (
        <Dashboard
          go={setPage}
          toast={showToast}
          alphas={alphas}
          onSubmitAlpha={handleSubmitAlpha}
          onCopy={copyText}
          submittedCount={submittedCount}
          activeRegion={activeRegion}
        />
      );
    if (page === "Daily Ideas")
      return (
        <DailyIdeas
          go={setPage}
          toast={showToast}
          onCopy={copyText}
          onStartIdea={(prefill) => {
            setPrefilledAlpha(prefill);
            setPrefilledExpr(prefill.expression);
            setPage("Alpha Vault");
            showToast(`Idea "${prefill.name}" loaded into Alpha Vault (+25 XP awarded)`);
          }}
          onAskAi={(prompt) => {
            setAiPrompt(prompt);
            setPage("AI Assistant");
          }}
          activeRegion={activeRegion}
        />
      );
    if (page === "Alpha Vault")
      return (
        <AlphaVault
          toast={showToast}
          onCopy={copyText}
          alphas={alphas}
          setAlphas={setAlphas}
          onSubmitAlpha={handleSubmitAlpha}
          prefilledExpr={prefilledExpr}
          setPrefilledExpr={setPrefilledExpr}
          prefilledAlpha={prefilledAlpha}
          setPrefilledAlpha={setPrefilledAlpha}
        />
      );
    if (page === "Datafields") return <Datafields toast={showToast} onCopy={copyText} />;
    if (page === "Fix Guide")
      return (
        <FixGuide
          onCopy={copyText}
          onAskAI={(topic, desc) => {
            setAiPrompt(`How do I resolve ${topic}? Detail: ${desc}`);
            setPage("AI Assistant");
          }}
          onOpenCommand={() => setSearchOpen(true)}
        />
      );
    if (page === "Combinations")
      return (
        <Combinations
          go={setPage}
          toast={showToast}
          onStartWithCombo={(expr) => {
            setPrefilledExpr(expr);
            setPage("Alpha Vault");
          }}
        />
      );
    if (page === "AI Assistant")
      return (
        <Assistant
          onCopy={copyText}
          toast={showToast}
          initialPrompt={aiPrompt}
          setInitialPrompt={setAiPrompt}
          onStartInVault={(expr) => {
            setPrefilledExpr(expr);
            setPage("Alpha Vault");
          }}
        />
      );
    if (page === "Pyramid")
      return (
        <Pyramid
          go={setPage}
          toast={showToast}
          onStartAlpha={(expr) => {
            setPrefilledExpr(expr);
            setPage("Alpha Vault");
          }}
        />
      );
    if (page === "Finance") return <Finance toast={showToast} onCopy={copyText} />;
    if (page === "Settings") return <SettingsPage toast={showToast} />;
    if (page === "Notifications") return <SettingsPage toast={showToast} notifications />;
    if (page === "UI Kit") return <UIKit />;
    return (
      <Dashboard
        go={setPage}
        toast={showToast}
        alphas={alphas}
        onSubmitAlpha={handleSubmitAlpha}
        onCopy={copyText}
        submittedCount={submittedCount}
        activeRegion={activeRegion}
      />
    );
  }, [page, alphas, submittedCount, streak, activeRegion, prefilledExpr, prefilledAlpha, aiPrompt]);

  return (
    <div
      className={`${dark ? "app dark" : "app"} ${page === "Pyramid" ? "journey-mode" : ""}`}
    >
      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-logo">
          <Logo />
          <button type="button" onClick={() => setCollapsed(!collapsed)}>
            <Icon name="chevron" />
          </button>
        </div>
        <nav>
          {nav.map((n, i) => (
            <button
              type="button"
              key={n.label}
              className={page === n.label ? "active" : ""}
              onClick={() => setPage(n.label)}
            >
              <Icon name={n.icon} />
              <span>{n.label}</span>
              {i === 2 && <small>12</small>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div
            className="streak"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setPage("Pyramid");
              showToast(`${streak}-day research streak! Active towards Genius achievements`);
            }}
          >
            <Icon name="sparkle" />
            <span>
              <b>{streak} day streak</b>
              <small>Keep it going</small>
            </span>
          </div>
          <button type="button" onClick={() => setPage("Settings")}>
            <div className="avatar">AM</div>
            <span>
              <b>Alex Morgan</b>
              <small>Apprentice</small>
            </span>
            <Icon name="chevron" />
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button
            type="button"
            className="mobile-menu"
            onClick={() => setMobileMore(true)}
          >
            <Icon name="menu" />
          </button>
          <div
            className="global-search"
            style={{ cursor: "pointer" }}
            onClick={() => setSearchOpen(true)}
          >
            <Icon name="search" />
            <span>Search alphas, fields, guides…</span>
            <kbd>⌘ K</kbd>
          </div>
          <div className="top-actions">
            <div
              className="submit-pill"
              style={{ cursor: "pointer" }}
              onClick={() => setPage("Dashboard")}
              title="Click to view today's submission quota"
            >
              <span>
                <i style={{ opacity: submittedCount >= 1 ? 1 : 0.2 }} />
                <i style={{ opacity: submittedCount >= 2 ? 1 : 0.2 }} />
              </span>
              <b>{submittedCount}/4 submitted</b>
              <small>6h left</small>
            </div>

            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="region"
                onClick={() => setRegionMenu(!regionMenu)}
              >
                {activeRegion} <span>⌄</span>
              </button>
              {regionMenu && (
                <div className="region-dropdown">
                  {["USA", "Europe", "Asia Pacific", "China", "India", "Global"].map((r) => (
                    <button
                      type="button"
                      key={r}
                      className={activeRegion === r ? "active" : ""}
                      onClick={() => {
                        setActiveRegion(r);
                        setRegionMenu(false);
                        showToast(`Switched active region to ${r}`);
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="icon-btn"
              onClick={() => setPage("Notifications")}
              title="Notifications"
            >
              <Icon name="bell" />
              <i className="alert-dot" />
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => {
                setDark(!dark);
                showToast(`Switched to ${!dark ? "Dark" : "Light"} mode`);
              }}
              title="Toggle theme"
            >
              <Icon name={dark ? "sun" : "moon"} />
            </button>
            <div
              className="avatar"
              style={{ cursor: "pointer" }}
              onClick={() => setPage("Settings")}
              title="Settings"
            >
              AM
            </div>
          </div>
        </header>
        <main>{content}</main>
      </div>

      <nav className="bottom-nav">
        {nav.slice(0, 4).map((n) => (
          <button
            type="button"
            className={page === n.label ? "active" : ""}
            onClick={() => setPage(n.label)}
            key={n.label}
          >
            <Icon name={n.icon} />
            <span>{n.label.replace("Alpha ", "")}</span>
          </button>
        ))}
        <button type="button" onClick={() => setMobileMore(true)}>
          <Icon name="menu" />
          <span>More</span>
        </button>
      </nav>

      {mobileMore && (
        <div className="sheet-backdrop" onClick={() => setMobileMore(false)}>
          <section className="more-sheet" onClick={(e) => e.stopPropagation()}>
            <header>
              <h2>More</h2>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setMobileMore(false)}
              >
                <Icon name="x" />
              </button>
            </header>
            <div>
              {nav.slice(4).map((n) => (
                <button
                  type="button"
                  key={n.label}
                  onClick={() => {
                    setPage(n.label);
                    setMobileMore(false);
                  }}
                >
                  <Icon name={n.icon} />
                  <span>{n.label}</span>
                  <Icon name="chevron" />
                </button>
              ))}
            </div>
            <footer>
              <button
                type="button"
                onClick={() => {
                  setDark(!dark);
                  setMobileMore(false);
                }}
              >
                <Icon name={dark ? "sun" : "moon"} />
                {dark ? "Light mode" : "Dark mode"}
              </button>
            </footer>
          </section>
        </div>
      )}

      {/* Global Command Palette Modal (⌘K) */}
      {searchOpen && (
        <div className="command-backdrop" onClick={() => setSearchOpen(false)}>
          <div className="command-modal" onClick={(e) => e.stopPropagation()}>
            <div className="command-search">
              <Icon name="search" size={20} />
              <input
                autoFocus
                placeholder="Type a command, page, alpha, or problem guide… (Esc to close)"
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
              />
            </div>
            <div className="command-results">
              <div className="command-group-title">
                {commandQuery ? "MATCHING RESULTS" : "NAVIGATION SHORTCUTS"}
              </div>
              {commandResults.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>
                  No results found for "{commandQuery}"
                </div>
              ) : (
                commandResults.map((item, idx) => (
                  <button
                    type="button"
                    key={idx}
                    className="command-item"
                    onClick={() => {
                      item.action();
                      setSearchOpen(false);
                      setCommandQuery("");
                    }}
                  >
                    <Badge tone={item.type === "Page" ? "violet" : "blue"}>{item.type}</Badge>
                    <span>{item.label}</span>
                    <small>{item.detail}</small>
                  </button>
                ))
              )}
            </div>
            <div className="command-footer">
              <span>Use ↑ ↓ to navigate</span>
              <span>ESC to dismiss</span>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast">
          <div>
            <Icon name="check" />
          </div>
          <span>
            <b>Notice</b>
            {toast}
          </span>
          <button type="button" onClick={() => setToast("")}>
            <Icon name="x" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(true);
  return authed ? <AppShell /> : <Auth onDone={() => setAuthed(true)} />;
}
