import SeriesPips from "./SeriesPips"

export default function GameIntroScreen({ game, players, seriesWins, matchMode = "full", onGo }) {
  const isSingleGame = matchMode === "single"

  return (
    <div className="screen" style={{ justifyContent: "center" }}>
      <div className="gi-emoji">{game.emoji}</div>
      <div className="gi-title bang glow-gold t-gold">{game.name}</div>
      <div className="gi-type">{game.type === "sim" ? "⚔️ simultaneous" : "📱 pass & play"}</div>
      <div className="card gi-rules">{game.rules}</div>

      <div className="card">
        <div className="series-card">
          <div>
            <div className="series-name t-pink">{players[0].name}</div>
            <SeriesPips value={seriesWins[0]} colorClass="t-pink" />
          </div>
          <div>
            <div className="series-score">{seriesWins[0]}-{seriesWins[1]}</div>
            <div className="series-note">
              {isSingleGame ? "First to 2 points wins this game" : "First to 2 points gives the other player a strike"}
            </div>
          </div>
          <div>
            <div className="series-name t-cyan">{players[1].name}</div>
            <SeriesPips value={seriesWins[1]} colorClass="t-cyan" />
          </div>
        </div>
      </div>

      {game.type === "sim" && (
        <div className="card" style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 15, color: "rgba(255,255,255,.58)" }}>
          <span>🔴 {players[0].name} → TOP</span>
          <span>🔵 {players[1].name} → BOTTOM</span>
        </div>
      )}

      <button className="btn btn-go" onClick={onGo} style={{ fontSize: 36 }}>
        {seriesWins[0] + seriesWins[1] === 0 ? (isSingleGame ? "START BEST OF 3" : "START SERIES") : "NEXT POINT"} 🚀
      </button>
    </div>
  )
}
