export default function PointScreen({ players, pointResult, onNextPoint }) {
  const { pointWinnerIdx, seriesWins, gameName, mode = "full", format = "best 2 out of 3" } = pointResult
  const isSingleGame = mode === "single"

  return (
    <div className="point-screen">
      <div className="ps-label">POINT WINNER</div>
      <div className={`ps-name ${pointWinnerIdx === 0 ? "t-pink" : "t-cyan"}`}>{players[pointWinnerIdx].name}</div>
      <div className="ps-score">{seriesWins[0]}-{seriesWins[1]}</div>
      <div className="series-note">
        {isSingleGame ? `${gameName} is ${format}. Keep going.` : `${gameName} is ${format}. Keep going.`}
      </div>
      <button className="btn btn-cyan" onClick={onNextPoint} style={{ marginTop: 12 }}>NEXT POINT →</button>
    </div>
  )
}
