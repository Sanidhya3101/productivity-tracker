import React, { useState, useEffect } from 'react';

// Limited set of colors and their keyboard mappings
const colors = ['red', 'green', 'blue', 'yellow'];
const colorMappings = { red: 'r', blue: 'b', green: 'g', yellow: 'y' };

// Fixed set of 20 questions using only the specified colors
const questions = [
  { word: 'RED', color: 'green' },
  { word: 'GREEN', color: 'blue' },
  { word: 'BLUE', color: 'yellow' },
  { word: 'YELLOW', color: 'red' },
  { word: 'RED', color: 'blue' },
  { word: 'GREEN', color: 'yellow' },
  { word: 'BLUE', color: 'red' },
  { word: 'YELLOW', color: 'green' },
  { word: 'RED', color: 'yellow' },
  { word: 'GREEN', color: 'red' },
  { word: 'BLUE', color: 'green' },
  { word: 'YELLOW', color: 'blue' },
  { word: 'RED', color: 'green' },
  { word: 'GREEN', color: 'blue' },
  { word: 'BLUE', color: 'yellow' },
  { word: 'YELLOW', color: 'red' },
  { word: 'RED', color: 'blue' },
  { word: 'GREEN', color: 'yellow' },
  { word: 'BLUE', color: 'red' },
  { word: 'YELLOW', color: 'green' },
];

const StroopTest = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [question, setQuestion] = useState(null); // Initially null, shows first question on start
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null); // Initially null
  const [times, setTimes] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false); // Track whether the quiz has started

  // Handle key press for color selection
  const handleKeyPress = (event) => {
    if (gameOver || !quizStarted) return; // Do nothing if the game is over or hasn't started

    const selectedKey = event.key.toLowerCase();
    const correctKey = colorMappings[question.color];

    // Check if selected key matches the correct key
    if (selectedKey === correctKey) {
      setScore(score + 1);
    }

    // Record time taken for this question
    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000; // in seconds
    setTimes([...times, timeTaken]);

    // Move to the next question or end the game
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setQuestion(questions[currentQuestionIndex + 1]);
      setStartTime(Date.now()); // Restart timer for the next question
    } else {
      setGameOver(true);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);

    // Cleanup the event listener
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentQuestionIndex, question, quizStarted]);

  // Display results after game ends
  const renderResults = () => {
    const totalTime = times.reduce((acc, time) => acc + time, 0);
    const avgTime = (totalTime / times.length).toFixed(2);
    const accuracy = ((score / questions.length) * 100).toFixed(2);

    return (
      <div style={{ textAlign: 'center' }}>
        {/* <h2>Game Over</h2> */}
        <h1 style={{ fontSize: '1.5em' }}> Game Over</h1>
        <br />
        <p>Your final score: {score} / 20</p>
        <p>Accuracy: {accuracy}%</p>
        <p>Total Time Taken: {totalTime.toFixed(2)} seconds</p>
        <p>Average Time per Question: {avgTime} seconds</p>
        <br />
        <button onClick={restartGame} style={{ border: '2px solid lightblue', padding: '10px 20px', borderRadius: '8px' }}>
          Restart
        </button>
      </div>
    );
  };

  // Start the quiz
  const startQuiz = () => {
    setQuizStarted(true);
    setQuestion(questions[0]);
    setCurrentQuestionIndex(0);
    setStartTime(Date.now());
  };

  // Restart game function
  const restartGame = () => {
    setQuizStarted(false);
    setGameOver(false);
    setScore(0);
    setTimes([]);
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
                color: question.color,
                margin: '20px auto',
              }}
            >
              {question.word}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StroopTest;
