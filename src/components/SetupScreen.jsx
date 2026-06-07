import { useMemo, useState } from "react"
import { LS_NAMES } from "../constants"
import { readStorage } from "../utils/storage"

export default function SetupScreen({ history, onStart }) {
  const savedNames = useMemo(() => readStorage(LS_NAMES, []), [])
  const [names, setNames] = useState([savedNames[0] || "", savedNames[1] || ""])

  const go = () => {
    onStart(names[0].trim().slice(0, 16) || "Player 1", names[1].trim().slice(0, 16) || "Player 2")
  }

  return (
    <div className="screen" style={{ justifyContent: "center" }}>
      <div>
        <div className="setup-logo glow-pink t-pink">STRIKE</div>
        <div className="setup-logo glow-cyan t-cyan" style={{ fontSize: 30 }}>ZONE</div>
        <div className="setup-sub" style={{ marginTop: 6 }}>2 players · 1 phone · best 2 of 3</div>
      </div>

      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[0, 1].map((idx) => (
          <label key={idx} className="field">
            <span className="inp-label">{idx === 0 ? "🔴" : "🔵"} Player {idx + 1}</span>
            <input
              className="inp"
              value={names[idx]}
              placeholder="Enter name"
              onChange={(e) => setNames(idx === 0 ? [e.target.value, names[1]] : [names[0], e.target.value])}
              maxLength={16}
            />
          </label>
        ))}
      </div>

      <button className="btn btn-go" onClick={go} style={{ fontSize: 36 }}>LET'S GO! 🎮</button>

      {history.length > 0 && (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="bang" style={{ fontSize: 16, color: "rgba(255,255,255,.45)", textAlign: "center" }}>RECENT MATCHES</div>
          {history.slice(0, 3).map((h) => (
            <div key={`${h.date}-${h.winner}-${h.loser}`} style={{ fontSize: 14, color: "rgba(255,255,255,.48)", textAlign: "center" }}>
              🏆 {h.winner} beat {h.loser} · {h.date}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
