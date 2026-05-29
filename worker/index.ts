import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import { templates, orders, users } from '../src/db/schema';
import { cors } from 'hono/cors';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { basicAuth } from 'hono/basic-auth';

const app = new Hono<{ Bindings: Env }>();

app.use('/api/*', cors());

// Basic Auth Middleware for Admin Routes
app.use('/api/admin/*', async (c, next) => {
  const auth = basicAuth({
    username: 'admin',
    password: c.env.ADMIN_SECRET || 'admin123',
  });
  return auth(c, next);
});

// --- Public Endpoints ---

// List approved templates
app.get('/api/templates', async (c) => {
  const db = drizzle(c.env.DB);
  const allTemplates = await db
    .select()
    .from(templates)
    .where(eq(templates.status, 'approved'))
    .orderBy(desc(templates.createdAt))
    .all();
  return c.json(allTemplates);
});

// Get a single template
app.get('/api/templates/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param('id');
  const template = await db.select().from(templates).where(eq(templates.id, id)).get();
  
  if (!template) {
    return c.json({ error: 'Template not found' }, 404);
  }
  return c.json(template);
});

// Create an order schema
const orderSchema = z.object({
  templateId: z.string().min(1),
  email: z.string().email(),
});

// Create an order (and Apirone Invoice)
app.post('/api/orders', zValidator('json', orderSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const { templateId, email } = await c.req.json();

  // Get the template to find its price
  const template = await db.select().from(templates).where(eq(templates.id, templateId)).get();
  if (!template) {
    return c.json({ error: 'Template not found' }, 404);
  }

  // Find or create user
  let user = await db.select().from(users).where(eq(users.email, email)).get();
  if (!user) {
    const userId = crypto.randomUUID();
    await db.insert(users).values({
      id: userId,
      name: email.split('@')[0],
      email: email,
      passwordHash: 'dummy',
    });
    user = { id: userId, email, name: email.split('@')[0], role: 'user', passwordHash: 'dummy' };
  }

  const orderId = crypto.randomUUID();

  // Create Apirone Invoice
  let apironeInvoiceUrl = '';
  let apironeInvoiceId = null;

  if (c.env.APIRONE_ACCOUNT && c.env.APIRONE_ACCOUNT !== 'mock_account') {
    const apironeReq = {
      amount: template.price * 10000, 
      currency: "usdt@trx",
      "callback-url": `https://${new URL(c.req.url).hostname}/api/webhooks/apirone`,
      "user-data": {
        title: `Order ${orderId}`,
        merchant: "Template Marketplace",
        items: [
          { name: template.title, cost: (template.price / 100).toString(), qty: 1, total: (template.price / 100).toString() }
        ]
      }
    };

    try {
      const apironeRes = await fetch(`https://apirone.com/api/v2/accounts/${c.env.APIRONE_ACCOUNT}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apironeReq)
      });

      if (apironeRes.ok) {
        const data = await apironeRes.json() as any;
        apironeInvoiceId = data.invoice;
        apironeInvoiceUrl = data['invoice-url'];
      } else {
        console.error('Apirone error:', await apironeRes.text());
        return c.json({ error: 'Failed to generate invoice' }, 500);
      }
    } catch (e) {
      console.error(e);
      return c.json({ error: 'Network error generating invoice' }, 500);
    }
  } else {
    // Mock for local dev
    apironeInvoiceId = `mock_inv_${crypto.randomUUID()}`;
    apironeInvoiceUrl = `https://mock-payment.com/pay/${apironeInvoiceId}`;
  }

  await db.insert(orders).values({
    id: orderId,
    userId: user.id,
    templateId: template.id,
    amount: template.price,
    apironeInvoiceId: apironeInvoiceId,
    status: 'created',
    createdAt: new Date(),
  });

  return c.json({ orderId, invoiceUrl: apironeInvoiceUrl });
});

// Apirone Webhook Callback
app.post('/api/webhooks/apirone', async (c) => {
  const db = drizzle(c.env.DB);
  const payload = await c.req.json();
  const invoiceId = c.req.query('invoice') || payload.invoice;
  const status = payload.status;

  if (invoiceId && status) {
    await db.update(orders)
      .set({ status })
      .where(eq(orders.apironeInvoiceId, invoiceId));
    return c.json({ success: true });
  }

  return c.json({ error: 'Invalid payload' }, 400);
});

// --- Admin Endpoints ---

app.get('/api/admin/templates', async (c) => {
  const db = drizzle(c.env.DB);
  const allTemplates = await db.select().from(templates).orderBy(desc(templates.createdAt)).all();
  return c.json(allTemplates);
});

const newTemplateSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.number().min(0),
  imageUrl: z.string().url().optional(),
  demoUrl: z.string().url().optional(),
  fileUrl: z.string().url().optional(),
});

app.post('/api/admin/templates', zValidator('json', newTemplateSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  
  let admin = await db.select().from(users).where(eq(users.role, 'admin')).get();
  if (!admin) {
    const adminId = crypto.randomUUID();
    await db.insert(users).values({
      id: adminId,
      name: 'Admin',
      email: 'admin@admin.com',
      role: 'admin',
      passwordHash: 'dummy'
    });
    admin = { id: adminId, email: 'admin@admin.com', name: 'Admin', role: 'admin', passwordHash: 'dummy' };
  }

  const newTemplate = {
    id: crypto.randomUUID(),
    title: body.title,
    description: body.description,
    price: body.price,
    imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop',
    demoUrl: body.demoUrl || 'https://demo.com',
    fileUrl: body.fileUrl || 'https://file.com',
    authorId: admin.id,
    status: 'approved',
    createdAt: new Date(),
  };

  await db.insert(templates).values(newTemplate);
  return c.json(newTemplate);
});

const patchTemplateSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  title: z.string().optional(),
});

app.patch('/api/admin/templates/:id', zValidator('json', patchTemplateSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param('id');
  const body = await c.req.json();

  await db.update(templates).set(body).where(eq(templates.id, id));
  return c.json({ success: true });
});

// View Orders
app.get('/api/admin/orders', async (c) => {
  const db = drizzle(c.env.DB);
  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).all();
  return c.json(allOrders);
});

app.notFound((c) => {
  return c.json({ error: "Not Found" }, 404);
});

export default app;
