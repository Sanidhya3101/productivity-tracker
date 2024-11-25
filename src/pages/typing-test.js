import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, RotateCcw } from "lucide-react"

export default function TypingTest({ onTaskComplete }) {
  const [text] = useState(
    "the quick brown fox jumps over the lazy dog while the mighty lion sleeps peacefully beneath the warm summer sun and gentle breeze rustles through the tall grass creating a serene atmosphere in the wild"
  )
  const [input, setInput] = useState("")
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [isActive, setIsActive] = useState(false)
  const [errorCount, setErrorCount] = useState(0)
  const inputRef = useRef(null)

  const words = text.trim().split(/\s+/).length
  const characters = text.length

  const accuracy = endTime
    ? (((input.length - errorCount) / input.length) * 100).toFixed(1)
    : null

  const wpm = endTime
    ? Math.round((input.trim().split(/\s+/).length / ((endTime - startTime) / 1000 / 60)))
    : null

  useEffect(() => {
    if (input.length === 1 && !startTime) {
      setStartTime(Date.now())
      setIsActive(true)
    }

    if (input.length > 0) {
      // Update error count
      let errors = 0
      for (let i = 0; i < input.length; i++) {
        if (input[i] !== text[i]) {
          errors++
        }
      }
      setErrorCount(errors)
    } else {
      setErrorCount(0)
    }

    if (input === text) {
      setEndTime(Date.now())
      setIsActive(false)

      // Notify parent component that the task is complete
      if (onTaskComplete) {
        onTaskComplete()
      }
    }
  }, [input, startTime, text, onTaskComplete])

  const reset = () => {
    setInput("")
    setStartTime(null)
    setEndTime(null)
    setIsActive(false)
    setErrorCount(0)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
      <Card className="w-full max-w-5xl p-10 space-y-10">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Typing Test</h1>
          <Button variant="outline" size="icon" onClick={reset}>
            <RotateCcw className="h-8 w-8" />
          </Button>
        </div>

        {/* Typing Area */}
        <div className="relative border rounded-md p-8">
          {/* Displayed Text */}
          <div
            className="font-mono text-2xl whitespace-pre-wrap break-words pointer-events-none text-gray-400 select-none leading-relaxed"
            aria-hidden="true"
          >
            {text}
          </div>
          {/* User Input Overlay */}
          <div className="absolute top-8 left-8 font-mono text-2xl whitespace-pre-wrap break-words pointer-events-none leading-relaxed">
            {input.split("").map((char, i) => {
              const expectedChar = text[i]
              let className = ""
              if (char === expectedChar) {
                className = "text-green-500"
              } else {
                className = "text-red-500"
              }
              return (
                <span key={i} className={className}>
                  {char}
                </span>
              )
            })}
          </div>
          {/* Invisible Input Field */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              const value = e.target.value
              if (value.length <= text.length && !endTime) {
                setInput(value)
              }
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-default"
            autoFocus
            onPaste={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>

        {/* Statistics */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6" />
            <span className="text-2xl font-bold">
              {startTime && !endTime
                ? ((Date.now() - startTime) / 1000).toFixed(1)
                : endTime
                ? ((endTime - startTime) / 1000).toFixed(1)
                : "0.0"}
              s
            </span>
          </div>

          {endTime && (
            <div className="flex gap-6 text-2xl font-bold">
              <div>
                <span>{wpm}</span> WPM
              </div>
              <div>
                <span>{accuracy}%</span> Accuracy
              </div>
              <div>
                <span>{errorCount}</span> Errors
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="h-3 bg-primary/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{
              width: `${(input.length / text.length) * 100}%`,
            }}
          />
        </div>
      </Card>
    </div>
  )
}
