import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from 'next/image';
import puzzles1 from "../styles/img/puzzles1.png";
import puzzles2 from "../styles/img/puzzles2.jpg";
import puzzles3 from "../styles/img/puzzles3.png";
import puzzles4 from "../styles/img/puzzles4.png";
import puzzles5 from "../styles/img/puzzles5.png";
import puzzles6 from "../styles/img/puzzles6.png";
import puzzles7 from "../styles/img/puzzles7.png";

const puzzles = [
  {
    id: 1,
    image: puzzles1,
    options: ['97', '98', '99', '100'],
    correctAnswer: 0,
  },
  {
    id: 2,
    image: puzzles2,
    options: ['1', '2', '3', '8'],
    correctAnswer: 1,
  },
  {
    id: 3,
    image: puzzles3,
    options: ['13', '5', '3', '2'],
    correctAnswer: 1,
  },
  {
    id: 4,
    image: puzzles4,
    options: ['V', 'Y', 'X', 'W'],
    correctAnswer: 3,
  },
  {
    id: 5,
    image: puzzles5,
    options: ['6', '7', '8', '4'],
    correctAnswer: 2,
  },
  {
    id: 6,
    image: puzzles6,
    options: ['152', '142', '140', '150'],
    correctAnswer: 0,
  },
  {
    id: 7,
    image: puzzles7,
    options: ['6', '0', '2', '4'],
    correctAnswer: 3,
  },
];

export default function PuzzleGame({ onTaskComplete }) {
  const [isStarted, setIsStarted] = useState(false);
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [unansweredQuestions, setUnansweredQuestions] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let timer;
    if (isStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      endQuiz();
    }
    return () => clearInterval(timer);
  }, [isStarted, timeLeft]);

  const startQuiz = () => {
    setIsStarted(true);
  };

  const endQuiz = () => {
    setIsFinished(true);
    setUnansweredQuestions(puzzles.length - currentPuzzle - 1);

    // Notify parent when quiz ends
    if (onTaskComplete) {
      onTaskComplete();
    }
  };

  const handleAnswer = (selectedAnswer) => {
    if (selectedAnswer === puzzles[currentPuzzle].correctAnswer) {
      setCorrectAnswers((prev) => prev + 1);
    }
    if (currentPuzzle < puzzles.length - 1) {
      setCurrentPuzzle((prev) => prev + 1);
    } else {
      endQuiz();
    }
  };

  const accuracy = isFinished ? (correctAnswers / puzzles.length) * 100 : 0;

  if (!isStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold mb-4">Logical Puzzle Quiz</h1>
        <p className="text-lg mb-6 text-center max-w-md">
          Welcome to the Logical Puzzle Quiz! You will have 2 minutes to solve {puzzles.length} puzzles.
          Each puzzle has 4 options. Good luck!
        </p>
        <Button onClick={startQuiz}>Start Quiz</Button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4">Quiz Results</h2>
        <p>Correct Answers: {correctAnswers}</p>
        <p>Unanswered Questions: {unansweredQuestions}</p>
        <p>Accuracy: {accuracy.toFixed(2)}%</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="text-2xl font-bold mb-4">
        Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
      </div>
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Puzzle {currentPuzzle + 1} of {puzzles.length}</h2>
          <Image
            src={puzzles[currentPuzzle].image}
            alt={`Puzzle ${currentPuzzle + 1}`}
            width={400}
            height={300}
            className="w-full h-auto mb-4"
          />
          <div className="grid grid-cols-2 gap-4">
            {puzzles[currentPuzzle].options.map((option, index) => (
              <Button key={index} onClick={() => handleAnswer(index)}>
                {option}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
