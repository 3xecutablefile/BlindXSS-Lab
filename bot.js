// bot.js - A simple bot that automatically reads reports and triggers XSS
const sqlite3 = require('sqlite3').verbose();
const { spawn } = require('child_process');

// Create a database for reports
const db = new sqlite3.Database('./reports.db');

// Function to simulate the admin bot reading reports
async function readReports() {
  console.log('🤖 Admin bot is checking for new reports...');
  
  // Get reports from the last 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  
  db.all(`
    SELECT * FROM reports 
    WHERE created_at > ? 
    ORDER BY created_at DESC
  `, [fiveMinutesAgo], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return;
    }
    
    if (rows.length > 0) {
      console.log(`Found ${rows.length} new report(s):`);
      rows.forEach(row => {
        console.log(`- Report ID: ${row.id}`);
        console.log(`  User-Agent: ${row.user_agent}`);
        console.log(`  IP: ${row.ip_address}`);
        console.log(`  Time: ${row.created_at}`);
        console.log('---');
        
        // Simulate the bot executing any XSS in the User-Agent
        // In a real scenario, if there's XSS in the User-Agent, it would execute here
        if (row.user_agent.includes('<script') || 
            row.user_agent.includes('onerror') || 
            row.user_agent.includes('javascript:') ||
            row.user_agent.includes('alert')) {
          console.log(`🚨 XSS PAYLOAD DETECTED & EXECUTED from IP: ${row.ip_address}`);
          console.log(`Payload: ${row.user_agent}`);
          
          // In a real browser environment, this would execute the XSS
          // For simulation purposes, we'll just log it
          console.log(`💥 XSS executed in admin's browser context!`);
        }
      });
    } else {
      console.log('No new reports.');
    }
  });
}

// Function to start the bot checking periodically
function startBot() {
  console.log('🤖 Admin bot started. Checking for reports every 3 seconds...');
  
  // Check immediately
  readReports();
  
  // Then check every 3 seconds
  setInterval(readReports, 3000);
}

// Initialize the database
db.serialize(() => {
  // Create the reports table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_agent TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Start the bot
  startBot();
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down admin bot...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});