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

// Import puzzle images
import puzzles5 from "../styles/img/puzzles5.png";
import puzzles6 from "../styles/img/puzzles6.png";
import puzzles7 from "../styles/img/puzzles7.png";

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

  // Define multiple puzzles
  const puzzles = [
    {
      id: 5,
      image: puzzles5,
      options: ['6', '7', '8', '4'],
      correctAnswer: 2, // Index of the correct answer in options array
    },
    {
      id: 6,
      image: puzzles6,
      options: ['2', '5', '9', '3'],
      correctAnswer: 1,
    },
    {
      id: 7,
      image: puzzles7,
      options: ['10', '11', '12', '9'],
      correctAnswer: 0,
    }
  ];

  // Track user answers for the puzzles (null if not chosen yet)
  const [userAnswers, setUserAnswers] = useState(Array(puzzles.length).fill(null));

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
            handleInterruptionSubmit(false); // Not solved within time
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
  const handlePuzzleAnswer = (puzzleIndex, selectedOptionIndex) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[puzzleIndex] = selectedOptionIndex;
    setUserAnswers(updatedAnswers);
  };

  // Handle interruption submission
  const handleInterruptionSubmit = async (solvedManually = true) => {
    setShowInterruption(false);
    interruptionEndTimeRef.current = Date.now(); // Record end time of interruption

    const timeTaken = 120 - interruptionTimer; // Time taken to solve puzzle set

    // Determine correctness of each puzzle
    const puzzleResults = puzzles.map((puzzle, index) => {
      const chosenAnswer = userAnswers[index];
      const isCorrect = solvedManually && chosenAnswer === puzzle.correctAnswer;
      return {
        puzzleId: puzzle.id,
        timeTaken: timeTaken, // same time taken for all, or you could differentiate if needed
        solved: isCorrect
      };
    });

    // Submit interruption data
    await submitInterruption(puzzleResults);

    // Reset interruption timer and user answers
    setInterruptionTimer(120);
    setUserAnswers(Array(puzzles.length).fill(null));

    // If at least one puzzle is solved correctly, resume timer. 
    // Or if you require all to be correct to continue, handle that logic accordingly.
    // Here, we'll allow resuming if all are correct (you can change this as needed).
    const allCorrect = puzzleResults.every(r => r.solved === true);
    if (allCorrect) {
      setIsTimerActive(true); // Resume the main timer if puzzle set is solved correctly
    } else {
      // If not solved, you can decide what to do. Here we just resume as per original logic.
      setIsTimerActive(true);
    }
  };

  // Submit interruption data via API
  const submitInterruption = async (puzzleResults) => {
    try {
      const response = await fetch('/api/save-mail-interruption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          puzzles: puzzleResults,
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
            <DialogDescription className="text-lg mb-6">
              <p className="text-white mb-4">
                <strong>Solve the following 3 puzzles within 2 minutes to continue your task.</strong>
              </p>
              <div className="flex flex-col items-center space-y-6">
                {puzzles.map((puzzle, pIndex) => (
                  <div key={puzzle.id} className="w-full max-w-md border-b border-gray-600 pb-4">
                    <Image
                      src={puzzle.image}
                      alt={`Puzzle ${puzzle.id}`}
                      width={500}
                      height={300}
                      className="mb-6 rounded-lg object-contain"
                    />
                    <div className="w-full max-w-md grid grid-cols-2 gap-4">
                      {puzzle.options.map((option, oIndex) => (
                        <Button
                          key={oIndex}
                          onClick={() => handlePuzzleAnswer(pIndex, oIndex)}
                          className={`${
                            userAnswers[pIndex] === oIndex ? 'bg-blue-700' : 'bg-blue-500'
                          } hover:bg-blue-700 text-white font-bold py-2 px-4 rounded`}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="text-center w-full">
              <p className="text-xl">
                Time Remaining: <span className="text-red-500">{interruptionTimer}</span> seconds
              </p>
              <Button onClick={() => handleInterruptionSubmit(true)} className="w-full py-4 mt-4 text-lg">
                Submit All Puzzles
              </Button>
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
    </div>
  );
}
