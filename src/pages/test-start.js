import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TestStart({ onStartFunction }) {
  const [consentGiven, setConsentGiven] = useState(false);

  return (
    <div className="font-mono min-h-screen bg-background bg-black p-8 flex items-start justify-center">
      <Card className="w-full max-w-3xl p-10 space-y-0">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Welcome to the Test</CardTitle>
          <CardDescription className="text-lg">Please read the following information before starting.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="text-lg font-semibold mb-2">Test Duration</h3>
            <p>The test will take approximately 30 minutes to complete.</p>
          </section>
          <section>
            <h3 className="text-lg font-semibold mb-2">Test Sections</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Typing and Data Entry: Test your typing speed and accuracy.</li>
              <li>Cognitive Tasks: Engage in problem-solving and memory exercises.</li>
              <li>Creative Tasks: Demonstrate your creative thinking abilities.</li>
            </ol>
          </section>
          <section>
            <h3 className="text-lg font-semibold mb-2">Privacy Information</h3>
            <ScrollArea className="max-h-40 rounded border p-4">
              <ul className="list-disc list-inside space-y-2">
                <li>This survey is anonymous to protect your identity.</li>
                <li>Access to data is restricted to only those involved with the creation of the test.</li>
                <li>You can exit the study at any point without penalty.</li>
              </ul>
            </ScrollArea>
          </section>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="consent"
              checked={consentGiven}
              onCheckedChange={(checked) => setConsentGiven(checked)}
            />
            <label
              htmlFor="consent"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have read and agree to the privacy information
            </label>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="mx-auto" disabled={!consentGiven} onClick={onStartFunction}>
            Start Test
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
