import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { puzzleData } = req.body;

    // Validate input data
    if (!Array.isArray(puzzleData) || puzzleData.length === 0) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    const csvDirectory = path.join(process.cwd(), 'csv');
    const csvFilePath = path.join(csvDirectory, 'puzzle_game_results.csv');

    // Ensure the 'csv' directory exists
    if (!fs.existsSync(csvDirectory)) {
      fs.mkdirSync(csvDirectory);
    }

    const csvWriter = createObjectCsvWriter({
      path: csvFilePath,
      header: [
        { id: 'timestamp', title: 'Timestamp' },
        { id: 'puzzleId', title: 'Puzzle ID' },
        { id: 'response', title: 'Response Given' },
        { id: 'timeTaken', title: 'Time Taken (s)' },
      ],
      append: fs.existsSync(csvFilePath), // Append to the file if it exists
    });

    try {
      const records = puzzleData.map(({ puzzleId, response, timeTaken }) => ({
        timestamp: new Date().toISOString(),
        puzzleId,
        response,
        timeTaken,
      }));

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
