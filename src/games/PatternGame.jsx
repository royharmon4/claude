import { useEffect, useRef, useState } from "react"
import PassTo from "../components/PassTo"
import { useTimers } from "../hooks/useTimers"
import { chooseLoser } from "../utils/random"

const KEYS = ["r", "b", "g", "y"]
const ICON = { r: "🔴", b: "🔵", g: "🟢", y: "🟡" }

export default function PatternGame({ players, onResult }) {
  const [seq] = useState(() => Array.from({ length: 5 }, () => KEYS[Math.floor(Math.random() * 4)]))
  const [phase, setPhase] = useState("show0")
  const [lit, setLit] = useState(null)
  const [entered, setEntered] = useState([])
  const [scores, setScores] = useState([null, null])
  const input = useRef([])
  const { addTimeout, clearAll } = useTimers()

  useEffect(() => {
    if (phase !== "show0" && phase !== "show1") return
    clearAll()
    input.current = []
    setEntered([])
    setLit(null)
    let delay = 500
    seq.forEach((key) => {
      addTimeout(() => setLit(key), delay)
      delay += 650
      addTimeout(() => setLit(null), delay)
      delay += 250
    })
    addTimeout(() => setPhase(phase === "show0" ? "play0" : "play1"), delay + 150)
  }, [phase])

  const finish = (player, score) => {
    setScores((old) => {
      const next = [...old]
      next[player] = score
      return next
    })
    addTimeout(() => setPhase(player === 0 ? "handoff" : "done"), 700)
  }

  const press = (key) => {
    if (phase !== "play0" && phase !== "play1") return
    const player = phase === "play0" ? 0 : 1
    const idx = input.current.length
    const next = [...input.current, key]
    input.current = next
    setEntered(next)
    if (key !== seq[idx]) finish(player, idx)
    else if (next.length === seq.length) finish(player, seq.length)
  }

  useEffect(() => {
    if (phase !== "done") return
    if (scores[0] == null || scores[1] == null) return
    addTimeout(() => onResult(chooseLoser(scores[0], scores[1])), 1000)
  }, [phase, scores])

  if (phase === "handoff") return <PassTo name={players[1].name} color="#00e5ff" info={`${players[0].name}: ${scores[0]}/${seq.length}. Same pattern.`} onReady={() => setPhase("show1")} />
  if (phase === "done") return <div className="mini-outer"><div className="bang t-gold" style={{ fontSize: 40 }}>RESULTS!</div><div className="bang" style={{ fontSize: 24 }}><span className="t-pink">{players[0].name}: {scores[0]}/{seq.length}</span><br /><span className="t-cyan">{players[1].name}: {scores[1]}/{seq.length}</span></div><div className="command-sub">Pattern: {seq.map((x) => ICON[x]).join(" ")}</div></div>

  const player = phase.endsWith("0") ? 0 : 1
  const show = phase.startsWith("show")
  return <div className="mp-outer"><div className="mp-status" style={{ color: player === 0 ? "#ff2d6e" : "#00e5ff" }}>{show ? `${players[player].name}: watch` : `${players[player].name}: repeat`}</div>{!show && <div className="mp-progress">{entered.map((x) => ICON[x]).join(" ")} <span style={{ color: "rgba(255,255,255,.28)" }}>{"·".repeat(Math.max(0, seq.length - entered.length))}</span></div>}<div className="grid-2x2">{KEYS.map((key) => <div key={key} className={`mp-cell ${key}${show ? "" : " on"}${lit === key ? " lit" : ""}`} onPointerDown={(e) => { e.preventDefault(); press(key) }} />)}</div></div>
}
