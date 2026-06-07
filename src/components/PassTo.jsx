export default function PassTo({ name, color, info, onReady }) {
  return (
    <div className="pass-screen">
      <div className="pass-icon">📱</div>
      <div className="pass-inst bang">PASS THE PHONE TO</div>
      <div className="pass-name bang" style={{ color }}>{name}</div>
      {info && <div className="pass-prev">{info}</div>}
      <button className="btn btn-cyan" style={{ marginTop: 8 }} onClick={onReady}>I'M READY!</button>
    </div>
  )
}
