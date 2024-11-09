
// CODE WORKING FINE --- SELECT THE LETTER

// import React, { useState, useEffect } from 'react';

// const maze = [
//   ["D", "V", "D", "C", "A", "S", "V", "T", "J", "N", "N", "U", "L", "D", "I", "Y", "H", "Y"],
//   ["A", "U", "I", "T", "C", "O", "C", "U", "H", "B", "I", "S", "X", "D", "N", "C", "O", "T"],
//   ["T", "S", "R", "Z", "E", "R", "V", "O", "X", "X", "C", "E", "D", "H", "T", "R", "R", "U"],
//   ["A", "M", "E", "P", "K", "C", "E", "F", "L", "Q", "H", "R", "A", "U", "E", "E", "I", "M"],
//   ["T", "A", "C", "A", "E", "O", "H", "A", "E", "L", "E", "J", "X", "M", "R", "A", "Z", "O"],
//   ["V", "R", "T", "Y", "Y", "Z", "P", "N", "T", "A", "E", "L", "I", "A", "F", "T", "O", "N"],
//   ["O", "B", "I", "R", "B", "L", "S", "T", "O", "I", "T", "G", "S", "N", "A", "I", "N", "E"],
//   ["S", "L", "O", "N", "O", "O", "F", "E", "K", "L", "V", "U", "E", "D", "C", "V", "T", "Y"],
//   ["U", "E", "N", "P", "A", "Y", "X", "X", "V", "V", "O", "I", "R", "L", "E", "I", "A", "A"],
//   ["I", "N", "T", "E", "R", "A", "C", "T", "I", "O", "N", "G", "T", "E", "M", "T", "L", "U"],
//   ["H", "R", "B", "C", "D", "Y", "T", "I", "M", "E", "X", "I", "Y", "Y", "S", "Y", "H", "J"],
//   ["O", "T", "M", "O", "U", "S", "E", "N", "V", "E", "R", "T", "I", "C", "A", "L", "F", "F"]
// ];

// const wordsToFind = [
//   "INTERACTION", "CREATIVITY", "TECHNOLOGY", "HORIZONTAL", "INTERFACE",
//   "DIRECTION", "VERTICAL", "FEATURES", "KEYBOARD", "COLLEGE", "MARBLE",
//   "HUMAN", "MONEY", "NICHE", "MOUSE", "USER", "AXIS", "DATA", "TEXT", "TIME"
// ];

// function App() {
//   const [selectedCells, setSelectedCells] = useState([]);
//   const [foundWords, setFoundWords] = useState([]);
//   const [timer, setTimer] = useState(0); // Timer state
//   const [isTimerActive, setIsTimerActive] = useState(false); // Timer active state

//   // Start the timer when the start button is clicked
//   const startTimer = () => {
//     setIsTimerActive(true);
//   };

//   // Update the timer every second
//   useEffect(() => {
//     let interval;
//     if (isTimerActive) {
//       interval = setInterval(() => {
//         setTimer(prevTimer => prevTimer + 1);
//       }, 1000);
//     } else {
//       clearInterval(interval);
//     }
//     return () => clearInterval(interval); // Cleanup the interval on component unmount or when the timer is stopped
//   }, [isTimerActive]);

//   // Check if all words have been found
//   useEffect(() => {
//     if (foundWords.length === wordsToFind.length) {
//       setIsTimerActive(false); // Stop the timer if all words are found
//     }
//   }, [foundWords]);

//   const handleCellClick = (row, col) => {
//     const cellId = `${row}-${col}`;
//     if (!selectedCells.includes(cellId)) {
//       setSelectedCells([...selectedCells, cellId]);
//     }
//   };

//   const isCellSelected = (row, col) => selectedCells.includes(`${row}-${col}`);
//   const isCellPartOfFoundWord = (row, col) =>
//     foundWords.some(({ cells }) => cells.includes(`${row}-${col}`));

//   const getSelectedWord = () => {
//     return selectedCells
//       .map((cellId) => {
//         const [row, col] = cellId.split('-').map(Number);
//         return maze[row][col];
//       })
//       .join('');
//   };

//   const handleKeyPress = (event) => {
//     if (event.key === 'Enter') {
//       const selectedWord = getSelectedWord();
//       if (wordsToFind.includes(selectedWord) && !foundWords.some(word => word.word === selectedWord)) {
//         setFoundWords([
//           ...foundWords,
//           { word: selectedWord, cells: [...selectedCells] },
//         ]);
//       }
//       setSelectedCells([]); // Clear selection after checking
//     }
//   };

//   useEffect(() => {
//     window.addEventListener('keydown', handleKeyPress);
//     return () => {
//       window.removeEventListener('keydown', handleKeyPress);
//     };
//   }, [selectedCells, foundWords]);

//   return (
//     <div className="flex flex-col items-center">
//       <div className="flex justify-between items-center w-full mb-4 p-2">
//         <button
//           onClick={startTimer}
//           className="bg-blue-500 text-white px-4 py-2 rounded-md"
//         >
//           Start
//         </button>
//         <div className="text-xl font-bold">
//           Time: {timer}s
//         </div>
//       </div>
//       <div className="text-center mb-4">
//         <h1 className="text-2xl font-bold">Word Search Game</h1>
//         <p>Select letters to form words, then press Enter to check.</p>
//       </div>
//       <div
//         className="grid gap-1 p-4 border border-white"
//         style={{
//           gridTemplateColumns: "repeat(18, 2rem)",
//           gridTemplateRows: "repeat(12, 2rem)",
//         }}
//       >
//         {maze.map((row, rowIndex) =>
//           row.map((letter, colIndex) => (
//             <div
//               key={`${rowIndex}-${colIndex}`}
//               onClick={() => handleCellClick(rowIndex, colIndex)}
//               className={`w-8 h-8 flex items-center justify-center text-lg font-bold cursor-pointer ${
//                 isCellPartOfFoundWord(rowIndex, colIndex)
//                   ? "text-yellow-500"
//                   : isCellSelected(rowIndex, colIndex)
//                   ? "text-red-500"
//                   : "text-white"
//               }`}
//             >
//               {letter}
//             </div>
//           ))
//         )}
//       </div>
//       <div className="mt-4">
//         <h2 className="text-lg font-bold mb-2">Words to Find:</h2>
//         <ul className="grid grid-cols-3 gap-4">
//           {wordsToFind.map((word, index) => (
//             <li
//               key={index}
//               className={`text-center ${foundWords.some(({ word: foundWord }) => foundWord === word) ? "text-green-500" : ""}`}
//             >
//               {word}
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// }

// export default App;

import React, { useState, useEffect } from 'react';

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
  "INTERACTION", "CREATIVITY", "TECHNOLOGY", "HORIZONTAL", "INTERFACE",
  "DIRECTION", "VERTICAL", "FEATURES", "KEYBOARD", "COLLEGE", "MARBLE",
  "HUMAN", "MONEY", "NICHE", "MOUSE", "USER", "AXIS", "DATA", "TEXT", "TIME"
];

function App() {
  const [selectedCells, setSelectedCells] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [direction, setDirection] = useState(null); // Track direction of selection

  const handleMouseDown = (row, col) => {
    setIsDragging(true);
    setSelectedCells([`${row}-${col}`]);
    setDirection(null); // Reset direction at the start of selection
  };

  const handleMouseEnter = (row, col) => {
    if (isDragging) {
      const lastCell = selectedCells[selectedCells.length - 1];
      const [lastRow, lastCol] = lastCell.split('-').map(Number);

      // Calculate the current direction based on movement
      const newDirection = [row - lastRow, col - lastCol];

      // Only proceed if cells are adjacent
      if (Math.abs(newDirection[0]) > 1 || Math.abs(newDirection[1]) > 1) return;

      // Set direction if it’s the first cell after the initial cell
      if (!direction && selectedCells.length === 1) {
        setDirection(newDirection);
      }

      // Check if the direction is consistent
      if (direction && (newDirection[0] !== direction[0] || newDirection[1] !== direction[1])) {
        return; // Stop selection if the direction changes
      }

      const cellId = `${row}-${col}`;
      if (!selectedCells.includes(cellId)) {
        setSelectedCells([...selectedCells, cellId]);
      }
    }
  };

  const handleMouseUp = () => {
    const selectedWord = getSelectedWord();
    if (wordsToFind.includes(selectedWord) && !foundWords.some(word => word.word === selectedWord)) {
      setFoundWords([...foundWords, { word: selectedWord, cells: [...selectedCells] }]);
    }
    setSelectedCells([]);
    setIsDragging(false);
    setDirection(null); // Reset direction after selection is done
  };

  const getSelectedWord = () => {
    return selectedCells
      .map((cellId) => {
        const [row, col] = cellId.split('-').map(Number);
        return maze[row][col];
      })
      .join('');
  };

  const isCellSelected = (row, col) => selectedCells.includes(`${row}-${col}`);
  const isCellPartOfFoundWord = (row, col) =>
    foundWords.some(({ cells }) => cells.includes(`${row}-${col}`));

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold">Word Search Game</h1>
        <p>Click and drag to select letters and form words.</p>
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
              onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
              onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
              onMouseUp={handleMouseUp}
              className={`w-8 h-8 flex items-center justify-center text-lg font-bold cursor-pointer ${
                isCellPartOfFoundWord(rowIndex, colIndex)
                  ? "text-yellow-500" // Highlight found word in yellow
                  : isCellSelected(rowIndex, colIndex)
                  ? "text-red-500" // Highlight selected cells in red while dragging
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
              className={`text-center ${
                foundWords.some(({ word: foundWord }) => foundWord === word) ? "text-green-500" : ""
              }`}
            >
              {word}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
