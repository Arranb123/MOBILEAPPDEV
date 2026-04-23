// all the table definitions for the sqlite database using drizzle orm
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  password: text('password').notNull(),
});

export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
});

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  color: text('color').notNull().default('#0F766E'),
  icon: text('icon').notNull().default('📁'),
});

export const applications = sqliteTable('applications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  company: text('company').notNull(),
  role: text('role').notNull(),
  date: text('date').notNull(),
  status: text('status').notNull().default('Applied'),
  categoryId: integer('category_id').notNull().references(() => categories.id),
  notes: text('notes'),
});

export const statusLogs = sqliteTable('application_status_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  applicationId: integer('application_id').notNull().references(() => applications.id),
  status: text('status').notNull(),
  date: text('date').notNull(),
  notes: text('notes'),
});

export const targets = sqliteTable('targets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  period: text('period').notNull(),
  count: integer('count').notNull(),
  categoryId: integer('category_id').references(() => categories.id),
});

// settings table stores things like dark mode preference as key value pairs
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
