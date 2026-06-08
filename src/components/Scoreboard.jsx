import { STRIKES_WIN } from "../constants"
import SeriesPips from "./SeriesPips"

export default function Scoreboard({ players, round, seriesWins, game, matchMode = "full" }) {
  const isSingleGame = matchMode === "single"
  const pointsToWin = game?.pointsToWin || 2
  const isOneRound = pointsToWin === 1

  return (
    <div className="sb">
      {[0, 1].map((idx) => (
        <div key={idx} className="sb-player">
          <div className={`sb-name ${idx === 0 ? "t-pink" : "t-cyan"}`}>{players[idx].name}</div>
          {!isSingleGame && (
            <div className={`sb-dots ${idx === 0 ? "t-pink" : "t-cyan"}`}>
              {Array.from({ length: STRIKES_WIN }, (_, i) => (
                <div key={i} className={`dot${i < players[idx].strikes ? " on" : ""}`} />
              ))}
            </div>
          )}
          {game && <SeriesPips value={seriesWins[idx]} colorClass={idx === 0 ? "t-pink" : "t-cyan"} pointsToWin={pointsToWin} />}
        </div>
      ))}
      <div className="sb-mid bang" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
        {isSingleGame ? (isOneRound ? "ONE" : "BEST") : "ROUND"}<br />{isSingleGame ? (isOneRound ? "ROUND" : "OF 3") : round}<br />{game ? `${seriesWins[0]}-${seriesWins[1]}` : ""}
      </div>
    </div>
  )
}
