import { Hono } from 'hono';

// Define Cloudflare Bindings
export interface Env {
  DB: D1Database;
  // Add KV, R2, or Secrets here later
}

const app = new Hono<{ Bindings: Env }>();

// API Routes
app.get('/api/', (c) => {
  return c.json({
    name: "Cloudflare (Powered by Hono)",
    status: "Production Ready"
  });
});

// 404 Handler for undefined API routes
app.notFound((c) => {
  return c.json({ error: "Not Found" }, 404);
});

export default app;
