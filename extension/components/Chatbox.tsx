import { useAutoAnimate } from "@formkit/auto-animate/react"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef, useState, type FormEvent } from "react"

import { sendToBackground, sendToContentScript } from "@plasmohq/messaging"

import { Button } from "../@/ui/button"
import { Input } from "../@/ui/input"
import { extractYouTubeVideoID } from "./chatFunctions"
import ChatMessage, { type ChatMessageType } from "./Messages/Message"
import { IconHappyface, IconPlay } from "./utils/Icons"

const queryVideo = async (data) => {
  const result = await sendToBackground({
    name: "ping",
    body: data
  })
  return result
}

export default function Chatbox() {
  const messagesEndRef = useRef(null)
  const [parent, enableAnimations] = useAutoAnimate({ duration: 500 })
  const [chat, setChat] = useState<ChatMessageType[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const chatInput = useRef(null)
  const queryClient = useQueryClient()

  // Ref for tracking if the input is focused
  const isInputFocused = useRef(false)
  const toggleVisibility = () => {
    setIsVisible((prev) => !prev)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Event handler for keydown events
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if the active element is your input field
      if (document.activeElement === chatInput.current) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    // Add the keydown event listener to the window in capturing phase
    window.addEventListener("keydown", handleKeyDown, true)

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true)
    }
  }, [])

  useEffect(() => {
    setTimeout(() => {
      scrollToBottom()
    }, 1000)
  }, [chat])

  const mutation = useMutation({
    mutationFn: queryVideo,
    onSuccess: (result) => {
      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.chat,
          start_time: result.time
        }
      ])
    }
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const message = chatInput.current.value
    if (message === "") return
    const youtube_id = extractYouTubeVideoID(window.location.href)
    setChat((prev: ChatMessageType[]) => {
      const newMessage: ChatMessageType = {
        role: "user",
        content: message,
        start_time: null
      }

      const updatedChat = [...prev, newMessage]
      mutation.mutate({
        query: message,
        youtube_id: youtube_id,
        chat: chat
      })

      return updatedChat
    })
    chatInput.current.value = ""
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation()
  }

  return (
    <>
      <button
        onClick={toggleVisibility}
        className="fixed bottom-10 right-10 p-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-700 hover:to-blue-500 shadow-lg transition duration-300 ease-in-out transform hover:scale-110">
        {/* Icon or text here */}
        <svg
          className="h-12 w-12 text-white"
          viewBox="0 0 512 512"
          xmlns="http://www.w3.org/2000/svg">
          <g>
            <path
              fill="white"
              d="m21.729 331h129.271c21.532 0 42.015-4.569 60.542-12.775-.357 4.235-.542 8.496-.542 12.775 0 82.71 67.29 150 150 150h130.271l-22.382-44.764c27.529-27.967 43.111-65.701 43.111-105.236 0-82.71-67.738-150-151-150-21.185 0-41.658 4.334-60.542 12.689.352-4.184.542-8.415.542-12.689 0-82.71-67.29-150-150-150-83.262 0-151 67.29-151 150 0 39.104 15.943 76.861 44.102 105.257zm339.271-120c66.72 0 121 53.832 121 120 0 63.841-47.578 95.026-50.138 98.267l10.867 21.733h-81.729c-66.168 0-120-53.832-120-120 0-11.556 1.64-22.935 4.86-33.894 20.477-16.761 36.456-38.819 45.825-64.064 20.321-14.428 44.189-22.042 69.315-22.042zm-331-30c0-66.168 54.28-120 121-120 66.168 0 120 53.832 120 120s-53.832 120-120 120h-80.729l10.867-21.733c-2.773-3.473-51.138-35.245-51.138-98.267z"
            />
            <path
              fill="white"
              d="m151 121c16.542 0 30 13.458 30 30 0 11.214-6.182 21.411-16.132 26.613-17.537 9.167-28.868 28.16-28.868 48.387h30c0-9.048 5.131-17.809 12.767-21.801 19.881-10.393 32.233-30.778 32.233-53.199 0-33.084-26.916-60-60-60s-60 26.916-60 60h30c0-16.542 13.458-30 30-30z"
            />
            <path fill="white" d="m136 241h30v30h-30z" />
            <path fill="white" d="m301 286h121v30h-121z" />
            <path fill="white" d="m301 346h121v30h-121z" />
          </g>
        </svg>
      </button>
      <div
        key="1"
        style={{
          position: "fixed",
          bottom: "5%",
          right: isVisible ? "5%" : "-100%", // Off-screen when not visible
          transition: "right 0.75s" // Smooth sliding effect
        }}
        className="bg-white rounded-3xl shadow-2xl w-96 h-144 mx-auto">
        <div className="bg-[#89CFF0] p-4 flex items-center text-white rounded-t-xl">
          <IconHappyface className="text-white mr-3 h-6 w-6" />

          <div className="ml-4">
            <div className="font-semibold">YouTube Q&A</div>
          </div>
        </div>
        <div
          className="p-5 space-y-6 overflow-auto h-104 relative flex-grow"
          style={{ height: "350px" }}
          ref={parent}>
          {chat.map((message, index) => (
            <ChatMessage
              role={message.role}
              content={message.content}
              start_time={message.start_time}
              key={index}
            />
          ))}
          {mutation.isPending && <LoadingBubble />}

          <div ref={messagesEndRef}></div>
        </div>
        <div className="bg-gray-100 p-2 flex items-center rounded-b-xl">
          <form className="contents" onSubmit={handleSubmit}>
            <Input
              disabled={mutation.isPending}
              onKeyDown={handleKeyPress}
              onKeyUp={handleKeyPress}
              ref={chatInput}
              className="flex-1 p-2 text-sm bg-white border border-gray-300 rounded-lg"
              placeholder="Type a reply..."
            />
            {mutation.isPending ? (
              <Button disabled>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              </Button>
            ) : (
              <Button
                className="bg-white border border-gray-300 text-gray-700 ml-2 rounded-lg"
                variant="outline">
                Send
              </Button>
            )}
          </form>
        </div>
      </div>
    </>
  )
}

const LoadingBubble = () => (
  <div className="flex items-center space-x-2">
    <div className="bg-gray-200 text-black text-sm rounded-lg p-2 max-w-3/4 shadow-lg flex items-center">
      <div className="h-2 w-2 bg-black rounded-full animate-bounce mr-1" />
      <div className="h-2 w-2 bg-black rounded-full animate-bounce mr-1" />
      <div className="h-2 w-2 bg-black rounded-full animate-bounce" />
    </div>
  </div>
)
