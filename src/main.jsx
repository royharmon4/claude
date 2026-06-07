import React from "react"
import { createRoot } from "react-dom/client"
import AppSneakyMemory from "./AppSneakyMemory.jsx"

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppSneakyMemory />
  </React.StrictMode>
)
