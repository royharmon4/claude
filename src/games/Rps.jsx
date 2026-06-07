export default function Rps({ onResult }) {
  return (
    <div className="mini-outer">
      <div className="bang t-gold" style={{ fontSize: 34 }}>SECRET PICK</div>
      <div className="command-sub">This module will be expanded after the refactor.</div>
      <button className="btn btn-cyan" onClick={() => onResult(Math.random() < 0.5 ? 0 : 1)}>RESOLVE</button>
    </div>
  )
}
