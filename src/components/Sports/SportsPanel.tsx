"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Match, SportsConfig, Team } from "@/lib/sports/types";
import { isStale, matchesScope, progress, selectMatch, statusLabels } from "@/lib/sports/model";
import { safeAsset } from "@/lib/sports/config";
import { useSportsFeed } from "./useSportsFeed";
import styles from "./sports.module.css";

export function TeamLogo({ team }: { team: Team }) {
  const [broken, setBroken] = useState<string | undefined>();
  const src = safeAsset(team.logo);
  return src && broken !== src ? <img className={styles.logo} src={src} alt="" onError={() => setBroken(src)} /> : <span className={styles.logoFallback} style={{ borderColor: team.color }}>{team.name.slice(0, 2)}</span>;
}
const startTime = (value: string) => new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value));

export default function SportsPanel({ config, matchId, initialDemo = false }: { config: SportsConfig; matchId?: string; initialDemo?: boolean }) {
  const [demo, setDemo] = useState(initialDemo);
  const { feed, error, now, retry } = useSportsFeed(demo);
  const match = matchId ? feed?.matches.find(m => m.id === matchId && matchesScope(m, config)) : selectMatch(feed?.matches ?? [], config, now);
  const stale = !!match && (error || isStale(match, now));
  const href = match ? `/universe/${encodeURIComponent(config.slug)}/live/${encodeURIComponent(match.id)}?sport=${config.sport ?? ""}${demo ? "&demo=1" : ""}` : "";
  const details = !!matchId;
  return <section className={styles.panel} style={{ "--sports-accent": config.color } as CSSProperties} aria-label={details ? "경기 문자 중계" : "유니버스 경기 정보"}>
    <div className={styles.heading}><div><span className={styles.eyebrow}>MATCH CENTER</span><h2>{details ? "경기 중계" : "오늘의 경기"}</h2></div><div className={styles.controls}>
      {demo && <span className={styles.demo}>예시 · 실제 경기 아님</span>}
      {!details && <button onClick={() => setDemo(v => !v)}>{demo ? "실제 경기로 돌아가기" : "예시 경기 보기"}</button>}
    </div></div>
    {error && <div role="status" className={styles.notice}>연결이 끊겼어요. {match ? "마지막으로 받은 기록을 표시합니다." : "경기 정보를 가져오지 못했어요."} <button onClick={retry}>다시 시도</button></div>}
    {!feed && !error && <p className={styles.empty} role="status">경기 정보를 불러오는 중…</p>}
    {feed?.mode === "unconfigured" && <p className={styles.empty}>경기 중계 연결을 준비 중이에요. 연결되면 경기와 다음 일정이 표시됩니다.</p>}
    {feed && feed.mode !== "unconfigured" && !match && <p className={styles.empty}>{details ? "이 경기의 기록이 없거나 이 유니버스에 해당하지 않아요." : "진행 중인 경기와 등록된 다음 일정이 없어요."}</p>}
    {match && <>
      <div className={styles.meta}><span>{match.league}</span><span className={stale ? styles.warning : styles.status}>{demo ? "예시 화면" : stale ? "업데이트 지연" : statusLabels[match.status]}</span></div>
      {details ? <Score match={match} /> : <Link className={styles.scoreLink} href={href} aria-label={`${match.home.name} 대 ${match.away.name} 경기 중계 보기`}><Score match={match} /><span className={styles.open}>경기 상황 보기 →</span></Link>}
      <div className={styles.schedule}>{startTime(match.startsAt)} (한국 시간){match.venue ? ` · ${match.venue}` : ""}</div>
      {match.status !== "scheduled" && <SportState match={match} detailed={details} />}
      {details && <EventFeed match={match} />}
      <p className={styles.updated}>{demo ? "화면 확인용 고정 예시입니다." : `마지막 기록 ${new Date(match.updatedAt).toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul" })} · 한국 시간 · 10초마다 확인`}</p>
    </>}
  </section>;
}

function Score({ match }: { match: Match }) {
  const marker = `${match.id}:${match.score.join(":")}`;
  const previous = useRef(marker);
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    if (previous.current === marker) return;
    const sameMatch = previous.current.startsWith(`${match.id}:`);
    previous.current = marker;
    if (!sameMatch) return;
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 550);
    return () => clearTimeout(timer);
  }, [marker, match.id]);
  return <div className={styles.score}>
    <div className={styles.team}><TeamLogo team={match.home}/><strong>{match.home.name}</strong><small>홈</small></div>
    <div className={styles.scoreCenter}><span className={styles.period}>{progress(match)}</span><strong className={animate ? styles.scoreChanged : ""} aria-live="polite" aria-atomic="true">{match.status === "scheduled" ? "VS" : `${match.score[0]} : ${match.score[1]}`}</strong>{match.state?.kind === "volleyball" && <span>세트 {match.state.sets[0]} : {match.state.sets[1]}</span>}</div>
    <div className={styles.team}><TeamLogo team={match.away}/><strong>{match.away.name}</strong><small>원정</small></div>
  </div>;
}
function Stat({ label, children }: { label: string; children: ReactNode }) { return <div className={styles.stat}><span>{label}</span><strong>{children}</strong></div>; }
function List({ title, items }: { title: string; items: string[] }) { return <div className={styles.list}><h3>{title}</h3>{items.length ? <ul>{items.map((s,i) => <li key={i}>{s}</li>)}</ul> : <p>기록 없음</p>}</div>; }
function Count({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return <div className={styles.count} aria-label={`${label} ${value}`}><strong>{label}</strong><span aria-hidden="true">{Array.from({ length: max }, (_, i) => <i key={i} style={{ background: i < value ? color : undefined }}/>)}</span><b>{value}</b></div>;
}
export function SportState({ match, detailed }: { match: Match; detailed: boolean }) {
  const state = match.state;
  if (!state) return <p className={styles.empty}>상세 경기 기록을 기다리고 있어요.</p>;
  switch(state.kind) {
    case "baseball": return <div className={styles.baseball}>
      <div className={styles.diamondWrap}><svg viewBox="0 0 160 130" className={styles.diamond} role="img" aria-label={`주자: ${state.bases.map((on,i) => on ? `${i+1}루` : "").filter(Boolean).join(", ") || "없음"}`}>
        <path d="M80 18 L133 65 L80 113 L27 65 Z" fill="none" stroke="currentColor" strokeWidth="2" opacity=".25"/>
        {[[133,65],[80,18],[27,65]].map(([x,y],i) => <rect key={i} x={x-8} y={y-8} width="16" height="16" transform={`rotate(45 ${x} ${y})`} fill={state.bases[i] ? "var(--sports-accent)" : "currentColor"} opacity={state.bases[i] ? 1 : .2}/>)}
        <path d="M73 108 H87 V115 L80 122 L73 115 Z" fill="currentColor"/>
        <text x="147" y="91">1루</text><text x="68" y="49">2루</text><text x="1" y="91">3루</text>
      </svg><span>{state.bases.some(Boolean) ? state.bases.map((on,i) => on ? `${i+1}루` : "").filter(Boolean).join(" · ") : "주자 없음"}</span></div>
      <div className={styles.counts}><Count label="B" value={state.balls} max={3} color="#16a34a"/><Count label="S" value={state.strikes} max={2} color="#ca8a04"/><Count label="O" value={state.outs} max={3} color="#dc2626"/></div>
      {detailed && <div className={styles.players}><Stat label="현재 투수">{state.pitcher || "정보 대기"}</Stat><Stat label="현재 타자">{state.batter || "정보 대기"}</Stat><Stat label="최근 타석 결과">{state.lastAtBat || "정보 대기"}</Stat></div>}
    </div>;
    case "football": return <div className={styles.stats}><Stat label="경기 시간">{state.clock}</Stat>{detailed && <><List title="득점자" items={state.scorers}/><List title="경고 · 퇴장" items={state.cards}/><List title="선수 교체" items={state.substitutions}/></>}</div>;
    case "basketball": return <div className={styles.stats}><Stat label="쿼터">{state.quarter}</Stat><Stat label="남은 시간">{state.remaining}</Stat><Stat label={`${match.home.name} 팀 파울`}>{state.fouls[0]}</Stat><Stat label={`${match.away.name} 팀 파울`}>{state.fouls[1]}</Stat></div>;
    case "volleyball": return <div className={styles.stats}><Stat label="현재 세트">{state.set}세트</Stat><Stat label="세트 스코어">{state.sets.join(" : ")}</Stat><Stat label="현재 세트 점수">{match.score.join(" : ")}</Stat><Stat label="서브권">{state.serving ? match[state.serving].name : "정보 대기"}</Stat></div>;
    case "other": return <div className={styles.stats}><Stat label="진행 상황">{state.period}</Stat>{state.details.map((d,i) => <Stat key={i} label={d.label}>{d.value}</Stat>)}</div>;
  }
}
function EventFeed({ match }: { match: Match }) {
  const latest = match.events[0];
  const previous = useRef(latest?.id);
  const [highlight, setHighlight] = useState<string>();
  useEffect(() => {
    const changed = previous.current !== latest?.id;
    previous.current = latest?.id;
    if (!changed || !latest?.major) return;
    setHighlight(latest.id);
    const timer = setTimeout(() => setHighlight(undefined), 600);
    return () => clearTimeout(timer);
  }, [latest?.id, latest?.major]);
  return <section className={styles.events}><h3>최근 플레이</h3><p className={styles.latest} aria-live="polite" aria-atomic="true">{latest ? `${latest.label} · ${latest.text}` : "아직 기록된 플레이가 없어요."}</p><ol>{match.events.map(event => <li key={event.id} className={highlight === event.id ? styles.eventChanged : ""}><span>{event.label}</span><p>{event.major && <b className={styles.major}>주요 장면 </b>}{event.text}</p></li>)}</ol></section>;
}
