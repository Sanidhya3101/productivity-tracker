'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function Component() {
  const [answer, setAnswer] = useState('');

  // const question = 'Write a short mail to your manager, asking for a leave application. You will be judged based on your creativity, and the tone of the mail';
  const question = 'Write a concise and professional email to your manager requesting a leave application. Your submission will be evaluated on creativity, tone, formatting, and overall communication effectiveness.'

  const handleSubmit = () => {
    if (answer.trim()) {
      const csvContent = `Message\n"${answer.replace(/"/g, '""')}"`; // Escape double quotes in the message
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'user_message.csv'; // File name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('CSV file created and downloaded:', answer);
      setAnswer(''); // Clear the input field
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Question</CardTitle>
          <CardDescription>Read the question carefully before answering.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium">{question}</p>
        </CardContent>
      </Card>

      <Card className="min-h-[50vh]">
        <CardHeader>
          <CardTitle>Your Answer</CardTitle>
          <CardDescription>Provide your thoughtful response below.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Type your answer here..."
            className="min-h-[40vh] resize-none"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            aria-label="Answer input"
          />
        </CardContent>
      </Card>

      <Button className="w-full" onClick={handleSubmit} disabled={!answer.trim()}>
        Submit
      </Button>
    </div>
  );
}

