import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { moves } = req.body;

    // Validate input data
    if (!Array.isArray(moves)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    for (const move of moves) {
      if (typeof move.moveNumber !== 'number' ||
          typeof move.wrongMove !== 'boolean' ||
          typeof move.timeTakenForMove !== 'number') {
        return res.status(400).json({ error: 'Invalid move data format' });
      }
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
        // { id: 'timestamp', title: 'Timestamp' },
        { id: 'moveNumber', title: 'Move Number' },
        { id: 'wrongMove', title: 'Wrong Move' },
        { id: 'timeTakenForMove', title: 'Time Taken For Move (s)' },
      ],
      append: fs.existsSync(csvFilePath), // Append if file exists
    });

    try {
      const records = moves.map(move => ({
        // timestamp: new Date().toISOString(),
        moveNumber: move.moveNumber,
        wrongMove: move.wrongMove,
        timeTakenForMove: move.timeTakenForMove,
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
