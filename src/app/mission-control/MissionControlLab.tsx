"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import {
  Activity,
  ArrowUpRight,
  Check,
  Copy,
  Globe2,
  Layers,
  Radar,
  RotateCcw,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

const PALETTES = {
  mission: { label: "Mission Blue", accent: "#4C8DFF", line: "#243B5B" },
  arctic: { label: "Arctic Cyan", accent: "#43D5D0", line: "#245057" },
  signal: { label: "Signal Amber", accent: "#F6B85D", line: "#60452B" },
} as const;

type Palette = keyof typeof PALETTES;
type Preferences = {
  palette: Palette;
  radius: number;
  compact: boolean;
  grid: boolean;
};

const STORAGE_KEY = "dv-mission-control-lab-v1";
const DEFAULTS: Preferences = {
  palette: "mission",
  radius: 16,
  compact: false,
  grid: true,
};

const channels = [
  { label: "COMMUNICATION", value: "LINK READY", status: "nominal" },
  { label: "ORBITAL TRACKING", value: "ACTIVE", status: "nominal" },
  { label: "DATA STREAM", value: "SIMULATED", status: "standby" },
];

const activity = [
  { time: "T+00:04", label: "시스템 인터페이스 초기화", type: "OK" },
  { time: "T+00:12", label: "우주 탐사 뷰 시뮬레이션 시작", type: "OK" },
  { time: "T+00:18", label: "시연 데이터 표시 중", type: "DEMO" },
];

function readPreferences(raw: string | null): Preferences {
  if (!raw) return DEFAULTS;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return DEFAULTS;
    const data = parsed as Partial<Preferences>;

    return {
      palette:
        data.palette === "mission" || data.palette === "arctic" || data.palette === "signal"
          ? data.palette
          : DEFAULTS.palette,
      radius:
        typeof data.radius === "number" && Number.isFinite(data.radius)
          ? Math.min(28, Math.max(6, Math.round(data.radius)))
          : DEFAULTS.radius,
      compact: typeof data.compact === "boolean" ? data.compact : DEFAULTS.compact,
      grid: typeof data.grid === "boolean" ? data.grid : DEFAULTS.grid,
    };
  } catch {
    return DEFAULTS;
  }
}

export default function MissionControlLab() {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setPreferences(readPreferences(window.localStorage.getItem(STORAGE_KEY)));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    }
  }, [hydrated, preferences]);

  const palette = PALETTES[preferences.palette];
  const cssVariables = {
    "--mc-accent": palette.accent,
    "--mc-line-accent": palette.line,
    "--mc-radius": String(preferences.radius) + "px",
  } as CSSProperties;

  function change(patch: Partial<Preferences>) {
    setPreferences((previous) => ({ ...previous, ...patch }));
    setNotice("");
  }

  function reset() {
    setPreferences(DEFAULTS);
    setNotice("기본 디자인으로 초기화했어.");
  }

  async function copyTokens() {
    const tokens = [
      "/* Drawing Verse Mission Control tokens */",
      ":root {",
      "  --dv-mission-bg: #080D16;",
      "  --dv-mission-surface: #101B2A;",
      "  --dv-mission-text: #E8EDF5;",
      "  --dv-mission-muted: #9BAABE;",
      "  --dv-mission-accent: " + palette.accent + ";",
      "  --dv-mission-border: " + palette.line + ";",
      "  --dv-mission-radius: " + preferences.radius + "px;",
      "}",
    ].join("\n");

    try {
      await navigator.clipboard.writeText(tokens);
      setNotice("CSS 변수를 클립보드에 복사했어!");
    } catch {
      setNotice("복사할 수 없었어. 보안 연결(HTTPS)에서 다시 시도해 줘.");
    }
  }

  return (
    <main
      className="mc-lab"
      style={cssVariables}
      data-density={preferences.compact ? "compact" : "comfortable"}
      data-grid={preferences.grid ? "on" : "off"}
    >
      <div className="mc-layout">
        <aside className="mc-sidebar" aria-label="디자인 조정 패널">
          <Link className="mc-brand" href="/" aria-label="Drawing Verse 홈으로">
            <span className="mc-brand-mark">DV</span>
            <span>
              <strong>DRAWING VERSE</strong>
              <small>DESIGN SYSTEM / 01</small>
            </span>
          </Link>

          <div className="mc-side-section">
            <p className="mc-eyebrow">DESIGN LABORATORY</p>
            <h2>관제센터 실험실</h2>
            <p className="mc-side-description">
              색상과 모서리, 정보 밀도를 바꾸면서 디자인을 직접 조정해 봐.
              변경값은 이 브라우저에 저장돼.
            </p>
          </div>

          <section className="mc-controls" aria-labelledby="mc-controls-title">
            <h3 id="mc-controls-title">
              <SlidersHorizontal size={16} aria-hidden="true" /> UI CONTROLS
            </h3>

            <fieldset className="mc-control-group">
              <legend>강조 색상</legend>
              <div className="mc-swatches">
                {(Object.keys(PALETTES) as Palette[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={preferences.palette === key ? "mc-swatch is-selected" : "mc-swatch"}
                    style={{ "--swatch": PALETTES[key].accent } as CSSProperties}
                    onClick={() => change({ palette: key })}
                    aria-label={PALETTES[key].label}
                    aria-pressed={preferences.palette === key}
                    title={PALETTES[key].label}
                  >
                    {preferences.palette === key && <Check size={15} aria-hidden="true" />}
                  </button>
                ))}
              </div>
              <span className="mc-control-caption">{palette.label} · {palette.accent}</span>
            </fieldset>

            <div className="mc-control-group">
              <label htmlFor="mc-radius">모서리 곡률 <output>{preferences.radius}px</output></label>
              <input
                id="mc-radius"
                type="range"
                min="6"
                max="28"
                step="2"
                value={preferences.radius}
                onChange={(event) => change({ radius: Number(event.target.value) })}
              />
            </div>

            <label className="mc-toggle">
              <span>컴팩트한 정보 밀도</span>
              <input
                type="checkbox"
                checked={preferences.compact}
                onChange={(event) => change({ compact: event.target.checked })}
              />
            </label>
            <label className="mc-toggle">
              <span>관측 격자 표시</span>
              <input
                type="checkbox"
                checked={preferences.grid}
                onChange={(event) => change({ grid: event.target.checked })}
              />
            </label>
          </section>

          <div className="mc-side-actions">
            <button type="button" className="mc-action mc-action-primary" onClick={copyTokens}>
              <Copy size={16} aria-hidden="true" /> CSS 변수 복사
            </button>
            <button type="button" className="mc-action mc-action-muted" onClick={reset}>
              <RotateCcw size={15} aria-hidden="true" /> 기본값 복원
            </button>
            <p className="mc-notice" role="status">{notice || "실제 서비스 데이터는 변경하지 않아."}</p>
          </div>
        </aside>

        <div className="mc-workspace">
          <header className="mc-topbar">
            <div className="mc-breadcrumb">
              <span>DRAWING VERSE</span><span className="mc-divider">/</span>
              <strong>MISSION CONTROL</strong>
            </div>
            <div className="mc-top-status"><span className="mc-status-light" /> SYSTEM PREVIEW <span>·</span> V1.0</div>
          </header>

          <div className="mc-content">
            <div className="mc-heading">
              <div>
                <p className="mc-eyebrow">MISSION INTERFACE · CONCEPT 01</p>
                <h1>Explore the <em>unknown.</em></h1>
                <p className="mc-lead">우주를 탐험하는 감각, 매일 사용하는 서비스의 명료함. 드버스의 새로운 인터페이스를 시험하는 공간이야.</p>
              </div>
              <span className="mc-preview-stamp"><Settings2 size={14} aria-hidden="true" /> INTERACTIVE PROTOTYPE</span>
            </div>

            <section className="mc-metrics" aria-label="시연용 시스템 상태">
              <article className="mc-metric">
                <div className="mc-metric-heading"><Activity size={17} aria-hidden="true" /> SYSTEM STATE</div>
                <strong>OPERATIONAL</strong>
                <span><i className="mc-dot mc-green" /> Interface online</span>
              </article>
              <article className="mc-metric">
                <div className="mc-metric-heading"><Globe2 size={17} aria-hidden="true" /> CURRENT SECTOR</div>
                <strong>SOL / 003</strong>
                <span>Earth orbit · Sample</span>
              </article>
              <article className="mc-metric">
                <div className="mc-metric-heading"><Layers size={17} aria-hidden="true" /> SYSTEM BUILD</div>
                <strong>DS 1.0</strong>
                <span>Mission Control concept</span>
              </article>
            </section>

            <div className="mc-main-grid">
              <section className="mc-panel mc-orbit-panel" aria-labelledby="mc-orbit-heading">
                <div className="mc-panel-header">
                  <div>
                    <p className="mc-eyebrow">01 / EXPLORATION</p>
                    <h2 id="mc-orbit-heading">Orbital overview</h2>
                  </div>
                  <span className="mc-tag"><Radar size={13} aria-hidden="true" /> SIMULATION</span>
                </div>
                <div className="mc-orbit-display">
                  <svg viewBox="0 0 620 342" role="img" aria-label="지구와 주변 궤도를 표현한 시연용 관측 다이어그램">
                    <defs>
                      <radialGradient id="mc-earth" cx="36%" cy="30%" r="75%">
                        <stop offset="0" stopColor="#78B8E8" />
                        <stop offset=".53" stopColor="#2B6A9F" />
                        <stop offset="1" stopColor="#0B233F" />
                      </radialGradient>
                    </defs>
                    <g fill="none" stroke="currentColor" strokeWidth="1">
                      <circle cx="310" cy="171" r="62" opacity=".22" strokeDasharray="3 8" />
                      <circle cx="310" cy="171" r="108" opacity=".22" />
                      <circle cx="310" cy="171" r="147" opacity=".14" />
                      <ellipse cx="310" cy="171" rx="238" ry="103" transform="rotate(-18 310 171)" opacity=".35" />
                      <path d="M310 10 V332 M15 171 H605" opacity=".12" />
                    </g>
                    <circle cx="310" cy="171" r="47" fill="url(#mc-earth)" stroke="#82B2DA" strokeOpacity=".5" />
                    <path d="M291 137 l12 8 1 14 16 7 -8 12 -15 -3 -8 -20z M320 181 l22 -5 3 14 -11 18 -9 -3z" fill="#8DCBAA" opacity=".45" />
                    <circle cx="484" cy="103" r="6" fill="var(--mc-accent)" />
                    <circle cx="484" cy="103" r="13" fill="none" stroke="var(--mc-accent)" strokeOpacity=".6" />
                    <path d="M484 103 L520 71 H592" stroke="var(--mc-accent)" strokeWidth="1" fill="none" />
                    <text x="520" y="63" fill="var(--mc-accent)" fontSize="12" fontFamily="monospace">OBJECT 001</text>
                    <text x="310" y="237" textAnchor="middle" fill="#D9EAF6" fontSize="12" fontFamily="monospace" letterSpacing="3">EARTH</text>
                    <text x="32" y="35" fill="#8096AD" fontSize="11" fontFamily="monospace">SECTOR 03 / DEMO</text>
                    <text x="32" y="312" fill="#8096AD" fontSize="11" fontFamily="monospace">NOT TO SCALE</text>
                  </svg>
                </div>
                <div className="mc-orbit-footer">
                  <span><span className="mc-mini-square" /> ORBITAL VIEW</span>
                  <span>REFERENCE / J2000</span>
                </div>
              </section>

              <section className="mc-panel mc-telemetry" aria-labelledby="mc-telemetry-heading">
                <div className="mc-panel-header">
                  <div>
                    <p className="mc-eyebrow">02 / TELEMETRY</p>
                    <h2 id="mc-telemetry-heading">System channels</h2>
                  </div>
                  <span className="mc-tag">DEMO</span>
                </div>
                <div className="mc-channel-list">
                  {channels.map((channel) => (
                    <div className="mc-channel" key={channel.label}>
                      <span>{channel.label}</span>
                      <strong className={channel.status === "nominal" ? "mc-ok" : ""}>{channel.value}</strong>
                    </div>
                  ))}
                </div>
                <div className="mc-telemetry-note">
                  <ShieldCheck size={18} aria-hidden="true" />
                  <p>표시된 값은 디자인 확인을 위한 샘플이야. 실제 센서나 서버 상태를 나타내지 않아.</p>
                </div>
              </section>
            </div>

            <div className="mc-bottom-grid">
              <section className="mc-panel" aria-labelledby="mc-type-heading">
                <div className="mc-panel-header">
                  <div>
                    <p className="mc-eyebrow">03 / TYPOGRAPHY</p>
                    <h2 id="mc-type-heading">Font specimens</h2>
                  </div>
                </div>
                <div className="mc-font-specimens">
                  <div><span>DISPLAY / SPACE GROTESK</span><strong className="mc-font-display">Drawing Verse 01</strong></div>
                  <div><span>BODY / SUIT VARIABLE</span><strong className="mc-font-body">너만의 우주를 그리다</strong></div>
                  <div><span>DATA / IBM PLEX MONO</span><strong className="mc-font-data">MISSION STATUS : READY</strong></div>
                </div>
              </section>
              <section className="mc-panel" aria-labelledby="mc-log-heading">
                <div className="mc-panel-header">
                  <div>
                    <p className="mc-eyebrow">04 / ACTIVITY</p>
                    <h2 id="mc-log-heading">Event log</h2>
                  </div>
                </div>
                <div className="mc-activity">
                  {activity.map((event) => (
                    <div className="mc-event" key={event.time}>
                      <time>{event.time}</time>
                      <span>{event.label}</span>
                      <b>{event.type}</b>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <footer className="mc-footer">
              <span>DRAWING VERSE / MISSION CONTROL DESIGN LAB</span>
              <nav aria-label="서비스 바로가기">
                <Link href="/">홈 <ArrowUpRight size={13} aria-hidden="true" /></Link>
                <Link href="/universe">유니버스 <ArrowUpRight size={13} aria-hidden="true" /></Link>
                <Link href="/community">커뮤니티 <ArrowUpRight size={13} aria-hidden="true" /></Link>
              </nav>
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}
