import express, { Request, Response } from 'express'; // Import Request and Response types
import db from './database.js';

export function startAPIServer() {
  const app = express();
  const port = 3000;

  // Leaderboard endpoint
  app.get('/api/leaderboard', (req: Request, res: Response) => {
    const leaderboard = db
      .prepare(
        `
      SELECT username, commit_count 
      FROM leaderboard 
      ORDER BY commit_count DESC
      LIMIT 10
    `
      )
      .all();

    res.json(leaderboard);
  });

  // Commits endpoint
  app.get('/api/commits', (req, res) => {
    const { repo, author } = req.query;

    if (!repo) {
      res.status(400).json({ error: 'Repository name is required' });

      return;
    }

    try {
      let query = `
        SELECT sha, repo, author, date, message 
        FROM commits 
        WHERE repo = ?
      `;
      const params = [repo as string]; // Explicitly cast repo to string

      if (author) {
        query += ' AND author = ?';
        params.push(author as string); // Explicitly cast author to string
      }

      query += ' ORDER BY date DESC';

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