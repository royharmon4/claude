import { useState } from "react"
import PassTo from "../components/PassTo"
import { useTimers } from "../hooks/useTimers"
import { RED_SUITS, cardText, dealHigherLower } from "../utils/cards"
import { sfx } from "../utils/sound"

const COLORS = ["#ff2d6e", "#00e5ff"]
const TONE = ["t-pink", "t-cyan"]

function CardFace({ card, hidden }) {
  return (
    <div className={`reveal-card${hidden ? "" : " card-flip"}`} style={{ minWidth: 150 }}>
      <div className="emoji">🃏</div>
      <div className="bang" style={{ fontSize: 70, color: hidden ? "rgba(255,255,255,.3)" : RED_SUITS.has(card.suit) ? "#ff2d6e" : "#fff" }}>{hidden ? "?" : cardText(card)}</div>
    </div>
  )
}

export default function HigherLower({ players, onResult, pointIndex = 0 }) {
  // Roles alternate every point so both players get to guess.
  const drawer = pointIndex % 2
  const guesser = 1 - drawer
  const [phase, setPhase] = useState("reveal")
  const [deal, setDeal] = useState(() => dealHigherLower())
  const [guess, setGuess] = useState(null)
  const { addTimeout } = useTimers()

  const reset = () => {
    setDeal(dealHigherLower())
    setGuess(null)
    setPhase("reveal")
  }

  const choose = (choice) => {
    setGuess(choice)
    if (deal.second.rank === deal.first.rank) {
      sfx.tick()
      setPhase("push")
      addTimeout(reset, 1800)
      return
    }
    const correct = choice === "higher" ? deal.second.rank > deal.first.rank : deal.second.rank < deal.first.rank
    if (correct) sfx.good()
    else sfx.bad()
    setPhase("result")
    addTimeout(() => onResult(correct ? drawer : guesser), 1700)
  }

  if (phase === "reveal") {
    return (
      <div className="mini-outer">
        <div className={`bang ${TONE[drawer]}`} style={{ fontSize: 34 }}>{players[drawer].name}'S CARD</div>
        <CardFace card={deal.first} />
        <div className="command-sub">Drawn from a real 52-card deck. {players[guesser].name} guesses next.</div>
        <button className="btn btn-cyan" onClick={() => setPhase("handoff")}>PASS PHONE →</button>
      </div>
    )
  }

  if (phase === "handoff") {
    return <PassTo name={players[guesser].name} color={COLORS[guesser]} info={`${players[drawer].name}'s card is ${cardText(deal.first)}. Guess higher or lower.`} onReady={() => setPhase("guess")} />
  }

  if (phase === "guess") {
    return (
      <div className="mini-outer">
        <div className={`bang ${TONE[guesser]}`} style={{ fontSize: 34 }}>{players[guesser].name}</div>
        <div className="command-sub">Will the next card be higher or lower than {cardText(deal.first)}?</div>
        <div className="choice-grid">
          <button className="choice-btn" onClick={() => choose("higher")}><span className="choice-emoji">⬆️</span><span>Higher</span></button>
          <button className="choice-btn" onClick={() => choose("lower")}><span className="choice-emoji">⬇️</span><span>Lower</span></button>
        </div>
      </div>
    )
  }

  if (phase === "push") {
    return <div className="mini-outer"><div className="bang t-gold" style={{ fontSize: 42 }}>PUSH!</div><div className="reveal-row"><CardFace card={deal.first} /><CardFace card={deal.second} /></div><div className="command-sub">Same rank. No point. New cards coming...</div></div>
  }

  const correct = guess === "higher" ? deal.second.rank > deal.first.rank : deal.second.rank < deal.first.rank
  const winnerIdx = correct ? guesser : drawer
  return (
    <div className="mini-outer">
      <div className={`bang ${TONE[winnerIdx]}`} style={{ fontSize: 40 }}>{players[winnerIdx].name} WINS!</div>
      <div className="reveal-row"><CardFace card={deal.first} /><CardFace card={deal.second} /></div>
      <div className="command-sub">{players[guesser].name} guessed {guess}. {correct ? "Correct!" : "Wrong!"}</div>
    </div>
  )
}
