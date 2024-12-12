'use client';

import React, { useState, useEffect, useRef } from 'react';
import TestStart from './test-start';
import StroopTest from './stroop';
import TypingTest from './typing-test';
import MazeGame from './mazeRunner';
import PuzzleGame from './puzzles';
import Mail from './mail';
import Questionnaire from './questionnaire';
import WordMaze from './maze';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import axios from 'axios';

const TASKS = {
  TEST_START: 'TestStart',
  TYPING_TEST: 'TypingTest',
  STROOP_TEST: 'StroopTest',
  WORD_MAZE: 'WordMaze',
  MAZE_GAME: 'MazeGame',
  CREATIVE_TASK: 'Mail',
  SURVEY: 'Questionnaire',
};

export default function Home() {
  const [currentTask, setCurrentTask] = useState(TASKS.TEST_START);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [totalTime, setTotalTime] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Start the timer at the beginning of the first task
  useEffect(() => {
    if (currentTask === TASKS.TEST_START && !startTime) {
      setStartTime(Date.now());
    }
  }, [currentTask, startTime]);

  // Handle task completion and transition to the next task
  const handleTaskCompletion = async () => {
    if (currentTask === TASKS.TEST_START) {
      try {
        // Start video recording
        await startVideoRecording();

        // Start Python scripts
        await startPythonScripts();

        // Transition to the next task
        setCurrentTask(TASKS.TYPING_TEST);
      } catch (error) {
        console.error('Error starting video recording or Python scripts:', error);
      }
    } else if (currentTask === TASKS.TYPING_TEST) {
      setCurrentTask(TASKS.STROOP_TEST);
    } else if (currentTask === TASKS.STROOP_TEST) {
      setCurrentTask(TASKS.WORD_MAZE);
    } else if (currentTask === TASKS.WORD_MAZE) {
      setCurrentTask(TASKS.MAZE_GAME);
    } else if (currentTask === TASKS.MAZE_GAME) {
      setCurrentTask(TASKS.CREATIVE_TASK);
    } else if (currentTask === TASKS.CREATIVE_TASK) {
      setCurrentTask(TASKS.SURVEY);
    } else if (currentTask === TASKS.SURVEY) {
      // End of all tasks
      try {
        // Stop video recording
        await stopVideoRecording();

        // Stop Python scripts
        await stopPythonScripts();

        setEndTime(Date.now());
        console.log('All tasks completed!');
      } catch (error) {
        console.error('Error stopping video recording or Python scripts:', error);
      }
    }
  };

  // Function to start video recording
  const startVideoRecording = async () => {
    try {
      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      mediaStreamRef.current = stream;

      // Initialize MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Handle data availability
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      // Start recording
      mediaRecorder.start();
      console.log('Video recording started.');
    } catch (err) {
      console.error('Error accessing media devices.', err);
      throw err;
    }
  };

  // Function to stop video recording
  const stopVideoRecording = async () => {
    return new Promise((resolve, reject) => {
      const mediaRecorder = mediaRecorderRef.current;
      const stream = mediaStreamRef.current;

      if (mediaRecorder && stream) {
        mediaRecorder.onstop = async () => {
          console.log('Video recording stopped.');

          // Handle the recorded video (e.g., upload to server or download)
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          
          // Reset recorded chunks
          recordedChunksRef.current = [];

          // Trigger download of the video
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'recording.webm';
          document.body.appendChild(a); // Append to the DOM
          a.click(); // Trigger download
          document.body.removeChild(a); // Clean up
          URL.revokeObjectURL(url); // Release memory

          // Alternatively, upload the blob to the server
          // uploadVideo(blob);

          //  // Upload the video to the server
          //  try {
          //     await uploadVideo(blob);
          //     console.log('Video uploaded successfully.');
          //   } catch (uploadError) {
          //     console.error('Error uploading video:', uploadError);
          //   }

          // Stop all media tracks to release the camera and microphone
          stream.getTracks().forEach(track => track.stop());

          resolve();
        };

        mediaRecorder.stop();
      } else {
        reject(new Error('MediaRecorder or mediaStream not initialized.'));
      }
    });
  };

  // // Function to upload video to the server
  // const uploadVideo = async (blob) => {
  //   const formData = new FormData();
  //   const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Replace colons and dots for filename
  //   const fileName = `recording_${timestamp}.webm`;
  //   formData.append('video', blob, fileName);

  //   try {
  //     const response = await axios.post('/api/upload-video', formData, {
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //       },
  //     });

  //     if (response.status === 200) {
  //       console.log('Video uploaded:', response.data);
  //     } else {
  //       throw new Error(`Upload failed with status: ${response.status}`);
  //     }
  //   } catch (error) {
  //     console.error('Error uploading video:', error);
  //     throw error;
  //   }
  // };

  // Function to start Python scripts by making an API call
  const startPythonScripts = async () => {
    try {
      await axios.post('/api/start-scripts'); // Next.js API route
      console.log('Python scripts started.');
    } catch (error) {
      console.error('Error starting Python scripts:', error);
      throw error;
    }
  };

  // Function to stop Python scripts by making an API call
  const stopPythonScripts = async () => {
    try {
      await axios.post('/api/stop-scripts'); // Next.js API route
      console.log('Python scripts stopped.');
    } catch (error) {
      console.error('Error stopping Python scripts:', error);
      throw error;
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
      case TASKS.TYPING_TEST:
        return <TypingTest onTaskComplete={handleTaskCompletion} />;
      case TASKS.STROOP_TEST:
        return <StroopTest onTaskComplete={handleTaskCompletion} />;
      case TASKS.WORD_MAZE:
        return <WordMaze onTaskComplete={handleTaskCompletion} />;
      case TASKS.MAZE_GAME:
        return <MazeGame onTaskComplete={handleTaskCompletion} />;
      // case TASKS.PUZZLE_GAME:
      //   return <PuzzleGame onTaskComplete={handleTaskCompletion} />;
      case TASKS.CREATIVE_TASK:
        return <Mail onTaskComplete={handleTaskCompletion} />;
      case TASKS.SURVEY:
        return <Questionnaire onComplete={handleTaskCompletion} />; {/* Updated prop */}
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
    <div className="min-h-screen bg-slate-800 text-white flex flex-col items-center justify-center p-4">
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
