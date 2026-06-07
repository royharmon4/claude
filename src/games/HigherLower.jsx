import { useState } from "react"
import PassTo from "../components/PassTo"
import { useTimers } from "../hooks/useTimers"
import { RED_SUITS, cardText, dealHigherLower } from "../utils/cards"

function CardFace({ card }) {
  return (
    <div className="reveal-card" style={{ minWidth: 150 }}>
      <div className="emoji">🃏</div>
      <div className="bang" style={{ fontSize: 70, color: RED_SUITS.has(card.suit) ? "#ff2d6e" : "#fff" }}>{cardText(card)}</div>
    </div>
  )
}

export default function HigherLower({ players, onResult }) {
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
      setPhase("push")
      addTimeout(reset, 1800)
      return
    }
    const correct = choice === "higher" ? deal.second.rank > deal.first.rank : deal.second.rank < deal.first.rank
    setPhase("result")
    addTimeout(() => onResult(correct ? 0 : 1), 1700)
  }

  if (phase === "reveal") {
    return (
      <div className="mini-outer">
        <div className="bang t-pink" style={{ fontSize: 34 }}>{players[0].name}'S CARD</div>
        <CardFace card={deal.first} />
        <div className="command-sub">Drawn from a real 52-card deck. Pass the phone.</div>
        <button className="btn btn-cyan" onClick={() => setPhase("handoff")}>PASS PHONE →</button>
      </div>
    )
  }

  if (phase === "handoff") {
    return <PassTo name={players[1].name} color="#00e5ff" info={`${players[0].name}'s card is ${cardText(deal.first)}. Guess higher or lower.`} onReady={() => setPhase("guess")} />
  }

  if (phase === "guess") {
    return (
      <div className="mini-outer">
        <div className="bang t-cyan" style={{ fontSize: 34 }}>{players[1].name}</div>
        <div className="command-sub">Will the next card be higher or lower than {cardText(deal.first)}?</div>
        <div className="choice-grid">
          <button className="choice-btn" onClick={() => choose("higher")}><span className="choice-emoji">⬆️</span><span>Higher</span></button>
          <button className="choice-btn" onClick={() => choose("lower")}><span className="choice-emoji">⬇️</span><span>Lower</span></button>
        </div>
      </div>
    )
  }

  if (phase === "push") {
    return <div className="mini-outer"><div className="bang t-gold" style={{ fontSize: 42 }}>PUSH!</div><div className="reveal-row"><CardFace card={deal.first} /><CardFace card={deal.second} /></div><div className="command-sub">Same rank. No point. Replay this one.</div></div>
  }

  const correct = guess === "higher" ? deal.second.rank > deal.first.rank : deal.second.rank < deal.first.rank
  return (
    <div className="mini-outer">
      <div className={`bang ${correct ? "t-cyan" : "t-pink"}`} style={{ fontSize: 40 }}>{correct ? `${players[1].name} WINS!` : `${players[0].name} WINS!`}</div>
      <div className="reveal-row"><CardFace card={deal.first} /><CardFace card={deal.second} /></div>
      <div className="command-sub">Guess: {guess}. {correct ? "Correct." : "Wrong."}</div>
    </div>
  )
}
