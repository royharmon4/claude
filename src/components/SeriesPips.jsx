export default function SeriesPips({ value, colorClass, pointsToWin = 2 }) {
  return (
    <div className={`series-mini ${colorClass}`}>
      {Array.from({ length: pointsToWin }, (_, i) => (
        <div key={i} className={`series-dot${i < value ? " on" : ""}`} />
      ))}
    </div>
  )
}
