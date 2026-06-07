import { STRIKES_WIN } from "../constants"

export default function ResultScreen({ players, result, onNext }) {
  const { loserIdx, newStrikes, seriesWinnerIdx, gameName } = result
  const eliminated = newStrikes >= STRIKES_WIN

  return (
    <div className="result-screen">
      {eliminated ? (
        <>
          <div className="rs-label">GAME OVER!</div>
          <div className="rs-name t-pink glow-pink">{players[loserIdx].name}</div>
          <div className="rs-elim">ELIMINATED! ☠️</div>
          <div className="rs-dots">{Array.from({ length: STRIKES_WIN }, (_, i) => <div key={i} className="rs-dot on" />)}</div>
          <div className="rs-winner">🏆 {players[seriesWinnerIdx].name} won {gameName} 2 out of 3 and wins the match!</div>
          <button className="btn btn-gold" onClick={onNext} style={{ marginTop: 12 }}>SEE THE WINNER! 🎉</button>
        </>
      ) : (
        <>
          <div className="rs-label">SERIES LOST</div>
          <div className="rs-strike">STRIKE!</div>
          <div className="rs-name t-pink">{players[loserIdx].name}</div>
          <div className="rs-dots">{Array.from({ length: STRIKES_WIN }, (_, i) => <div key={i} className={`rs-dot${i < newStrikes ? " on" : ""}`} />)}</div>
          <div className="rs-winner" style={{ marginTop: 4 }}>{players[seriesWinnerIdx].name} won {gameName} 2 out of 3</div>
          <button className="btn btn-cyan" onClick={onNext} style={{ marginTop: 12 }}>NEXT ROUND →</button>
        </>
      )}
    </div>
  )
}
