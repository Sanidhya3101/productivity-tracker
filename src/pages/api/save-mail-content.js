// pages/api/save-mail-content.js

import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { question, answer, timeTaken, retention_time } = req.body;

    // Validate the request body
    if (!question || !answer || timeTaken === undefined || retention_time === undefined) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Define the directory and file path
    const csvDirectory = path.join(process.cwd(), 'csv');
    const csvFilePath = path.join(csvDirectory, 'mail_content.csv');

    // Ensure the 'csv' directory exists
    if (!fs.existsSync(csvDirectory)) {
      fs.mkdirSync(csvDirectory, { recursive: true });
    }

    // Initialize the CSV writer
    const csvWriter = createObjectCsvWriter({
      path: csvFilePath,
      header: [
        { id: 'question', title: 'Question' },
        { id: 'answer', title: 'Answer' },
        { id: 'timeTaken', title: 'TimeTaken(s)' },
        { id: 'retention_time', title: 'RetentionTime(s)' },
      ],
      append: fs.existsSync(csvFilePath), // Append to the file if it exists
    });

    try {
      // Prepare the data to write
      const dataToWrite = [{
        question: question.trim(),
        answer: answer.trim(),
        timeTaken,
        retention_time,
      }];

      // Write the records to the CSV file
      await csvWriter.writeRecords(dataToWrite);

      // Respond with a success message
      res.status(200).json({ message: 'Mail content saved successfully.' });
    } catch (error) {
      console.error('Error writing to mail_content.csv:', error);
      res.status(500).json({ error: 'Failed to save mail content.' });
    }
  } else {
    // Handle unsupported HTTP methods
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
