import { useState } from "react"
import "./app-next.css"
import { HISTORY_LIMIT, LS_HIST, LS_NAMES, STRIKES_WIN } from "./constants"
import { pickGame } from "./utils/random"
import { readStorage, writeStorage } from "./utils/storage"
import { isMuted, toggleMuted } from "./utils/sound"
import Scoreboard from "./components/Scoreboard"
import SetupScreen from "./components/SetupScreen"
import GameSelectScreen from "./components/GameSelectScreen"
import GameIntroScreen from "./components/GameIntroScreen"
import GameRouter from "./components/GameRouter"
import PointScreen from "./components/PointScreen"
import TieScreen from "./components/TieScreen"
import ResultScreen from "./components/ResultScreen"
import FinalScreen from "./components/FinalScreen"

const freshPlayers = () => [
  { name: "Player 1", strikes: 0 },
  { name: "Player 2", strikes: 0 },
]

const makePlayers = (p1, p2) => [
  { name: p1, strikes: 0 },
  { name: p2, strikes: 0 },
]

const pointsToWin = (game) => game?.pointsToWin || 2
const formatLabel = (game) => pointsToWin(game) === 1 ? "one round" : "best 2 out of 3"

export default function App() {
  const [screen, setScreen] = useState("setup")
  const [players, setPlayers] = useState(freshPlayers())
  const [game, setGame] = useState(null)
  const [result, setResult] = useState(null)
  const [pointResult, setPointResult] = useState(null)
  const [tieResult, setTieResult] = useState(null)
  const [seriesWins, setSeriesWins] = useState([0, 0])
  const [recentIds, setRecentIds] = useState([])
  const [round, setRound] = useState(1)
  const [matchMode, setMatchMode] = useState("full")
  const [history, setHistory] = useState(() => readStorage(LS_HIST, []))
  const [muted, setMutedState] = useState(() => isMuted())

  const handleToggleSound = () => setMutedState(toggleMuted())

  const resetRoundState = () => {
    setRound(1)
    setSeriesWins([0, 0])
    setPointResult(null)
    setTieResult(null)
    setResult(null)
  }

  const startMatch = (p1, p2) => {
    writeStorage(LS_NAMES, [p1, p2])
    const nextGame = pickGame([])
    setMatchMode("full")
    setPlayers(makePlayers(p1, p2))
    resetRoundState()
    setRecentIds([nextGame.id])
    setGame(nextGame)
    setScreen("intro")
  }

  const openGameGallery = (p1, p2) => {
    writeStorage(LS_NAMES, [p1, p2])
    setMatchMode("single")
    setPlayers(makePlayers(p1, p2))
    resetRoundState()
    setRecentIds([])
    setGame(null)
    setScreen("select-game")
  }

  const startSingleGame = (selectedGame) => {
    setMatchMode("single")
    setGame(selectedGame)
    resetRoundState()
    setScreen("intro")
  }

  const handleGamePoint = (pointLoserIdx) => {
    if (pointLoserIdx == null) {
      setPointResult(null)
      setResult(null)
      setTieResult({ gameName: game.name })
      setScreen("tie")
      return
    }

    const targetPoints = pointsToWin(game)
    const pointWinnerIdx = 1 - pointLoserIdx
    const nextSeries = [...seriesWins]
    nextSeries[pointWinnerIdx] += 1

    if (nextSeries[pointWinnerIdx] < targetPoints) {
      setSeriesWins(nextSeries)
      setTieResult(null)
      setPointResult({ pointWinnerIdx, pointLoserIdx, seriesWins: nextSeries, gameName: game.name, mode: matchMode, pointsToWin: targetPoints, format: formatLabel(game) })
      setScreen("point")
      return
    }

    const seriesLoserIdx = 1 - pointWinnerIdx

    if (matchMode === "single") {
      setSeriesWins(nextSeries)
      setPointResult(null)
      setTieResult(null)
      setResult({ loserIdx: seriesLoserIdx, seriesWinnerIdx: pointWinnerIdx, gameName: game.name, mode: "single", pointsToWin: targetPoints, format: formatLabel(game) })
      setScreen("result")
      return
    }

    const newStrikes = players[seriesLoserIdx].strikes + 1
    const nextPlayers = players.map((player, idx) => idx === seriesLoserIdx ? { ...player, strikes: newStrikes } : player)

    setSeriesWins([0, 0])
    setPointResult(null)
    setTieResult(null)
    setPlayers(nextPlayers)
    setResult({ loserIdx: seriesLoserIdx, newStrikes, seriesWinnerIdx: pointWinnerIdx, gameName: game.name, mode: "full", pointsToWin: targetPoints, format: formatLabel(game) })

    if (newStrikes >= STRIKES_WIN) {
      const entry = {
        winner: nextPlayers[pointWinnerIdx].name,
        loser: nextPlayers[seriesLoserIdx].name,
        date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
      }
      setHistory((prev) => {
        const nextHistory = [entry, ...prev].slice(0, HISTORY_LIMIT)
        writeStorage(LS_HIST, nextHistory)
        return nextHistory
      })
    }

    setScreen("result")
  }

  const handleNextPoint = () => {
    setPointResult(null)
    setScreen("intro")
  }

  const handleReplayTie = () => {
    setTieResult(null)
    setScreen("intro")
  }

  const handleNextRound = () => {
    if (matchMode === "single") {
      setGame(null)
      resetRoundState()
      setScreen("select-game")
      return
    }

    if (result?.newStrikes >= STRIKES_WIN) {
      setScreen("final")
      return
    }

    const nextGame = pickGame(recentIds)
    setRecentIds((prev) => [...prev, nextGame.id].slice(-6))
    setGame(nextGame)
    setRound((currentRound) => currentRound + 1)
    setSeriesWins([0, 0])
    setPointResult(null)
    setTieResult(null)
    setResult(null)
    setScreen("intro")
  }

  const handleRestart = () => {
    setScreen("setup")
    setPlayers(freshPlayers())
    setResult(null)
    setPointResult(null)
    setTieResult(null)
    setSeriesWins([0, 0])
    setRecentIds([])
    setRound(1)
    setGame(null)
    setMatchMode("full")
  }

  const showScoreboard = screen === "game" || screen === "point" || screen === "tie" || (matchMode === "full" && screen === "result")
  const showSoundToggle = screen === "setup" || screen === "intro" || screen === "select-game"

  return (
    <div className="app">
      {showSoundToggle && (
        <button className="sound-toggle" onClick={handleToggleSound} aria-label={muted ? "Unmute sounds" : "Mute sounds"}>
          {muted ? "🔇" : "🔊"}
        </button>
      )}
      {showScoreboard && <Scoreboard players={players} round={round} seriesWins={seriesWins} game={game} matchMode={matchMode} />}
      {screen === "setup" && <SetupScreen history={history} onStart={startMatch} onChooseGame={openGameGallery} />}
      {screen === "select-game" && <GameSelectScreen players={players} onSelect={startSingleGame} onBack={handleRestart} />}
      {screen === "intro" && game && <GameIntroScreen game={game} players={players} seriesWins={seriesWins} matchMode={matchMode} onGo={() => setScreen("game")} />}
      {screen === "game" && game && <GameRouter game={game} players={players} onResult={handleGamePoint} pointIndex={seriesWins[0] + seriesWins[1]} />}
      {screen === "point" && pointResult && <PointScreen players={players} pointResult={pointResult} onNextPoint={handleNextPoint} />}
      {screen === "tie" && tieResult && <TieScreen gameName={tieResult.gameName} onReplay={handleReplayTie} />}
      {screen === "result" && result && <ResultScreen players={players} result={result} onNext={handleNextRound} />}
      {screen === "final" && <FinalScreen players={players} history={history} onRestart={handleRestart} />}
    </div>
  )
}
