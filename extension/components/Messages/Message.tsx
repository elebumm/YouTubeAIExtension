import React from "react"

import { Button } from "~/@/ui/button"

import { convertToSeconds } from "../chatFunctions"
import { IconHappyface, IconPlay } from "../utils/Icons"

export type ChatMessageType = {
  role: "user" | "assistant" | "system"
  content: string
  start_time: string | null
}

const ChatMessage: React.FC<ChatMessageType> = ({
  role,
  content,
  start_time
}) => {
  const roleClass =
    role === "user"
      ? "flex flex-row-reverse items-end space-x-2 space-x-reverse"
      : "flex items-end space-x-2"

  const nameClass =
    role === "user"
      ? "bg-[#5DADE2] text-white text-sm rounded-lg p-2 max-w-xs shadow-lg"
      : "bg-gray-200 text-black text-sm rounded-lg p-2 max-w-3/4 w-3/4 shadow-lg flex flex-col space-y-2"

  const goToTime = (time) => {
    const seconds = convertToSeconds(time)
    document.querySelector("video").currentTime = seconds
  }

  return (
    <div className={roleClass}>
      {role === "assistant" && (
        <IconHappyface className="text-[#89CFF0] h-6 w-6" />
      )}
      <div className={nameClass}>
        {start_time && (
          <Button
            onClick={() => goToTime(start_time)}
            size="sm"
            className="bg-white border border-gray-300 text-xs text-black self-start"
            variant="outline">
            <IconPlay className="mr-1 h-3 w-3" />
            {start_time}
          </Button>
        )}
        <div>{content}</div>
      </div>
    </div>
  )
}

export default ChatMessage
