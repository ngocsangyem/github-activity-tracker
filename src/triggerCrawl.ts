import { crawlOrganization } from './crawler.js';
import db from './database.js';
import minimist from 'minimist';

// Parse command-line arguments
const args = minimist(process.argv.slice(2));

(async () => {
  console.log('Manually triggering crawl...');

  // Optional: Reset leaderboard before crawling
  const forceReset = args.reset || false;
  if (forceReset) {
    console.log('Resetting database...');
    db.prepare('DELETE FROM leaderboard').run();
    db.prepare('DELETE FROM commits').run();
  }

  // Optional: Use a specific date for crawling
  const specificDate = args.date;
  if (specificDate) {
    console.log(`Crawling data for specific date: ${specificDate}`);
  } else {
    console.log('Crawling data for today.');
  }

  try {
    await crawlOrganization(specificDate); // Pass the specific date to the crawler
    console.log('Crawl completed successfully.');
  } catch (error) {
    console.error('Crawl failed:', error);
  }
})();