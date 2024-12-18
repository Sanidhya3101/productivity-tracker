import React, { useState, useEffect } from 'react';

const MazeGame = ({ onTaskComplete }) => {
  const maze = [
    [0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0],
    [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0],
    [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
    [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];

  const startPosition = { row: 0, col: 0 };
  const endPosition = { row: 18, col: 19 };

  const [position, setPosition] = useState(startPosition);
  const [path, setPath] = useState([startPosition]);
  const [wrongMoves, setWrongMoves] = useState(0);
  const [totalMoves, setTotalMoves] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [endTime, setEndTime] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  // New states for per-move recording
  const [movesData, setMovesData] = useState([]);
  const [moveNumber, setMoveNumber] = useState(0);
  const [lastMoveTime, setLastMoveTime] = useState(Date.now());

  const submitStatistics = async () => {
    if (!endTime) return; 

    // Send moves data to the server
    try {
      const response = await fetch('/api/save-maze-runner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moves: movesData }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      console.log('Maze game data saved successfully');

      // Proceed to the next task
      if (onTaskComplete) {
        onTaskComplete();
      }
    } catch (error) {
      console.error('Error saving maze game data:', error);
    }
  };

  useEffect(() => {
    if (endTime) {
      submitStatistics(); // Trigger submission after endTime is set
    }
  }, [endTime]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (gameOver) return;

      const now = Date.now();
      const moveTimeTaken = (now - lastMoveTime) / 1000; // time in seconds since last move
      const { row, col } = position;
      let newRow = row;
      let newCol = col;

      switch (event.key) {
        case 'ArrowUp':
          newRow -= 1;
          break;
        case 'ArrowDown':
          newRow += 1;
          break;
        case 'ArrowLeft':
          newCol -= 1;
          break;
        case 'ArrowRight':
          newCol += 1;
          break;
        default:
          return;
      }

      setTotalMoves((prevMoves) => prevMoves + 1);
      let moveIsWrong = false;

      if (
        newRow >= 0 &&
        newRow < maze.length &&
        newCol >= 0 &&
        newCol < maze[0].length &&
        maze[newRow][newCol] === 0
      ) {
        const newPosition = { row: newRow, col: newCol };

        // Check if we're backtracking to the previous cell
        if (
          path.length > 1 &&
          path[path.length - 2].row === newRow &&
          path[path.length - 2].col === newCol
        ) {
          // Backtracking
          setPath((prevPath) => prevPath.slice(0, prevPath.length - 1));
        } else {
          // Moving forward
          setPath((prevPath) => [...prevPath, newPosition]);
        }

        setPosition(newPosition);

        // Record this move
        setMovesData((prev) => [
          ...prev,
          {
            moveNumber: moveNumber + 1,
            wrongMove: false,
            timeTakenForMove: moveTimeTaken,
          },
        ]);
        setMoveNumber(moveNumber + 1);
        setLastMoveTime(now);

        if (newRow === endPosition.row && newCol === endPosition.col) {
          setEndTime(Date.now());
          setGameOver(true);
          // Submit the moves data
          submitStatistics();
        }
      } else {
        moveIsWrong = true;
        setWrongMoves((prevWrongMoves) => prevWrongMoves + 1);
        // Record wrong move
        setMovesData((prev) => [
          ...prev,
          {
            moveNumber: moveNumber + 1,
            wrongMove: true,
            timeTakenForMove: moveTimeTaken,
          },
        ]);
        setMoveNumber(moveNumber + 1);
        setLastMoveTime(now);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [position, gameOver, path, moveNumber, lastMoveTime, onTaskComplete]);

  const resetGame = () => {
    setPosition(startPosition);
    setPath([startPosition]);
    setWrongMoves(0);
    setTotalMoves(0);
    setStartTime(Date.now());
    setEndTime(null);
    setMovesData([]);
    setMoveNumber(0);
    setLastMoveTime(Date.now());
    setGameOver(false);
  };

  return (
    <div className="min-h-screen bg-slate-800 text-white flex flex-col items-center justify-center p-4">
      <div className="font-sans rounded-3xl bg-background text-foreground p-8 flex items-center justify-center">
        <div className="w-full max-w-5xl rounded-3xl border-solid border-4 border-black p-4">
          <header className="text-center">
            <h1 className="text-4xl font-bold mb-2 text-gradient">Maze Game</h1>
            <p className="text-xl text-red-500 italic">Navigate using the arrow keys.</p>
          </header>

          <main className="mt-1">
            <div 
              className="grid gap-1 mx-auto bg-slate-700 p-4 rounded-lg border-2 border-white" 
              style={{ 
                gridTemplateColumns: `repeat(20, minmax(0, 1fr))`,
                maxWidth: "90vw",
                aspectRatio: "1/1",
              }}
            >
              {maze.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  let cellContent = '';
                  if (position.row === rowIndex && position.col === colIndex) {
                    cellContent = 'S';
                  } else if (rowIndex === endPosition.row && colIndex === endPosition.col) {
                    cellContent = 'E';
                  }

                  const isInPath = path.some(
                    (p) => p.row === rowIndex && p.col === colIndex
                  );

                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`flex items-center justify-center text-lg font-bold rounded aspect-square ${
                        cell === 1 
                          ? 'bg-slate-900' 
                          : isInPath 
                            ? 'bg-blue-500' 
                            : 'bg-slate-600'
                      } ${
                        position.row === rowIndex && position.col === colIndex
                          ? 'text-red-500'
                          : 'text-white'
                      }`}
                    >
                      {cellContent}
                    </div>
                  );
                })
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MazeGame;
