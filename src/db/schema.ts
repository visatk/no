import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').notNull().default('user'),
  passwordHash: text('password_hash').notNull(),
});

export const templates = sqliteTable('templates', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  price: integer('price').notNull(),
  imageUrl: text('image_url').notNull(),
  demoUrl: text('demo_url').notNull(),
  fileUrl: text('file_url').notNull(),
  authorId: text('author_id').notNull().references(() => users.id),
  status: text('status').notNull().default('pending'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (t) => ({
  statusIdx: index('templates_status_idx').on(t.status),
  createdIdx: index('templates_created_at_idx').on(t.createdAt),
}));

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  templateId: text('template_id').notNull().references(() => templates.id),
  amount: integer('amount').notNull(),
  apironeInvoiceId: text('apirone_invoice_id'),
  status: text('status').notNull().default('created'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (t) => ({
  invoiceIdx: index('orders_invoice_id_idx').on(t.apironeInvoiceId),
  createdIdx: index('orders_created_at_idx').on(t.createdAt),
}));
