export const SUITS = ["♠", "♥", "♦", "♣"]
export const RED_SUITS = new Set(["♥", "♦"])

export function rankLabel(rank) {
  if (rank === 1) return "A"
  if (rank === 11) return "J"
  if (rank === 12) return "Q"
  if (rank === 13) return "K"
  return String(rank)
}

export function cardText(card) {
  return `${rankLabel(card.rank)}${card.suit}`
}

export function buildDeck() {
  return SUITS.flatMap((suit) =>
    Array.from({ length: 13 }, (_, index) => ({
      id: `${index + 1}-${suit}`,
      rank: index + 1,
      suit,
    })),
  )
}

export function drawCard(deck) {
  const index = Math.floor(Math.random() * deck.length)
  return [deck[index], deck.filter((_, i) => i !== index)]
}

export function dealHigherLower() {
  const [first, afterFirst] = drawCard(buildDeck())
  const [second] = drawCard(afterFirst)
  return { first, second }
}
