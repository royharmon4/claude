import { STRIKES_WIN } from "../constants"

export default function ResultScreen({ players, result, onNext }) {
  const { loserIdx, newStrikes = 0, seriesWinnerIdx, gameName, mode = "full", format = "best 2 out of 3" } = result
  const isSingleGame = mode === "single"
  const eliminated = !isSingleGame && newStrikes >= STRIKES_WIN
  const winnerLabel = format === "one round" ? "ROUND WINNER" : "BEST OF 3 WINNER"

  if (isSingleGame) {
    return (
      <div className="result-screen">
        <div className="rs-label">{winnerLabel}</div>
        <div className={`rs-name ${seriesWinnerIdx === 0 ? "t-pink" : "t-cyan"}`}>{players[seriesWinnerIdx].name}</div>
        <div className="rs-winner" style={{ marginTop: 4 }}>
          🏆 Beat {players[loserIdx].name} at {gameName}
        </div>
        <button className="btn btn-go" onClick={onNext} style={{ marginTop: 12 }}>PICK ANOTHER GAME 🎯</button>
      </div>
    )
  }

  return (
    <div className="result-screen">
      {eliminated ? (
        <>
          <div className="rs-label">GAME OVER!</div>
          <div className="rs-name t-pink glow-pink">{players[loserIdx].name}</div>
          <div className="rs-elim">ELIMINATED! ☠️</div>
          <div className="rs-dots">{Array.from({ length: STRIKES_WIN }, (_, i) => <div key={i} className="rs-dot on" />)}</div>
          <div className="rs-winner">🏆 {players[seriesWinnerIdx].name} won {gameName} ({format}) and wins the match!</div>
          <button className="btn btn-gold" onClick={onNext} style={{ marginTop: 12 }}>SEE THE WINNER! 🎉</button>
        </>
      ) : (
        <>
          <div className="rs-label">{format === "one round" ? "ROUND LOST" : "SERIES LOST"}</div>
          <div className="rs-strike">STRIKE!</div>
          <div className="rs-name t-pink">{players[loserIdx].name}</div>
          <div className="rs-dots">{Array.from({ length: STRIKES_WIN }, (_, i) => <div key={i} className={`rs-dot${i < newStrikes ? " on" : ""}`} />)}</div>
          <div className="rs-winner" style={{ marginTop: 4 }}>{players[seriesWinnerIdx].name} won {gameName} ({format})</div>
          <button className="btn btn-cyan" onClick={onNext} style={{ marginTop: 12 }}>NEXT ROUND →</button>
        </>
      )}
    </div>
  )
}
