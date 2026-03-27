"use client";

import { useState, useEffect } from "react";

// Mock data
const VALIDATORS = [
  { id: "val1", name: "Jito Labs", identity: "Jito", voteCredits: 432120, creditRatio: 0.987, mev: 12.4, skipRate: 0.8, bam: true, stakeRank: 1, salary: 140, trend: [95, 97, 98, 96, 99, 98, 97] },
  { id: "val2", name: "Helius", identity: "Helius", voteCredits: 429800, creditRatio: 0.982, mev: 8.7, skipRate: 1.2, bam: true, stakeRank: 3, salary: 130, trend: [92, 94, 93, 96, 95, 97, 96] },
  { id: "val3", name: "Triton One", identity: "Triton", voteCredits: 428500, creditRatio: 0.979, mev: 9.1, skipRate: 1.5, bam: false, stakeRank: 5, salary: 120, trend: [88, 91, 90, 93, 92, 94, 95] },
  { id: "val4", name: "Laine", identity: "Laine", voteCredits: 431200, creditRatio: 0.985, mev: 7.2, skipRate: 0.9, bam: true, stakeRank: 2, salary: 135, trend: [94, 96, 95, 97, 96, 98, 97] },
  { id: "val5", name: "Overclock", identity: "Overclock", voteCredits: 425100, creditRatio: 0.971, mev: 11.3, skipRate: 2.1, bam: true, stakeRank: 8, salary: 100, trend: [85, 88, 87, 90, 92, 91, 93] },
  { id: "val6", name: "Chorus One", identity: "Chorus", voteCredits: 427300, creditRatio: 0.976, mev: 6.8, skipRate: 1.8, bam: false, stakeRank: 12, salary: 85, trend: [82, 85, 84, 87, 86, 89, 90] },
  { id: "val7", name: "Everstake", identity: "Everstake", voteCredits: 430100, creditRatio: 0.983, mev: 5.4, skipRate: 1.1, bam: false, stakeRank: 4, salary: 125, trend: [90, 92, 91, 94, 93, 95, 94] },
  { id: "val8", name: "Shinobi Systems", identity: "Shinobi", voteCredits: 421800, creditRatio: 0.963, mev: 14.2, skipRate: 3.2, bam: true, stakeRank: 22, salary: 60, trend: [78, 82, 80, 86, 84, 88, 91] },
  { id: "val9", name: "Staking Facilities", identity: "StakeFac", voteCredits: 426700, creditRatio: 0.975, mev: 4.9, skipRate: 1.6, bam: false, stakeRank: 15, salary: 75, trend: [80, 83, 82, 85, 87, 88, 89] },
  { id: "val10", name: "P2P Validator", identity: "P2P", voteCredits: 424300, creditRatio: 0.969, mev: 6.1, skipRate: 2.4, bam: false, stakeRank: 18, salary: 70, trend: [76, 79, 81, 83, 85, 86, 87] },
  { id: "val11", name: "Figment", identity: "Figment", voteCredits: 429100, creditRatio: 0.980, mev: 7.8, skipRate: 1.3, bam: true, stakeRank: 6, salary: 115, trend: [89, 91, 93, 92, 94, 95, 96] },
  { id: "val12", name: "Galaxy", identity: "Galaxy", voteCredits: 423600, creditRatio: 0.967, mev: 13.1, skipRate: 2.8, bam: true, stakeRank: 25, salary: 55, trend: [74, 78, 80, 83, 85, 87, 90] },
];

type Validator = typeof VALIDATORS[number];

const LEADERBOARD = [
  { rank: 1, name: "sol_maxi.sol", score: 9847, reward: 4.2, roster: ["Jito Labs", "Shinobi Systems", "Overclock", "Galaxy", "Helius"] },
  { rank: 2, name: "defi_degen", score: 9723, reward: 3.8, roster: ["Jito Labs", "Laine", "Overclock", "Figment", "Shinobi Systems"] },
  { rank: 3, name: "validator_watcher", score: 9651, reward: 3.1, roster: ["Helius", "Overclock", "Galaxy", "Shinobi Systems", "Figment"] },
  { rank: 4, name: "stake_hunter", score: 9544, reward: 2.4, roster: ["Laine", "Helius", "Triton One", "Everstake", "Chorus One"] },
  { rank: 5, name: "epoch_surfer", score: 9412, reward: 1.9, roster: ["Jito Labs", "Everstake", "Staking Facilities", "P2P Validator", "Figment"] },
];

const SALARY_CAP = 500;
const ROSTER_SIZE = 5;

function SparkLine({ data, color = "#22d3ee" }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 60, h = 20;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatBadge({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <span style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: accent || "#e2e8f0", fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
    </div>
  );
}

export default function ValidatorLeague() {
  const [tab, setTab] = useState("roster");
  const [roster, setRoster] = useState<Validator[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("mev");
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => { setAnimateIn(true); }, []);

  const salaryCost = roster.reduce((s, v) => s + v.salary, 0);
  const salaryRemaining = SALARY_CAP - salaryCost;

  const toggleValidator = (v: Validator) => {
    if (roster.find((r) => r.id === v.id)) {
      setRoster(roster.filter((r) => r.id !== v.id));
    } else if (roster.length < ROSTER_SIZE) {
      if (salaryCost + v.salary <= SALARY_CAP) {
        setRoster([...roster, v]);
      }
    }
  };

  const filteredValidators = VALIDATORS
    .filter((v) => v.name.toLowerCase().includes(search.toLowerCase()) || v.identity.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "mev") return b.mev - a.mev;
      if (sortBy === "credits") return b.voteCredits - a.voteCredits;
      if (sortBy === "salary") return a.salary - b.salary;
      if (sortBy === "skipRate") return a.skipRate - b.skipRate;
      return 0;
    });

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0a0e17 0%, #0d1321 40%, #111827 100%)",
      color: "#e2e8f0",
      fontFamily: "'Space Grotesk', 'Segoe UI', system-ui, sans-serif",
      padding: "0 0 40px 0",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(34,211,238,0.1); } 50% { box-shadow: 0 0 40px rgba(34,211,238,0.2); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "24px 32px 20px",
        borderBottom: "1px solid rgba(34,211,238,0.1)",
        background: "linear-gradient(180deg, rgba(34,211,238,0.03) 0%, transparent 100%)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "linear-gradient(135deg, #22d3ee, #06b6d4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 800, color: "#0a0e17",
              boxShadow: "0 0 24px rgba(34,211,238,0.3)",
            }}>VL</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>Validator League</div>
              <div style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase" }}>Fantasy staking on Solana</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              padding: "6px 14px", borderRadius: 8,
              background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.2)",
              fontSize: 12, color: "#22d3ee", fontWeight: 600,
            }}>
              <span style={{ animation: "pulse 2s ease-in-out infinite", display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#22d3ee", marginRight: 6 }}></span>
              Season #7 — OPEN
            </div>
            <div style={{
              padding: "6px 14px", borderRadius: 8,
              background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
              fontSize: 12, color: "#a78bfa", fontWeight: 600,
            }}>
              Prize Pool: 42.7 JitoSOL
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 32px 0" }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
          {[
            { key: "roster", label: "Build Roster" },
            { key: "leaderboard", label: "Leaderboard" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 600, fontFamily: "inherit", letterSpacing: "0.02em",
                background: tab === t.key ? "rgba(34,211,238,0.12)" : "transparent",
                color: tab === t.key ? "#22d3ee" : "#64748b",
                transition: "all 0.2s",
              }}
            >{t.label}</button>
          ))}
        </div>

        {tab === "roster" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, animation: "fadeUp 0.4s ease" }}>
            {/* Validator Grid */}
            <div>
              <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
                <input
                  placeholder="Search validators..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    flex: 1, padding: "10px 14px", borderRadius: 8,
                    background: "rgba(30,41,59,0.6)", border: "1px solid #1e293b",
                    color: "#e2e8f0", fontSize: 13, fontFamily: "inherit", outline: "none",
                  }}
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: "10px 14px", borderRadius: 8,
                    background: "rgba(30,41,59,0.6)", border: "1px solid #1e293b",
                    color: "#94a3b8", fontSize: 12, fontFamily: "inherit", cursor: "pointer",
                  }}
                >
                  <option value="mev">Sort: MEV ↓</option>
                  <option value="credits">Sort: Credits ↓</option>
                  <option value="salary">Sort: Salary ↑</option>
                  <option value="skipRate">Sort: Skip Rate ↑</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filteredValidators.map((v, i) => {
                  const selected = !!roster.find((r) => r.id === v.id);
                  const disabled = !selected && (roster.length >= ROSTER_SIZE || salaryCost + v.salary > SALARY_CAP);
                  return (
                    <div
                      key={v.id}
                      onClick={() => !disabled && toggleValidator(v)}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        alignItems: "center",
                        padding: "14px 18px",
                        borderRadius: 12,
                        background: selected
                          ? "rgba(34,211,238,0.06)"
                          : disabled ? "rgba(15,23,42,0.4)" : "rgba(15,23,42,0.7)",
                        border: `1px solid ${selected ? "rgba(34,211,238,0.25)" : "rgba(30,41,59,0.5)"}`,
                        cursor: disabled ? "not-allowed" : "pointer",
                        opacity: disabled ? 0.45 : 1,
                        transition: "all 0.2s",
                        animation: `slideIn ${0.3 + i * 0.05}s ease`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 8,
                          background: selected
                            ? "linear-gradient(135deg, #22d3ee, #06b6d4)"
                            : "linear-gradient(135deg, #1e293b, #334155)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, fontWeight: 700,
                          color: selected ? "#0a0e17" : "#64748b",
                          flexShrink: 0,
                        }}>
                          {v.identity.slice(0, 2).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 600 }}>{v.name}</span>
                            {v.bam && (
                              <span style={{
                                fontSize: 9, padding: "2px 6px", borderRadius: 4,
                                background: "rgba(168,85,247,0.15)", color: "#c084fc",
                                fontWeight: 700, letterSpacing: "0.08em",
                              }}>BAM</span>
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                            Rank #{v.stakeRank} · Salary: {v.salary}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                        <SparkLine data={v.trend} color={selected ? "#22d3ee" : "#475569"} />
                        <StatBadge label="MEV" value={`${v.mev}◎`} accent={v.mev > 10 ? "#34d399" : undefined} />
                        <StatBadge label="Credits" value={(v.voteCredits / 1000).toFixed(1) + "k"} />
                        <StatBadge label="Skip" value={v.skipRate + "%"} accent={v.skipRate > 2 ? "#f87171" : undefined} />
                        <div style={{
                          width: 28, height: 28, borderRadius: 7,
                          background: selected ? "#22d3ee" : "rgba(30,41,59,0.8)",
                          border: `1px solid ${selected ? "#22d3ee" : "#334155"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 14, color: selected ? "#0a0e17" : "#475569",
                          fontWeight: 700, flexShrink: 0,
                          transition: "all 0.2s",
                        }}>
                          {selected ? "✓" : "+"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Roster Panel */}
            <div style={{
              background: "rgba(15,23,42,0.6)",
              border: "1px solid rgba(30,41,59,0.5)",
              borderRadius: 16,
              padding: 20,
              position: "sticky",
              top: 20,
              alignSelf: "start",
              animation: roster.length > 0 ? "glow 3s ease-in-out infinite" : "none",
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Your Roster</div>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 16 }}>
                {roster.length}/{ROSTER_SIZE} validators selected
              </div>

              {/* Salary Cap Bar */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 6 }}>
                  <span>Salary Cap</span>
                  <span style={{ color: salaryRemaining < 60 ? "#f87171" : "#22d3ee", fontFamily: "'JetBrains Mono', monospace" }}>
                    {salaryCost} / {SALARY_CAP}
                  </span>
                </div>
                <div style={{ height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 3,
                    width: `${(salaryCost / SALARY_CAP) * 100}%`,
                    background: salaryRemaining < 60
                      ? "linear-gradient(90deg, #f87171, #ef4444)"
                      : "linear-gradient(90deg, #22d3ee, #06b6d4)",
                    transition: "width 0.3s ease",
                  }} />
                </div>
              </div>

              {/* Roster Slots */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {Array.from({ length: ROSTER_SIZE }).map((_, i) => {
                  const v = roster[i];
                  return (
                    <div
                      key={i}
                      style={{
                        padding: v ? "12px 14px" : "14px",
                        borderRadius: 10,
                        background: v ? "rgba(34,211,238,0.04)" : "rgba(30,41,59,0.3)",
                        border: `1px dashed ${v ? "rgba(34,211,238,0.2)" : "#1e293b"}`,
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        minHeight: 48,
                      }}
                    >
                      {v ? (
                        <>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: 6,
                              background: "linear-gradient(135deg, #22d3ee, #06b6d4)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 10, fontWeight: 700, color: "#0a0e17",
                            }}>{v.identity.slice(0, 2).toUpperCase()}</div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600 }}>{v.name}</div>
                              <div style={{ fontSize: 10, color: "#64748b" }}>Salary: {v.salary}</div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); setRoster(roster.filter((r) => r.id !== v.id)); }}
                            style={{
                              width: 22, height: 22, borderRadius: 6, border: "none",
                              background: "rgba(239,68,68,0.15)", color: "#f87171",
                              cursor: "pointer", fontSize: 12, display: "flex",
                              alignItems: "center", justifyContent: "center",
                            }}
                          >×</button>
                        </>
                      ) : (
                        <span style={{ fontSize: 12, color: "#334155", fontStyle: "italic" }}>
                          Empty slot #{i + 1}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Estimated Score */}
              {roster.length > 0 && (
                <div style={{
                  padding: "12px 14px", borderRadius: 10,
                  background: "rgba(139,92,246,0.06)",
                  border: "1px solid rgba(139,92,246,0.15)",
                  marginBottom: 16,
                }}>
                  <div style={{ fontSize: 10, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                    Est. Composite Score
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#c4b5fd" }}>
                    {Math.round(roster.reduce((s, v) => s + v.creditRatio * 2000 + v.mev * 50 + (100 - v.skipRate * 20) + (v.bam ? 200 : 0), 0))}
                  </div>
                </div>
              )}

              {/* Entry Button */}
              <button
                disabled={roster.length < ROSTER_SIZE}
                style={{
                  width: "100%", padding: "14px", borderRadius: 10, border: "none",
                  background: roster.length >= ROSTER_SIZE
                    ? "linear-gradient(135deg, #22d3ee, #06b6d4)"
                    : "#1e293b",
                  color: roster.length >= ROSTER_SIZE ? "#0a0e17" : "#475569",
                  fontSize: 14, fontWeight: 700, fontFamily: "inherit",
                  cursor: roster.length >= ROSTER_SIZE ? "pointer" : "not-allowed",
                  letterSpacing: "0.02em",
                  transition: "all 0.2s",
                }}
              >
                {roster.length >= ROSTER_SIZE ? "Enter Season — 1 JitoSOL" : `Pick ${ROSTER_SIZE - roster.length} more validator${ROSTER_SIZE - roster.length > 1 ? "s" : ""}`}
              </button>
              <div style={{ fontSize: 10, color: "#475569", textAlign: "center", marginTop: 8 }}>
                Entry fee returned after settlement. You compete for yield.
              </div>
            </div>
          </div>
        )}

        {tab === "leaderboard" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            {/* Season Stats */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12,
              marginBottom: 24,
            }}>
              {[
                { label: "Prize Pool", value: "42.7 JitoSOL", color: "#a78bfa" },
                { label: "Entries", value: "312", color: "#22d3ee" },
                { label: "Epoch", value: "#723", color: "#34d399" },
                { label: "Time Left", value: "14h 23m", color: "#fb923c" },
              ].map((s) => (
                <div key={s.label} style={{
                  padding: "16px 18px", borderRadius: 12,
                  background: "rgba(15,23,42,0.6)", border: "1px solid rgba(30,41,59,0.5)",
                }}>
                  <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Leaderboard Table */}
            <div style={{
              background: "rgba(15,23,42,0.6)", border: "1px solid rgba(30,41,59,0.5)",
              borderRadius: 16, overflow: "hidden",
            }}>
              {/* Header */}
              <div style={{
                display: "grid", gridTemplateColumns: "60px 1fr 200px 100px 100px",
                padding: "12px 20px",
                background: "rgba(30,41,59,0.3)",
                fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600,
              }}>
                <span>Rank</span>
                <span>Player</span>
                <span>Roster</span>
                <span style={{ textAlign: "right" }}>Score</span>
                <span style={{ textAlign: "right" }}>Reward</span>
              </div>

              {LEADERBOARD.map((entry, i) => (
                <div
                  key={entry.rank}
                  style={{
                    display: "grid", gridTemplateColumns: "60px 1fr 200px 100px 100px",
                    padding: "16px 20px",
                    borderTop: "1px solid rgba(30,41,59,0.4)",
                    alignItems: "center",
                    animation: `slideIn ${0.3 + i * 0.08}s ease`,
                    background: i === 0 ? "rgba(34,211,238,0.02)" : "transparent",
                  }}
                >
                  <span style={{
                    fontSize: 16, fontWeight: 800,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: i === 0 ? "#fbbf24" : i === 1 ? "#94a3b8" : i === 2 ? "#d97706" : "#475569",
                  }}>
                    #{entry.rank}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: i === 0 ? "#22d3ee" : "#e2e8f0" }}>
                    {entry.name}
                  </span>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {entry.roster.map((v) => (
                      <span key={v} style={{
                        fontSize: 9, padding: "2px 6px", borderRadius: 4,
                        background: "rgba(30,41,59,0.6)", color: "#94a3b8",
                        whiteSpace: "nowrap",
                      }}>{v}</span>
                    ))}
                  </div>
                  <span style={{
                    textAlign: "right", fontSize: 14, fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace", color: "#c4b5fd",
                  }}>{entry.score.toLocaleString()}</span>
                  <span style={{
                    textAlign: "right", fontSize: 14, fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace", color: "#34d399",
                  }}>{entry.reward} ◎</span>
                </div>
              ))}
            </div>

            {/* Your Position */}
            <div style={{
              marginTop: 16, padding: "16px 20px", borderRadius: 12,
              background: "rgba(34,211,238,0.04)",
              border: "1px solid rgba(34,211,238,0.15)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <span style={{ fontSize: 12, color: "#64748b" }}>Your position: </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#22d3ee" }}>#47 / 312</span>
              </div>
              <div>
                <span style={{ fontSize: 12, color: "#64748b" }}>Est. reward: </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#34d399", fontFamily: "'JetBrains Mono', monospace" }}>1.1 JitoSOL</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
