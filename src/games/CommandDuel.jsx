import { useEffect, useRef, useState } from "react"
import { useLatest } from "../hooks/useLatest"
import { useTimers } from "../hooks/useTimers"

const FAKE_COMMANDS = ["DON'T TAP", "WAIT!", "NOT YET", "HOLD", "FREEZE", "NOPE"]

function SplitZone({ idx, state, color, top, title, subtitle, name, onTap }) {
  const stateClass = state === "go" ? "zone-go" : state === "early" ? "zone-early" : state === "won" ? "zone-won" : state === "lost" ? "zone-lost" : "zone-wait"
  const textColor = state === "go" || state === "won" ? "#00e5ff" : state === "early" || state === "lost" ? "#ff4444" : state === "tie" ? "#ffd700" : "rgba(255,255,255,.54)"
  return (
    <div className={`split-zone ${top ? "top" : ""} ${color} ${stateClass}`} onPointerDown={(e) => { e.preventDefault(); onTap(idx) }}>
      <div className="command-text" style={{ color: textColor }}>{title}</div>
      <div className="command-sub">{subtitle}</div>
      <div className="bang" style={{ fontSize: 18, color: "rgba(255,255,255,.42)" }}>{name}</div>
    </div>
  )
}

export default function CommandDuel({ players, onResult, fakeout = false }) {
  const [command, setCommand] = useState({ text: fakeout ? "GET READY" : "WAIT...", kind: "wait" })
  const [zones, setZones] = useState(["wait", "wait"])
  const [step, setStep] = useState(0)
  const doneRef = useRef(false)
  const commandRef = useRef("wait")
  const onResultRef = useLatest(onResult)
  const { addTimeout, clearAll } = useTimers()

  useEffect(() => {
    let delay = 1500
    if (fakeout) {
      const fakeCount = 2 + Math.floor(Math.random() * 4)
      delay = 800
      for (let i = 0; i < fakeCount; i += 1) {
        addTimeout(() => {
          if (doneRef.current) return
          commandRef.current = "fake"
          setCommand({ text: FAKE_COMMANDS[Math.floor(Math.random() * FAKE_COMMANDS.length)], kind: "fake" })
          setStep((value) => value + 1)
        }, delay)
        delay += 850 + Math.random() * 450
      }
    } else {
      delay += Math.random() * 2500
    }

    addTimeout(() => {
      if (doneRef.current) return
      commandRef.current = "go"
      setCommand({ text: "TAP NOW!", kind: "go" })
      setZones(["go", "go"])
      addTimeout(() => {
        if (doneRef.current) return
        doneRef.current = true
        setZones(["tie", "tie"])
        addTimeout(() => onResultRef.current(null), 950)
      }, fakeout ? 2600 : 4000)
    }, delay)
  }, [addTimeout, fakeout, onResultRef])

  const tap = (idx) => {
    if (doneRef.current) return
    clearAll()
    doneRef.current = true
    if (commandRef.current === "go") {
      const loser = 1 - idx
      setZones((old) => old.map((_, i) => (i === idx ? "won" : "lost")))
      addTimeout(() => onResultRef.current(loser), 900)
    } else {
      setZones((old) => old.map((_, i) => (i === idx ? "early" : "won")))
      addTimeout(() => onResultRef.current(idx), 1100)
    }
  }

  const status = (idx) => {
    if (zones[idx] === "won") return ["YOU WIN!", ""]
    if (zones[idx] === "lost") return ["YOU LOSE!", ""]
    if (zones[idx] === "tie") return ["NO TAP!", "Replay point"]
    if (zones[idx] === "early") return [fakeout ? "FAKEOUT!" : "TOO EARLY!", "Tapped too soon"]
    if (fakeout) return [players[idx].name, ""]
    if (command.kind === "go") return ["TAP NOW!", "GO GO GO!"]
    return ["WAIT...", "Don't tap yet!"]
  }

  return (
    <div className="split-outer">
      {fakeout && (
        <div className="cd-overlay" style={{ pointerEvents: "none", background: "rgba(8,8,26,.15)", zIndex: 2 }}>
          <div key={`${command.text}-${step}`} className="cd-num" style={{ fontSize: command.kind === "go" ? 96 : 58, color: command.kind === "go" ? "#00ff44" : command.kind === "fake" ? "#ff2d6e" : "#ffd700" }}>{command.text}</div>
          <div className="bang" style={{ fontSize: 18, color: "rgba(255,255,255,.58)" }}>{command.kind === "go" ? "Real command — tap fast!" : command.kind === "fake" ? "Trap command — don't tap" : "Watch the command"}</div>
        </div>
      )}
      {[0, 1].map((idx) => {
        const [title, sub] = status(idx)
        return <SplitZone key={idx} idx={idx} state={zones[idx]} color={idx === 0 ? "pink" : "cyan"} top={idx === 0} title={title} subtitle={sub} name={fakeout ? "" : players[idx].name} onTap={tap} />
      })}
    </div>
  )
}
