import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { responses } = req.body;

    // Validate input data
    if (typeof responses !== 'object' || responses === null) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    const csvDirectory = path.join(process.cwd(), 'csv');
    const csvFilePath = path.join(csvDirectory, 'questionnaire_responses.csv');

    // Ensure the 'csv' directory exists
    if (!fs.existsSync(csvDirectory)) {
      fs.mkdirSync(csvDirectory);
    }

    const csvWriter = createObjectCsvWriter({
      path: csvFilePath,
      header: [
        { id: 'timestamp', title: 'Timestamp' },
        { id: 'questionId', title: 'Question ID' },
        { id: 'responseValue', title: 'Response Value' },
      ],
      append: fs.existsSync(csvFilePath), // Append to the file if it exists
    });

    try {
      const records = Object.entries(responses).map(([questionId, responseValue]) => ({
        timestamp: new Date().toISOString(),
        questionId,
        responseValue,
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
