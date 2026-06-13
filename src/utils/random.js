import { GAMES } from "../data/games"

export function shuffle(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function pickGame(recent = []) {
  // Avoid repeating any of the last 4 games so matches feel varied.
  const excluded = new Set(recent.slice(-4))
  const pool = GAMES.filter((game) => !excluded.has(game.id))
  const choices = pool.length ? pool : GAMES
  return choices[Math.floor(Math.random() * choices.length)]
}

export function chooseLoser(scoreA, scoreB, lowerIsBetter = false) {
  if (scoreA === scoreB) return null
  if (lowerIsBetter) return scoreA < scoreB ? 1 : 0
  return scoreA > scoreB ? 1 : 0
}
