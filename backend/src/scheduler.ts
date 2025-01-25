import { Cron } from 'croner';
import { crawlOrganization } from './crawler.js';

// Function to start the scheduler
export function startScheduler() {
  // Schedule the task to run every hour from 10:00 AM to 7:00 PM in Vietnam timezone
  const job = new Cron(
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
        if (error instanceof Error) {
          console.error('Crawl failed:', error.message);
        } else {
          console.error('An unknown error occurred during the crawl');
        }
      }
    }
  );

  console.log('Cron job scheduled. Next run at:', job.nextRun());
}