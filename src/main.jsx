import React from "react"
import { createRoot } from "react-dom/client"
import AppHigherLower from "./AppHigherLower.jsx"

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppHigherLower />
  </React.StrictMode>
)
