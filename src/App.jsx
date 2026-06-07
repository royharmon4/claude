import { useState } from "react"
import "./app-next.css"
import { HISTORY_LIMIT, LS_HIST, LS_NAMES, SERIES_WIN, STRIKES_WIN } from "./constants"
import { pickGame } from "./utils/random"
import { readStorage, writeStorage } from "./utils/storage"
import Scoreboard from "./components/Scoreboard"
import SetupScreen from "./components/SetupScreen"
import GameSelectScreen from "./components/GameSelectScreen"
import GameIntroScreen from "./components/GameIntroScreen"
import GameRouter from "./components/GameRouter"
import PointScreen from "./components/PointScreen"
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

export default function App() {
  const [screen, setScreen] = useState("setup")
  const [players, setPlayers] = useState(freshPlayers())
  const [game, setGame] = useState(null)
  const [result, setResult] = useState(null)
  const [pointResult, setPointResult] = useState(null)
  const [seriesWins, setSeriesWins] = useState([0, 0])
  const [recentIds, setRecentIds] = useState([])
  const [round, setRound] = useState(1)
  const [matchMode, setMatchMode] = useState("full")
  const [history, setHistory] = useState(() => readStorage(LS_HIST, []))

  const resetRoundState = () => {
    setRound(1)
    setSeriesWins([0, 0])
    setPointResult(null)
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
    const pointWinnerIdx = 1 - pointLoserIdx
    const nextSeries = [...seriesWins]
    nextSeries[pointWinnerIdx] += 1

    if (nextSeries[pointWinnerIdx] < SERIES_WIN) {
      setSeriesWins(nextSeries)
      setPointResult({ pointWinnerIdx, pointLoserIdx, seriesWins: nextSeries, gameName: game.name })
      setScreen("point")
      return
    }

    const seriesLoserIdx = 1 - pointWinnerIdx

    if (matchMode === "single") {
      setSeriesWins(nextSeries)
      setPointResult(null)
      setResult({ loserIdx: seriesLoserIdx, seriesWinnerIdx: pointWinnerIdx, gameName: game.name, mode: "single" })
      setScreen("result")
      return
    }

    const newStrikes = players[seriesLoserIdx].strikes + 1
    const nextPlayers = players.map((player, idx) => idx === seriesLoserIdx ? { ...player, strikes: newStrikes } : player)

    setSeriesWins([0, 0])
    setPointResult(null)
    setPlayers(nextPlayers)
    setResult({ loserIdx: seriesLoserIdx, newStrikes, seriesWinnerIdx: pointWinnerIdx, gameName: game.name, mode: "full" })

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
    setResult(null)
    setScreen("intro")
  }

  const handleRestart = () => {
    setScreen("setup")
    setPlayers(freshPlayers())
    setResult(null)
    setPointResult(null)
    setSeriesWins([0, 0])
    setRecentIds([])
    setRound(1)
    setGame(null)
    setMatchMode("full")
  }

  const showScoreboard = screen === "game" || screen === "point" || (matchMode === "full" && screen === "result")

  return (
    <div className="app">
      {showScoreboard && <Scoreboard players={players} round={round} seriesWins={seriesWins} game={game} matchMode={matchMode} />}
      {screen === "setup" && <SetupScreen history={history} onStart={startMatch} onChooseGame={openGameGallery} />}
      {screen === "select-game" && <GameSelectScreen players={players} onSelect={startSingleGame} onBack={handleRestart} />}
      {screen === "intro" && game && <GameIntroScreen game={game} players={players} seriesWins={seriesWins} onGo={() => setScreen("game")} />}
      {screen === "game" && game && <GameRouter game={game} players={players} onResult={handleGamePoint} />}
      {screen === "point" && pointResult && <PointScreen players={players} pointResult={pointResult} onNextPoint={handleNextPoint} />}
      {screen === "result" && result && <ResultScreen players={players} result={result} onNext={handleNextRound} />}
      {screen === "final" && <FinalScreen players={players} history={history} onRestart={handleRestart} />}
    </div>
  )
}
