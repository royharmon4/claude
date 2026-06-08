import { GAMES } from "../data/games"

const formatLabel = (game) => game.pointsToWin === 1 ? "One round" : "Best 2 of 3"

export default function GameSelectScreen({ players, onSelect, onBack }) {
  return (
    <div className="screen" style={{ paddingBottom: 18 }}>
      <div>
        <div className="setup-logo glow-gold t-gold" style={{ fontSize: 44 }}>PICK A GAME</div>
        <div className="setup-sub" style={{ marginTop: 6 }}>
          {players[0].name} vs {players[1].name} · each game has its own format
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
        {GAMES.map((game) => (
          <button
            key={game.id}
            className="card"
            onClick={() => onSelect(game)}
            style={{
              color: "#fff",
              display: "grid",
              gridTemplateColumns: "54px 1fr",
              gap: 12,
              alignItems: "center",
              textAlign: "left",
              padding: 14,
              width: "100%",
            }}
          >
            <span style={{ fontSize: 40, lineHeight: 1, textAlign: "center" }}>{game.emoji}</span>
            <span style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
              <span className="bang" style={{ fontSize: 23, letterSpacing: 1.4 }}>{game.name}</span>
              <span style={{ fontSize: 12, color: "#00e5ff", letterSpacing: 2, textTransform: "uppercase" }}>
                {game.type === "sim" ? "Simultaneous" : "Pass & play"} · {formatLabel(game)}
              </span>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,.58)", lineHeight: 1.25 }}>{game.rules}</span>
            </span>
          </button>
        ))}
      </div>

      <button className="btn btn-ghost" onClick={onBack} style={{ fontSize: 22 }}>← CHANGE PLAYERS</button>
    </div>
  )
}
