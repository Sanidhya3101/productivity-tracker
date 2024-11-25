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
  const [gameOver, setGameOver] = useState(false);

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
        setPosition(newPosition);
        setPath((prevPath) => [...prevPath, newPosition]);

        if (newRow === endPosition.row && newCol === endPosition.col) {
          setGameOver(true);
          if (onTaskComplete) {
            onTaskComplete();
          }
        }
      } else {
        setWrongMoves((prevWrongMoves) => prevWrongMoves + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [position, gameOver, onTaskComplete]);

  const resetGame = () => {
    setPosition(startPosition);
    setPath([startPosition]);
    setWrongMoves(0);
    setTotalMoves(0);
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
          <p>Position: Row {position.row}, Col {position.col}</p>
          <p>Total Moves: {totalMoves}</p>
          <p>Wrong Moves: {wrongMoves}</p>
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

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                style={{
                  ...styles.cell,
                  backgroundColor: cell === 1 ? '#444' : '#fff',
                  color:
                    position.row === rowIndex && position.col === colIndex
                      ? 'red'
                      : path.some((p) => p.row === rowIndex && p.col === colIndex)
                      ? 'blue'
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
