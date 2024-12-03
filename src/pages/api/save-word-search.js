import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { totalTime, foundWords } = req.body;

    // Validate input data
    if (typeof totalTime !== 'number' || !Array.isArray(foundWords)) {
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
        { id: 'timestamp', title: 'Timestamp' },
        { id: 'totalTime', title: 'Total Time (s)' },
        { id: 'foundWords', title: 'Found Words' },
      ],
      append: fs.existsSync(csvFilePath), // Append to the file if it exists
    });

    try {
      const record = {
        timestamp: new Date().toISOString(),
        totalTime,
        foundWords: foundWords.join(', '), // Convert array to a comma-separated string
      };

      await csvWriter.writeRecords([record]);
      res.status(200).json({ message: 'Data saved successfully' });
    } catch (error) {
      console.error('Error writing to CSV file:', error);
      res.status(500).json({ error: 'Failed to save data' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
