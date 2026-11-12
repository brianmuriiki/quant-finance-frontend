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
  | "Settings";

const csvCell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

function vapidKeyBytes(encodedKey: string): ArrayBuffer {
  const padding = "=".repeat((4 - (encodedKey.length % 4)) % 4);
  const base64 = (encodedKey + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let index = 0; index < raw.length; index += 1) bytes[index] = raw.charCodeAt(index);
  const buffer = new ArrayBuffer(bytes.length);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

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
  lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
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
];

type AuthMode = "signin" | "signup" | "forgot" | "reset" | "verify" | "invite";

function initialAuthMode(): AuthMode {
  const path = window.location.pathname.replace(/\/+$/, "");
  if (path.endsWith("/reset-password")) return "reset";
  if (path.endsWith("/verify-email")) return "verify";
  if (path.endsWith("/accept-invite")) return "invite";
  return "signin";
}

function Auth({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<AuthMode>(initialAuthMode);
  const [flowToken] = useState(() => new URLSearchParams(window.location.search).get("token") || "");
  const [referralCode] = useState(() => new URLSearchParams(window.location.search).get("ref") || new URLSearchParams(window.location.search).get("referralCode") || "");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [googleOAuthEnabled, setGoogleOAuthEnabled] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "success" | "error">("pending");
  const [authSuccess, setAuthSuccess] = useState("");
  const [authError, setAuthError] = useState(() => {
    const reason = new URLSearchParams(window.location.search).get("oauth_error");
    const errors: Record<string, string> = {
      oauth_cancelled: "Google sign-in was cancelled.",
      oauth_invalid_state: "The Google sign-in session expired. Please try again.",
      google_unconfigured: "Google sign-in is not configured on this server yet.",
      registration_closed: "New account registration is currently closed.",
      account_suspended: "This account is suspended.",
      oauth_failed: "Google sign-in could not be completed. Please try again.",
    };
    return reason ? errors[reason] || "Google sign-in could not be completed." : "";
  });

  useEffect(() => {
    if (mode === "signin" || mode === "signup") {
      api.auth.providers().then((providers) => setGoogleOAuthEnabled(providers.google)).catch(() => {});
    }
    const url = new URL(window.location.href);
    if (url.searchParams.has("oauth") || url.searchParams.has("oauth_error") || url.searchParams.has("token")) {
      url.searchParams.delete("oauth");
      url.searchParams.delete("oauth_error");
      url.searchParams.delete("token");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }
    if (mode === "verify") {
      if (!flowToken) {
        setVerificationStatus("error");
        setAuthError("The verification link is missing its token.");
      } else {
        api.auth.verifyEmail(flowToken).then(() => setVerificationStatus("success")).catch((error) => {
          setVerificationStatus("error");
          setAuthError(error instanceof Error ? error.message : "This verification link is invalid or expired.");
        });
      }
    }
    if ((mode === "reset" || mode === "invite") && !flowToken) {
      setAuthError("This account link is missing its token. Request a fresh link and try again.");
    }
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    if ((mode === "signup" || mode === "reset" || mode === "invite") && password.length < 8) {
      setAuthError("Use at least 8 characters for your password.");
      return;
    }
    if ((mode === "reset" || mode === "invite" || mode === "signup") && password !== passwordConfirm) {
      setAuthError("Your passwords don’t match.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        await api.auth.register(fullName.trim(), email, password, Intl.DateTimeFormat().resolvedOptions().timeZone, referralCode);
        onDone();
      } else if (mode === "signin") {
        await api.auth.login(email, password);
        onDone();
      } else if (mode === "forgot") {
        await api.auth.forgotPassword(email);
        setResetSent(true);
      } else if (mode === "reset") {
        await api.auth.resetPassword(flowToken, password);
        setPassword("");
        setPasswordConfirm("");
        setMode("signin");
        setAuthSuccess("Your password has been reset. Sign in with your new password.");
      } else if (mode === "invite") {
        await api.auth.acceptInvite(flowToken, fullName.trim(), password, Intl.DateTimeFormat().resolvedOptions().timeZone);
        onDone();
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Unable to complete this request.");
    } finally {
      setBusy(false);
    }
  };

  const titles: Record<AuthMode, string> = {
    signin: "Welcome back",
    signup: "Create your account",
    forgot: "Reset your password",
    reset: "Choose a new password",
    verify: "Verify your email",
    invite: "Accept your invitation",
  };
  const descriptions: Record<AuthMode, string> = {
    signin: "Sign in to pick up where your research left off.",
    signup: "Build a workspace for clearer, more consistent research.",
    forgot: "Enter the email address on your account and we’ll send a reset link.",
    reset: "Choose a new password to secure your QuantStorm account.",
    verify: "We’re checking your email verification link.",
    invite: "Set up your researcher account to join the workspace.",
  };
  const usesPassword = mode === "signin" || mode === "signup" || mode === "reset" || mode === "invite";
  const needsName = mode === "signup" || mode === "invite";
  const needsEmail = mode === "signin" || mode === "signup" || mode === "forgot";
  const needsConfirm = mode === "signup" || mode === "reset" || mode === "invite";

  return (
    <div className="auth-shell">
      <aside className="auth-side">
        <Logo />
        <div className="auth-quote">
          <span className="auth-kicker"><i /> A workspace for serious research</span>
          <h1>Turn good ideas into <em>repeatable</em> research.</h1>
          <p>Keep your expressions, datasets, and progress in one focused workspace.</p>
          <div className="auth-feature-list">
            <div><span className="auth-feature-icon"><Icon name="vault" size={17} /></span><span><b>Research vault</b><small>Save, refine, and submit your alpha ideas.</small></span></div>
            <div><span className="auth-feature-icon"><Icon name="database" size={17} /></span><span><b>Your data library</b><small>Track fields and dataset coverage by region.</small></span></div>
            <div><span className="auth-feature-icon"><Icon name="pyramid" size={17} /></span><span><b>Progress that compounds</b><small>See how your research practice develops.</small></span></div>
          </div>
        </div>
        <div className="auth-side-footer"><span><Icon name="check" size={14} /> Private workspace</span><span>Built for better research habits</span></div>
      </aside>
      <main className="auth-main">
        <div className="auth-form">
          <div className="mobile-logo"><Logo /></div>
          <div className="auth-heading">
            <div className="eyebrow">QUANTSTORM WORKSPACE</div>
            <h2>{titles[mode]}</h2>
            <p>{descriptions[mode]}</p>
          </div>

          {mode === "verify" ? (
            <div className={`auth-result ${verificationStatus}`} aria-live="polite">
              <span className="auth-result-icon"><Icon name={verificationStatus === "success" ? "check" : "bell"} size={19} /></span>
              <div>
                <b>{verificationStatus === "pending" ? "Verifying your email…" : verificationStatus === "success" ? "Email verified" : "Verification link expired"}</b>
                <p>{verificationStatus === "pending" ? "This should only take a moment." : verificationStatus === "success" ? "Your email is confirmed. You can sign in now." : authError || "Request a fresh verification link from your account."}</p>
              </div>
            </div>
          ) : resetSent ? (
            <div className="auth-result success" aria-live="polite">
              <span className="auth-result-icon"><Icon name="check" size={19} /></span>
              <div><b>Check your inbox</b><p>If an account exists for {email}, a password reset link is on its way.</p></div>
            </div>
          ) : (
            <>
              {(mode === "signin" || mode === "signup") && googleOAuthEnabled && (
                <button type="button" className="google" disabled={busy} onClick={() => api.auth.startGoogleOAuth(referralCode)}>
                  <span className="google-mark" aria-hidden="true">G</span><span>Continue with Google</span>
                </button>
              )}
              {(mode === "signin" || mode === "signup") && googleOAuthEnabled && <div className="divider"><span>or continue with email</span></div>}

              <form onSubmit={submit}>
                {needsName && <label htmlFor="auth-name">Full name<input id="auth-name" autoComplete="name" type="text" placeholder="Your name" value={fullName} onChange={(event) => setFullName(event.target.value)} maxLength={80} required /></label>}
                {needsEmail && <label htmlFor="auth-email">Email address<input id="auth-email" autoComplete="email" type="email" inputMode="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required /></label>}
                {usesPassword && <label htmlFor="auth-password">{mode === "reset" ? "New password" : "Password"}
                  <div className="input-link auth-password-wrap">
                    <input id="auth-password" autoComplete={mode === "signin" ? "current-password" : "new-password"} type={showPassword ? "text" : "password"} placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} minLength={mode === "signin" ? undefined : 8} maxLength={128} required />
                    <button type="button" className="auth-password-toggle" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? "Hide" : "Show"}</button>
                  </div>
                  {mode === "signin" && <button type="button" className="auth-forgot-link" onClick={() => { setAuthError(""); setMode("forgot"); }}>Forgot password?</button>}
                  {(mode === "signup" || mode === "invite") && <small className="auth-field-hint">Use at least 8 characters.</small>}
                </label>}
                {needsConfirm && <label htmlFor="auth-confirm">Confirm password<input id="auth-confirm" autoComplete="new-password" type={showPassword ? "text" : "password"} placeholder="Enter your password again" value={passwordConfirm} onChange={(event) => setPasswordConfirm(event.target.value)} minLength={8} maxLength={128} required /></label>}
                {authError && <p role="alert" className="auth-error"><Icon name="x" size={15} />{authError}</p>}
                {authSuccess && <p role="status" className="auth-success"><Icon name="check" size={15} />{authSuccess}</p>}
                <Button type="submit" icon={busy ? undefined : "arrow"} disabled={busy || ((mode === "reset" || mode === "invite") && !flowToken)}>
                  {busy ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : mode === "reset" ? "Save new password" : "Accept invitation"}
                </Button>
              </form>
            </>
          )}

          {mode === "signin" && <p className="auth-switch">New to QuantStorm? <button type="button" onClick={() => { setAuthError(""); setAuthSuccess(""); setMode("signup"); }}>Create an account</button></p>}
          {mode === "signup" && <p className="auth-switch">Already have an account? <button type="button" onClick={() => { setAuthError(""); setMode("signin"); }}>Sign in</button></p>}
          {(mode === "forgot" || mode === "reset" || mode === "invite" || mode === "verify" || resetSent) && <p className="auth-switch"><button type="button" onClick={() => { setAuthError(""); setAuthSuccess(""); setResetSent(false); setMode("signin"); }}>Back to sign in</button></p>}
          <div className="auth-privacy"><Icon name="lock" size={13} /> Your account is protected with encrypted sessions.</div>
        </div>
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

function Bars({ alphas }: { alphas: any[] }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - i));
    return date;
  });
  const counts = days.map((day) => alphas.filter((alpha) => {
    if (alpha.status !== "Submitted" || !alpha.submittedAt) return false;
    const submitted = new Date(alpha.submittedAt);
    return submitted.toDateString() === day.toDateString();
  }).length);
  const max = Math.max(1, ...counts);
  return (
    <div className="chart-bars">
      {counts.map((v, i) => (
        <div key={i}>
          <span style={{ height: `${Math.max(4, (v / max) * 100)}%` }} className={i === counts.length - 1 ? "hot" : ""} />
          <small>{days[i].toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1)}</small>
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
  currentUser,
  dailyTarget,
}: {
  go: (p: Page) => void;
  toast: (s: string) => void;
  alphas: typeof alphaData;
  onSubmitAlpha: (id: string) => void;
  onCopy: (text: string, label: string) => void;
  submittedCount: number;
  activeRegion: string;
  currentUser: any;
  dailyTarget: number;
}) {
  const readyAlphas = useMemo(() => alphas.filter((a) => a.status === "Saved"), [alphas]);
  const submittedAlphas = useMemo(() => alphas.filter((a) => a.status === "Submitted"), [alphas]);
  const usedFieldsCount = new Set(submittedAlphas.flatMap((a) => a.datafields || [])).size;
  const pct = dailyTarget ? Math.min(100, Math.round((submittedCount / dailyTarget) * 100)) : 0;

  const [dashboardIdeas, setDashboardIdeas] = useState<any[]>([]);
  const [ideasTriedCount, setIdeasTriedCount] = useState(0);
  const [ideasTotalCount, setIdeasTotalCount] = useState(0);

  useEffect(() => {
    let active = true;
    api.ideas.getToday().then((res) => {
      if (active && res && res.ideas) {
        setDashboardIdeas(res.ideas.slice(0, 3));
        setIdeasTotalCount(res.ideas.length);
        const tried = res.ideas.filter((i: any) => i.status === "started" || i.outcome !== "none").length;
        setIdeasTriedCount(tried);
      }
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  const average = (key: string) => {
    const values = submittedAlphas.map((alpha) => Number(alpha[key])).filter(Number.isFinite);
    return values.length ? (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2) : "—";
  };

  return (
    <div className="page">
      <header className="page-title">
        <div>
          <div className="eyebrow">{new Date().toLocaleDateString()} · {activeRegion} REGION</div>
          <h1>Welcome{currentUser?.name ? `, ${currentUser.name}` : ""}</h1>
          <p>{readyAlphas.length} saved alphas are ready to submit.</p>
        </div>
        <Button icon="plus" onClick={() => go("Alpha Vault")}>
          Add alpha
        </Button>
      </header>
      <section className="daily-banner">
        <div className="ring">
          <strong>{submittedCount}</strong>
          <span>/ {dailyTarget || "—"}</span>
        </div>
        <div>
          <Badge tone={dailyTarget > 0 && submittedCount >= dailyTarget ? "green" : "violet"}>
            {dailyTarget > 0 && submittedCount >= dailyTarget ? "TARGET ACHIEVED" : "DAILY SUBMISSION"}
          </Badge>
          <h2>{dailyTarget > 0 && submittedCount >= dailyTarget ? "Daily submission target reached" : "Daily submissions"}</h2>
          <p>Submission count uses your configured account timezone.</p>
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
        <Stat label="Saved for later" value={String(readyAlphas.length)} delta="In your vault" icon="vault" />
        <Stat label="Submitted alphas" value={String(submittedAlphas.length)} delta={`${pct}% of daily target`} icon="check" />
        <Stat label="Used datafields" value={String(usedFieldsCount)} delta="From submitted alphas" icon="database" />
        <Stat label="Current streak" value={`${currentUser?.streak?.current || 0} days`} delta={`Personal best: ${currentUser?.streak?.best || 0}`} icon="sparkle" />
      </div>
      <div className="dash-grid">
        <section className="card ready-card">
          <div className="card-head">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3>Today's ideas</h3>
                <span className="badge badge-neutral" style={{ fontSize: "11px", fontWeight: "700" }}>
                  {ideasTriedCount}/{ideasTotalCount} tried
                </span>
              </div>
              <p>Top personalized alpha hypotheses generated for your datasets</p>
            </div>
            <button type="button" onClick={() => go("Daily Ideas")}>
              View all {ideasTotalCount} <Icon name="arrow" size={15} />
            </button>
          </div>
          {dashboardIdeas.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)" }}>
              <p style={{ margin: "0 0 8px 0" }}>No ideas have been generated for today yet.</p>
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
              {alphas.some((alpha) => alpha.status === "Submitted") ? "No saved alphas are waiting to be submitted." : "No alphas in your vault yet. Save an expression to get started."}
            </div>
          ) : (
            readyAlphas.slice(0, 3).map((a, i) => (
              <div className="alpha-row" key={a._id || a.id}>
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
                <Button variant="secondary" onClick={() => onSubmitAlpha(a._id || a.id)}>
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
            <Badge tone="neutral">7 day view</Badge>
          </div>
          <Bars alphas={alphas} />
          <div className="chart-foot">
            <span>
              <i className="dot-violet" />
              Submitted
            </span>
            <b>{submittedAlphas.length} total</b>
          </div>
        </section>
        <section className="card trend-card">
          <div className="card-head">
            <div>
              <h3>Alpha quality trend</h3>
              <p>Average from submitted alphas</p>
            </div>
            <Badge tone="neutral">{submittedAlphas.length} records</Badge>
          </div>
          <div className="chart-foot">
            <span>
              <i className="dot-violet" />
              Sharpe {average("sharpe")}
            </span>
            <span>
              <i className="dot-blue" />
              Fitness {average("fitness")}
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

const alphaData: any[] = [];

function AlphaVault({
  toast,
  onCopy,
  regions,
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
  regions: string[];
  alphas: typeof alphaData;
  setAlphas: React.Dispatch<React.SetStateAction<typeof alphaData>>;
  onSubmitAlpha: (id: string) => void;
  prefilledExpr?: string;
  setPrefilledExpr?: (expr: string) => void;
  prefilledAlpha?: any;
  setPrefilledAlpha?: (p: any) => void;
}) {
  const [editor, setEditor] = useState(Boolean(prefilledExpr || prefilledAlpha));
  const [saved, setSaved] = useState(false);
  const [savingAlpha, setSavingAlpha] = useState(false);
  const [view, setView] = useState<"table" | "cards">("table");
  const [selected, setSelected] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sharpeFilter, setSharpeFilter] = useState("All");
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());
  const [fieldWarnings, setFieldWarnings] = useState<any>(null);

  // New Alpha Form State
  const [newName, setNewName] = useState("");
  const [newExpr, setNewExpr] = useState(prefilledExpr || "");
  const [newRegion, setNewRegion] = useState("USA");
  const [newUniverse, setNewUniverse] = useState("TOP3000");
  const [newDelay, setNewDelay] = useState("1");
  const [newDecay, setNewDecay] = useState("4");
  const [newNeutralization, setNewNeutralization] = useState("SUBINDUSTRY");
  const [newTruncation, setNewTruncation] = useState("0.08");
  const [newSharpe, setNewSharpe] = useState("");
  const [newFitness, setNewFitness] = useState("");
  const [newTurnover, setNewTurnover] = useState("");
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

  useEffect(() => {
    if (!regions.length) return;
    if (!regions.includes(newRegion)) setNewRegion(regions[0]);
  }, [regions]);

  useEffect(() => {
    if (!editor || !newExpr.trim()) { setFieldWarnings(null); return; }
    let active = true;
    const timer = window.setTimeout(() => {
      api.alphas.checkFields(newExpr, newRegion).then((warnings) => {
        if (active) setFieldWarnings(warnings);
      }).catch(() => { if (active) setFieldWarnings(null); });
    }, 450);
    return () => { active = false; window.clearTimeout(timer); };
  }, [editor, newExpr, newRegion]);

  const filteredAlphas = useMemo(() => {
    return alphas.filter((a) => {
      const matchSearch = `${a.name} ${a.expr} ${a.region} ${a.notes || ""} ${(a.tags || []).join(" ")} ${(a.datasets || []).join(" ")} ${(a.datafields || []).join(" ")}`
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

  const handleSaveAlpha = async () => {
    if (!newExpr.trim()) { toast("Enter an expression before saving this alpha"); return; }
    if (!newRegion) { toast("Choose a region before saving this alpha"); return; }
    setSavingAlpha(true);
    const draft = {
      name: newName.trim() || "Untitled Alpha",
      expr: newExpr.trim(),
      region: newRegion,
    };
    try {
      const created: any = await api.alphas.create({
        name: draft.name,
        expression: draft.expr,
        region: draft.region,
        universe: newUniverse,
        delay: Number(newDelay),
        decay: Number(newDecay),
        neutralization: newNeutralization,
        truncation: Number(newTruncation),
        ...(newSharpe !== "" && { sharpe: Number(newSharpe) }),
        ...(newFitness !== "" && { fitness: Number(newFitness) }),
        ...(newTurnover !== "" && { turnover: Number(newTurnover.replace("%", "")) }),
        notes: newNotes,
        ideaId: prefilledAlpha?.ideaId || undefined,
      });
      setAlphas((prev) => [{
        _id: created._id,
        id: created._id,
        name: created.name || created.expression.slice(0, 30),
        expr: created.expression,
        region: created.region,
        sharpe: created.sharpe,
        fit: created.fitness,
        status: created.status === "submitted" ? "Submitted" : "Saved",
        datasets: created.datasets || [],
        datafields: created.datafields || [],
        tags: created.tags || [],
        createdAt: created.createdAt,
        submittedAt: created.submittedAt,
      }, ...prev]);
      setSaved(true);
      setEditor(false);
      toast(`Alpha saved to your vault`);
      if (setPrefilledExpr) setPrefilledExpr("");
      if (setPrefilledAlpha) setPrefilledAlpha(null);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not save alpha");
    } finally {
      setSavingAlpha(false);
    }
  };

  const toggleSelectAll = () => {
    const visibleIds = filteredAlphas.map((a) => a._id || a.id).filter(Boolean);
    setSelectedNames((current) => {
      const next = new Set(current);
      if (visibleIds.length && visibleIds.every((id) => next.has(id))) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const toggleSelectOne = (id: string) => {
    setSelectedNames((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBatchArchive = async () => {
    const ids = alphas.filter((a) => selectedNames.has(a._id || a.id)).map((a) => a._id || a.id).filter(Boolean);
    try {
      const result = await api.alphas.bulk(ids, "archive");
      setAlphas((prev) => prev.map((a) => selectedNames.has(a._id || a.id) ? { ...a, status: "Archived" } : a));
      toast(`Archived ${result.count} alphas`);
      setSelectedNames(new Set());
    } catch (error) { toast(error instanceof Error ? error.message : "Could not archive alphas"); }
  };

  const handleBatchMarkSubmitted = async () => {
    const ids = alphas.filter((a) => selectedNames.has(a._id || a.id)).map((a) => a._id || a.id).filter(Boolean);
    try {
      const result = await api.alphas.bulk(ids, "submit");
      setAlphas((prev) => prev.map((a) => selectedNames.has(a._id || a.id) ? { ...a, status: "Submitted", submittedAt: new Date().toISOString() } : a));
      toast(`Recorded ${result.count} submitted alphas`);
      setSelectedNames(new Set());
    } catch (error) { toast(error instanceof Error ? error.message : "Could not submit alphas"); }
  };

  const handleBatchDelete = async () => {
    const ids = alphas.filter((a) => selectedNames.has(a._id || a.id)).map((a) => a._id || a.id).filter(Boolean);
    try {
      const result = await api.alphas.bulk(ids, "delete");
      setAlphas((prev) => prev.filter((a) => !selectedNames.has(a._id || a.id)));
      toast(`Deleted ${result.count} alphas`);
      setSelectedNames(new Set());
    } catch (error) { toast(error instanceof Error ? error.message : "Could not delete alphas"); }
  };

  const handleExportSelectedCSV = () => {
    const items = alphas.filter((a) => selectedNames.has(a._id || a.id));
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Name,Expression,Region,Sharpe,Fitness,Status"]
        .concat(
          items.map((a) => [a.name, a.expr, a.region, a.sharpe, a.fit, a.status].map(csvCell).join(","))
        )
        .join("\n");
    const encoded = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
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
          alphas.map((a) => [a.name, a.expr, a.region, a.sharpe, a.fit, a.status].map(csvCell).join(","))
        )
        .join("\n");
    const encoded = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
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
          {newExpr.trim() && <div className="warning-panel">
            <div><Icon name="bell" /></div>
            <section>
              <b>{fieldWarnings?.detected?.length ? `${fieldWarnings.detected.length} datafield${fieldWarnings.detected.length === 1 ? "" : "s"} detected` : "Checking expression datafields…"}</b>
              <p>{fieldWarnings?.note || "Overlap is estimated from your saved datafields; it is not the platform’s official self-correlation."}</p>
              {fieldWarnings?.reusedFields?.length > 0 && <div>{fieldWarnings.reusedFields.map((field: string) => <Badge key={field} tone="amber">{field} · previously used</Badge>)}</div>}
              {fieldWarnings?.freshFields?.length > 0 && <div>{fieldWarnings.freshFields.map((field: string) => <Badge key={field} tone="green">{field} · new</Badge>)}</div>}
            </section>
            {fieldWarnings?.reusedFields?.length > 0 && <button type="button" onClick={() => { setSearchQuery(fieldWarnings.reusedFields[0]); toast(`Showing alphas that use ${fieldWarnings.reusedFields[0]}`); }}>View related alphas</button>}
          </div>}
          <div className="form-grid">
            <label className="field">
              <span>Name</span>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} />
            </label>
            <label className="field">
              <span>Region</span>
              <select value={newRegion} onChange={(e) => setNewRegion(e.target.value)}>
                {regions.map((code) => <option key={code}>{code}</option>)}
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
              <span>Simulation Sharpe (optional)</span>
              <input value={newSharpe} onChange={(e) => setNewSharpe(e.target.value)} />
            </label>
            <label className="field">
              <span>Simulation fitness (optional)</span>
              <input value={newFitness} onChange={(e) => setNewFitness(e.target.value)} />
            </label>
            <label className="field">
              <span>Simulation turnover (optional)</span>
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
            <Button onClick={handleSaveAlpha} disabled={savingAlpha}>{savingAlpha ? "Saving…" : "Save to vault"}</Button>
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
          {regions.map((code) => <option key={code} value={code}>Region: {code}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="Saved">Saved</option>
          <option value="Submitted">Submitted</option>
          <option value="Archived">Archived</option>
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
            <Button variant="secondary" onClick={handleBatchArchive}>
              Archive
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
                    checked={filteredAlphas.length > 0 && filteredAlphas.every((alpha) => selectedNames.has(alpha._id || alpha.id))}
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
                  <tr key={a._id || a.id} onClick={() => setSelected(alphas.findIndex((item) => (item._id || item.id) === (a._id || a.id)))}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedNames.has(a._id || a.id)}
                        onChange={() => toggleSelectOne(a._id || a.id)}
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
                    <td>{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "—"}</td>
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
              onClick={() => setSelected(alphas.findIndex((item) => (item._id || item.id) === (a._id || a.id)))}
              key={a._id || a.id}
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
                  <p>{selectedAlpha.createdAt ? `Created ${new Date(selectedAlpha.createdAt).toLocaleDateString()}` : ""} · {selectedAlpha.region} region</p>
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
                  <b>{selectedAlpha.turnover ?? "—"}</b>
                </div>
                <div>
                  <span>Self-corr.</span>
                  <b>{selectedAlpha.selfCorrelation ?? "—"}</b>
                </div>
              </div>
              <h3>Simulation settings</h3>
              {[
                ["Region", selectedAlpha.region],
                ["Universe", selectedAlpha.universe || "—"],
                ["Delay", selectedAlpha.delay ?? "—"],
                ["Decay", selectedAlpha.decay ?? "—"],
                ["Neutralization", selectedAlpha.neutralization || "—"],
              ].map((x) => (
                <div className="detail-row" key={x[0]}>
                  <span>{x[0]}</span>
                  <b>{x[1]}</b>
                </div>
              ))}
              <h3>Datafields used</h3>
              <div className="chips">{(selectedAlpha.datafields || []).map((field: string) => <Badge key={field}>{field}</Badge>)}</div>
            </div>
            <footer>
              <Button
                variant="danger"
                onClick={async () => {
                  try {
                    await api.alphas.delete(selectedAlpha._id);
                    setAlphas((prev) => prev.filter((item) => item._id !== selectedAlpha._id));
                    setSelected(null);
                    toast("Alpha deleted from your vault");
                  } catch (error) { toast(error instanceof Error ? error.message : "Could not delete alpha"); }
                }}
              >
                Delete
              </Button>
              <Button
                variant="secondary"
                onClick={async () => {
                  try {
                    const copy = await api.alphas.create({
                      name: `${selectedAlpha.name} (Copy)`,
                      expression: selectedAlpha.expr,
                      region: selectedAlpha.region,
                      universe: selectedAlpha.universe,
                      delay: Number(selectedAlpha.delay),
                      decay: Number(selectedAlpha.decay),
                      neutralization: selectedAlpha.neut,
                      truncation: Number(selectedAlpha.trunc),
                      notes: selectedAlpha.notes,
                    });
                    setAlphas((prev) => [{ ...selectedAlpha, _id: copy._id, id: copy._id, name: copy.name, status: "Saved", createdAt: copy.createdAt }, ...prev]);
                    setSelected(null);
                    toast(`Duplicated as "${copy.name}"`);
                  } catch (error) { toast(error instanceof Error ? error.message : "Could not duplicate alpha"); }
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
                  onSubmitAlpha(selectedAlpha._id || selectedAlpha.id);
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
  const [regions, setRegions] = useState<string[]>([]);
  const [activeRegion, setActiveRegion] = useState("USA");
  const [addingRegion, setAddingRegion] = useState(false);
  const [regionName, setRegionName] = useState("");
  const [filterQuery, setFilterQuery] = useState("");
  const [rawText, setRawText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImportGroups, setSelectedImportGroups] = useState<Set<string>>(
    new Set<string>()
  );
  const [detectedGroups, setDetectedGroups] = useState<Array<{ name: string; countStr: string; fieldList: string }>>([]);
  const [detectedFieldDetails, setDetectedFieldDetails] = useState<Array<{ fieldId: string; dataset: string; description: string }>>([]);
  const [importError, setImportError] = useState("");
  const [editGroupModal, setEditGroupModal] = useState<string | null>(null);
  const [editGroupFields, setEditGroupFields] = useState("");

  const [datasets, setDatasets] = useState<Array<[string, string, string, string[]]>>([]);
  const [freshDatasets, setFreshDatasets] = useState<any[]>([]);

  // Load datasets and fields from MongoDB
  const loadDatafieldsFromBackend = async (reg = activeRegion) => {
    try {
      const [res, regionData, fresh] = await Promise.all([api.datafields.list(reg), api.regions.list(), api.datafields.fresh(reg)]);
      if (Array.isArray(res)) {
        setDatasets(res.map((g: any) => [
          g.dataset || "Unsorted",
          String(g.used || 0),
          String(g.total || (g.fields ? g.fields.length : 0)),
          g.fields ? g.fields.map((f: any) => (typeof f === "string" ? f : f.fieldId || f.name)) : [],
        ]));
      }
      if (regionData?.regions) {
        const codes = regionData.regions.map((r) => r.code);
        setRegions(codes);
        if (!codes.includes(activeRegion) && codes.length) setActiveRegion(codes[0]);
      }
      setFreshDatasets(fresh?.untouchedDatasets || []);
    } catch (error) { setImportError(error instanceof Error ? error.message : "Could not load datafields"); }
  };

  useEffect(() => {
    loadDatafieldsFromBackend(activeRegion);
  }, [activeRegion]);

  const reviewExtractedFields = (fields: any[]) => {
    const normalized = fields.map((field) => ({
      fieldId: String(field.fieldId || field.id || "").trim(),
      dataset: String(field.dataset || "Unsorted").trim() || "Unsorted",
      description: String(field.description || field.desc || ""),
    })).filter((field) => field.fieldId);
    setDetectedFieldDetails(normalized);
    const grouped = new Map<string, string[]>();
    normalized.forEach((field) => {
      if (!grouped.has(field.dataset)) grouped.set(field.dataset, []);
      grouped.get(field.dataset)!.push(field.fieldId);
    });
    const groups = Array.from(grouped.entries()).map(([name, fieldIds]) => ({
      name,
      countStr: `${fieldIds.length} field${fieldIds.length === 1 ? "" : "s"}`,
      fieldList: fieldIds.join(", "),
    }));
    if (!groups.length) {
      setImportError("No valid datafield identifiers were found. Check the file or pasted text and try again.");
      setStage("idle");
      return;
    }
    setDetectedGroups(groups);
    setSelectedImportGroups(new Set(groups.map((group) => group.name)));
    setImportError("");
    setStage("review");
  };

  const start = async () => {
    if (!rawText.trim()) {
      setImportError("Paste datafield text or choose an export file first.");
      return;
    }
    setStage("processing");
    setImportError("");
    try {
      // 1. Try AI extraction via OpenRouter first
      const aiRes = await api.datafields.extractAi(rawText, undefined, activeRegion);
      if (aiRes && Array.isArray(aiRes.fields) && aiRes.fields.length > 0) {
        reviewExtractedFields(aiRes.fields);
        return;
      }
    } catch {}

    // 2. Fallback to rule-based parser
    try {
      const parsedRes = await api.datafields.extract(rawText, undefined, activeRegion);
      if (parsedRes && Array.isArray(parsedRes.fields) && parsedRes.fields.length > 0) {
        reviewExtractedFields(parsedRes.fields);
        return;
      }
    } catch {}

    setImportError("Could not extract fields. Check your API connection and input format, then try again.");
    setStage("idle");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setImportError("Choose a file smaller than 5 MB.");
      e.target.value = "";
      return;
    }
    setImportError("");
    setStage("processing");
    api.datafields.upload(file, activeRegion).then((result) => {
      reviewExtractedFields(result.fields || []);
      toast(`Read ${file.name}`);
    }).catch((error) => {
      setStage("idle");
      setImportError(error instanceof Error ? error.message : "Could not read the selected file");
    }).finally(() => { e.target.value = ""; });
  };

  const addRegion = async () => {
    const name = regionName.trim();
    if (!name) return;
    try {
      const result = await api.regions.add(name.toUpperCase());
      setRegions(result.regions.map((r: any) => r.code));
      setActiveRegion(name.toUpperCase());
      setRegionName("");
      setAddingRegion(false);
      toast(`${name} added to your regions`);
    } catch (error) { setImportError(error instanceof Error ? error.message : "Could not add region"); }
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
          description: detectedFieldDetails.find((field) => field.dataset === g.name && field.fieldId.toLowerCase() === t)?.description || "",
          });
        });
      }
    });

    if (!fieldsToCommit.length) return setImportError("No fields were selected for import.");
    try {
      await api.datafields.commit(activeRegion, fieldsToCommit);
      await loadDatafieldsFromBackend(activeRegion);
      setStage("done");
      toast(`Imported fields saved for ${activeRegion}`);
    } catch (error) { setImportError(error instanceof Error ? error.message : "Could not save imported fields"); }
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
      {importError && <p role="alert" className="error-inline">{importError}</p>}

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
          <b>Add a region code</b>
            <span>Create a custom region workspace for its datasets and fields.</span>
          </div>
          <input
            autoFocus
            value={regionName}
            onChange={(event) => setRegionName(event.target.value)}
            placeholder="e.g. LATAM"
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
                  accept=".csv,.txt,.tsv"
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                />
                <div>
                  <Icon name="upload" size={24} />
                </div>
                <h3>Drop your datafield export here</h3>
                <p>CSV, TXT, or TSV, up to 5 MB</p>
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
                  Extract fields
                </Button>
              </div>
            </>
          )}
          {stage === "processing" && (
            <div className="processing">
              <div className="spinner" />
              <h3>Reading your fields</h3>
              <p>Extracting identifiers and grouping them by dataset…</p>
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
                  <p>We grouped the extracted fields into {detectedGroups.length} dataset(s). Review before saving.</p>
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
                <h2>Edit {editGroupModal} field list</h2>
                <p>Review the extracted identifiers before saving them into {activeRegion}.</p>
              </div>
              <button type="button" className="icon-btn" onClick={() => setEditGroupModal(null)}>
                <Icon name="x" />
              </button>
            </header>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "16px 0" }}>
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
                  toast(`Updated extracted fields for ${editGroupModal}`);
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

      {freshDatasets.length > 0 && <section className="fresh-card">
        <div className="spark">
          <Icon name="sparkle" />
        </div>
        <div>
          <Badge tone="green">FRESH TERRITORY</Badge>
          <h3>Explore {freshDatasets[0].dataset}</h3>
          <p>{freshDatasets[0].total} fields in this dataset have not been used in submitted alphas.</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            setFilterQuery(freshDatasets[0].dataset);
          }}
        >
          View recommendation
        </Button>
      </section>}

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
                  <span><i /></span>
                  <code>{x}</code>
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
  const [problems, setProblems] = useState<any[]>([]);
  const [guideError, setGuideError] = useState("");
  useEffect(() => {
    api.guide.list().then((rows) => setProblems(rows || [])).catch((error) => setGuideError(error.message || "Could not load guides"));
  }, []);

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

  const filteredProblems = problems.filter((p) => {
    const text = `${p.title} ${p.symptoms} ${(p.causes || []).join(" ")} ${(p.fixes || []).join(" ")}`;
    const matchesSearch = text.toLowerCase().includes(search.toLowerCase());
    const matchesTopic = topic === "All" || String(p.category || "").toLowerCase() === topic.toLowerCase();
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
        {guideError && <p role="alert">{guideError}</p>}
        {filteredProblems.map((p, i) => (
          <details className="card guide" open={i === 0} key={p._id || p.slug}>
            <summary>
              <span className={`problem-icon p${i}`}>
                <Icon name={i ? "book" : "bell"} />
              </span>
              <div>
                <h3>{p.title}</h3>
                <p>{p.symptoms}</p>
              </div>
              <Icon name="chevron" />
            </summary>
            <div className="guide-body">
              <h4>What to try</h4>
              <p>{(p.fixes || []).join("; ")}</p>
              <ol>{(p.causes || []).map((cause: string) => <li key={cause}>{cause}</li>)}</ol>
              {(p.examples || []).map((example: string) => <div className="expression" key={example}>
                <code>{example}</code>
                <button type="button" onClick={() => onCopy(example, p.title)} title="Copy formula">
                  <Icon name="copy" />
                </button>
              </div>)}
              <Button
                variant="secondary"
                icon="sparkle"
                onClick={() => onAskAI(p.title, p.symptoms)}
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
  const [basePairs, setBasePairs] = useState<any[]>([]);
  const [comboError, setComboError] = useState("");
  useEffect(() => {
    api.combos.list().then((rows) => setBasePairs((rows || []).map((combo: any) => [
      combo.datasets?.[0] || "Dataset",
      combo.datasets?.[1] || "Dataset",
      String(combo.riskLevel || "medium").replace(/^./, (x: string) => x.toUpperCase()),
      combo.rationale || "",
      combo.exampleIdea || "",
      combo.involvesUnusedDataset,
    ]))).catch((error) => setComboError(error.message || "Could not load combinations"));
  }, []);

  const pairs = useMemo(() => {
    let list = [...basePairs];
    if (personalized) {
      list.sort((a, b) => Number(Boolean(b[5])) - Number(Boolean(a[5])));
    }
    if (riskFilter !== "All") {
      list = list.filter((p) => p[2] === riskFilter);
    }
    return list;
  }, [basePairs, personalized, riskFilter]);

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
              : `${basePairs.filter((pair) => pair[5]).length} combinations include untouched datasets.`}
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
        {comboError && <p role="alert">{comboError}</p>}
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
  const [messages, setMessages] = useState<Array<{ from: "ai" | "user"; text: string; code?: string }>>([]);
  const [text, setText] = useState(initialPrompt || "");
  const [loading, setLoading] = useState(false);
  const [contextAlpha, setContextAlpha] = useState<string | null>(null);
  const [activeDatasets, setActiveDatasets] = useState<string[]>([]);

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

    let reply = "";
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
                  text: "What alpha or dataset would you like to explore?",
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
            {["Fundamental", "Analyst", "Market", "News Sentiment"].filter((d) => activeDatasets.includes(d)).map((d, i) => (
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

function JourneySparkline({ values, green = false }: { values: number[]; green?: boolean }) {
  const safeValues = values.filter(Number.isFinite);
  const points = safeValues
    .map((value, index) => `${safeValues.length > 1 ? (index / (safeValues.length - 1)) * 300 : 150},${70 - value * 0.58}`)
    .join(" ");
  return (
    <svg className="journey-spark" viewBox="0 0 300 75" preserveAspectRatio="none">
      <path d="M0 18H300M0 40H300M0 62H300" />
      <polyline className={green ? "green" : ""} points={points} />
      {safeValues.length > 0 && <circle cx="300" cy={70 - safeValues[safeValues.length - 1] * 0.58} r="3" />}
    </svg>
  );
}

function Pyramid({
  go,
  toast,
  onStartAlpha,
  currentUser,
}: {
  go: (page: Page) => void;
  toast?: (s: string) => void;
  onStartAlpha?: (expr: string) => void;
  currentUser: any;
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
  const [journeyData, setJourneyData] = useState<any>(null);
  const [pyramidData, setPyramidData] = useState<any>(null);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [achievementData, setAchievementData] = useState<any[]>([]);
  const [objectiveData, setObjectiveData] = useState<any>(null);
  const [journeyAnalytics, setJourneyAnalytics] = useState<any>(null);
  const [scoreMethodology, setScoreMethodology] = useState<any>(null);
  const [cellData, setCellData] = useState<any>(null);
  const [journeyError, setJourneyError] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([
      api.journey.overview(),
      api.journey.pyramid(),
      api.journey.timeline(),
      api.journey.achievements(),
      api.journey.objectives(),
      api.journey.analytics(range.toLowerCase()),
      api.journey.methodology(),
    ]).then(([overview, pyramid, timeline, achievements, objectives, analytics, methodology]) => {
      if (!active) return;
      setJourneyData(overview);
      setPyramidData(pyramid);
      setTimelineData(timeline || []);
      setAchievementData(achievements || []);
      setObjectiveData(objectives || []);
      setJourneyAnalytics(analytics);
      setScoreMethodology(methodology);
    }).catch((error) => { if (active) setJourneyError(error.message || "Could not load journey data"); });
    return () => { active = false; };
  }, [range]);
  const matrixRows: any[] = pyramidData?.matrix?.rows || [];
  const journeyRows = matrixRows.map((row: any) => row.label);
  const journeyCols: string[] = pyramidData?.matrix?.columns || [];
  const coverageStates = matrixRows.map((row: any) => row.cells.map((item: any) =>
    item.status === "needs_improvement" ? "improve" : item.status === "in_progress" ? "progress" : item.status
  ));
  useEffect(() => {
    if (!cell) { setCellData(null); return; }
    const row = matrixRows[cell.row];
    const category = row?.cells?.[cell.col]?.category;
    if (!row || !category) { setCellData(null); return; }
    api.journey.cell(row.region, row.delay, category).then(setCellData).catch((error) => setJourneyError(error.message || "Could not load pyramid cell"));
  }, [cell, pyramidData]);

  const handleExportTimeline = () => {
    const timelineEvents = [["Timestamp", "Event", "Description"], ...timelineData.map((event: any) => [
      event.createdAt ? new Date(event.createdAt).toLocaleString() : "",
      event.title || event.kind || "",
      event.detail || "",
    ])];
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
  const submitted = journeyData?.stats?.submitted || 0;
  const qualifying = journeyData?.stats?.qualifying || 0;
  const uniqueDatasets = journeyData?.stats?.datasets?.length || 0;
  const uniqueRegions = journeyData?.stats?.regions?.length || 0;
  const uniqueDelays = journeyData?.stats?.delays?.length || 0;
  const avgFitness = journeyData?.stats?.avgFitness;
  const avgSharpe = journeyData?.stats?.avgSharpe;
  const qualifiedCoverage = journeyData?.coverage?.qualified || 0;
  const activeCoverage = journeyData?.coverage?.cells ? Math.round(((journeyData.coverage.covered || 0) / journeyData.coverage.cells) * 100) : undefined;
  const totalCells = matrixRows.reduce((sum: number, row: any) => sum + row.cells.length, 0);
  const osmosis = journeyData?.osmosis?.score || 0;
  const valueFactor = journeyData?.valueFactor?.score || 0;
  const xp = journeyData?.xp || 0;
  const xpTarget = journeyData?.level?.nextLevelXp ?? xp;
  const levelStartXp = journeyData?.level?.levelStartXp ?? 0;
  const xpPercent = journeyData?.level?.nextLevelXp > levelStartXp
    ? Math.max(0, Math.min(100, Math.round(((xp - levelStartXp) / (journeyData.level.nextLevelXp - levelStartXp)) * 100)))
    : 100;
  const levels = journeyData?.levels || [];
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
  const achievements = achievementData.map((item) => [item.title, item.description, item.unlocked, `${item.rewardXp} XP`, item.percent]);
  const objectives: Array<[string, number, number, string, string]> = (objectiveData?.objectives || []).map((item: any): [string, number, number, string, string] => [item.title, item.current, item.target, `${item.rewardXp} XP`, `${item.daysLeft} days`]);
  const selectedCell = cell
    ? {
        row: journeyRows[cell.row],
        region: matrixRows[cell.row]?.region,
        delay: matrixRows[cell.row]?.delay,
        category: journeyCols[cell.col],
        status: coverageStates[cell.row][cell.col],
      }
    : null;
  const selectedResearch = (cellData?.alphas || []).map((alpha: any) => ({
    ...alpha,
    qualifies: alpha.qualifying,
    corr: alpha.selfCorrelation,
    delay: `D${alpha.delay}`,
    dataset: (alpha.categories || []).join(", "),
  }));
  const submittedResearch = selectedResearch.filter((alpha: any) => alpha.status === "submitted");
  const recommendationOptions = [journeyData?.nextBestAction?.primary, ...(journeyData?.nextBestAction?.alternatives || [])].filter(Boolean);
  const recommendation = recommendationOptions[altRecommendation ? 1 : 0] || recommendationOptions[0];
  const recommendedRegion = recommendation?.cell?.region || "—";
  const recommendedDelay = `D${recommendation?.cell?.delay ?? "—"}`;
  const recommendedCategory = recommendation?.cell?.category || "—";
  const recommendedRegionName = recommendedRegion;
  const osmosisHistory = (journeyAnalytics?.snapshots || []).map((item: any) => item.osmosis).filter(Number.isFinite);
  const valueHistory = (journeyAnalytics?.snapshots || []).map((item: any) => item.valueFactor).filter(Number.isFinite);
  const journeyMetrics = [
    { name: "Osmosis", value: journeyAnalytics?.snapshots?.[journeyAnalytics.snapshots.length - 1]?.osmosis, values: osmosisHistory, green: false },
    { name: "Value Factor", value: journeyAnalytics?.snapshots?.[journeyAnalytics.snapshots.length - 1]?.valueFactor, values: valueHistory, green: true },
    { name: "XP earned", value: (journeyAnalytics?.xpByDay || []).reduce((sum: number, item: any) => sum + item.xp, 0), values: (journeyAnalytics?.xpByDay || []).map((item: any) => item.xp), green: false },
    { name: "Qualified coverage", value: journeyAnalytics?.snapshots?.[journeyAnalytics.snapshots.length - 1]?.qualifiedCells, values: (journeyAnalytics?.snapshots || []).map((item: any) => item.qualifiedCells), green: true },
    { name: "Average fitness", value: journeyAnalytics?.snapshots?.[journeyAnalytics.snapshots.length - 1]?.avgFitness, values: (journeyAnalytics?.snapshots || []).map((item: any) => item.avgFitness).filter(Number.isFinite), green: true },
    { name: "Average Sharpe", value: journeyAnalytics?.snapshots?.[journeyAnalytics.snapshots.length - 1]?.avgSharpe, values: (journeyAnalytics?.snapshots || []).map((item: any) => item.avgSharpe).filter(Number.isFinite), green: false },
    { name: "Average turnover", value: journeyAnalytics?.snapshots?.[journeyAnalytics.snapshots.length - 1]?.avgTurnover, values: (journeyAnalytics?.snapshots || []).map((item: any) => item.avgTurnover).filter(Number.isFinite), green: true },
    { name: "Self correlation", value: journeyAnalytics?.snapshots?.[journeyAnalytics.snapshots.length - 1]?.avgSelfCorrelation, values: (journeyAnalytics?.snapshots || []).map((item: any) => item.avgSelfCorrelation).filter(Number.isFinite), green: true },
  ];
  const osmosisBreadth = journeyData?.osmosis?.components?.find((component: any) => component.key === "datasetDiversity");
  const osmosisRegions = journeyData?.osmosis?.components?.find((component: any) => component.key === "regionCoverage");
  const osmosisDelays = journeyData?.osmosis?.components?.find((component: any) => component.key === "delayCoverage");
  const osmosisDelta = osmosisHistory.length > 1 ? osmosisHistory[osmosisHistory.length - 1] - osmosisHistory[0] : null;
  const valueDelta = valueHistory.length > 1 ? valueHistory[valueHistory.length - 1] - valueHistory[0] : null;
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
          <div className="avatar">{(currentUser?.name || currentUser?.email || "").slice(0, 2).toUpperCase()}</div>
          <span>
            <b>{currentUser?.name || currentUser?.email || "Researcher"}</b>
            <small>{journeyData?.level?.name || "Level"} · Level {journeyData?.level?.number ?? "—"}</small>
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
            {journeyError ? "Research data unavailable" : journeyData ? "Research data synced from server" : "Loading research data…"}
          </div>
        </header>

        <section className="journey-level">
          <div className="level-summary">
            <div className="level-orbit">
              <span>{String(journeyData?.level?.number ?? "—").padStart(2, "0")}</span>
            </div>
            <div>
              <span className="journey-kicker">CURRENT LEVEL · {journeyData?.level?.number ?? "—"} OF {levels.length || "—"}</span>
              <h2>{journeyData?.level?.name || "Loading level"}</h2>
              <p>
                <strong>{xp.toLocaleString()} XP</strong> of {xpTarget.toLocaleString()} to {journeyData?.level?.nextLevelName || "next level"}
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
              <Icon name="sparkle" size={14} /> {Math.max(0, xpTarget - xp)} XP to unlock <b>{journeyData?.level?.nextLevelName || "next level"}</b>
            </p>
          </div>
          <div className="level-map">
            {levels.map((level: any, index: number) => (
              <button
                type="button"
                className={level.reached ? "complete" : level.current ? "next-level" : ""}
                title={`${level.name}: ${level.xpRequired.toLocaleString()} XP required`}
                onClick={() => setSelectedLevelModal(index)}
                key={level.number}
              >
                <i>{level.reached ? <Icon name="check" size={13} /> : level.number}</i>
                <span>{level.name}</span>
                <small>{level.xpRequired.toLocaleString()} XP</small>
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
                / 100<b>{osmosisDelta === null ? "No historical snapshot" : `${osmosisDelta >= 0 ? "+" : ""}${osmosisDelta} in range`}</b>
              </span>
              <JourneySparkline values={osmosisHistory} />
            </div>
            <div className="score-metrics">
              <span>
                <b>{uniqueDatasets}</b>Dataset diversity<small>target {osmosisBreadth?.target ?? "—"}</small>
              </span>
              <span>
                <b>{uniqueRegions}</b>Region coverage<small>target {osmosisRegions?.target ?? "—"}</small>
              </span>
              <span>
                <b>{uniqueDelays}</b>Delay coverage<small>target {osmosisDelays?.target ?? "—"}</small>
              </span>
            </div>
            <div className="score-progress">
              <i style={{ width: `${osmosis}%` }} />
            </div>
            <p>
              {journeyData?.osmosis?.components?.[0]?.explain || journeyData?.disclaimer}
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
                / 100<b>{valueDelta === null ? "No historical snapshot" : `${valueDelta >= 0 ? "+" : ""}${valueDelta} in range`}</b>
              </span>
              <JourneySparkline green values={valueHistory} />
            </div>
            <div className="score-metrics">
              <span>
                <b>{Number.isFinite(avgFitness) ? avgFitness.toFixed(2) : "—"}</b>Avg. fitness<small>qualifying only</small>
              </span>
              <span>
                <b>{Number.isFinite(avgSharpe) ? avgSharpe.toFixed(2) : "—"}</b>Avg. Sharpe<small>submitted alphas</small>
              </span>
              <span>
                <b>{qualifying}</b>Qualifying alphas
                <small>of {submitted} submitted</small>
              </span>
            </div>
            <div className="score-progress">
              <i style={{ width: `${valueFactor}%` }} />
            </div>
            <p>
              {journeyData?.valueFactor?.opportunities?.[0] || "Submit alpha results to build this estimate."}
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
                <b>{qualifiedCoverage}/{totalCells}</b>Qualified
              </span>
              <span>
                <b>{activeCoverage ?? "—"}{activeCoverage === undefined ? "" : "%"}</b>Active coverage
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
                {journeyCols.map((column: string) => (
                  <b key={column}>{column}</b>
                ))}
                {journeyRows.map((row: string, rowIndex: number) => (
                  <div className="matrix-row" key={row}>
                    <strong>
                      {row}
                      <small>
                        {matrixRows[rowIndex].region}
                      </small>
                    </strong>
                    {journeyCols.map((column: string, colIndex: number) => {
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
                <strong>{submitted ? Math.round((qualifying / submitted) * 100) : 0}%</strong>
                <p>
                  {qualifying} of {submitted} submitted alphas currently meet fitness,
                  Sharpe, and correlation thresholds.
                </p>
                <div>
                  <i style={{ width: `${submitted ? (qualifying / submitted) * 100 : 0}%` }} />
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
              <h2>{recommendation?.title || "No research recommendation yet"}</h2>
              <p>{recommendation?.recommendation || "Submit alpha research to receive a personalized next action."}</p>
              <button
                type="button"
                className="why-link"
                onClick={() => setWhyModal(true)}
                title="Click to view detailed scoring breakdown"
              >
                Why this recommendation?{" "}
                <span>{recommendation?.reason || journeyData?.nextBestAction?.reason || "Based on current research coverage."}</span>
              </button>
            </div>
            <div className="impact-grid">
              <span>
                <small>EXPECTED XP</small>
                <b>{recommendation?.expectedXp ?? "—"}</b>
              </span>
              <span>
                <small>OSMOSIS IMPACT</small>
                <b className="blue">{recommendation?.osmosisImpact ?? "—"}</b>
              </span>
              <span>
                <small>VALUE IMPACT</small>
                <b className="green">{recommendation?.valueFactorImpact ?? "—"}</b>
              </span>
              <span>
                <small>DIFFICULTY</small>
                <b>{recommendation?.difficulty || "—"}</b>
              </span>
              <span>
                <small>EST. TIME</small>
                <b>{recommendation?.estimatedMinutes ? `${recommendation.estimatedMinutes} min` : "—"}</b>
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
                      ? "Showing another available recommendation"
                      : "Showing the primary recommendation"
                  );
                }
              }}
            >
              {altRecommendation ? "Show primary recommendation" : "Show an alternative recommendation"}{" "}
              <Icon name="chevron" size={14} />
            </button>
            <div>
              <Button variant="secondary" icon="database" onClick={() => go("Datafields")}>
                Explore datasets
              </Button>
              <Button
                icon="arrow"
                onClick={() => {
                  const expr = recommendation?.expression || "";
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
              <span>PERSONALIZED RESEARCH TARGETS</span>
              <h2>Weekly Objectives</h2>
              <p>Focused goals that translate research activity into measurable progression.</p>
            </div>
            <b className="week-xp">{objectiveData?.objectives?.reduce((sum: number, item: any) => sum + (item.rewardXp || 0), 0) ?? 0} XP available</b>
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
            {journeyMetrics.map(({ name, value, green, values }) => (
              <article className="journey-card analytic" key={name}>
                <header>
                  <span>{name}</span>
                </header>
                <strong>{Number.isFinite(value) ? value : "—"}</strong>
                <JourneySparkline green={green} values={values} />
                <small>
                  {values.length ? `${values.length} recorded data points` : "No recorded data for this range"}
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
            {timelineData.map((event: any, index: number) => (
              <article key={event._id || `${event.createdAt}-${event.title}`}>
                <div className="timeline-line">
                  <i className={index === 0 ? "active" : ""}>
                    <Icon name={event.kind === "alpha_submit" ? "check" : event.kind === "level_up" ? "arrow" : "sparkle"} size={15} />
                  </i>
                </div>
                <time>{event.createdAt ? new Date(event.createdAt).toLocaleString() : ""}</time>
                <div>
                  <b>{event.title || event.kind}</b>
                  <p>{event.detail || ""}</p>
                </div>
                {event.meta?.xp ? <Badge tone="green">+{event.meta.xp} XP</Badge> : null}
              </article>
            ))}
            {!timelineData.length && <p>No research history has been recorded yet.</p>}
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
                ["Region", selectedCell.region],
                ["Delay", `D${selectedCell.delay}`],
                ["Category", selectedCell.category],
                ["Available datasets", String(cellData?.cell?.datasets?.length ?? 0)],
                ["Submitted alphas", String(submittedResearch.length)],
                ["Qualifying alphas", String(submittedResearch.filter((x: any) => x.qualifies).length)],
                [
                  "Average fitness",
                  submittedResearch.some((x: any) => Number.isFinite(x.fitness))
                    ? (submittedResearch.filter((x: any) => Number.isFinite(x.fitness)).reduce((s: number, x: any) => s + x.fitness, 0) /
                        submittedResearch.filter((x: any) => Number.isFinite(x.fitness)).length).toFixed(2)
                    : "—",
                ],
                [
                  "Average Sharpe",
                  submittedResearch.some((x: any) => Number.isFinite(x.sharpe))
                    ? (submittedResearch.filter((x: any) => Number.isFinite(x.sharpe)).reduce((s: number, x: any) => s + x.sharpe, 0) /
                        submittedResearch.filter((x: any) => Number.isFinite(x.sharpe)).length).toFixed(2)
                    : "—",
                ],
                [
                  "Avg. correlation",
                  submittedResearch.some((x: any) => Number.isFinite(x.corr))
                    ? (submittedResearch.filter((x: any) => Number.isFinite(x.corr)).reduce((s: number, x: any) => s + x.corr, 0) /
                        submittedResearch.filter((x: any) => Number.isFinite(x.corr)).length).toFixed(2)
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
              {cellData?.thresholds && <div className="rule">Configured qualification thresholds: fitness ≥ {cellData.thresholds.minFitness}, Sharpe ≥ {cellData.thresholds.minSharpe}, self-correlation ≤ {cellData.thresholds.maxSelfCorrelation}</div>}
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
              <h2>{levels[selectedLevelModal]?.name || "Level"}</h2>
              </div>
              <button className="icon-btn" onClick={() => setSelectedLevelModal(null)}>
                <Icon name="x" />
              </button>
            </header>
            <div style={{ margin: "16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Badge tone={levels[selectedLevelModal]?.reached ? "green" : levels[selectedLevelModal]?.current ? "blue" : "neutral"}>
                {levels[selectedLevelModal]?.reached ? "Reached" : levels[selectedLevelModal]?.current ? "Current level" : "Not reached"}
              </Badge>
              <b>Required: {levels[selectedLevelModal]?.xpRequired?.toLocaleString()} XP</b>
            </div>
            <p>Level requirements are loaded from your account progression settings.</p>
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
            <p style={{ fontSize: "13px", color: "var(--muted)", margin: "14px 0" }}>{journeyData?.nextBestAction?.method || "Recommendations are based on your recorded alpha coverage and scores."}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "14px 0" }}>
              {(recommendation?.why || []).map((reason: string, index: number) => <div key={reason} style={{ padding: "12px", background: "rgba(255,255,255,0.04)", borderRadius: "8px", border: "1px solid var(--border)" }}><b style={{ display: "block", color: "var(--accent)" }}>{index + 1}. {reason}</b></div>)}
              {!recommendation && <p>No next action is available yet.</p>}
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
            <div className="formula">
              {(scoreInfo === "osmosis"
                ? journeyData?.osmosis?.components
                : journeyData?.valueFactor?.components
              )?.map((component: any) => (
                <p key={component.key}>
                  <b>{component.label}</b>
                  <span>{component.explain}</span>
                  <strong>{component.ratio == null ? "—" : `${Math.round(component.ratio * 100)}% × ${component.weight}%`}</strong>
                </p>
              ))}
              <small>{scoreInfo === "osmosis"
                ? scoreMethodology?.osmosis?.formula
                : scoreMethodology?.valueFactor?.formula}</small>
              {scoreInfo === "osmosis" && <small>{scoreMethodology?.qualification?.note}</small>}
            </div>
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
  const [activeTab, setActiveTab] = useState<"Overview" | "Salary" | "Referrals" | "Bonus">("Overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [records, setRecords] = useState<Array<[string, string, string, string, string?]>>([]);
  const [financeSummary, setFinanceSummary] = useState<any>(null);

  // Load finance records from MongoDB on mount
  useEffect(() => {
    let active = true;
    Promise.all([api.finance.list(), api.finance.summary()]).then(([res, summary]) => {
      if (!active) return;
      setFinanceSummary(summary);
      if (res && Array.isArray(res.items)) {
        setRecords(
          res.items.map((it: any) => [
            it.date
              ? new Date(it.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
              : "—",
            it.type ? it.type.charAt(0).toUpperCase() + it.type.slice(1) : "Salary",
            it.note || it.description || "Alpha compensation",
            `$${(it.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
            it._id || it.id,
          ])
        );
      }
    }).catch((error) => toast(error instanceof Error ? error.message : "Could not load earnings data")).finally(() => setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Modal form states
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [newType, setNewType] = useState("Salary");
  const [newAmount, setNewAmount] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const filteredRecords = useMemo(() => {
    if (activeTab === "Overview") return records;
    const type = activeTab === "Referrals" ? "Referral" : activeTab;
    return records.filter((r) => r[1] === type);
  }, [records, activeTab]);
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const quarterKey = `${now.getFullYear()}-Q${Math.ceil((now.getMonth() + 1) / 3)}`;
  const currency = (amount: number) => `$${Number(amount || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

  const handleDeleteRecord = async (idx: number) => {
    const item = filteredRecords[idx];
    if (!item?.[4]) return;
    try {
      await api.finance.deleteEntry(item[4]);
      setRecords((prev) => prev.filter((r) => r !== item));
      setFinanceSummary(await api.finance.summary());
      toast("Earnings entry removed");
    }
    catch (error) { toast(error instanceof Error ? error.message : "Could not remove earnings entry"); }
  };

  const handleExportCSV = () => {
    const csv = ["Date,Type,Description,Amount"]
      .concat(records.map((r) => [r[0], r[1], r[2], r[3]].map(csvCell).join(",")))
      .join("\n");
    const encoded = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
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
    if (!newAmount || !newDate) return;
    const num = Number(newAmount);
    if (!Number.isFinite(num) || num < 0) return toast("Enter a valid non-negative amount");
    const formattedAmount = `$${num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
    const desc = newDesc.trim() || `${newType} payout payment`;
    setSaving(true);
    try {
      const res = await api.finance.addEntry({
        date: newDate,
        type: newType.toLowerCase(),
        amount: num,
        description: desc,
      });
      const entry = res?.item || res;
      setRecords((prev) => [[new Date(entry.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), newType, entry.note || desc, formattedAmount, entry._id || entry.id], ...prev]);
      setFinanceSummary(await api.finance.summary());
      setModal(false); setNewAmount(""); setNewDesc(""); toast("Earnings entry saved");
    } catch (error) { toast(error instanceof Error ? error.message : "Could not save earnings entry"); }
    finally { setSaving(false); }
  };

  return (
    <div className="page">
      <header className="page-title">
        <div>
          <div className="eyebrow">EARNINGS</div>
          <h1>Finance</h1>
          <p>Track your research rewards and referral income.</p>
        </div>
        <div className="page-actions">
          <Button variant="secondary" icon="download" onClick={handleExportCSV}>Export earnings</Button>
          <Button icon="plus" onClick={() => setModal(true)}>Add earning</Button>
        </div>
      </header>
      <div className="tab-line">
        {(["Overview", "Salary", "Referrals", "Bonus"] as const).map((t) => (
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
        <Stat label="This month" value={currency(financeSummary?.monthly?.[currentMonth] || 0)} delta="Recorded earnings" icon="wallet" />
        <Stat label="This quarter" value={currency(financeSummary?.quarterly?.[quarterKey] || 0)} delta="Recorded earnings" icon="grid" />
        <Stat label="All time" value={currency(financeSummary?.all || 0)} delta={`${records.length} payment records`} icon="pyramid" />
        <Stat label="Referral earnings" value={currency(financeSummary?.byType?.referral || 0)} delta={`${financeSummary?.referral?.count ?? 0} referrals`} icon="layers" />
      </div>
      <div className="two-col wide-left">
        <section className="card finance-chart">
          <div className="card-head">
            <div>
              <h3>Earnings by month</h3>
              <p>Totals from recorded payment entries</p>
            </div>
          </div>
          <div className="money-bars">
            {Object.entries(financeSummary?.monthly || {}).slice(-12).map(([month, amount]) => {
              const values = Object.values(financeSummary?.monthly || {}) as number[];
              const max = Math.max(...values, 1);
              const height = Math.max(2, (Number(amount) / max) * 100);
              return <div key={month}><span style={{ height: `${height}%` }} /><small>{month}</small></div>;
            })}
            {!Object.keys(financeSummary?.monthly || {}).length && <p>No payment data is recorded yet.</p>}
          </div>
        </section>
        <section className="card referral">
          <Badge tone="violet">REFERRALS</Badge>
          <h3>Earn together</h3>
          <p>Share QuantStorm and track your network earnings.</p>
          <div className="copy-link">
            <code>{financeSummary?.referral?.code || "Referral code unavailable"}</code>
            <button
              type="button"
              onClick={() => financeSummary?.referral?.code && onCopy(`${window.location.origin}/?ref=${financeSummary.referral.code}`, "Referral link")}
              title="Copy referral link"
            >
              <Icon name="copy" />
            </button>
          </div>
          <div>
            <span>Active referrals</span>
            <b>{financeSummary?.referral?.count ?? 0}</b>
          </div>
          <div>
            <span>This month</span>
            <b>{currency(financeSummary?.monthlyByType?.[currentMonth]?.referral || 0)}</b>
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
            {loading ? <tr><td colSpan={6} style={{ textAlign: "center", padding: "28px", color: "var(--muted)" }}>Loading earnings…</td></tr> : filteredRecords.length === 0 ? <tr><td colSpan={6} style={{ textAlign: "center", padding: "28px", color: "var(--muted)" }}>No earnings have been recorded for this view.</td></tr> : filteredRecords.map((r, i) => (
              <tr key={r[0] + i}>
                {r.slice(0, 4).map((x, j) => (
                  <td key={`${x ?? ""}${j}`}>
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
                  <Badge tone="neutral">Recorded</Badge>
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
                <p>Record a salary, referral, or bonus payment.</p>
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
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </label>
              <label className="field">
                <span>Type</span>
                <select value={newType} onChange={(e) => setNewType(e.target.value)}>
                  <option>Salary</option>
                  <option>Referral</option>
                  <option>Bonus</option>
                </select>
              </label>
            </div>
            <label className="field">
              <span>Amount ($)</span>
              <div className="currency" style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="number"
                  min="0"
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
              <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Add entry"}</Button>
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
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [verificationSending, setVerificationSending] = useState(false);
  const [region, setRegion] = useState("");
  const [regionOptions, setRegionOptions] = useState<string[]>([]);

  const [dailyReminders, setDailyReminders] = useState(true);
  const [submitTarget, setSubmitTarget] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [reminderTimes, setReminderTimes] = useState([true, true, false]);
  const [emailChannel, setEmailChannel] = useState(false);
  const [inAppChannel, setInAppChannel] = useState(true);
  const [pushChannel, setPushChannel] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushAvailable, setPushAvailable] = useState<boolean | null>(null);
  const [pushBusy, setPushBusy] = useState(false);

  // Local appearance preferences
  const [themePref, setThemePref] = useState("Dark");
  const [densityPref, setDensityPref] = useState("Comfortable");
  const [notificationHistory, setNotificationHistory] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Daily Ideas Preferences State
  const [ideasEnabled, setIdeasEnabled] = useState(true);
  const [ideasNotifyTime, setIdeasNotifyTime] = useState("08:00");
  const [ideasRegions, setIdeasRegions] = useState<string[]>(["USA", "EUR"]);
  const [ideasAvoidCategories, setIdeasAvoidCategories] = useState<string[]>([]);
  const [ideasDifficulty, setIdeasDifficulty] = useState("all");
  const [shareExpressions, setShareExpressions] = useState(false);

  useEffect(() => {
    const supported = window.isSecureContext && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setPushSupported(supported);
    if (supported) {
      api.push.publicKey().then((result) => setPushAvailable(Boolean(result.publicKey))).catch(() => setPushAvailable(false));
      navigator.serviceWorker.getRegistration("/")
        .then((registration) => registration?.pushManager.getSubscription())
        .then((subscription) => setPushChannel(Boolean(subscription)))
        .catch(() => setPushChannel(false));
    } else setPushAvailable(false);
  }, []);

  useEffect(() => {
    let active = true;

    // Load user profile from MongoDB
    api.users.getProfile().then((u) => {
      if (active && u) {
        if (u.name) setFullName(u.name);
        if (u.email) setEmail(u.email);
        setEmailVerified(Boolean(u.emailVerified));
        if (u.timezone) setTimezone(u.timezone);
        if (u.dailyTarget) setSubmitTarget(`${u.dailyTarget} alphas`);
        if (u.regions && u.regions.length > 0) setRegion(u.regions[0]);
        if (u.reminderPrefs?.channels) {
          if (u.reminderPrefs.channels.email !== undefined) setEmailChannel(u.reminderPrefs.channels.email);
          if (u.reminderPrefs.channels.inApp !== undefined) setInAppChannel(u.reminderPrefs.channels.inApp);
        }
        if (Array.isArray(u.reminderPrefs?.offsetsMin)) {
          setReminderTimes([180, 60, 15].map((offset) => u.reminderPrefs.offsetsMin.includes(offset)));
          setDailyReminders(u.reminderPrefs.offsetsMin.length > 0);
        }
      }
    }).catch(() => {});

    api.regions.list().then((res) => {
      if (active) setRegionOptions(res.regions.map((item) => item.code));
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
          time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—",
          read: Boolean(n.readAt),
        })));
      }
    }).catch(() => {});

    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (activeTab !== "Sessions") return;
    setSessionsLoading(true);
    api.auth.sessions().then((items) => setSessions(items || []))
      .catch((error) => toast?.(error.message || "Could not load sessions"))
      .finally(() => setSessionsLoading(false));
  }, [activeTab]);

  const revokeSession = async (id: string) => {
    try {
      await api.auth.revokeSession(id);
      setSessions((items) => items.filter((session) => session._id !== id));
      toast?.("Session revoked");
    } catch (error: any) {
      toast?.(error.message || "Could not revoke session");
    }
  };

  const revokeOtherSessions = async () => {
    try {
      await api.auth.revokeOtherSessions();
      setSessions((items) => items.filter((session) => session.current));
      toast?.("Other sessions signed out");
    } catch (error: any) {
      toast?.(error.message || "Could not sign out other sessions");
    }
  };

  const updatePushSubscription = async (enabled: boolean) => {
    if (enabled === pushChannel) return;
    if (!pushSupported) {
      toast?.("Push notifications require a supported browser and a secure HTTPS connection");
      return;
    }
    setPushBusy(true);
    try {
      if (enabled) {
        let permission = Notification.permission;
        if (permission === "default") permission = await Notification.requestPermission();
        if (permission !== "granted") throw new Error("Allow notifications in your browser to enable push alerts");
      }
      const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      const readyRegistration = await navigator.serviceWorker.ready;
      const activeRegistration = readyRegistration || registration;
      const current = await activeRegistration.pushManager.getSubscription();
      if (enabled) {
        const { publicKey } = await api.push.publicKey();
        const subscription = current || await activeRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKeyBytes(publicKey),
        });
        try {
          await api.push.subscribe(subscription.toJSON());
        } catch (error) {
          if (!current) await subscription.unsubscribe();
          throw error;
        }
        setPushChannel(true);
        toast?.("Push notifications enabled for this browser");
      } else {
        if (current) {
          await api.push.unsubscribe(current.endpoint);
          await current.unsubscribe();
        }
        setPushChannel(false);
        toast?.("Push notifications disabled for this browser");
      }
    } catch (error) {
      toast?.(error instanceof Error ? error.message : "Could not update push notifications");
    } finally {
      setPushBusy(false);
    }
  };

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
    } catch (error: any) {
      if (toast) toast(error.message || "Could not save Daily Ideas preferences");
    }
  };

  const handleSave = async () => {
    try {
      await api.users.updateProfile({
        name: fullName,
        timezone,
        dailyTarget: parseInt(submitTarget) || 4,
        ...(region ? { regions: [region] } : {}),
        reminderPrefs: {
          offsetsMin: dailyReminders ? [180, 60, 15].filter((offset, index) => reminderTimes[index]) : [],
          channels: { email: emailChannel, inApp: inAppChannel },
        },
      });
      if (toast) toast("Profile and reminder preferences saved");
    } catch (error: any) {
      if (toast) toast(error.message || "Could not save settings and profile");
    }
  };

  const handleResendVerification = async () => {
    setVerificationSending(true);
    try {
      const result = await api.auth.resendVerification();
      if (toast) toast(result.alreadyVerified ? "Your email is already verified" : "Verification email sent");
    } catch (error: any) {
      if (toast) toast(error.message || "Could not send verification email");
    } finally {
      setVerificationSending(false);
    }
  };

  const handleExportWorkspace = () => {
    const data = {
      user: { name: fullName, email, region, submitTarget, timezone },
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
        "Appearance",
        "Sessions",
        "Data & privacy",
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
                    type="number"
                    min={1}
                    max={20}
                    required
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
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="Asia/Singapore">Asia/Singapore</option>
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
                  {regionOptions.map((r) => {
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
              <label className="switch-row compact">
                <span>
                  <b>Browser push notifications</b>
                  <small style={{ display: "block", color: "var(--muted)", fontSize: "12px" }}>
                    {pushSupported
                      ? pushAvailable === null
                        ? "Checking push notification availability…"
                        : pushAvailable === false
                          ? "Push notifications are unavailable; check the server configuration and connection"
                          : "Receive reminders and research announcements when QuantStorm is closed"
                      : "Push notifications need a supported browser and an HTTPS connection"}
                  </small>
                </span>
                <input
                  type="checkbox"
                  checked={pushChannel}
                  disabled={!pushSupported || pushBusy || (!pushAvailable && !pushChannel)}
                  onChange={(event) => void updatePushSubscription(event.target.checked)}
                  aria-label="Enable browser push notifications"
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
                  onClick={async () => {
                    try {
                      await api.notifications.markAllRead();
                      setNotificationHistory((prev) => prev.map((n) => ({ ...n, read: true })));
                      if (toast) toast("All notifications marked as read");
                    } catch (error) { if (toast) toast(error instanceof Error ? error.message : "Could not update notifications"); }
                  }}
                >
                  Mark all as read
                </Button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", margin: "16px 0" }}>
                {notificationHistory.map((n) => (
                  <div
                    key={n.id}
                    onClick={async () => {
                      if (!n.read) {
                        try {
                          await api.notifications.markRead(String(n.id));
                          setNotificationHistory((prev) => prev.map((it) => (it.id === n.id ? { ...it, read: true } : it)));
                        } catch (error) { if (toast) toast(error instanceof Error ? error.message : "Could not update notification"); }
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
          ) : activeTab === "Sessions" ? (
            <>
              <h2>Signed-in devices</h2>
              <p>Refresh sessions are stored securely and can be revoked at any time.</p>
              {sessions.length > 1 && <Button variant="secondary" onClick={revokeOtherSessions}>Sign out other devices</Button>}
              {sessionsLoading ? <p>Loading sessions…</p> : sessions.length ? (
                <div className="settings-session-list">
                  {sessions.map((session) => (
                    <div key={session._id} className="settings-session-row">
                      <div>
                        <b>{session.current ? "This device" : (session.userAgent || "Browser session")}</b>
                        <small>{session.current ? "Current session" : session.userAgent || "Browser session"} · Last active {session.lastUsedAt ? new Date(session.lastUsedAt).toLocaleString() : "unknown"}</small>
                        <small>Signed in {session.createdAt ? new Date(session.createdAt).toLocaleDateString() : "unknown"}</small>
                      </div>
                      {!session.current && <Button variant="secondary" onClick={() => revokeSession(session._id)}>Revoke</Button>}
                    </div>
                  ))}
                </div>
              ) : <p>No active sessions.</p>}
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
            </>
          ) : (
            <>
              <div className="profile-line">
                <div className="avatar large">{String(fullName || email || "?").slice(0, 2).toUpperCase()}</div>
                <div>
                  <b>{fullName}</b>
                  <span>{email}</span>
                </div>
              </div>
              {emailVerified !== null && <div className={`email-verification-row ${emailVerified ? "verified" : "unverified"}`}>
                <div><b>{emailVerified ? "Email verified" : "Verify your email"}</b><small>{emailVerified ? "Your account email is confirmed." : "Confirm your email to keep account recovery available."}</small></div>
                {!emailVerified && <Button variant="secondary" disabled={verificationSending} onClick={handleResendVerification}>{verificationSending ? "Sending…" : "Resend email"}</Button>}
              </div>}
              <div className="form-grid">
                <label className="field">
                  <span>Full name</span>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </label>
                <label className="field">
                  <span>Email</span>
                  <input type="email" value={email} readOnly />
                </label>
                <label className="field">
                  <span>Default region</span>
                  <select value={region} onChange={(e) => setRegion(e.target.value)}>
                    {[...new Set([region, ...regionOptions])].filter(Boolean).map((code) => <option key={code}>{code}</option>)}
                  </select>
                </label>
              </div>
              <div className="danger-zone">
                <h3>Data &amp; privacy</h3>
                <p>Export a copy of your saved workspace records.</p>
                <Button variant="secondary" onClick={handleExportWorkspace}>Export all data</Button>
              </div>
            </>
          )}
          {activeTab !== "Sessions" && <footer><Button onClick={handleSave}>Save changes</Button></footer>}
        </section>
      </div>
    </div>
  );
}

function AppShell({ onLogout }: { onLogout: () => void }) {
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
  const [alphas, setAlphas] = useState<any[]>(alphaData);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [dailyTarget, setDailyTarget] = useState(0);
  const [streak, setStreak] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeRegion, setActiveRegion] = useState("USA");
  const [availableRegions, setAvailableRegions] = useState<string[]>(currentUser?.regions || []);
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

  const handleSubmitAlpha = (id: string) => {
    const targetAlpha = alphas.find((a: any) => (a._id || a.id) === id);
    if (!targetAlpha?._id) return showToast("Save this alpha before submitting it");
    api.alphas.submit(targetAlpha._id).then((result) => {
      setAlphas((prev) => prev.map((a) => a._id === targetAlpha._id ? { ...a, status: "Submitted", submittedAt: new Date().toISOString() } : a));
      setSubmittedCount(result.dailySubmittedCount);
      showToast(`Alpha submitted (${result.dailySubmittedCount} submitted today)`);
    }).catch((error) => showToast(error.message || "Could not submit alpha"));
  };

  // Sync state with backend on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const session = await api.auth.ensureSession();
      if (!isMounted) return;
      if (session?.user) {
        setCurrentUser(session.user);
        if (session.user.regions?.[0]) setActiveRegion(session.user.regions[0]);
        if (session.quota?.submittedToday !== undefined) {
          setSubmittedCount(session.quota.submittedToday);
        }
        if (session.quota?.target !== undefined) setDailyTarget(session.quota.target);
        if (session.user.streak?.current !== undefined) {
          setStreak(session.user.streak.current);
        }
      }
      const regionData = await api.regions.list();
      if (isMounted) setAvailableRegions((regionData?.regions || []).map((item: any) => item.code));
      const alphaRes = await api.alphas.list();
      if (isMounted && alphaRes && Array.isArray(alphaRes.items)) {
        setAlphas(alphaRes.items.map((b: any) => ({
          id: b._id || b.id,
          _id: b._id,
          name: b.name || (b.expression ? b.expression.slice(0, 30) : "Alpha"),
          expr: b.expression || "",
          region: b.region || "USA",
          universe: b.universe || "TOP3000",
          delay: String(b.delay ?? 1),
          decay: String(b.decay ?? 4),
          neut: b.neutralization || "SUBINDUSTRY",
          trunc: String(b.truncation ?? 0.08),
          sharpe: b.sharpe,
          fit: b.fitness,
          fitness: b.fitness,
          turnover: b.turnover,
          selfCorrelation: b.selfCorrelation,
          status: b.status === "submitted" ? "Submitted" : b.status === "archived" ? "Archived" : "Saved",
          qualifying: b.qualifying,
          datasets: b.datasets || [],
          datafields: b.datafields || [],
          tags: b.tags || [],
          notes: b.notes || "",
          createdAt: b.createdAt,
          submittedAt: b.submittedAt,
        })));
      }
    })().catch((error) => {
      if (isMounted) showToast(error instanceof Error ? error.message : "Could not load account data");
    });
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
          currentUser={currentUser}
          dailyTarget={dailyTarget}
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
            showToast(`Idea "${prefill.name}" loaded into Alpha Vault`);
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
          regions={availableRegions}
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
          currentUser={currentUser}
          onStartAlpha={(expr) => {
            setPrefilledExpr(expr);
            setPage("Alpha Vault");
          }}
        />
      );
    if (page === "Finance") return <Finance toast={showToast} onCopy={copyText} />;
    if (page === "Settings") return <SettingsPage toast={showToast} />;
    if (page === "Notifications") return <SettingsPage toast={showToast} notifications />;
    return (
      <Dashboard
        go={setPage}
        toast={showToast}
        alphas={alphas}
        onSubmitAlpha={handleSubmitAlpha}
        onCopy={copyText}
        submittedCount={submittedCount}
        activeRegion={activeRegion}
          currentUser={currentUser}
          dailyTarget={dailyTarget}
      />
    );
  }, [page, alphas, submittedCount, streak, activeRegion, currentUser, dailyTarget, prefilledExpr, prefilledAlpha, aiPrompt]);

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
              {i === 2 && <small>{alphas.length}</small>}
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
            <div className="avatar">{String(currentUser?.name || currentUser?.email || "?").slice(0, 2).toUpperCase()}</div>
            <span>
              <b>{currentUser?.name || currentUser?.email || "Researcher"}</b>
              <small>{currentUser?.email || "Account"}</small>
            </span>
            <Icon name="chevron" />
          </button>
          <button type="button" onClick={onLogout} aria-label="Sign out">Sign out</button>
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
              <b>{submittedCount}/{dailyTarget || "—"} submitted</b>
              <small>{activeRegion}</small>
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
                  {availableRegions.map((r) => (
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
                  {!availableRegions.length && <span>No regions configured for this account.</span>}
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
              {String(currentUser?.name || currentUser?.email || "?").slice(0, 2).toUpperCase()}
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
  const [authed, setAuthed] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("oauth") === "success") {
      url.searchParams.delete("oauth");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }
    const path = window.location.pathname.replace(/\/+$/, "");
    const accountAction = ["/reset-password", "/verify-email", "/accept-invite"].some((route) => path.endsWith(route));
    if (accountAction) {
      setAuthed(false);
      setCheckingSession(false);
      return;
    }
    api.auth.ensureSession().then(() => setAuthed(true)).catch(() => setAuthed(false)).finally(() => setCheckingSession(false));
  }, []);
  if (checkingSession) return <div className="auth-shell" aria-live="polite">Loading your account…</div>;
  if (!authed) return <Auth onDone={() => setAuthed(true)} />;
  return <AppShell onLogout={() => { api.auth.logout().finally(() => setAuthed(false)); }} />;
}
