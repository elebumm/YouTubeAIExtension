import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/watch*"],
  world: "MAIN",
  run_at: "document_start"
}
