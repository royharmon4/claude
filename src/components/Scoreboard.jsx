import { STRIKES_WIN } from "../constants"
import SeriesPips from "./SeriesPips"

export default function Scoreboard({ players, round, seriesWins, game }) {
  return (
    <div className="sb">
      {[0, 1].map((idx) => (
        <div key={idx} className="sb-player">
          <div className={`sb-name ${idx === 0 ? "t-pink" : "t-cyan"}`}>{players[idx].name}</div>
          <div className={`sb-dots ${idx === 0 ? "t-pink" : "t-cyan"}`}>
            {Array.from({ length: STRIKES_WIN }, (_, i) => (
              <div key={i} className={`dot${i < players[idx].strikes ? " on" : ""}`} />
            ))}
          </div>
          {game && <SeriesPips value={seriesWins[idx]} colorClass={idx === 0 ? "t-pink" : "t-cyan"} />}
        </div>
      ))}
      <div className="sb-mid bang" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
        ROUND<br />{round}<br />{game ? `${seriesWins[0]}-${seriesWins[1]}` : ""}
      </div>
    </div>
  )
}
