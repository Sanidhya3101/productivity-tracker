import React, { useState, useEffect } from 'react';
import TestStart from './test-start';
import StroopTest from './stroop';
import TypingTest from './typing-test';
import MazeGame from './mazeRunner';
import PuzzleGame from './puzzles';
import Mail from './mail';
import Questionnaire from './questionnaire';
import WordMaze from './maze';

const TASKS = {
  TEST_START: 'TestStart',
  STROOP_TEST: 'StroopTest',
  TYPING_TEST: 'TypingTest',
  WORD_MAZE: 'WordMaze',
  MAZE_GAME: 'MazeGame',
  PUZZLE_GAME: 'PuzzleGame', // Added PuzzleGame to the task list
  CREATIVE_TASK: 'Mail',
  SURVEY: 'Questionnaire',
};

export default function Home() {
  const [currentTask, setCurrentTask] = useState(TASKS.TEST_START);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [totalTime, setTotalTime] = useState(0);

  // Start the timer at the beginning of the first task
  useEffect(() => {
    if (currentTask === TASKS.TEST_START && !startTime) {
      setStartTime(Date.now());
    }
  }, [currentTask, startTime]);

  // Handle task completion and transition to the next task
  const handleTaskCompletion = () => {
    if (currentTask === TASKS.TEST_START) {
      setCurrentTask(TASKS.STROOP_TEST);
    } else if (currentTask === TASKS.STROOP_TEST) {
      setCurrentTask(TASKS.TYPING_TEST);
    } else if (currentTask === TASKS.TYPING_TEST) {
      setCurrentTask(TASKS.WORD_MAZE);
    } else if (currentTask === TASKS.WORD_MAZE) {
      setCurrentTask(TASKS.MAZE_GAME);
    } else if (currentTask === TASKS.MAZE_GAME) {
      setCurrentTask(TASKS.PUZZLE_GAME);
    } else if (currentTask === TASKS.PUZZLE_GAME) {
      setCurrentTask(TASKS.CREATIVE_TASK);
    } else if (currentTask === TASKS.CREATIVE_TASK) {
      setCurrentTask(TASKS.SURVEY);
    } else if (currentTask === TASKS.SURVEY) {
      setEndTime(Date.now());
      console.log('All tasks completed!');
    }
  };

  // Calculate total time when all tasks are completed
  useEffect(() => {
    if (endTime) {
      const elapsedTime = Math.round((endTime - startTime) / 1000); // Convert to seconds
      setTotalTime(elapsedTime);
    }
  }, [endTime]);

  const getTaskProgress = () => {
    const taskKeys = Object.keys(TASKS).filter((key) => key !== 'TEST_START'); // Exclude the start page
    const currentIndex = taskKeys.findIndex((key) => TASKS[key] === currentTask);
    return currentIndex >= 0 ? `${currentIndex + 1} / ${taskKeys.length}` : '0 / 4';
  };

  // Render the current task component based on the state
  const renderCurrentTask = () => {
    switch (currentTask) {
      case TASKS.TEST_START:
        return <TestStart onStartFunction={handleTaskCompletion} />;
      case TASKS.STROOP_TEST:
        return <StroopTest onTaskComplete={handleTaskCompletion} />;
      case TASKS.TYPING_TEST:
        return <TypingTest onTaskComplete={handleTaskCompletion} />;
      case TASKS.WORD_MAZE:
        return <WordMaze onTaskComplete={handleTaskCompletion} />;
      case TASKS.MAZE_GAME:
        return <MazeGame onTaskComplete={handleTaskCompletion} />;
      case TASKS.PUZZLE_GAME:
        return <PuzzleGame onTaskComplete={handleTaskCompletion} />;
      case TASKS.CREATIVE_TASK:
        return <Mail onTaskComplete={handleTaskCompletion} />;
      case TASKS.SURVEY:
        return <Questionnaire onTaskComplete={handleTaskCompletion} />;
      default:
        return (
          <div className="text-center">
            <h1 className="text-2xl font-bold">Task Not Found</h1>
            <p>Please try again or contact support.</p>
          </div>
        );
    }
  };

  // Render a completion message if all tasks are done
  const renderCompletionMessage = () => {
    return (
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">All Tasks Completed!</h1>
        <p className="text-lg">Total Time Taken: {totalTime} seconds</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      {endTime ? (
        renderCompletionMessage()
      ) : (
        <>
          {/* Task Progress */}
          {currentTask !== TASKS.TEST_START && ( // Hide progress on the start page
            <div className="absolute top-4 left-4 text-lg">
              <p>Task Progress: {getTaskProgress()}</p>
            </div>
          )}

          {/* Current Task */}
          {renderCurrentTask()}
        </>
      )}
    </div>
  );
}
