// pages/api/save-word-search-interruption.js

import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { content } = req.body;

    // Validate the request body
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing "content" field.' });
    }

    // Define the directory and file paths
    const csvDirectory = path.join(process.cwd(), 'csv');
    const csvFilePath = path.join(csvDirectory, 'interruption_word_search.csv');

    // Ensure the 'csv' directory exists
    if (!fs.existsSync(csvDirectory)) {
      fs.mkdirSync(csvDirectory);
    }

    // Initialize the CSV writer
    const csvWriter = createObjectCsvWriter({
      path: csvFilePath,
      header: [
        // { id: 'timestamp', title: 'Timestamp' },
        { id: 'content', title: 'Content' },
      ],
      append: fs.existsSync(csvFilePath), // Append to the file if it exists
    });

    try {
      // Prepare the data to write
      const dataToWrite = [{
        // timestamp: new Date().toISOString(),
        content: content.trim(), // Trim whitespace from the input
      }];

      // Write the records to the CSV file
      await csvWriter.writeRecords(dataToWrite);

      // Respond with a success message
      res.status(200).json({ message: 'Interruption data saved successfully.' });
    } catch (error) {
      console.error('Error writing to interruption_word_search.csv:', error);
      res.status(500).json({ error: 'Failed to save interruption data.' });
    }
  } else {
    // Handle unsupported HTTP methods
    res.status(405).json({ error: 'Method not allowed. Use POST instead.' });
  }
}
