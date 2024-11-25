'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function Component() {
  const [answer, setAnswer] = useState('');

  const question =
    'Write a concise and professional email to your manager requesting a leave application. Your submission will be evaluated on creativity, tone, formatting, and overall communication effectiveness.';

  const handleSubmit = () => {
    if (answer.trim()) {
      const csvHeaders = 'Question,Answer\n';
      const csvContent = `${csvHeaders}"${question.replace(/"/g, '""')}","${answer.replace(/"/g, '""')}"`; // Escape double quotes
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'response.csv'; // File name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert('Your response has been saved successfully!');

      setAnswer(''); // Clear the input field
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle>Question</CardTitle>
          <CardDescription>Read the question carefully before answering.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium">{question}</p>
        </CardContent>
      </Card>

      {/* Answer Input Card */}
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

      {/* Submit Button */}
      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={!answer.trim()}
        aria-disabled={!answer.trim()}
      >
        Submit
      </Button>
    </div>
  );
}
