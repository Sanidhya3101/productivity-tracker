import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, RotateCcw } from "lucide-react";

export default function TypingTest({ onTaskComplete }) {
  const [text] = useState(
    "the quick brown fox jumps over the lazy dog while the mighty lion sleeps peacefully beneath the warm summer sun and gentle breeze rustles through the tall grass creating a serene atmosphere in the wild"
  );
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const inputRef = useRef(null);

  const words = text.trim().split(/\s+/).length;

  const accuracy = endTime
    ? (((text.length - totalErrors) / input.length) * 100).toFixed(1)
    : null;

  const wpm = endTime
    ? Math.round(
        text.trim().split(/\s+/).length / (((endTime - startTime) / 1000) / 60)
      )
    : null;

  // Function to submit statistics to the server
  const submitStatistics = async () => {
    const data = {
      wpm,
      accuracy,
      totalErrors,
      timeTaken: ((endTime - startTime) / 1000).toFixed(1),
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/save-typing-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      // Check if the response is OK
      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      console.log('Typing test statistics saved successfully');

      // Proceed to the next task
      if (onTaskComplete) {
        onTaskComplete();
      }
    } catch (error) {
      console.error('Error saving statistics:', error);
      // Optionally handle the error (e.g., show a message to the user)
    }
  };

  // Trigger statistics submission after `endTime` is set
  useEffect(() => {
    if (endTime) {
      submitStatistics();
    }
  }, [endTime]);

  useEffect(() => {
    if (input.length === 1 && !startTime) {
      setStartTime(Date.now());
      setIsActive(true);
    }

    if (input.length > 0) {
      // Update error count
      let errors = 0;
      for (let i = 0; i < input.length; i++) {
        if (input[i] !== text[i]) {
          errors++;
        }
      }
      setErrorCount(errors);
    } else {
      setErrorCount(0);
    }

    // End test when input length matches text length
    if (input.length === text.length) {
      setEndTime(Date.now());
      setIsActive(false);

    }
  }, [input, startTime, text]);

  const reset = () => {
    setInput("");
    setStartTime(null);
    setEndTime(null);
    setIsActive(false);
    setErrorCount(0);
    setTotalErrors(0);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="min-h-screen bg-slate-800 text-white p-8 flex items-center justify-center">
    {/* <div className="min-h-screen bg-background p-8 flex items-center justify-center">
      <Card className="w-full max-w-4xl p-10 space-y-10"> */}
        {/* Header */}
      <Card className="w-full max-w-5xl p-10 space-y-10">
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
          {/* <div className="absolute top-8 left-8 right-8 bottom-8 font-mono text-2xl whitespace-pre-wrap break-words pointer-events-none leading-relaxed"> */}
          {/* <div className="absolute top-8 left-8 font-mono text-2xl whitespace-pre-wrap break-words pointer-events-none leading-relaxed"> */}
          <div className="absolute inset-0 p-8 font-mono text-2xl whitespace-pre-wrap break-words pointer-events-none leading-relaxed">
            {[...text].map((expectedChar, i) => {
              const char = input[i];
              let className = "";
              if (char == null) {
                className = "";
              } else if (char === expectedChar) {
                className = "text-green-400";
              } else {
                className = "text-red-600";
              }
              return (
                <span key={i} className={className}>
                  {expectedChar}
                </span>
              );
            })}
          </div>
          {/* Invisible Input Field */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= text.length && !endTime) {
                setInput(value);
                // Check for errors on new character
                const position = value.length - 1;
                if (position >= 0) {
                  if (
                    value[position] !== text[position] &&
                    value.length > input.length
                  ) {
                    setTotalErrors((prev) => prev + 1);
                  }
                }
              }
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-default"
            autoFocus
            onPaste={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
            onKeyDown={(e) => {
              if (e.key === "Backspace") {
                // Do not count backspace as a keystroke
                return;
              }
            }}
          />
        </div>

        {/* Statistics */}
        {/* <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
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
            <div className="flex flex-col md:flex-row gap-6 text-2xl font-bold">
              <div>
                <span>{wpm}</span> WPM
              </div>
              <div>
                <span>{accuracy}%</span> Accuracy
              </div>
              <div>
                <span>{totalErrors}</span> Errors
              </div>
            </div>
          )}
        </div> */}

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
  );
}
