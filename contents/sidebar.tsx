import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import cssText from "data-text:~styles/tailwind.css"
import type { PlasmoCSConfig } from "plasmo"

import Chatbox from "../components/Chatbox"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/watch*"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  style.textContent = cssText.replaceAll(":root", ":host")
  return style
}

const queryClient = new QueryClient()

const SideBar: React.FC = () => {
  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <Chatbox />
      </QueryClientProvider>
    </div>
  )
}

export default SideBar
