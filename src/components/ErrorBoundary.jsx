import React from "react"

export default class ErrorBoundary extends React.Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  handleRestart = () => {
    this.setState({ error: null })
    window.location.reload()
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="app">
        <div className="screen" style={{ justifyContent: "center", textAlign: "center" }}>
          <div className="bang t-pink" style={{ fontSize: 42 }}>Something broke</div>
          <div className="card" style={{ color: "rgba(255,255,255,.72)", lineHeight: 1.5 }}>
            The game hit an unexpected error. Restart the match and keep playing.
          </div>
          <button className="btn btn-go" onClick={this.handleRestart}>RESTART</button>
        </div>
      </div>
    )
  }
}
