// Simple in-memory store for serverless functions.
// Note: State persists only while the lambda stays warm.

const g = globalThis;

function ensureStore() {
  if (!g.__BXSS_STORE__) {
    g.__BXSS_STORE__ = {
      seq: 1,
      reports: [],
      contact_messages: [],
      comments: [],
      xss_payloads: [],
    };
  }
  return g.__BXSS_STORE__;
}

export function add(collection, item) {
  const store = ensureStore();
  const now = new Date();
  const entry = { id: store.seq++, created_at: now.toISOString(), ...item };
  store[collection].unshift(entry);
  return entry;
}

export function all(collection) {
  const store = ensureStore();
  return store[collection];
}

export function recentSince(collection, isoTimestamp) {
  const since = new Date(isoTimestamp).getTime();
  return all(collection).filter((x) => new Date(x.created_at).getTime() > since);
}

