import React, { useState, useEffect } from 'react';

const MazeGame = () => {
  const maze = [
    [0, 1, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 1, 0],
    [1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0]
  ];

  const startPosition = { row: 0, col: 0 };
  const endPosition = { row: 4, col: 4 };

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
        }
      } else {
        setWrongMoves((prevWrongMoves) => prevWrongMoves + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [position, gameOver]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Maze Game</h1>
      {gameOver ? (
        <div style={styles.statsContainer}>
          <h2 style={styles.gameOverText}>Game Over!</h2>
          <p>You reached the endpoint!</p>
          <p>Total Moves: {totalMoves}</p>
          <p>Wrong Moves: {wrongMoves}</p>
          <p>Path Taken: {path.map((p) => `(${p.row}, ${p.col})`).join(' -> ')}</p>
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
                      : 'black'
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
    backgroundColor: '#f0f4f8',
    fontFamily: '"Arial", sans-serif',
    color: '#333',
    textAlign: 'center'
  },
  title: {
    fontSize: '2.5em',
    color: '#333',
    marginBottom: '10px'
  },
  statsContainer: {
    backgroundColor: '#fff',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px',
    width: '80%',
    maxWidth: '300px',
  },
  gameOverText: {
    color: '#e63946',
  },
  mazeContainer: {
    display: 'grid',
    gridTemplateColumns: `repeat(5, 40px)`,
    gap: '4px',
  },
  cell: {
    width: 40,
    height: 40,
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
