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
import axios from 'axios';

const maze = [
  ["D", "V", "D", "C", "A", "S", "V", "T", "J", "N", "N", "U", "L", "D", "I", "Y", "H", "Y"],
  ["A", "U", "I", "T", "C", "O", "C", "U", "H", "B", "I", "S", "X", "D", "N", "C", "O", "T"],
  ["T", "S", "R", "Z", "E", "R", "V", "O", "X", "X", "C", "E", "D", "H", "T", "R", "R", "U"],
  ["A", "M", "E", "P", "K", "C", "E", "F", "L", "Q", "H", "R", "A", "U", "E", "E", "I", "M"],
  ["T", "A", "C", "A", "E", "O", "H", "A", "E", "L", "E", "J", "X", "M", "R", "A", "Z", "O"],
  ["V", "R", "T", "Y", "Y", "Z", "P", "N", "T", "A", "E", "L", "I", "A", "F", "T", "O", "N"],
  ["O", "B", "I", "R", "B", "L", "S", "T", "O", "I", "T", "G", "S", "N", "A", "I", "N", "E"],
  ["S", "L", "O", "N", "O", "O", "F", "E", "K", "L", "V", "U", "E", "D", "C", "V", "T", "Y"],
  ["U", "E", "N", "P", "A", "Y", "X", "X", "V", "V", "O", "I", "R", "L", "E", "I", "A", "A"],
  ["I", "N", "T", "E", "R", "A", "C", "T", "I", "O", "N", "G", "T", "E", "M", "T", "L", "U"],
  ["H", "R", "B", "C", "D", "Y", "T", "I", "M", "E", "X", "I", "Y", "Y", "S", "Y", "H", "J"],
  ["O", "T", "M", "O", "U", "S", "E", "N", "V", "E", "R", "T", "I", "C", "A", "L", "F", "F"]
];

const wordsToFind = [
  "MOUSE", "USER"
];

function WordMaze({ onTaskComplete }) {
  // Selection and Found Words State
  const [selectedCells, setSelectedCells] = useState([]);
  const [foundWords, setFoundWords] = useState([]);

  // Timer State
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  // Interruption-related State
  const [showInterruption, setShowInterruption] = useState(false);
  const [interruptionInput, setInterruptionInput] = useState('');
  const [interruptionTimer, setInterruptionTimer] = useState(5); // 60 seconds
  const interruptionIntervalRef = useRef(null);
  const interruptionInputRef = useRef('');

  // Timing Refs and States
  const interruptionEndTimeRef = useRef(null); // Records when interruption ends
  const nextWordHasRetentionTimeRef = useRef(false); // Flag to calculate retention time for next word
  const pendingRetentionTimeRef = useRef(null); // Stores the calculated retention time
  const [lastWordFoundTime, setLastWordFoundTime] = useState(0); // Tracks the timer value when the last word was found

  // Start the main timer and reset all states
  const startTimer = () => {
    setIsTimerActive(true);
    setIsDialogOpen(false);
    setSelectedCells([]);
    setFoundWords([]);
    setTimer(0);
    interruptionEndTimeRef.current = null;
    nextWordHasRetentionTimeRef.current = false;
    pendingRetentionTimeRef.current = null;
    setLastWordFoundTime(0);
  };

  // Main Timer Effect
  useEffect(() => {
    let interval;
    if (isTimerActive) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  // Interruption Timer Effect
  useEffect(() => {
    if (showInterruption) {
      setIsTimerActive(false); // Pause the main timer

      interruptionIntervalRef.current = setInterval(() => {
        setInterruptionTimer(prev => {
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

  // Handle Interruption Submission
  const handleInterruptionSubmit = async () => {
    setShowInterruption(false);
    const interruptionEnd = Date.now();
    interruptionEndTimeRef.current = interruptionEnd; // Record interruption end time
    nextWordHasRetentionTimeRef.current = true; // Flag to calculate retention time for next word

    // Submit interruption data
    await submitInterruption();

    // Reset interruption states
    setInterruptionInput('');
    interruptionInputRef.current = '';
    setInterruptionTimer(60); // Reset interruption timer
    setIsTimerActive(true); // Resume the main timer
  };

  // Submit Interruption Data
  const submitInterruption = async () => {
    try {
      const response = await axios.post('/api/save-word-search-interruption', {
        content: interruptionInputRef.current,
      });

      if (response.status === 200) {
        console.log('Interruption data saved successfully.');
      } else {
        console.log('Failed to save interruption data.');
      }
    } catch (error) {
      console.error('Error saving interruption data:', error);
    }
  };

  // Submit Results to API
  const submitResults = async (foundWordsList) => {
    const data = {
      foundWords: foundWordsList.map(({ word, timeTaken, retention_time }) => ({
        word,
        timeTaken,
        retention_time
      }))
      // No separate retention_time field
    };

    try {
      const response = await fetch('/api/save-word-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      console.log('Word search data saved successfully');

      if (onTaskComplete) {
        onTaskComplete();
      }
    } catch (error) {
      console.error('Error saving word search data:', error);
    }
  };

  // Effect to Submit Results when All Words are Found
  useEffect(() => {
    if (foundWords.length === wordsToFind.length) {
      setIsTimerActive(false);
      submitResults(foundWords);
    }
  }, [foundWords]);

  // Trigger Interruption at Halfway Point
  useEffect(() => {
    const halfWords = Math.floor(wordsToFind.length / 2);
    if (foundWords.length === halfWords && !showInterruption) { // Ensure interruption not already shown
      setShowInterruption(true);
    }
  }, [foundWords]);

  // Handle Cell Click
  const handleCellClick = (row, col) => {
    const cellId = `${row}-${col}`;

    if (selectedCells.includes(cellId)) return;

    if (selectedCells.length === 0) {
      setSelectedCells([cellId]);

      // Record the first letter click time
      if (nextWordHasRetentionTimeRef.current && pendingRetentionTimeRef.current === null) {
        const currentTime = Date.now();
        const retention = (currentTime - interruptionEndTimeRef.current) / 1000; // in seconds
        pendingRetentionTimeRef.current = retention;
        nextWordHasRetentionTimeRef.current = false;
      } else if (foundWords.length === 0 && lastWordFoundTime === 0) {
        // If the game just started
        setLastWordFoundTime(timer);
      }

      return;
    }

    const [lastRow, lastCol] = selectedCells[selectedCells.length - 1].split('-').map(Number);
    const isAdjacent = (Math.abs(lastRow - row) <= 1 && Math.abs(lastCol - col) <= 1);

    if (isAdjacent) {
      setSelectedCells([...selectedCells, cellId]);
    }
  };

  // Check if a Cell is Selected
  const isCellSelected = (row, col) => selectedCells.includes(`${row}-${col}`);

  // Check if a Cell is Part of a Found Word
  const isCellPartOfFoundWord = (row, col) =>
    foundWords.some(({ cells }) => cells.includes(`${row}-${col}`));

  // Get the Currently Selected Word
  const getSelectedWord = () => {
    return selectedCells
      .map((cellId) => {
        const [row, col] = cellId.split('-').map(Number);
        return maze[row][col];
      })
      .join('');
  };

  // Handle Key Press (Enter)
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      const selectedWord = getSelectedWord().toUpperCase();
      if (wordsToFind.includes(selectedWord) && !foundWords.some(word => word.word === selectedWord)) {
        let timeTaken = timer - lastWordFoundTime; // Calculate time taken for this word

        let retention_time = null;
        if (pendingRetentionTimeRef.current !== null) {
          retention_time = pendingRetentionTimeRef.current.toFixed(2);
          pendingRetentionTimeRef.current = null; // Reset after using
        }

        setFoundWords([
          ...foundWords,
          { word: selectedWord, cells: [...selectedCells], timeTaken: timeTaken.toFixed(2), retention_time }
        ]);

        setLastWordFoundTime(timer); // Update the last found time
      }
      setSelectedCells([]);
    }
  };

  // Add Event Listener for Key Press
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [selectedCells, foundWords, timer]);

  return (
    <div className="min-h-screen bg-slate-800 text-white flex flex-col items-center justify-center p-4">
      <div className="font-sans rounded-3xl bg-background text-foreground p-8 flex items-center justify-center">
        <div className="w-full max-w-3xl space-y-8 rounded-2xl border-solid border-4 border-black p-4">
          {/* Header Section */}
          <header className="text-center">
            <h1 className="text-5xl font-bold mb-2 text-gradient">Word Maze Game</h1>
            <p className="text-xl text-red-500 italic">
              Find all the hidden words in the grid. Select letters by clicking on adjacent cells and press Enter to check.
            </p>
          </header>
          
          {/* Main Content */}
          <main className="space-y-8">
            {/* Instructions Dialog */}
            <Dialog open={isDialogOpen}>
              <DialogContent className="bg-[#0E121B] text-white max-w-3xl w-full p-8 rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-4xl mb-6">Welcome to Word Maze</DialogTitle>
                  <DialogDescription className="text-lg mb-6">
                    <p className=" text-white mb-4">
                      <strong>Select letters to form words.</strong>
                    </p>
                    <p className="text-white mb-4">
                      You have <strong>unlimited time</strong> to find all the words. Press the Start button to begin.
                    </p>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button onClick={startTimer} className="mx-auto bg-white text-black py-4 text-lg">
                    Start Quiz
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Timer Display */}
            {/* <div className="flex justify-between items-center w-full mb-4 p-2">
              <div className="text-xl font-bold">
                Time: {timer}s
              </div>
            </div> */}

            {/* Word Grid */}
            <div className="flex flex-col items-center">
              <div className="grid gap-1 p-4 border border-black bg-slate-500"
                style={{
                  gridTemplateColumns: `repeat(${maze[0].length}, 2rem)`,
                  gridTemplateRows: `repeat(${maze.length}, 2rem)`,
                }}
              >
                {maze.map((row, rowIndex) =>
                  row.map((letter, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      className={`bg-black w-8 h-8 flex items-center justify-center text-lg font-bold cursor-pointer ${
                        isCellPartOfFoundWord(rowIndex, colIndex)
                          ? "text-yellow-500"
                          : isCellSelected(rowIndex, colIndex)
                          ? "text-red-500"
                          : "text-white"
                      }`}
                    >
                      {letter}
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4">
                <h2 className="text-lg text-center font-bold mb-2">Words to Find:</h2>
                <ul className="grid grid-cols-5 gap-6 border border-solid border-black bg-slate-500 p-1">
                  {wordsToFind.map((word, index) => {
                    const foundWord = foundWords.find(({ word: found }) => found === word);
                    return (
                      <li
                        key={index}
                        className={`text-center font-bold ${foundWord ? "text-green-500" : ""}`}
                      >
                        {word}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </main>

          {/* Interruption Dialog */}
          <Dialog open={showInterruption}>
            <DialogContent className="bg-[#0E121B] text-white max-w-3xl w-full p-8 rounded-2xl">
              <DialogHeader>
                <DialogDescription className="text-lg mb-6">
                  <p className="text-white mb-4">
                    <strong>List as many unusual uses related to a "bucket" as you can.</strong>
                  </p>
                  <p className="text-white mb-4">
                    You have <strong>{interruptionTimer}</strong> seconds. Separate each use with a comma.
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
                    disabled={interruptionTimer === 0}
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

export default WordMaze;
