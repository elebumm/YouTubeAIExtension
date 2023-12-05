import type { PlasmoCSConfig } from "plasmo"

import { relayMessage } from "@plasmohq/messaging"

export const cong: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/*"],
  all_frames: true // Match the URL of the page
}

const Bridge = () => {
  return <></>
}

export default Bridge
