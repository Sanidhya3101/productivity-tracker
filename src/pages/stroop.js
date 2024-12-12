'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import axios from 'axios';

// Define color mappings
const colors = ['red', 'green', 'blue', 'yellow'];
const colorMappings = { red: 'r', green: 'g', blue: 'b', yellow: 'y' };

// Define 20 Stroop Test questions
const questions = [
  { word: 'RED', color: 'blue' },
  { word: 'GREEN', color: 'red' },
  { word: 'BLUE', color: 'yellow' },
  { word: 'YELLOW', color: 'green' },
  { word: 'RED', color: 'green' },
  { word: 'GREEN', color: 'blue' },
  { word: 'BLUE', color: 'red' },
  { word: 'YELLOW', color: 'blue' },
  { word: 'RED', color: 'yellow' },
  { word: 'GREEN', color: 'red' },
  { word: 'BLUE', color: 'green' },
  { word: 'YELLOW', color: 'red' },
  { word: 'RED', color: 'blue' },
  { word: 'GREEN', color: 'yellow' },
  { word: 'BLUE', color: 'red' },
  { word: 'YELLOW', color: 'green' },
  { word: 'RED', color: 'blue' },
  { word: 'GREEN', color: 'red' },
  { word: 'BLUE', color: 'yellow' },
  { word: 'YELLOW', color: 'blue' },
];

export default function StroopTest({ onTaskComplete }) {
  
  // State variables
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [times, setTimes] = useState([]);
  const [responses, setResponses] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  
  // Interruption-related state
  const [showInterruption, setShowInterruption] = useState(false);
  const [interruptionInput, setInterruptionInput] = useState('');
  const [interruptionTimer, setInterruptionTimer] = useState(60); // 60 seconds
  const [interruptionEndedAt, setInterruptionEndedAt] = useState(null);
  const [retentionTime, setRetentionTime] = useState(null);
  const interruptionIntervalRef = useRef(null);

  const interruptionInputRef = useRef('');
  
  // Handle key presses for Stroop Test
  const handleKeyPress = (event) => {
    if (gameOver || !quizStarted || showInterruption) return;

    const selectedKey = event.key.toLowerCase();
    const correctKey = colorMappings[questions[currentQuestionIndex].color];

    const keyPressTime = Date.now();

    // Calculate retention_time for question 11 (index 10)
    let retention = null;
    let timeTaken;
    if (currentQuestionIndex === 10 && interruptionEndedAt) {
      retention = (keyPressTime - interruptionEndedAt) / 1000; // in seconds
      setRetentionTime(retention);
      timeTaken = retention; // Use retention_time as timeTaken for question 11
    } else {
      timeTaken = (keyPressTime - startTime) / 1000; // in seconds
    }

    // Update score if correct
    if (selectedKey === correctKey) {
      setScore((prevScore) => prevScore + 1);
    }

    // Create response object
    const responseObj = {
      questionId: currentQuestionIndex + 1,
      word: questions[currentQuestionIndex].word,
      color: questions[currentQuestionIndex].color,
      keyPressed: selectedKey,
      timeTaken: timeTaken.toFixed(2),
      isCorrect: selectedKey === correctKey,
    };

    // Add retention_time if applicable
    if (currentQuestionIndex === 10 && retention !== null) {
      responseObj.retention_time = retention.toFixed(2);
    }

    // Update responses and times
    setResponses((prevResponses) => [
      ...prevResponses,
      responseObj,
    ]);

    setTimes((prevTimes) => [...prevTimes, timeTaken]);

    // After 10th question, trigger interruption
    if (currentQuestionIndex === 9) {
      setShowInterruption(true);
    }

    // Move to next question or end game
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setStartTime(Date.now());

      // Reset retentionTime after question 11
      if (currentQuestionIndex === 10) {
        setRetentionTime(null);
      }
    } else {
      setGameOver(true);
    }
  };

  // Submit results to the server
  const submitResults = async () => {
    try {
      const response = await fetch('/api/save-stroop-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results: responses }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      console.log('Stroop test data saved successfully');

      // Notify parent component
      if (onTaskComplete) {
        onTaskComplete();
      }
    } catch (error) {
      console.error('Error saving Stroop test data:', error);
    }
  };

  // Trigger submitResults when game is over
  useEffect(() => {
    if (gameOver) {
      submitResults();
    }
  }, [gameOver]);

  // Add keydown event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentQuestionIndex, quizStarted, gameOver, showInterruption, retentionTime]);

  // Start the quiz
  const startQuiz = () => {
    setQuizStarted(true);
    setStartTime(Date.now());
  };

  // Render test results
  const renderResults = () => {
    const totalTime = times.reduce((acc, time) => acc + time, 0);
    const avgTime = (totalTime / times.length).toFixed(2);
    const accuracy = ((score / questions.length) * 100).toFixed(2);

    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Game Over</h1>
        <p className="text-xl mb-2">Your final score: {score} / {questions.length}</p>
        <p className="text-xl mb-2">Accuracy: {accuracy}%</p>
        <p className="text-xl mb-2">Total Time Taken: {totalTime.toFixed(2)} seconds</p>
        <p className="text-xl mb-2">Average Time per Question: {avgTime} seconds</p>
        {retentionTime && (
          <p className="text-xl mb-2">Retention Time: {retentionTime} seconds</p>
        )}
      </div>
    );
  };

  // Handle submission of the interruption task
  const handleInterruptionSubmit = async () => {
    setShowInterruption(false);
    const interruptionEndTime = Date.now();
    setInterruptionEndedAt(interruptionEndTime);
    setStartTime(interruptionEndTime); // Set start time to end of interruption

    console.log(interruptionInputRef.current); // Use the ref here

    try {
      // Send the interruption input to the API route
      const response = await axios.post('/api/save-stroop-interruption', {
        content: interruptionInputRef.current, // Use the ref here
      });
  
      if (response.status === 200) {
        console.log('Interruption data saved successfully.');
      } else {
        console.log('Failed to save interruption data.');
      }
    } catch (error) {
      console.error('Error saving interruption data:', error);
      console.log('An error occurred while saving interruption data.');
    }

    setInterruptionInput('');
    interruptionInputRef.current = ''; // Reset the ref as well
    setInterruptionTimer(60); // Reset timer for future interruptions if any
  };

  // Start the interruption timer when the dialog opens
  useEffect(() => {
    if (showInterruption) {
      interruptionIntervalRef.current = setInterval(() => {
        setInterruptionTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interruptionIntervalRef.current);
            handleInterruptionSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interruptionIntervalRef.current) {
        clearInterval(interruptionIntervalRef.current);
      }
    };
  }, [showInterruption]);

  return (
    <div className="min-h-screen bg-slate-800 text-white flex flex-col items-center justify-center p-4">
      <div className="font-sans rounded-3xl bg-background text-foreground p-8 flex items-center justify-center">
        <div className="w-full max-w-3xl space-y-8 rounded-2xl border-solid border-4 border-black p-4">
          {/* Header Section */}
          <header className="text-center">
            <h1 className="text-5xl font-bold mb-2 text-gradient">Stroop Test</h1>
            <p className="text-xl text-red-500 italic">
              Challenge your ability to process conflicting information.
              Focus on the color of the word and press the corresponding key.
            </p>
          </header>
          
          {/* Main Content */}
          <main className="space-y-8">
            {/* Instructions Section */}
            <section className="p-6 rounded-lg border-2 border-black">
              <h2 className="text-center text-2xl font-semibold mb-4">Instructions</h2>
              <p className="mb-4 text-lg text-center">Press the following keys for the colors</p>
              <ul className="grid grid-cols-2 gap-4 text-xl text-center">
                {Object.entries(colorMappings).map(([color, key]) => {
                  const textColorClass = {
                    red: 'text-red-500',
                    green: 'text-green-500',
                    blue: 'text-blue-500',
                    yellow: 'text-yellow-500',
                  }[color];

                  return (
                    <li key={color} className={`${textColorClass} font-bold`}>
                      <span className="uppercase">{key}</span> for {color}
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* Quiz Section */}
            <section className="text-center">
              {!quizStarted ? (
                // Start Quiz Button
                <Button 
                  onClick={() => {
                    setQuizStarted(true);
                    startQuiz();
                  }}
                  className="w-32 py-6 text-lg"
                >
                  Start Quiz
                </Button>
              ) : gameOver ? (
                // Display Results
                renderResults()
              ) : (
                // Current Question Display
                <div>
                  <p className="text-xl mb-6">Press the key corresponding to the color of the word!</p>
                  <div
                    className="text-6xl font-bold mb-8"
                    style={{ color: questions[currentQuestionIndex].color }}
                  >
                    {questions[currentQuestionIndex].word}
                  </div>
                </div>
              )}
            </section>
          </main>

          {/* Interruption Dialog */}
          <Dialog open={showInterruption}>
            <DialogContent className="bg-[#0E121B] text-white max-w-3xl w-full p-8 rounded-2xl">
              <DialogHeader>
                {/* <DialogTitle className="text-4xl mb-6">Interruption Task</DialogTitle> */}
                <DialogDescription className="text-lg mb-6">
                  <p className=" text-white mb-4">
                    <strong>List as many unusual objects related to a "bucket" as you can.</strong>
                  </p>
                  <p className="text-white mb-4">
                    You have <strong>1 minute</strong>. Separate each object with a comma.
                  </p>
                  <textarea
                    className="w-full p-4 rounded-md border border-gray-500 bg-[#181B25] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-lg"
                    rows="6"
                    value={interruptionInput}
                    onChange={(e) => {
                      setInterruptionInput(e.target.value);
                      interruptionInputRef.current = e.target.value;
                    }}
                    placeholder="List your unusual uses here..."
                  />
                </DialogDescription>
              </DialogHeader>
              
              {/* Timer Display */}
              <div className="text-center mb-6">
                {interruptionTimer > 0 ? (
                  <p className="text-xl">
                  Time Remaining: <span className="text-red-500">{interruptionTimer}</span> seconds
                  </p>
                ) : (
                  <p className="text-xl">Time's up!</p>
                )}
              </div>
              
              {/* Submit Button */}
              <DialogFooter>
                {interruptionTimer === 0 && (
                  <Button onClick={handleInterruptionSubmit} className="w-full py-4 text-lg">
                    Submit
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

