// pages/api/save-typing-test.js

import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const data = req.body;

    const csvDirectory = path.join(process.cwd(), 'csv');
    const csvFilePath = path.join(csvDirectory, 'typing_test_results.csv');

    // Ensure the 'csv' directory exists
    if (!fs.existsSync(csvDirectory)) {
      fs.mkdirSync(csvDirectory);
    }

    const csvWriter = createObjectCsvWriter({
      path: csvFilePath,
      header: [
        { id: 'timestamp', title: 'Timestamp' },
        { id: 'wpm', title: 'WPM' },
        { id: 'accuracy', title: 'Accuracy (%)' },
        { id: 'totalErrors', title: 'Total Errors' },
        { id: 'timeTaken', title: 'Time Taken (s)' },
      ],
      append: fs.existsSync(csvFilePath), // Append to the file if it exists
    });

    try {
      await csvWriter.writeRecords([data]);
      res.status(200).json({ message: 'Data saved successfully' });
    } catch (error) {
      console.error('Error writing to CSV file:', error);
      res.status(500).json({ error: 'Failed to save data' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
