// pages/index.js
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [xssInput, setXssInput] = useState('');
  const [reports, setReports] = useState([]);
  const [activeReport, setActiveReport] = useState(null);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState('');
  const [browserUA, setBrowserUA] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!xssInput.trim()) {
      alert('Please enter an XSS payload');
      return;
    }
    
    try {
      // Submit the XSS payload to the API
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userAgent: xssInput }),
      });
      
      if (response.ok) {
        const newReport = await response.json();
        setReports(prev => [newReport, ...prev]);
        setXssInput('');
        
        // Simulate bot reading the report after a short delay
        setTimeout(() => {
          setReports(prev => 
            prev.map(r => 
              r.id === newReport.id ? { ...r, status: 'read' } : r
            )
          );
          setActiveReport(newReport); // This would trigger the XSS execution in a real scenario
        }, 1000);
      } else {
        alert('Error submitting payload');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error submitting payload');
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus('');

    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      setContactStatus('Please fill in all fields.');
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactName.trim(),
          email: contactEmail.trim(),
          message: contactMessage.trim(),
        }),
      });

      if (response.ok) {
        setContactStatus('Thanks! Your message was received.');
        setContactName('');
        setContactEmail('');
        setContactMessage('');
      } else {
        const err = await response.json().catch(() => ({}));
        setContactStatus(err.error || 'Error submitting contact form.');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setContactStatus('Network error submitting contact form.');
    }
  };

  // Load reports on initial load
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('/api/reports');
        if (response.ok) {
          const data = await response.json();
          setReports(data);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };
    
    fetchReports();
    if (typeof navigator !== 'undefined') {
      setBrowserUA(navigator.userAgent || 'Unknown');
    }
  }, []);

  return (
    <div className="container">
      <Head>
        <title>Blind XSS Practice - Single Page</title>
        <meta name="description" content="Practice Blind XSS with auto-reading bot" />
      </Head>

      <main>
        <h1>Blind XSS Practice Site</h1>
        
        <div className="warning">
          <strong>WARNING:</strong> This site simulates a vulnerable admin panel where XSS payloads execute automatically.
        </div>
        
        <div className="input-section">
          <h2>Enter XSS Payload</h2>
          <form onSubmit={handleSubmit}>
            <textarea
              value={xssInput}
              onChange={(e) => setXssInput(e.target.value)}
              placeholder="Enter XSS payload (will be used as User-Agent)..."
              rows="4"
              cols="50"
            />
            <br />
            <button type="submit">Submit Payload</button>
          </form>
        </div>

        <div className="contact-section">
          <h2>Contact Us</h2>
          <div className="warning">
            <strong>WARNING:</strong> This form stores your User-Agent and other details for demo purposes.
          </div>
          <form onSubmit={handleContactSubmit}>
            <input
              type="text"
              placeholder="Your Name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
            />
            <textarea
              placeholder="Your Message"
              rows="4"
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              required
            />
            <br />
            <button type="submit">Send Message</button>
          </form>
          {contactStatus && (
            <p className="status">{contactStatus}</p>
          )}
          <div className="user-agent-display">
            <strong>Your User-Agent:</strong> {browserUA || 'Unknown'}
          </div>
        </div>
        
        <div className="reports-section">
          <h2>Reports - Auto-Read by Bot</h2>
          <p>The bot automatically reads each report, which will execute any XSS payload in the User-Agent.</p>
          
          {reports.length > 0 ? (
            <div className="reports-list">
              {reports.map((report) => (
                <div 
                  key={report.id} 
                  className={`report ${report.status === 'read' ? 'read' : 'pending'}`}
                >
                  <div className="report-header">
                    <span className="status-indicator">
                      {report.status === 'read' ? '👁️ Read' : '⏳ Pending'}
                    </span>
                    <span className="timestamp">{new Date(report.created_at || report.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="report-content">
                    <strong>User-Agent:</strong> {report.user_agent}
                  </div>
                  <div className="report-ip">
                    <strong>IP:</strong> {report.ip_address}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No reports yet. Submit an XSS payload to see it here.</p>
          )}
        </div>
        
        {/* This div will be used to trigger XSS when the bot reads it (in a real browser scenario) */}
        <div id="active-xss-target" style={{display: 'none'}}>
          {activeReport && (
            <div dangerouslySetInnerHTML={{ __html: activeReport.user_agent }} />
          )}
        </div>
      </main>

      <footer>
        <p>Blind XSS Practice - Auto-reading Bot Simulation</p>
      </footer>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 40px;
          background-color: #f5f5f5;
          font-family: Arial, sans-serif;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        main {
          padding: 20px 0;
        }
        
        h1 {
          color: #d9534f;
          margin-top: 0;
          text-align: center;
        }
        
        .warning {
          background-color: #f9f2f4;
          color: #a94442;
          padding: 10px;
          border-radius: 4px;
          margin: 10px 0;
          text-align: center;
        }
        
        .input-section {
          margin: 20px 0;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }

        .contact-section {
          margin: 20px 0;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }

        textarea {
          width: 100%;
          padding: 8px;
          margin: 5px 0;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-sizing: border-box;
        }

        input {
          width: 100%;
          padding: 8px;
          margin: 5px 0;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-sizing: border-box;
        }
        
        button {
          background-color: #5cb85c;
          color: white;
          padding: 10px 15px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 10px;
        }
        
        button:hover {
          background-color: #4cae4c;
        }
        
        .reports-section {
          margin-top: 20px;
        }
        
        .reports-list {
          margin-top: 10px;
        }
        
        .report {
          margin: 10px 0;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #f9f9f9;
        }
        
        .report.pending {
          border-left: 4px solid #f0ad4e;
        }
        
        .report.read {
          border-left: 4px solid #5cb85c;
        }
        
        .report-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.9em;
          color: #666;
        }
        
        .report-content {
          margin: 8px 0;
        }
        
        .report-ip {
          font-size: 0.8em;
          color: #777;
        }

        .user-agent-display {
          margin: 10px 0;
          padding: 10px;
          background-color: #f9f9f9;
          border-left: 3px solid #007cba;
        }

        .status {
          margin-top: 8px;
          color: #333;
        }
        
        .status-indicator {
          font-weight: bold;
        }
        
        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
}
