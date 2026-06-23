import { useState } from "react"
import PassTo from "../components/PassTo"
import { useTimers } from "../hooks/useTimers"
import { sfx, buzz } from "../utils/sound"

const SIZE = 6
const SHIPS = [
  { id: "cruiser", name: "Cruiser", length: 3 },
  { id: "patrol-a", name: "Patrol Boat", length: 2 },
  { id: "patrol-b", name: "Scout Boat", length: 2 },
]

const EMPTY_FLEET = () => SHIPS.map((ship) => ({ ...ship, cells: [] }))
const keyOf = (row, col) => `${row}-${col}`

function cellsFor(row, col, length, orientation) {
  return Array.from({ length }, (_, idx) => keyOf(
    row + (orientation === "v" ? idx : 0),
    col + (orientation === "h" ? idx : 0),
  ))
}

function canPlace(fleet, row, col, length, orientation) {
  const endRow = row + (orientation === "v" ? length - 1 : 0)
  const endCol = col + (orientation === "h" ? length - 1 : 0)
  if (endRow >= SIZE || endCol >= SIZE) return false

  const occupied = new Set(fleet.flatMap((ship) => ship.cells))
  return cellsFor(row, col, length, orientation).every((cell) => !occupied.has(cell))
}

function randomFleet() {
  const fleet = EMPTY_FLEET()

  fleet.forEach((ship, shipIndex) => {
    let placed = false
    while (!placed) {
      const orientation = Math.random() < 0.5 ? "h" : "v"
      const row = Math.floor(Math.random() * SIZE)
      const col = Math.floor(Math.random() * SIZE)
      if (!canPlace(fleet, row, col, ship.length, orientation)) continue
      fleet[shipIndex] = { ...ship, cells: cellsFor(row, col, ship.length, orientation) }
      placed = true
    }
  })

  return fleet
}

function Board({ fleet, shots = [], mode, onCell }) {
  const shipCells = new Set(fleet.flatMap((ship) => ship.cells))
  const shotCells = new Set(shots)
  const labels = ["A", "B", "C", "D", "E", "F"]

  return (
    <div className="bs-board" role="grid" aria-label={mode === "place" ? "Your fleet board" : "Opponent target board"}>
      <div className="bs-label" />
      {labels.map((label) => <div key={label} className="bs-label">{label}</div>)}
      {Array.from({ length: SIZE }, (_, row) => (
        <div className="bs-row" key={row}>
          <div className="bs-label">{row + 1}</div>
          {Array.from({ length: SIZE }, (_, col) => {
            const cell = keyOf(row, col)
            const isShip = shipCells.has(cell)
            const wasShot = shotCells.has(cell)
            const isHit = wasShot && isShip
            const classNames = [
              "bs-cell",
              mode === "place" && isShip ? "ship" : "",
              mode === "battle" && wasShot && !isHit ? "miss" : "",
              mode === "battle" && isHit ? "hit" : "",
            ].filter(Boolean).join(" ")

            return (
              <button
                key={cell}
                className={classNames}
                onClick={() => onCell?.(row, col)}
                disabled={mode === "battle" && wasShot}
                aria-label={`${labels[col]}${row + 1}${mode === "battle" && wasShot ? (isHit ? ", hit" : ", miss") : ""}`}
              >
                {mode === "place" && isShip ? "■" : ""}
                {mode === "battle" && isHit ? "💥" : ""}
                {mode === "battle" && wasShot && !isHit ? "•" : ""}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default function Battleship({ players, onResult, pointIndex = 0 }) {
  const startingPlayer = pointIndex % 2
  const [phase, setPhase] = useState("place")
  const [activePlayer, setActivePlayer] = useState(0)
  const [fleets, setFleets] = useState([EMPTY_FLEET(), EMPTY_FLEET()])
  const [shipIndex, setShipIndex] = useState(0)
  const [orientation, setOrientation] = useState("h")
  const [shots, setShots] = useState([[], []])
  const [feedback, setFeedback] = useState(null)
  const { addTimeout } = useTimers()

  const activeFleet = fleets[activePlayer]
  const currentShip = SHIPS[shipIndex]

  const placeShip = (row, col) => {
    if (!currentShip || !canPlace(activeFleet, row, col, currentShip.length, orientation)) {
      sfx.bad()
      buzz(24)
      return
    }

    const nextFleets = fleets.map((fleet, playerIndex) => {
      if (playerIndex !== activePlayer) return fleet
      return fleet.map((ship, idx) => idx === shipIndex
        ? { ...ship, cells: cellsFor(row, col, ship.length, orientation) }
        : ship)
    })

    setFleets(nextFleets)
    sfx.tap()
    setShipIndex((idx) => idx + 1)
  }

  const autoPlace = () => {
    const nextFleets = fleets.map((fleet, playerIndex) => playerIndex === activePlayer ? randomFleet() : fleet)
    setFleets(nextFleets)
    setShipIndex(SHIPS.length)
    sfx.good()
  }

  const resetPlacement = () => {
    const nextFleets = fleets.map((fleet, playerIndex) => playerIndex === activePlayer ? EMPTY_FLEET() : fleet)
    setFleets(nextFleets)
    setShipIndex(0)
    sfx.tap()
  }

  const lockFleet = () => {
    sfx.good()
    if (activePlayer === 0) {
      setPhase("place-handoff")
      return
    }
    setActivePlayer(startingPlayer)
    setPhase("battle-handoff")
  }

  const fire = (row, col) => {
    const cell = keyOf(row, col)
    if (shots[activePlayer].includes(cell)) return

    const targetPlayer = 1 - activePlayer
    const targetFleet = fleets[targetPlayer]
    const isHit = targetFleet.some((ship) => ship.cells.includes(cell))
    const nextShots = shots.map((playerShots, playerIndex) => playerIndex === activePlayer ? [...playerShots, cell] : playerShots)
    setShots(nextShots)

    const sunkShip = targetFleet.find((ship) => ship.cells.includes(cell) && ship.cells.every((shipCell) => nextShots[activePlayer].includes(shipCell)))
    const allSunk = targetFleet.every((ship) => ship.cells.every((shipCell) => nextShots[activePlayer].includes(shipCell)))

    if (allSunk) {
      sfx.win()
      buzz([40, 50, 40, 50, 80])
      setFeedback({ kind: "win", text: `${players[activePlayer].name} sank the whole fleet!` })
      setPhase("won")
      addTimeout(() => onResult(targetPlayer), 1600)
      return
    }

    if (isHit) {
      sfx.good()
      buzz([30, 30, 45])
      setFeedback({ kind: "hit", text: sunkShip ? `SUNK ${sunkShip.name.toUpperCase()}!` : "DIRECT HIT!" })
    } else {
      sfx.bad()
      setFeedback({ kind: "miss", text: "MISS!" })
    }
    setPhase("shot-result")
  }

  const finishTurn = () => {
    setActivePlayer((player) => 1 - player)
    setFeedback(null)
    setPhase("turn-handoff")
  }

  if (phase === "place-handoff") {
    return <PassTo name={players[1].name} color="#00e5ff" info={`${players[0].name}'s fleet is locked. Build yours without peeking.`} onReady={() => { setActivePlayer(1); setShipIndex(0); setOrientation("h"); setPhase("place") }} />
  }

  if (phase === "battle-handoff" || phase === "turn-handoff") {
    return <PassTo name={players[activePlayer].name} color={activePlayer === 0 ? "#ff2d6e" : "#00e5ff"} info="Your opponent's fleet is hidden. Choose one square to fire." onReady={() => setPhase("battle")} />
  }

  if (phase === "place") {
    const ready = shipIndex >= SHIPS.length
    return (
      <div className="bs-outer">
        <div className="bang bs-title" style={{ color: activePlayer === 0 ? "#ff2d6e" : "#00e5ff" }}>{players[activePlayer].name}'s Fleet</div>
        <div className="command-sub">{ready ? "Fleet ready. Lock it in and pass the phone." : `Place your ${currentShip.name} (${currentShip.length} squares).`}</div>
        <Board fleet={activeFleet} mode="place" onCell={ready ? null : placeShip} />
        <div className="bs-controls">
          {!ready && (
            <>
              <button className={`bs-small-btn ${orientation === "h" ? "on" : ""}`} onClick={() => setOrientation("h")}>↔ HORIZONTAL</button>
              <button className={`bs-small-btn ${orientation === "v" ? "on" : ""}`} onClick={() => setOrientation("v")}>↕ VERTICAL</button>
            </>
          )}
          <button className="bs-small-btn" onClick={autoPlace}>🎲 AUTO PLACE</button>
          {ready && <button className="bs-small-btn" onClick={resetPlacement}>↻ RESET</button>}
        </div>
        {ready && <button className="btn btn-cyan" onClick={lockFleet}>LOCK FLEET</button>}
      </div>
    )
  }

  const opponent = 1 - activePlayer
  return (
    <div className="bs-outer">
      <div className="bang bs-title" style={{ color: activePlayer === 0 ? "#ff2d6e" : "#00e5ff" }}>{players[activePlayer].name}'s Turn</div>
      <div className="command-sub">Fire on {players[opponent].name}'s hidden fleet.</div>
      <Board fleet={fleets[opponent]} shots={shots[activePlayer]} mode="battle" onCell={phase === "battle" ? fire : null} />
      <div className="bs-fleet-status">
        {fleets[opponent].map((ship) => {
          const sunk = ship.cells.length > 0 && ship.cells.every((cell) => shots[activePlayer].includes(cell))
          return <span key={ship.id} className={sunk ? "sunk" : ""}>{sunk ? "☠" : "🚢"} {ship.length}</span>
        })}
      </div>
      {feedback && <div className={`bang bs-feedback ${feedback.kind}`}>{feedback.text}</div>}
      {phase === "shot-result" && <button className="btn btn-gold" onClick={finishTurn}>PASS PHONE</button>}
    </div>
  )
}
