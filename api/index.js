// api/index.js - Main API route to handle all requests
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

export default async (req, res) => {
  // For API routes, we'll handle the request directly
  const { method, url } = req;
  const parsedUrl = parse(url, true);
  const { pathname, query } = parsedUrl;

  // Import the handler function
  const handler = await import('./handler').then(mod => mod.default);
  
  // Pass the request to our handler
  return handler(req, res);
};