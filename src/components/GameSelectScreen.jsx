import { GAMES } from "../data/games"

export default function GameSelectScreen({ players, onSelect, onBack }) {
  return (
    <div className="screen game-select-screen">
      <div>
        <div className="setup-logo glow-gold t-gold" style={{ fontSize: 44 }}>PICK A GAME</div>
        <div className="setup-sub" style={{ marginTop: 6 }}>
          {players[0].name} vs {players[1].name} · best 2 out of 3
        </div>
      </div>

      <div className="game-gallery">
        {GAMES.map((game) => (
          <button key={game.id} className="game-card" onClick={() => onSelect(game)}>
            <span className="game-card-emoji">{game.emoji}</span>
            <span className="game-card-main">
              <span className="game-card-name">{game.name}</span>
              <span className="game-card-type">{game.type === "sim" ? "Simultaneous" : "Pass & play"}</span>
              <span className="game-card-rules">{game.rules}</span>
            </span>
          </button>
        ))}
      </div>

      <button className="btn btn-ghost" onClick={onBack} style={{ fontSize: 22 }}>← CHANGE PLAYERS</button>
    </div>
  )
}
