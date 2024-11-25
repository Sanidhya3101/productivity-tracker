import React, { useState, useEffect } from 'react';

const colors = ['red', 'green', 'blue', 'yellow'];
const colorMappings = { red: 'r', green: 'g', blue: 'b', yellow: 'y' };

const questions = [
  { word: 'RED', color: 'green' },
  { word: 'GREEN', color: 'blue' },
  { word: 'BLUE', color: 'red' },
  { word: 'YELLOW', color: 'yellow' },
];

export default function StroopTest({ onTaskComplete }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [times, setTimes] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  // Handle key press for color selection
  const handleKeyPress = (event) => {
    if (gameOver || !quizStarted) return;

    const selectedKey = event.key.toLowerCase();
    const correctKey = colorMappings[questions[currentQuestionIndex].color];

    // Check if selected key matches the correct key
    if (selectedKey === correctKey) {
      setScore((prevScore) => prevScore + 1);
    }

    // Record time taken for this question
    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000; // Time in seconds
    setTimes((prevTimes) => [...prevTimes, timeTaken]);

    // Move to the next question or end the game
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setStartTime(Date.now()); // Restart timer for the next question
    } else {
      setGameOver(true);
    }
  };

  useEffect(() => {
    // Attach keydown listener
    window.addEventListener('keydown', handleKeyPress);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentQuestionIndex, quizStarted, gameOver]);

  useEffect(() => {
    if (gameOver) {
      // Notify parent component when the game is over
      onTaskComplete();
    }
  }, [gameOver, onTaskComplete]);

  // Start the quiz
  const startQuiz = () => {
    setQuizStarted(true);
    setStartTime(Date.now());
  };

  // Render results after the game ends
  const renderResults = () => {
    const totalTime = times.reduce((acc, time) => acc + time, 0);
    const avgTime = (totalTime / times.length).toFixed(2);
    const accuracy = ((score / questions.length) * 100).toFixed(2);

    return (
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5em' }}>Game Over</h1>
        <br />
        <p>Your final score: {score} / {questions.length}</p>
        <p>Accuracy: {accuracy}%</p>
        <p>Total Time Taken: {totalTime.toFixed(2)} seconds</p>
        <p>Average Time per Question: {avgTime} seconds</p>
        <br />
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ width: '20%', marginRight: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'left' }}>
        <h3>Instructions</h3>
        <p>Press the following keys for the colors:</p>
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          <li style={{ color: 'red' }}><strong>R</strong> for Red</li>
          <li style={{ color: 'green' }}><strong>G</strong> for Green</li>
          <li style={{ color: 'blue' }}><strong>B</strong> for Blue</li>
          <li style={{ color: 'yellow' }}><strong>Y</strong> for Yellow</li>
        </ul>
      </div>

      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5em' }}>Stroop Test</h1>
        {!quizStarted ? (
          <div>
            <br />
            <p>The Stroop Test challenges your ability to process conflicting information. Focus on the color of the word and press the corresponding key.</p>
            <br />
            <button onClick={startQuiz} style={{ border: '2px solid lightblue', padding: '10px 20px', borderRadius: '8px' }}>
              Start Quiz
            </button>
          </div>
        ) : gameOver ? (
          renderResults()
        ) : (
          <div>
            <p>Press the key corresponding to the color of the word!</p>
            <div
              style={{
                fontSize: '50px',
                color: questions[currentQuestionIndex].color,
                margin: '20px auto',
              }}
            >
              {questions[currentQuestionIndex].word}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
