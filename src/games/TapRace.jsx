import { useEffect, useRef, useState } from "react"
import { useLatest } from "../hooks/useLatest"
import { useTimers } from "../hooks/useTimers"
import { chooseLoser } from "../utils/random"
import { sfx, buzz } from "../utils/sound"

const RACE_SECONDS = 7

function TapSide({ idx, top, color, value, name, pulse, onTap }) {
  return (
    <div className={`split-zone ${top ? "top" : ""} ${color}`} onPointerDown={(e) => { e.preventDefault(); onTap(idx) }}>
      <div key={pulse} className={`big-count tap-pulse ${idx === 0 ? "t-pink" : "t-cyan"}`}>{value}</div>
      <div className={`player-label ${idx === 0 ? "t-pink" : "t-cyan"}`}>{name}</div>
    </div>
  )
}

export default function TapRace({ players, onResult }) {
  const [countdown, setCountdown] = useState(3)
  const [counts, setCounts] = useState([0, 0])
  const [timeLeft, setTimeLeft] = useState(RACE_SECONDS)
  const [done, setDone] = useState(false)
  const countsRef = useRef([0, 0])
  const doneRef = useRef(false)
  const onResultRef = useLatest(onResult)
  const { addTimeout, addInterval } = useTimers()

  useEffect(() => {
    addTimeout(() => { setCountdown(2); sfx.tick() }, 900)
    addTimeout(() => { setCountdown(1); sfx.tick() }, 1800)
    addTimeout(() => { setCountdown(0); sfx.go() }, 2700)
    addTimeout(() => {
      setCountdown(-1)
      let remaining = RACE_SECONDS
      const id = addInterval(() => {
        remaining -= 1
        setTimeLeft(remaining)
        if (remaining > 0 && remaining <= 3) sfx.tick()
        if (remaining <= 0 && !doneRef.current) {
          window.clearInterval(id)
          doneRef.current = true
          setDone(true)
          sfx.good()
          buzz([40, 60, 40])
          addTimeout(() => onResultRef.current(chooseLoser(countsRef.current[0], countsRef.current[1])), 1600)
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
    buzz(8)
  }

  const leader = counts[0] === counts[1] ? null : counts[0] > counts[1] ? 0 : 1

  return (
    <div className="split-outer">
      {countdown >= 0 && <div className="cd-overlay"><div key={countdown} className="cd-num" style={{ color: countdown === 0 ? "#00e5ff" : countdown === 1 ? "#ff2d6e" : "#ffd700" }}>{countdown === 0 ? "GO!" : countdown}</div></div>}
      <TapSide idx={0} top color="pink" value={counts[0]} name={players[0].name} pulse={counts[0]} onTap={tap} />
      <div className="split-mid"><div className="bang" style={{ fontSize: 26, color: timeLeft <= 3 ? "#ff2d6e" : "#fff" }}>{countdown === -1 && !done ? `${timeLeft}s` : done ? "TIME!" : ""}</div></div>
      <TapSide idx={1} color="cyan" value={counts[1]} name={players[1].name} pulse={counts[1]} onTap={tap} />
      {done && (
        <div className="cd-overlay">
          <div className="bang glow-gold t-gold" style={{ fontSize: 64 }}>TIME!</div>
          <div className="bang" style={{ fontSize: 24, color: "rgba(255,255,255,.72)", marginTop: 8 }}>
            <span className="t-pink">{players[0].name} {counts[0]}</span> vs <span className="t-cyan">{counts[1]} {players[1].name}</span>
          </div>
          <div className="bang" style={{ fontSize: 30, marginTop: 10, color: leader == null ? "#ffd700" : leader === 0 ? "#ff2d6e" : "#00e5ff" }}>
            {leader == null ? "DEAD HEAT!" : `${players[leader].name} WINS THE POINT!`}
          </div>
        </div>
      )}
    </div>
  )
}
