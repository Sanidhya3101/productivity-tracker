'use client'

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

  const handleKeyPress = (event) => {
    if (gameOver || !quizStarted) return;

    const selectedKey = event.key.toLowerCase();
    const correctKey = colorMappings[questions[currentQuestionIndex].color];

    if (selectedKey === correctKey) {
      setScore((prevScore) => prevScore + 1);
    }

    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000;
    setTimes((prevTimes) => [...prevTimes, timeTaken]);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setStartTime(Date.now());
    } else {
      setGameOver(true);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentQuestionIndex, quizStarted, gameOver]);

  useEffect(() => {
    if (gameOver) {
      onTaskComplete();
    }
  }, [gameOver, onTaskComplete]);

  const startQuiz = () => {
    setQuizStarted(true);
    setStartTime(Date.now());
  };

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
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">Stroop Test</h1>
          <p className="text-xl mb-6">
            The Stroop Test challenges your ability to process conflicting information. 
            Focus on the color of the word and press the corresponding key.
          </p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold mb-4">Instructions</h3>
          <p className="mb-4">Press the following keys for the colors:</p>
          <ul className="grid grid-cols-2 gap-4">
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
        </div>

        <div className="text-center">
          {!quizStarted ? (
            <button 
              onClick={startQuiz} 
              className="px-6 py-3 text-lg bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Start Quiz
            </button>
          ) : gameOver ? (
            renderResults()
          ) : (
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
        </div>
      </div>
    </div>
  );
}

