import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TestStart({ onStartFunction }) {
  const [consentGiven, setConsentGiven] = useState(false);

  return (
    <div className="font-sans rounded-3xl bg-white text-foreground p-8 flex items-center justify-center">
      <div className="w-full max-w-3xl space-y-8 rounded-3xl border-solid border-4 border-black p-4">
        <header className="text-center">
          <h1 className="text-4xl font-bold mb-2 text-gradient">Welcome to the Test</h1>
          <p className="text-xl text-red-500 italic">Please read the following information carefully before starting the test.</p>
        </header>
        
        <main className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-2">Test Duration</h2>
            <p className="text-lg">The test will take approximately 20 minutes to complete.</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-2">Test Sections</h2>
            <ol className="list-decimal list-inside space-y-2 text-lg">
              <li><strong>Typing and Data Entry:</strong> Test your typing speed and accuracy.</li>
              <li><strong>Cognitive Tasks:</strong> Engage in problem-solving and memory exercises.</li>
              <li><strong>Creative Tasks:</strong> Demonstrate your creative thinking abilities.</li>
            </ol>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-2">Privacy Information</h2>
            <ScrollArea className="rounded border border-black p-4 bg-card/50 backdrop-blur-sm">
              <ul className="list-disc list-inside space-y-2 text-lg">
                <li>This survey is anonymous to protect your identity.</li>
                <li>Access to data is restricted to only those involved with the creation of the test.</li>
                <li>You can exit the study at any point without penalty.</li>
              </ul>
            </ScrollArea>
          </section>
          
          <div className="flex items-center space-x-3">
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
        </main>
        
        <footer className="text-center">
          <Button 
            className="w-32 max-w-xs text-lg py-6" 
            disabled={!consentGiven} 
            onClick={onStartFunction}
          >
            Start Test
          </Button>
        </footer>
      </div>
    </div>
  );
}


