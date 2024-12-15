'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';

// Import puzzle images
import puzzles8 from "../styles/img/puzzles8.png";
import puzzles9 from "../styles/img/puzzles9.png";
import puzzles1 from "../styles/img/puzzles1.png";

export default function Mail({ onTaskComplete }) {
  // State variables
  const [answer, setAnswer] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(true); // Start dialog visibility
  const [timer, setTimer] = useState(0); // Main timer in seconds
  const [isTimerActive, setIsTimerActive] = useState(false); // Timer active flag
  const [showInterruption, setShowInterruption] = useState(false); // Interruption dialog visibility
  const [interruptionTimer, setInterruptionTimer] = useState(90); // 90-second timer per puzzle
  const [retentionTime, setRetentionTime] = useState(null); // Retention time
  const [wordCount, setWordCount] = useState(0); // Live word count
  const [showPreInterruption, setShowPreInterruption] = useState(false); // Pre-interruption dialog visibility
  const [preInterruptionTimer, setPreInterruptionTimer] = useState(30); // 30-second timer for pre-interruption
  const [timeAfterIntervention, setTimeAfterIntervention] = useState(null); // New State Variable

  // Current puzzle index
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);

  // Refs
  const interruptionEndTimeRef = useRef(null); // Timestamp when interruption ends
  const hasCalculatedRetentionTimeRef = useRef(false); // Flag to calculate retention time once
  const hasShownInterruptionRef = useRef(false); // Prevent multiple interruptions

  // Define multiple puzzles
  const puzzles = [
    {
      id: 5,
      image: puzzles8,
      options: ['206', '410', '96', '144'],
      correctAnswer: 1, // index of correct answer
    },
    {
      id: 6,
      image: puzzles9,
      options: ['14', '12', '17', '13'],
      correctAnswer: 2,
    },
    {
      id: 7,
      image: puzzles1,
      options: ['96', '64', '3', '97'],
      correctAnswer: 3,
    }
  ];

  const question = "Draft a concise and professional email to your manager requesting approval to attend a specific training program or conference. Clearly specify how this opportunity will enhance your skills and contribute to the team's success. Your submission will be evaluated on creativity, tone, formatting, and overall communication effectiveness."

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

  // Trigger pre-interruption dialog at halfway mark (wordCount >=50)
  useEffect(() => {
    if (isTimerActive && wordCount >= 50 && !hasShownInterruptionRef.current && !showPreInterruption) {
      setShowPreInterruption(true);
      setIsTimerActive(false); // Pause the main timer
      setPreInterruptionTimer(30); // Initialize pre-interruption timer
    }
  }, [isTimerActive, wordCount, showPreInterruption]);

  // Pre-interruption timer effect
  useEffect(() => {
    let interval;
    if (showPreInterruption) {
      interval = setInterval(() => {
        setPreInterruptionTimer(prev => {
          const newVal = prev - 1;
          if (newVal <= 0) {
            clearInterval(interval);
            setShowPreInterruption(false);
            setShowInterruption(true);
            hasShownInterruptionRef.current = true; // Ensure interruption shows only once
            setCurrentPuzzleIndex(0); // Start with the first puzzle
            setInterruptionTimer(90); // Reset timer for first puzzle
            return 0;
          }
          return newVal;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showPreInterruption]);

  // Interruption timer effect for the current puzzle
  useEffect(() => {
    let interval;
    if (showInterruption) {
      interval = setInterval(() => {
        setInterruptionTimer(prev => {
          const newVal = prev - 1;
          if (newVal < 0) {
            clearInterval(interval);
            handlePuzzleTimeout();
            return 0;
          }
          if (newVal === 0) {
            // Time ran out exactly at this moment
            clearInterval(interval);
            handlePuzzleTimeout();
            return 0;
          }
          return newVal;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showInterruption, currentPuzzleIndex]);

  // Handle puzzle answer selection
  const handlePuzzleAnswer = async (selectedOptionIndex) => {
    const currentPuzzle = puzzles[currentPuzzleIndex];
    // Calculate time taken at the moment of answering
    const timeTaken = 90 - interruptionTimer; 
    const isCorrect = selectedOptionIndex === currentPuzzle.correctAnswer;

    await submitInterruption(currentPuzzle.id, timeTaken, isCorrect);
    moveToNextPuzzle();
  };

  // If puzzle times out
  const handlePuzzleTimeout = async () => {
    const currentPuzzle = puzzles[currentPuzzleIndex];
    const timeTaken = 90; // Since time ran out, full 90 seconds used
    const solved = false;

    await submitInterruption(currentPuzzle.id, timeTaken, solved);
    moveToNextPuzzle();
  };

  // Move to next puzzle or end interruption
  const moveToNextPuzzle = () => {
    if (currentPuzzleIndex < puzzles.length - 1) {
      // Move to next puzzle
      setCurrentPuzzleIndex(currentPuzzleIndex + 1);
      setInterruptionTimer(90); // Reset timer for the next puzzle
    } else {
      // All puzzles done
      endInterruption();
    }
  };

  // End the interruption and prepare for main task resumption
  const endInterruption = () => {
    setShowInterruption(false);
    interruptionEndTimeRef.current = Date.now(); // Record end time of interruption
    // The main timer will resume when the user starts typing again.
  };

  // Submit interruption data via API for each puzzle
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

  // Handle key press in Textarea to calculate retention time and resume main timer
  const handleKeyDown = (e) => {
    if (interruptionEndTimeRef.current && !hasCalculatedRetentionTimeRef.current) {
      const firstKeyPressTime = Date.now();
      const retention = (firstKeyPressTime - interruptionEndTimeRef.current) / 1000; // in seconds
      setRetentionTime(retention.toFixed(2));
      hasCalculatedRetentionTimeRef.current = true;
      setIsTimerActive(true); // Resume the main timer when user starts typing again
    }
  };

  // Handle Submit of the main task
  const handleSubmit = async () => {
    if (answer.trim()) {
      // Calculate total time taken
      const totalTime = timer;

      // Calculate time after intervention if interruption occurred
      let timeAfterIntervention = null;
      if (interruptionEndTimeRef.current) {
        const submitTime = Date.now();
        timeAfterIntervention = (submitTime - interruptionEndTimeRef.current) / 1000; // in seconds
      }

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
            time_after_intervention: timeAfterIntervention, // New Field
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
        setAnswer(''); 
        setTimer(0); 
        setIsTimerActive(false); 
        hasCalculatedRetentionTimeRef.current = false; 
        setRetentionTime(null); 
        hasShownInterruptionRef.current = false; 
        interruptionEndTimeRef.current = null; // Reset interruption end time
        setTimeAfterIntervention(null); // Reset the new state
      } catch (error) {
        console.error('Error saving mail content:', error);
      }
    }
  };

  const currentPuzzle = puzzles[currentPuzzleIndex];

  return (
    <div className="min-h-screen bg-slate-800 text-white flex flex-col items-center justify-center p-4 relative">
      {/* Start Dialog */}
      <Dialog open={isDialogOpen}>
        <DialogContent className="bg-[#0E121B] text-white max-w-3xl w-full p-8 rounded-2xl">
          <DialogHeader>
            <h2 className="text-4xl mb-6">Welcome to the Email Task</h2>
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

      {/* Pre-Interruption Dialog */}
      <Dialog open={showPreInterruption}>
        <DialogContent className="bg-[#0E121B] text-red-500 max-w-lg w-full p-6 pt-8 rounded-b-none rounded-t-2xl border-2 border-red-500 fixed top-40 left-1/2 transform -translate-x-1/2">
          <DialogHeader>
            <h2 className="text-3xl mb-4 text-center">Upcoming Distractive Task</h2>
          </DialogHeader>
          <DialogDescription className="text-lg">
            <p className="mb-4 text-center text-white">
              You are about to be shown a distracting task. Please make a mental note of the current task you are doing to help you resume it effectively.
            </p>
            <p className="text-center text-white">Time Remaining: <span className="text-red-500">{preInterruptionTimer}</span> seconds</p>
          </DialogDescription>
          {/* No DialogFooter to prevent any buttons */}
        </DialogContent>
      </Dialog>


      {/* Interruption Dialog (Show one puzzle at a time) */}
      <Dialog open={showInterruption}>
        <DialogContent className="bg-[#0E121B] text-white max-w-3xl w-full p-8 rounded-2xl">
          <DialogHeader>
            <DialogDescription className="text-lg mb-6">
              <p className="text-white mb-4">
                <strong>Solve the puzzle within 90 seconds!</strong>
              </p>
              <div className="flex flex-col items-center space-y-6">
                {currentPuzzle && (
                  <div className="w-full max-w-md">
                    <Image
                      src={currentPuzzle.image}
                      alt={`Puzzle ${currentPuzzle.id}`}
                      width={500}
                      height={300}
                      className="mb-6 rounded-lg object-contain"
                    />
                    <div className="w-full max-w-md grid grid-cols-2 gap-4">
                      {currentPuzzle.options.map((option, oIndex) => (
                        <Button
                          key={oIndex}
                          onClick={() => handlePuzzleAnswer(oIndex)}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="text-center w-full">
              <p className="text-xl">
                Time Remaining: <span className="text-red-500">{interruptionTimer}</span> seconds
              </p>
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
                disabled={showPreInterruption || showInterruption}
              />
              <div className="mt-2 text-right text-lg">
                Word Count: {wordCount} / 100
              </div>
            </section>
          </main>

          <footer className="text-center">
            <Button
              className="w-32 max-w-xs text-lg py-6"
              disabled={wordCount < 100 || showPreInterruption || showInterruption}
              onClick={handleSubmit}
            >
              Submit
            </Button>
            {wordCount < 100 && (
              <p className="text-red-500 mt-2">Please write at least 100 words before submitting.</p>
            )}
          </footer>
        </div>
      </div>
    </div>
  );
}
