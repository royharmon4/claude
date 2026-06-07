import { SERIES_WIN } from "../constants"

export default function SeriesPips({ value, colorClass }) {
  return (
    <div className={`series-mini ${colorClass}`}>
      {Array.from({ length: SERIES_WIN }, (_, i) => (
        <div key={i} className={`series-dot${i < value ? " on" : ""}`} />
      ))}
    </div>
  )
}
