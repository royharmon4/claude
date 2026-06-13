import { useState } from "react"
import PassTo from "../components/PassTo"
import { useTimers } from "../hooks/useTimers"
import { sfx, buzz } from "../utils/sound"

const MOVES = [
  { id: "a", name: "Rock", icon: "✊", beats: "c" },
  { id: "b", name: "Paper", icon: "✋", beats: "a" },
  { id: "c", name: "Scissors", icon: "✌️", beats: "b" },
]

const SHOOT_WORDS = ["ROCK", "PAPER", "SCISSORS", "SHOOT!"]

export default function Rps({ players, onResult }) {
  const [phase, setPhase] = useState("p0")
  const [choices, setChoices] = useState([null, null])
  const [message, setMessage] = useState("Pick secretly. No peeking.")
  const [shootStep, setShootStep] = useState(0)
  const { addTimeout } = useTimers()

  const resolve = (next) => {
    const [p0, p1] = next
    if (p0.id === p1.id) {
      sfx.tick()
      setMessage("Tie! Replay this point.")
      setPhase("tie")
      addTimeout(() => {
        setChoices([null, null])
        setMessage("Pick secretly. No peeking.")
        setPhase("p0")
      }, 1700)
      return
    }
    const loser = p0.beats === p1.id ? 1 : 0
    sfx.good()
    buzz([30, 40, 30])
    setMessage(`${players[1 - loser].name} wins the point!`)
    setPhase("reveal")
    addTimeout(() => onResult(loser), 1700)
  }

  const startShoot = (next) => {
    setPhase("shoot")
    setShootStep(0)
    SHOOT_WORDS.forEach((_, i) => {
      addTimeout(() => {
        setShootStep(i)
        sfx.tick()
        if (i === SHOOT_WORDS.length - 1) addTimeout(() => resolve(next), 450)
      }, i * 480)
    })
  }

  const pick = (player, choice) => {
    const next = [...choices]
    next[player] = choice
    setChoices(next)
    sfx.tap()

    if (player === 0) {
      setMessage(`${players[0].name} locked in. Pass the phone.`)
      setPhase("handoff")
      return
    }

    startShoot(next)
  }

  if (phase === "handoff") return <PassTo name={players[1].name} color="#00e5ff" info={`${players[0].name} picked. Choose your move without looking back.`} onReady={() => setPhase("p1")} />

  if (phase === "shoot") {
    return (
      <div className="mini-outer">
        <div key={shootStep} className="bang t-gold cd-num" style={{ fontSize: shootStep === 3 ? 84 : 56 }}>{SHOOT_WORDS[shootStep]}</div>
        <div className="reveal-row">{[0, 1].map((idx) => <div key={idx} className="reveal-card"><div className="emoji">❔</div><div className={`name ${idx === 0 ? "t-pink" : "t-cyan"}`}>{players[idx].name}</div></div>)}</div>
      </div>
    )
  }

  if (phase === "reveal" || phase === "tie") {
    return <div className="mini-outer"><div className="bang t-gold" style={{ fontSize: 34 }}>{message}</div><div className="reveal-row">{[0, 1].map((idx) => <div key={idx} className="reveal-card card-flip"><div className="emoji" aria-label={choices[idx]?.name}>{choices[idx]?.icon ?? "❔"}</div><div className={`name ${idx === 0 ? "t-pink" : "t-cyan"}`}>{players[idx].name}</div><div className="command-sub">{choices[idx]?.name}</div></div>)}</div></div>
  }

  const player = phase === "p0" ? 0 : 1
  return <div className="mini-outer"><div className="bang" style={{ fontSize: 34, color: player === 0 ? "#ff2d6e" : "#00e5ff" }}>{players[player].name}</div><div className="command-sub">{message}</div><div className="choice-grid">{MOVES.map((choice) => <button key={choice.id} className="choice-btn" aria-label={choice.name} title={choice.name} onClick={() => pick(player, choice)}><span className="choice-emoji" aria-hidden="true">{choice.icon}</span><span>{choice.name}</span></button>)}</div></div>
}
