import { useEffect, useRef, useState } from "react"
import { useLatest } from "../hooks/useLatest"
import { useTimers } from "../hooks/useTimers"
import { chooseLoser } from "../utils/random"

function TapSide({ idx, top, color, value, name, onTap }) {
  return (
    <div className={`split-zone ${top ? "top" : ""} ${color}`} onPointerDown={(e) => { e.preventDefault(); onTap(idx) }}>
      <div className={`big-count ${idx === 0 ? "t-pink" : "t-cyan"}`}>{value}</div>
      <div className={`player-label ${idx === 0 ? "t-pink" : "t-cyan"}`}>{name}</div>
    </div>
  )
}

export default function TapRace({ players, onResult }) {
  const [countdown, setCountdown] = useState(3)
  const [counts, setCounts] = useState([0, 0])
  const [timeLeft, setTimeLeft] = useState(7)
  const [done, setDone] = useState(false)
  const countsRef = useRef([0, 0])
  const doneRef = useRef(false)
  const onResultRef = useLatest(onResult)
  const { addTimeout, addInterval } = useTimers()

  useEffect(() => {
    addTimeout(() => setCountdown(2), 900)
    addTimeout(() => setCountdown(1), 1800)
    addTimeout(() => setCountdown(0), 2700)
    addTimeout(() => {
      setCountdown(-1)
      let remaining = 7
      const id = addInterval(() => {
        remaining -= 1
        setTimeLeft(remaining)
        if (remaining <= 0 && !doneRef.current) {
          window.clearInterval(id)
          doneRef.current = true
          setDone(true)
          addTimeout(() => onResultRef.current(chooseLoser(countsRef.current[0], countsRef.current[1])), 1200)
        }
      }, 1000)
    }, 3300)
  }, [addInterval, addTimeout, onResultRef])

  const tap = (idx) => {
    if (countdown !== -1 || doneRef.current) return
    const next = [...countsRef.current]
    next[idx] += 1
    countsRef.current = next
    setCounts(next)
  }

  return (
    <div className="split-outer">
      {countdown >= 0 && <div className="cd-overlay"><div key={countdown} className="cd-num" style={{ color: countdown === 0 ? "#00e5ff" : countdown === 1 ? "#ff2d6e" : "#ffd700" }}>{countdown === 0 ? "GO!" : countdown}</div></div>}
      <TapSide idx={0} top color="pink" value={counts[0]} name={players[0].name} onTap={tap} />
      <div className="split-mid"><div className="bang" style={{ fontSize: 26, color: timeLeft <= 3 ? "#ff2d6e" : "#fff" }}>{countdown === -1 && !done ? `${timeLeft}s` : done ? "TIME!" : ""}</div></div>
      <TapSide idx={1} color="cyan" value={counts[1]} name={players[1].name} onTap={tap} />
      {done && <div className="cd-overlay"><div className="bang glow-gold t-gold" style={{ fontSize: 64 }}>TIME!</div><div className="bang" style={{ fontSize: 24, color: "rgba(255,255,255,.72)", marginTop: 8 }}>{players[0].name} {counts[0]} vs {counts[1]} {players[1].name}</div></div>}
    </div>
  )
}
