import { Cron } from 'croner';
import { crawlOrganization } from './crawler.js';
import db from './database.js';

// Function to start the scheduler
export function startScheduler() {
  // Reset leaderboard at midnight every day
  const resetJob = new Cron(
    '0 0 * * *', // Midnight every day
    {
      timezone: 'Asia/Ho_Chi_Minh', // Vietnam timezone
    },
    async () => {
      console.log('Resetting leaderboard/commits for the new day...');
      db.prepare('DELETE FROM leaderboard').run();
      db.prepare('DELETE FROM commits').run();
      console.log('Leaderboard/Commits reset completed.');
    }
  );

   // Crawl GitHub data every hour from 10:00 AM to 7:00 PM
   const crawlJob = new Cron(
    '0 10-19 * * *', // Every hour from 10:00 AM to 7:00 PM
    {
      timezone: 'Asia/Ho_Chi_Minh', // Vietnam timezone
    },
    async () => {
      console.log('Starting GitHub crawl...');
      try {
        await crawlOrganization();
        console.log('Crawl completed');
      } catch (error) {
        console.error('Crawl failed:', error);
      }
    }
  );

  console.log('Cron jobs scheduled:');
  console.log('- Leaderboard reset at:', resetJob.nextRun());
  console.log('- Next crawl at:', crawlJob.nextRun());
}