export default function TieScreen({ gameName, onReplay }) {
  return (
    <div className="point-screen">
      <div className="ps-label">NO POINT</div>
      <div className="ps-name t-gold glow-gold">TIE!</div>
      <div className="series-note">{gameName} was tied. Replay this point.</div>
      <button className="btn btn-cyan" onClick={onReplay} style={{ marginTop: 12 }}>REPLAY POINT →</button>
    </div>
  )
}
