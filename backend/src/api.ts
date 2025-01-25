import express, { Request, Response } from 'express'; // Import Request and Response types
import db from './database.js';

export function startAPIServer() {
  const app = express();
  const port = 3000;

  // Leaderboard endpoint
  app.get('/api/leaderboard', (req: Request, res: Response) => {
    const { repo } = req.query;

    let query: string;
    let params: unknown[] = [];

    if (repo) {
      // Get leaderboard for specific repo
      query = `
        SELECT author AS username, COUNT(*) AS commit_count 
        FROM commits 
        WHERE repo = ? 
          AND author NOT LIKE '%bot%'
        GROUP BY author 
        ORDER BY commit_count DESC 
      `;
      params = [repo];
    } else {
      // Get global leaderboard
      query = `
        SELECT username, commit_count 
        FROM leaderboard 
        WHERE username NOT LIKE '%bot%'
        ORDER BY commit_count DESC
      `;
    }

    try {
      // First try to get 10 results
      const initialResults = db.prepare(`${query} LIMIT 10`).all(...params);
      
      // If less than 5 results, get up to 15 to ensure minimum 5
      const finalResults = initialResults.length >= 5 
        ? initialResults 
        : db.prepare(`${query} LIMIT 15`).all(...params);
  
      res.json(finalResults.slice(0, 10)); // Always return 5-10 items
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });

  // Commits endpoint
  app.get('/api/commits', (req, res) => {
    const { repo, author, limit = '10', offset = '0' } = req.query;

    if (!repo) {
      res.status(400).json({ error: 'Repository name is required' });
      return;
    }

    try {
      let query = `
      SELECT sha, repo, author, date, message, pr_url 
      FROM commits 
      WHERE repo = ?
        AND author NOT LIKE '%bot%'
    `;
      const params = [repo];

      if (author) {
        query += ' AND author = ?';
        params.push(author);
      }

      query += ' ORDER BY date DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const commits = db.prepare(query).all(...params);
      res.json(commits);
    } catch (error) {
      console.error('Error fetching commits:', error);
      res.status(500).json({ error: 'Failed to fetch commits' });
    }
  });

  // Start the server
  app.listen(port, () => {
    console.log(`API server running on http://localhost:${port}`);
  });
}