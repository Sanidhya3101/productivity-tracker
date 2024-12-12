// pages/api/save-word-search.js

import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { foundWords, retention_time } = req.body;

    // Validate input data
    if (
      !Array.isArray(foundWords)
    ) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    const csvDirectory = path.join(process.cwd(), 'csv');
    const csvFilePath = path.join(csvDirectory, 'word_search_results.csv');

    // Ensure the 'csv' directory exists
    if (!fs.existsSync(csvDirectory)) {
      fs.mkdirSync(csvDirectory);
    }

    const csvWriter = createObjectCsvWriter({
      path: csvFilePath,
      header: [
        // { id: 'timestamp', title: 'Timestamp' },
        { id: 'word', title: 'Word' },
        { id: 'timeTaken', title: 'Time Taken (s)' },
        { id: 'retention_time', title: 'Retention Time (s)' },
      ],
      append: fs.existsSync(csvFilePath), // Append to the file if it exists
    });

    // Prepare records
    const records = foundWords.map((wordObj) => ({
      // timestamp: new Date().toISOString(),
      word: wordObj.word,
      timeTaken: parseFloat(wordObj.timeTaken),
      retention_time: wordObj.retention_time ? parseFloat(wordObj.retention_time) : '',
    }));

    try {
      await csvWriter.writeRecords(records);
      res.status(200).json({ message: 'Data saved successfully' });
    } catch (error) {
      console.error('Error writing to CSV file:', error);
      res.status(500).json({ error: 'Failed to save data' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
