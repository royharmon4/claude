import { useMemo } from "react"

const CONFETTI_COLORS = ["#ff2d6e", "#00e5ff", "#ffd700", "#ff6600", "#cc00ff", "#00ff88"]

export default function FinalScreen({ players, history, onRestart }) {
  const winner = players.find((p) => p.strikes < 3)
  const loser = players.find((p) => p.strikes >= 3)
  const confetti = useMemo(() => Array.from({ length: 64 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    dur: 2.2 + Math.random() * 2.8,
    delay: Math.random() * 2.5,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    w: 7 + Math.random() * 9,
    h: 7 + Math.random() * 9,
    rot: Math.random() * 360,
  })), [])

  return (
    <div className="final-screen">
      <div className="confetti">
        {confetti.map((p) => (
          <div key={p.id} className="cp" style={{ left: `${p.left}%`, background: p.color, width: `${p.w}px`, height: `${p.h}px`, transform: `rotate(${p.rot}deg)`, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }} />
        ))}
      </div>
      <div className="fs-crown">👑</div>
      <div className="fs-wins bang">CHAMPION!</div>
      <div className="fs-winner glow-gold t-gold">{winner?.name}</div>
      <div style={{ fontSize: 16, color: "rgba(255,255,255,.48)", letterSpacing: 1 }}>{loser?.name} got 3 strikes and is out.</div>
      {history.length > 0 && (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", maxWidth: 320, marginTop: 8 }}>
          <div className="bang" style={{ fontSize: 16, color: "rgba(255,255,255,.45)", textAlign: "center" }}>MATCH HISTORY</div>
          {history.slice(0, 4).map((h) => <div key={`${h.date}-${h.winner}-${h.loser}`} className="fs-hist">🏆 {h.winner} beat {h.loser} · {h.date}</div>)}
        </div>
      )}
      <button className="btn btn-go" onClick={onRestart} style={{ marginTop: 12, fontSize: 26 }}>PLAY AGAIN! 🎮</button>
    </div>
  )
}
