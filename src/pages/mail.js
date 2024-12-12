'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
// import puzzles1 from "../styles/img/puzzles1.png"; // Ensure this path is correct
import puzzles5 from "../styles/img/puzzles5.png"; // Ensure this path is correct

export default function Mail({ onTaskComplete }) {
  // State variables
  const [answer, setAnswer] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(true); // Start dialog visibility
  const [timer, setTimer] = useState(0); // Main timer in seconds
  const [isTimerActive, setIsTimerActive] = useState(false); // Timer active flag
  const [showInterruption, setShowInterruption] = useState(false); // Interruption dialog visibility
  const [interruptionTimer, setInterruptionTimer] = useState(120); // 2-minute interruption timer
  const [retentionTime, setRetentionTime] = useState(null); // Retention time
  const [wordCount, setWordCount] = useState(0); // Live word count

  // Refs
  const interruptionEndTimeRef = useRef(null); // Timestamp when interruption ends
  const hasCalculatedRetentionTimeRef = useRef(false); // Flag to calculate retention time once
  const hasShownInterruptionRef = useRef(false); // Prevent multiple interruptions

  // Puzzle data (only one puzzle as per request)
  // const puzzle = {
  //   id: 1,
  //   image: puzzles1,
  //   options: ['97', '98', '99', '100'],
  //   correctAnswer: 0, // Index of the correct answer in options array
  // };
  const puzzle = {
    id: 1,
    image: puzzles5,
    options: ['6', '7', '8', '4'],
    correctAnswer: 2, // Index of the correct answer in options array
  };

  // Email question
  const question =
    'Write a concise and professional email to your manager requesting a leave application while clearly specifying your reason for doing so. Your submission will be evaluated on creativity, tone, formatting, and overall communication effectiveness.';

  // Handle Start button click
  const handleStart = () => {
    setIsDialogOpen(false);
    setIsTimerActive(true); // Start the main timer when task begins
  };

  // Main timer effect
  useEffect(() => {
    let interval;
    if (isTimerActive) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  // Update word count whenever the answer changes
  useEffect(() => {
    const words = answer.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [answer]);

  // Trigger interruption after 75 words
  useEffect(() => {
    if (isTimerActive && wordCount >= 75 && !hasShownInterruptionRef.current) {
      setShowInterruption(true);
      setIsTimerActive(false); // Pause the main timer
      hasShownInterruptionRef.current = true; // Ensure interruption shows only once
    }
  }, [isTimerActive, wordCount]);

  // Interruption timer effect
  useEffect(() => {
    let interval;
    if (showInterruption) {
      interval = setInterval(() => {
        setInterruptionTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleInterruptionSubmit(false, 120); // Not solved within time
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showInterruption]);

  // Handle puzzle answer selection
  const handlePuzzleAnswer = (selectedOptionIndex) => {
    const isCorrect = selectedOptionIndex === puzzle.correctAnswer;
    const timeTaken = 120 - interruptionTimer; // Time taken to solve puzzle
    handleInterruptionSubmit(isCorrect, timeTaken);
  };

  // Handle interruption submission
  const handleInterruptionSubmit = async (solved, timeTaken) => {
    setShowInterruption(false);
    interruptionEndTimeRef.current = Date.now(); // Record end time of interruption

    // Submit interruption data
    await submitInterruption(puzzle.id, timeTaken, solved);

    // Reset interruption timer
    setInterruptionTimer(120);

    if (solved) {
      setIsTimerActive(true); // Resume the main timer if puzzle is solved
    } else {
      // Optionally handle what happens if the puzzle wasn't solved
      // For example, you might want to end the task or notify the user
    }
  };

  // Submit interruption data via API
  const submitInterruption = async (puzzleId, timeTaken, solved) => {
    try {
      const response = await fetch('/api/save-mail-interruption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          puzzleId,
          timeTaken,
          solved,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      console.log('Interruption data saved successfully');

    } catch (error) {
      console.error('Error saving interruption data:', error);
    }
  };

  // Handle key press in Textarea to calculate retention time
  const handleKeyDown = (e) => {
    if (interruptionEndTimeRef.current && !hasCalculatedRetentionTimeRef.current) {
      const firstKeyPressTime = Date.now();
      const retention = (firstKeyPressTime - interruptionEndTimeRef.current) / 1000; // in seconds
      setRetentionTime(retention.toFixed(2));
      hasCalculatedRetentionTimeRef.current = true;
      setIsTimerActive(true); // Resume the main timer when user starts typing again
    }
  };

  // Handle Submit
  const handleSubmit = async () => {
    if (answer.trim()) {
      // Calculate total time taken
      const totalTime = timer;

      // Submit mail content via API
      try {
        const response = await fetch('/api/save-mail-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question,
            answer,
            timeTaken: totalTime,
            retention_time: retentionTime,
          }),
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.statusText}`);
        }

        console.log('Mail content saved successfully');

        if (onTaskComplete) {
          onTaskComplete();
        }

        // Reset all states
        setAnswer(''); // Clear the input field
        setTimer(0); // Reset timer
        setIsTimerActive(false); // Stop timer
        hasCalculatedRetentionTimeRef.current = false; // Reset retention time calculation
        setRetentionTime(null); // Reset retention time
        hasShownInterruptionRef.current = false; // Allow interruptions again if needed
      } catch (error) {
        console.error('Error saving mail content:', error);
        // alert('There was an error saving your response. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-800 text-white flex flex-col items-center justify-center p-4 relative">
      {/* Start Dialog */}
      <Dialog open={isDialogOpen}>
        <DialogContent className="bg-[#0E121B] text-white max-w-3xl w-full p-8 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-4xl mb-6">Welcome to the Email Task</DialogTitle>
            <DialogDescription className="text-lg mb-6">
              <p className="text-white mb-4">
                <strong>{question}</strong>
              </p>
              {/* <p className="text-white mb-4">
                You will be required to solve a puzzle interruption during this task. Please press the Start button to begin.
              </p> */}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleStart} className="mx-auto bg-white text-black py-4 text-lg">
              Start Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Interruption Dialog */}
      <Dialog open={showInterruption}>
        <DialogContent className="bg-[#0E121B] text-white max-w-3xl w-full p-8 rounded-2xl">
          <DialogHeader>
            {/* <DialogTitle className="text-3xl mb-4">Puzzle Interruption</DialogTitle> */}
            <DialogDescription className="text-lg mb-6">
              <p className="text-white mb-4">
                <strong>Solve the puzzle below within 2 minutes to continue your task.</strong>
              </p>
              <div className="flex flex-col items-center">
                {/* <Image
                  src={puzzle.image}
                  alt={`Puzzle ${puzzle.id}`}
                  width={300}
                  height={200}
                  className="mb-4"
                /> */}
                <div className="w-full max-w-md">
                  <Image
                    src={puzzle.image}
                    alt={`Puzzle ${puzzle.id}`}
                    width={500} // Increased width
                    height={300} // Increased height
                    className="mb-6 rounded-lg object-contain" // Added rounded corners and object-fit
                  />
                </div>
                {/* <div className="grid grid-cols-2 gap-4"> */}
                <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {puzzle.options.map((option, index) => (
                    <Button
                      key={index}
                      onClick={() => handlePuzzleAnswer(index)}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="text-center w-full">
              <p className="text-xl">
                Time Remaining: <span className="text-red-500">{interruptionTimer}</span> seconds
              </p>
              {/* Hide Submit button when time is not up */}
              {interruptionTimer === 0 && (
                <Button onClick={() => handleInterruptionSubmit(false, 120)} className="w-full py-4 mt-4 text-lg">
                  Submit
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <div className="font-sans rounded-3xl bg-background text-foreground p-8 flex items-center justify-center w-full max-w-4xl">
        <div className="w-full space-y-8 bg-white rounded-3xl border-solid border-4 border-black p-6">
          <header className="text-center">
            <h1 className="text-4xl font-bold mb-2 text-gradient">Email Task</h1>
            <p className="text-xl text-red-500 italic">Please read the question carefully and provide your answer.</p>
          </header>

          <main className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-2">Question</h2>
              <p className="text-lg">{question}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-2">Your Answer</h2>
              <Textarea
                placeholder="Type your answer here..."
                className="min-h-[30vh] text-lg bg-white text-black border-2 border-black resize-none"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Answer input"
              />
              <div className="mt-2 text-right text-lg">
                Word Count: {wordCount} / 150
              </div>
            </section>
          </main>

          <footer className="text-center">
            <Button
              className="w-32 max-w-xs text-lg py-6"
              disabled={wordCount < 150}
              onClick={handleSubmit}
            >
              Submit
            </Button>
            {wordCount < 150 && (
              <p className="text-red-500 mt-2">Please write at least 150 words before submitting.</p>
            )}
          </footer>
        </div>
      </div>

      {/* Timer Display */}
      {/* <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-4 py-2 rounded-md">
        <div className="text-xl font-bold">
          Time: {timer}s
        </div>
        {retentionTime !== null && (
          <div className="text-xl font-bold">
            Retention Time: {retentionTime}s
          </div>
        )}
      </div> */}
    </div>
  );
}
