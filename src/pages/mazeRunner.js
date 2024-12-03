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

  const submitStatistics = async () => {
    if (!endTime) return; // Wait until endTime is set

    const timeTaken = ((endTime - startTime) / 1000).toFixed(2);

    const data = {
      timeTaken: parseFloat(timeTaken),
      totalMoves,
      wrongMoves,
    };

    try {
      const response = await fetch('/api/save-maze-runner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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

      if (
        newRow >= 0 &&
        newRow < maze.length &&
        newCol >= 0 &&
        newCol < maze[0].length &&
        maze[newRow][newCol] === 0
      ) {
        const newPosition = { row: newRow, col: newCol };

        // Check if the new position is the previous position in the path (backtracking)
        if (
          path.length > 1 &&
          path[path.length - 2].row === newRow &&
          path[path.length - 2].col === newCol
        ) {
          // Backtracking: remove the last position
          setPath((prevPath) => prevPath.slice(0, prevPath.length - 1));
        } else {
          // Moving forward: add new position to the path
          setPath((prevPath) => [...prevPath, newPosition]);
        }

        setPosition(newPosition);

        if (newRow === endPosition.row && newCol === endPosition.col) {
          setEndTime(Date.now());
          setGameOver(true);
          
          // Submit statistics before proceeding
          submitStatistics();
        }
      } else {
        setWrongMoves((prevWrongMoves) => prevWrongMoves + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [position, gameOver, path, onTaskComplete]);

  const resetGame = () => {
    setPosition(startPosition);
    setPath([startPosition]);
    setWrongMoves(0);
    setTotalMoves(0);
    setStartTime(Date.now());
    setEndTime(null);
    setGameOver(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Maze Game</h1>
      {gameOver ? (
        <div style={styles.statsContainer}>
          <h2 style={styles.gameOverText}>Game Over!</h2>
          <p>You reached the endpoint!</p>
          <p>Total Moves: {totalMoves}</p>
          <p>Wrong Moves: {wrongMoves}</p>
          <button style={styles.button} onClick={resetGame}>
            Play Again
          </button>
        </div>
      ) : (
        <div style={styles.statsContainer}>
          <p>
            Position: Row {position.row}, Col {position.col}
          </p>
          <p>Total Moves: {totalMoves}</p>
          <p>Wrong Moves: {wrongMoves}</p>
          <p>Use arrow keys to move through the maze.</p>
        </div>
      )}
      <div style={styles.mazeContainer}>
        {maze.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            let cellContent = '';
            if (position.row === rowIndex && position.col === colIndex) {
              cellContent = 'P';
            } else if (rowIndex === endPosition.row && colIndex === endPosition.col) {
              cellContent = 'E';
            }

            // Determine if the cell is part of the current path
            const isInPath = path.some(
              (p) => p.row === rowIndex && p.col === colIndex
            );

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                style={{
                  ...styles.cell,
                  backgroundColor: cell === 1 ? '#444' : isInPath ? '#0f0' : '#fff',
                  color:
                    position.row === rowIndex && position.col === colIndex
                      ? 'red'
                      : 'black',
                }}
              >
                {cellContent}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#000',
    fontFamily: '"Arial", sans-serif',
    color: '#fff',
    textAlign: 'center',
  },
  title: {
    fontSize: '2.5em',
    color: '#fff',
    marginBottom: '10px',
  },
  statsContainer: {
    backgroundColor: '#222',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0px 4px 8px rgba(255, 255, 255, 0.1)',
    marginBottom: '20px',
    width: '80%',
    maxWidth: '300px',
    color: '#fff',
  },
  gameOverText: {
    color: '#e63946',
  },
  button: {
    backgroundColor: '#e63946',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  mazeContainer: {
    display: 'grid',
    gridTemplateColumns: `repeat(20, 30px)`,
    gap: '4px',
  },
  cell: {
    width: 30,
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    fontSize: '1.2em',
    fontWeight: 'bold',
    border: '1px solid #bbb',
  },
};

export default MazeGame;
