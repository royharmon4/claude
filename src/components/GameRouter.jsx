import { GAME_COMPONENTS } from "../games"

export default function GameRouter({ game, players, onResult }) {
  const GameComponent = GAME_COMPONENTS[game.id]
  return GameComponent ? <GameComponent players={players} onResult={onResult} /> : null
}
