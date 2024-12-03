import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  "INTERACTION", "TECHNOLOGY", "HORIZONTAL",
  "DIRECTION", "VERTICAL", "FEATURES", "KEYBOARD",  "MARBLE",
  "HUMAN", "MONEY", "NICHE", "MOUSE", "USER", "DATA", "TEXT"
];

function WordMaze({ onTaskComplete }) {
  const [selectedCells, setSelectedCells] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  // Start the timer when the start button is clicked
  const startTimer = () => {
    setIsTimerActive(true);
    setIsDialogOpen(false);
  };

  // Update the timer every second
  useEffect(() => {
    let interval;
    if (isTimerActive) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  const submitResults = async (totalTime, foundWordsList) => {
    const data = { totalTime, foundWords: foundWordsList };

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

  // Stop the timer when all words have been found
  useEffect(() => {
    if (foundWords.length === wordsToFind.length) {
      setIsTimerActive(false);

      // Submit the results
      submitResults(timer, foundWords.map(({ word }) => word));
    }
  }, [foundWords]);

  // Check adjacency and add cell to selection if valid
  const handleCellClick = (row, col) => {
    const cellId = `${row}-${col}`;

    if (selectedCells.includes(cellId)) return;

    if (selectedCells.length === 0) {
      setSelectedCells([cellId]);
      return;
    }

    const [lastRow, lastCol] = selectedCells[selectedCells.length - 1].split('-').map(Number);
    const isAdjacent = (Math.abs(lastRow - row) <= 1 && Math.abs(lastCol - col) <= 1);

    if (isAdjacent) {
      setSelectedCells([...selectedCells, cellId]);
    }
  };

  const isCellSelected = (row, col) => selectedCells.includes(`${row}-${col}`);
  const isCellPartOfFoundWord = (row, col) =>
    foundWords.some(({ cells }) => cells.includes(`${row}-${col}`));

  const getSelectedWord = () => {
    return selectedCells
      .map((cellId) => {
        const [row, col] = cellId.split('-').map(Number);
        return maze[row][col];
      })
      .join('');
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      const selectedWord = getSelectedWord();
      if (wordsToFind.includes(selectedWord) && !foundWords.some(word => word.word === selectedWord)) {
        setFoundWords([
          ...foundWords,
          { word: selectedWord, cells: [...selectedCells] },
        ]);
      }
      setSelectedCells([]);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [selectedCells, foundWords]);

  return (
    <div className="flex flex-col items-center">
      <Dialog open={isDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Welcome to Word Search</DialogTitle>
            <DialogDescription>
              <p>Select letters to form words by clicking on adjacent cells.</p>
              <p>Words can be horizontal, vertical, or diagonal, but only from top to bottom.</p>
            </DialogDescription>
            <Button onClick={startTimer} className="mt-4">Start Quiz</Button>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <div className="flex justify-between items-center w-full mb-4 p-2">
        <div className="text-xl font-bold">
          Time: {timer}s
        </div>
      </div>
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold">Word Search Game</h1>
        <p>Select letters to form words, then press Enter to check.</p>
      </div>
      <div
        className="grid gap-1 p-4 border border-white"
        style={{
          gridTemplateColumns: "repeat(18, 2rem)",
          gridTemplateRows: "repeat(12, 2rem)",
        }}
      >
        {maze.map((row, rowIndex) =>
          row.map((letter, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              className={`w-8 h-8 flex items-center justify-center text-lg font-bold cursor-pointer ${
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
        <h2 className="text-lg font-bold mb-2">Words to Find:</h2>
        <ul className="grid grid-cols-3 gap-4">
          {wordsToFind.map((word, index) => (
            <li
              key={index}
              className={`text-center ${foundWords.some(({ word: foundWord }) => foundWord === word) ? "text-green-500" : ""}`}
            >
              {word}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default WordMaze;