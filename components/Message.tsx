import type React from "react"

interface MessageProps {
  sender: string
  text: string
}

const Message: React.FC<MessageProps> = ({ sender, text }) => {
  const isAI = sender === "ai"

  return (
    <div
      className={`message my-2 p-3 rounded-lg max-w-[80%] ${
        isAI ? "bg-blue-100 self-start" : "bg-green-100 self-end ml-auto"
      }`}
    >
      <div className="font-bold text-xs mb-1">{isAI ? "R3" : "You"}</div>
      <div className="text-gray-800">{text}</div>
    </div>
  )
}

export default Message
