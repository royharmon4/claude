import { GAME_COMPONENTS } from "../games"

export default function GameRouter({ game, players, onResult }) {
  const GameComponent = GAME_COMPONENTS[game?.id]

  if (!GameComponent) {
    return (
      <div className="mini-outer">
        <div className="bang t-pink" style={{ fontSize: 38 }}>Unknown Game</div>
        <div className="command-sub">This game could not be loaded. Start the next round to keep playing.</div>
        <button className="btn btn-cyan" onClick={() => onResult(Math.random() < 0.5 ? 0 : 1)}>SKIP POINT</button>
      </div>
    )
  }

  return <GameComponent players={players} onResult={onResult} />
}
