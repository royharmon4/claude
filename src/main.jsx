import React from "react"
import { createRoot } from "react-dom/client"
import AppBalanceMeter from "./AppBalanceMeter.jsx"

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppBalanceMeter />
  </React.StrictMode>
)
