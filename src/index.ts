import db from './database.js'; // Use .js extension for ESM
import { startScheduler } from './scheduler.js'; // Use .js extension for ESM
import { startAPIServer } from './api.js'; // Use .js extension for ESM

// Initialize the application
async function initializeApp() {
  try {
    console.log('Initializing database...');
    // Ensure the database is ready
    db.exec(`
      CREATE TABLE IF NOT EXISTS commits (
        id INTEGER PRIMARY KEY,
        sha TEXT UNIQUE,
        repo TEXT,
        author TEXT,
        date DATETIME,
        message TEXT
      );
      
      CREATE TABLE IF NOT EXISTS leaderboard (
        user_id TEXT PRIMARY KEY,
        username TEXT,
        commit_count INTEGER DEFAULT 0
      );
    `);
    console.log('Database initialized.');

    // Start the scheduler
    console.log('Starting scheduler...');
    startScheduler();
    console.log('Scheduler started.');

    // Start the API server
    console.log('Starting API server...');
    startAPIServer();
    console.log('API server started.');
  } catch (error) {
    console.error('Failed to initialize the app:', error);
    process.exit(1); // Exit with an error code
  }
}

// Handle graceful shutdown
function handleShutdown() {
  console.log('Shutting down...');
  db.close(); // Close the database connection
  process.exit(0); // Exit successfully
}

// Start the application
initializeApp();

// Handle shutdown signals (e.g., Ctrl+C)
process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);