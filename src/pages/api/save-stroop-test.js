// pages/api/save-stroop-test.js

import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { results } = req.body;

    if (!results || !Array.isArray(results)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    const csvDirectory = path.join(process.cwd(), 'csv');
    const csvFilePath = path.join(csvDirectory, 'stroop_test_results.csv');

    // Ensure the 'csv' directory exists
    if (!fs.existsSync(csvDirectory)) {
      fs.mkdirSync(csvDirectory);
    }

    const csvWriter = createObjectCsvWriter({
      path: csvFilePath,
      header: [
        { id: 'questionId', title: 'Question ID' },
        { id: 'word', title: 'Word' },
        { id: 'color', title: 'Color' },
        { id: 'keyPressed', title: 'Key Pressed' },
        { id: 'timeTaken', title: 'Time Taken (s)' },
        { id: 'isCorrect', title: 'Is Correct' },
        { id: 'timestamp', title: 'Timestamp' },
      ],
      append: fs.existsSync(csvFilePath), // Append to the file if it exists
    });

    try {
      const dataToWrite = results.map((result) => ({
        ...result,
        timestamp: new Date().toISOString(),
      }));

      await csvWriter.writeRecords(dataToWrite);
      res.status(200).json({ message: 'Data saved successfully' });
    } catch (error) {
      console.error('Error writing to CSV file:', error);
      res.status(500).json({ error: 'Failed to save data' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
