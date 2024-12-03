import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { timeTaken, totalMoves, wrongMoves } = req.body;

    // Validate input data
    if (
      typeof timeTaken !== 'number' ||
      typeof totalMoves !== 'number' ||
      typeof wrongMoves !== 'number'
    ) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    const csvDirectory = path.join(process.cwd(), 'csv');
    const csvFilePath = path.join(csvDirectory, 'maze_game_results.csv');

    // Ensure the 'csv' directory exists
    if (!fs.existsSync(csvDirectory)) {
      fs.mkdirSync(csvDirectory);
    }

    const csvWriter = createObjectCsvWriter({
      path: csvFilePath,
      header: [
        { id: 'timestamp', title: 'Timestamp' },
        { id: 'timeTaken', title: 'Time Taken (s)' },
        { id: 'totalMoves', title: 'Total Moves' },
        { id: 'wrongMoves', title: 'Wrong Moves' },
      ],
      append: fs.existsSync(csvFilePath), // Append to the file if it exists
    });

    try {
      const record = {
        timestamp: new Date().toISOString(),
        timeTaken,
        totalMoves,
        wrongMoves,
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
