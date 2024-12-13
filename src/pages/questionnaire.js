'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

const questions = [
  { id: 1, text: "I stayed focused and avoided distractions throughout the task.", category: "Engagement" },
  { id: 2, text: "I enjoyed working on this task and found it fulfilling.", category: "Task Satisfaction" },
  { id: 3, text: "I feel that I performed well and was productive during this task.", category: "Perceived Performance" },
  { id: 4, text: "I effectively achieved the goals and objectives of this task.", category: "Perceived Performance" },
  { id: 5, text: "I was able to quickly resume the task and recall important details after interruptions.", category: "Retention" },
  { id: 6, text: "I retained the critical information presented or learned during this task.", category: "Retention" },
  { id: 7, text: "I found this task to be appropriately challenging, but not overwhelming.", category: "Task Difficulty" },
  { id: 8, text: "I had to put in significant effort to complete the task, but it felt manageable.", category: "Task Difficulty" },
  { id: 9, text: "I would be willing and motivated to do a similar task in the future.", category: "Task Satisfaction" },
  { id: 10, text: "I believe my productivity in this task was high and met my expectations.", category: "Perceived Productivity" }
];

export default function Questionnaire({ onComplete = () => {} }) {
  const [responses, setResponses] = useState({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const submitResponses = async () => {
    try {
      const response = await fetch('/api/save-questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      console.log('Responses saved successfully');
    } catch (error) {
      console.error('Error saving responses:', error);
    }
  };

  const handleResponse = (questionId, value) => {
    setResponses(prev => ({ ...prev, [questionId]: value }))
  }

  const allAnswered = Object.keys(responses).length === questions.length;

  const handleSubmit = () => {
    submitResponses();
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false)
    onComplete()
  }

  return (
    <div className="fixed inset-0 bg-slate-800 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl sm:text-3xl font-bold">Post-Task Questionnaire</CardTitle>
          <CardDescription className="text-base">
            Please rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree) with 3 meaning unsure (neither Agree nor Disagree).
          </CardDescription>
        </CardHeader>
        <ScrollArea className="flex-grow overflow-y-auto max-h-[60vh]">
          <CardContent className="space-y-6 pb-6">
            {questions.map((question) => (
              <div key={question.id} className="space-y-2">
                <h3 className="text-lg font-semibold">{`Question ${question.id}: [${question.category}]`}</h3>
                <p className="text-sm text-muted-foreground">{question.text}</p>
                <RadioGroup
                  onValueChange={(value) => handleResponse(question.id, Number(value))}
                  value={responses[question.id]?.toString() || ""}
                  className="flex justify-between pt-2"
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <div key={value} className="flex flex-col items-center space-y-1">
                      <RadioGroupItem
                        value={value.toString()}
                        id={`q${question.id}-${value}`}
                        className="h-4 w-4"
                      />
                      <Label
                        htmlFor={`q${question.id}-${value}`}
                        className="text-xs font-normal"
                      >
                        {value}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </CardContent>
        </ScrollArea>
        <CardFooter className="flex justify-end pt-6">
          <Button onClick={handleSubmit} disabled={!allAnswered} className="mx-auto">
            Submit Questionnaire
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thank You!</DialogTitle>
            <DialogDescription>
              Thank you for completing the test and providing your valuable feedback. Your responses have been recorded.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={closeDialog} className="mx-auto mt-4">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
