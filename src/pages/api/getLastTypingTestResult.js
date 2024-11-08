// pages/api/getLastTypingResult.js
export default async function handler(req, res) {
    if (req.method === 'GET') {
      try {
        const response = await fetch('https://api.monkeytype.com/results/last', {
          method: 'GET',
          headers: {
            'Authorization': `ApeKey ${process.env.NEXT_PUBLIC_APE_KEY}`,  // Using environment variable
            'Content-Type': 'application/json'
          }
        });
  
        if (!response.ok) {
          return res.status(response.status).json({ message: 'Failed to fetch typing result' });
        }
  
        const resultData = await response.json();
        res.status(200).json(resultData);
      } catch (error) {
        console.error('Error fetching last typing result:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  }
  