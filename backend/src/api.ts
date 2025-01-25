import express, { Request, Response } from 'express'; // Import Request and Response types
import db from './database.js';
import cors from 'cors';

export function startAPIServer() {
  const app = express();
  const port = 3000;

  app.use(cors());

  // Leaderboard endpoint
  app.get('/api/leaderboard', (req: Request, res: Response) => {
    const { repo, avatar, authors } = req.query;
    const includeAvatar = avatar !== undefined;

    let query: string;
    let params: unknown[] = [];
    const authorList = authors 
      ? (authors as string).split(',') 
      : null;

    if (repo) {
      // Get leaderboard for specific repo
      query = `
        SELECT c.author AS username, COUNT(*) AS commit_count
        ${includeAvatar ? ', l.avatar_url' : ''}
        FROM commits c
        LEFT JOIN leaderboard l ON c.author = l.username
        WHERE c.repo = ?
          ${authorList ? 'AND c.author IN (' + authorList.map(() => '?').join(',') + ')' : ''}
          AND c.author NOT LIKE '%bot%'
        GROUP BY c.author
        ORDER BY commit_count DESC
      `;

      params = [repo];
      if (authorList) params.push(...authorList);
    } else {
      const fields = includeAvatar 
        ? 'username, commit_count, avatar_url'
        : 'username, commit_count';

      // Get global leaderboard
      query = `
        SELECT ${fields}
        FROM leaderboard 
        WHERE username NOT LIKE '%bot%'
        ${authorList ? 'AND username IN (' + authorList.map(() => '?').join(',') + ')' : ''}
        ORDER BY commit_count DESC 
      `;

      if (authorList) params.push(...authorList);
    }

    try {
      const results = db.prepare(query).all(...params);
      const finalResults = results.length >= 5 ? results.slice(0, 10) : results;
      
      // Remove avatar_url if not requested
      if (!includeAvatar) {
        // TODO: remove type assertion
        finalResults.forEach(user => delete (user as { avatar_url?: string }).avatar_url);
      }
  
      res.json(finalResults);
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