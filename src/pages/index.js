import React, { useState, useRef } from 'react'
import { BellIcon, CalendarIcon, MoonIcon, SunIcon, GearIcon, PersonIcon } from '@radix-ui/react-icons';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const productivityData = [
  { time: '9AM', score: 65 },
  { time: '10AM', score: 75 },
  { time: '11AM', score: 85 },
  { time: '12PM', score: 70 },
  { time: '1PM', score: 60 },
  { time: '2PM', score: 80 },
  { time: '3PM', score: 90 },
]

const historyData = [
  { date: '2023-06-01', score: 78 },
  { date: '2023-05-31', score: 82 },
  { date: '2023-05-30', score: 75 },
  { date: '2023-05-29', score: 88 },
  { date: '2023-05-28', score: 70 },
]

export default function Home() {
  // const [isDarkMode, setIsDarkMode] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [isRecording, setIsRecording] = useState(false);
  const [report, setReport] = useState(null);
  const screenStreamRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const startTimeRef = useRef(null);

  // const toggleDarkMode = () => {
  //   setIsDarkMode(!isDarkMode)
  //   document.documentElement.classList.toggle('dark')
  // }

  const handleStartRecording = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });

      screenStreamRef.current = screenStream;
      cameraStreamRef.current = cameraStream;

      const combinedStream = new MediaStream([
        ...screenStream.getVideoTracks(),
        ...cameraStream.getVideoTracks(),
      ]);

      mediaRecorderRef.current = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });
      mediaRecorderRef.current.start();

      setIsRecording(true);
      startTimeRef.current = Date.now();
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    const endTime = Date.now();
    const sessionDuration = Math.round((endTime - startTimeRef.current) / 1000); // session time in seconds
    const productivityScore = Math.floor(Math.random() * 100); // Placeholder for real analysis

    setReport({
      sessionTime: `${sessionDuration} seconds`,
      productivityScore: `${productivityScore} / 100`,
    });

    setIsRecording(false);
  };

  return (
    // <div className={`flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200 ${isDarkMode ? 'dark' : ''}`}>
    <div className={`flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200`}>
      {/* History Sidebar */}
      {/* <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 ease-in-out"> */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4">
          <h2 className="text-xl text-card-foreground font-semibold mb-4">History</h2>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            {historyData.map((day) => (
              <Button
                key={day.date}
                variant="outline"
                className="w-full text-accent-foreground justify-start mb-2"
                onClick={() => setSelectedDate(day.date)}
              >
                {/* <Calendar className="mr-2 h-4 w-4" /> */}
                <CalendarIcon className="mr-2 h-4 w-4" />
                {day.date}
                <span className="ml-auto">{day.score}</span>
              </Button>
            ))}
          </ScrollArea>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl text-card-foreground font-bold">Productivity Dashboard</h1>
            <div className="flex items-center space-x-4">
              {/* <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
              {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />} */}
              {/* <SunIcon className="h-5 w-5" />
              <MoonIcon className="h-5 w-5" /> */}
              <Button variant="outline" size="icon">
                <BellIcon className="text-accent-foreground h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon">
                <GearIcon className="text-accent-foreground h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon">
                <PersonIcon className="text-accent-foreground h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <ScrollArea className="h-[calc(100vh-5rem)] p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Productivity Score */}
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle>Current Productivity Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <div className="text-7xl font-bold text-primary">{report ? report.productivityScore : selectedDate ? historyData.find(d => d.date === selectedDate)?.score : 85}</div>
                  <div className="text-2xl ml-2 text-muted-foreground">/ 100</div>
                </div>
                <Progress value={report ? parseInt(report.productivityScore) : selectedDate ? historyData.find(d => d.date === selectedDate)?.score : 85} className="mt-4" />
              </CardContent>
            </Card>

            {/* Start/Stop Recording */}
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle>Screen and Camera Recording</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  {!isRecording ? (
                    <Button onClick={handleStartRecording} variant="outline">Start Analyzing</Button>
                  ) : (
                    <Button onClick={handleStopRecording} variant="destructive">Stop</Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Productivity Chart */}
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle>Productivity Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={productivityData}>
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Focus Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">4h 30m</div>
                <p className="text-muted-foreground">+30m from yesterday</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distractions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">12</div>
                <p className="text-muted-foreground">-3 from yesterday</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Breaks Taken</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">5</div>
                <p className="text-muted-foreground">+1 from yesterday</p>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </main>
    </div>
  )
}
