// pages/api/save-mail-interruption.js

import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { puzzleId, timeTaken, solved } = req.body;

    // Validate the request body
    if (puzzleId === undefined || timeTaken === undefined || solved === undefined) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Define the directory and file path
    const csvDirectory = path.join(process.cwd(), 'csv');
    const csvFilePath = path.join(csvDirectory, 'interruption_puzzles.csv');

    // Ensure the 'csv' directory exists
    if (!fs.existsSync(csvDirectory)) {
      fs.mkdirSync(csvDirectory, { recursive: true });
    }

    // Initialize the CSV writer
    const csvWriter = createObjectCsvWriter({
      path: csvFilePath,
      header: [
        { id: 'puzzleId', title: 'PuzzleID' },
        { id: 'timeTaken', title: 'TimeTaken(s)' },
        { id: 'solved', title: 'Solved' },
      ],
      append: fs.existsSync(csvFilePath), // Append to the file if it exists
    });

    try {
      // Prepare the data to write
      const dataToWrite = [{
        puzzleId,
        timeTaken,
        solved,
      }];

      // Write the records to the CSV file
      await csvWriter.writeRecords(dataToWrite);

      // Respond with a success message
      res.status(200).json({ message: 'Interruption data saved successfully.' });
    } catch (error) {
      console.error('Error writing to interruption_puzzles.csv:', error);
      res.status(500).json({ error: 'Failed to save interruption data.' });
    }
  } else {
    // Handle unsupported HTTP methods
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
