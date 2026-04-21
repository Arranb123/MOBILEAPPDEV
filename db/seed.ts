import { db } from './client';
import { applications, categories, statusLogs, targets, users } from './schema';

export async function seedIfEmpty() {
  const existingUsers = await db.select().from(users);
  if (existingUsers.length === 0) {
    await db.insert(users).values([
      { name: 'Demo User', email: 'demo@example.com', password: 'password' },
    ]);
  }

  const existingCats = await db.select().from(categories);
  if (existingCats.length > 0) return;

  await db.insert(categories).values([
    { name: 'Technology', color: '#0F766E', icon: '' },
    { name: 'Finance', color: '#1D4ED8', icon: '' },
    { name: 'Marketing', color: '#9333EA', icon: '' },
  ]);

  const cats = await db.select().from(categories);
  const tech = cats.find(c => c.name === 'Technology')!;
  const finance = cats.find(c => c.name === 'Finance')!;
  const marketing = cats.find(c => c.name === 'Marketing')!;

  await db.insert(applications).values([
    { company: 'Google', role: 'Software Engineer', date: '2025-01-15', status: 'Interviewing', categoryId: tech.id, notes: 'Applied via referral' },
    { company: 'Meta', role: 'Frontend Developer', date: '2025-01-20', status: 'Rejected', categoryId: tech.id, notes: null },
    { company: 'Goldman Sachs', role: 'Analyst', date: '2025-01-22', status: 'Rejected', categoryId: finance.id, notes: 'Completed 3 rounds' },
    { company: 'JPMorgan', role: 'Software Developer', date: '2025-02-01', status: 'Applied', categoryId: finance.id, notes: null },
    { company: 'HubSpot', role: 'Growth Engineer', date: '2025-02-05', status: 'Offer', categoryId: marketing.id, notes: 'Strong culture fit' },
    { company: 'Stripe', role: 'Backend Engineer', date: '2025-02-10', status: 'Applied', categoryId: tech.id, notes: null },
    { company: 'Shopify', role: 'Mobile Developer', date: '2025-02-14', status: 'Interviewing', categoryId: tech.id, notes: 'Technical screen done' },
    { company: 'Airbnb', role: 'React Native Developer', date: '2026-03-10', status: 'Applied', categoryId: tech.id, notes: null },
    { company: 'Uber', role: 'Software Engineer', date: '2026-03-15', status: 'Interviewing', categoryId: tech.id, notes: null },
    { company: 'Revolut', role: 'Frontend Engineer', date: '2026-03-18', status: 'Applied', categoryId: finance.id, notes: null },
    { company: 'LinkedIn', role: 'Product Engineer', date: '2026-03-21', status: 'Applied', categoryId: tech.id, notes: null },
    { company: 'Notion', role: 'Growth Marketer', date: '2026-03-23', status: 'Applied', categoryId: marketing.id, notes: null },
    { company: 'Figma', role: 'iOS Developer', date: '2026-03-24', status: 'Applied', categoryId: tech.id, notes: null },
  ]);

  const apps = await db.select().from(applications);
  const google = apps.find(a => a.company === 'Google')!;
  const goldman = apps.find(a => a.company === 'Goldman Sachs')!;
  const hubspot = apps.find(a => a.company === 'HubSpot')!;
  const shopify = apps.find(a => a.company === 'Shopify')!;

  await db.insert(statusLogs).values([
    { applicationId: google.id, status: 'Applied', date: '2025-01-15', notes: null },
    { applicationId: google.id, status: 'Interviewing', date: '2025-01-25', notes: 'Phone screen scheduled' },
    { applicationId: goldman.id, status: 'Applied', date: '2025-01-22', notes: null },
    { applicationId: goldman.id, status: 'Interviewing', date: '2025-02-01', notes: null },
    { applicationId: goldman.id, status: 'Rejected', date: '2025-02-10', notes: 'Did not progress after final round' },
    { applicationId: hubspot.id, status: 'Applied', date: '2025-02-05', notes: null },
    { applicationId: hubspot.id, status: 'Offer', date: '2025-02-20', notes: 'Offer received' },
    { applicationId: shopify.id, status: 'Applied', date: '2025-02-14', notes: null },
    { applicationId: shopify.id, status: 'Interviewing', date: '2025-02-21', notes: 'Technical screen passed' },
  ]);

  await db.insert(targets).values([
    { period: 'weekly', count: 3, categoryId: null },
    { period: 'monthly', count: 10, categoryId: null },
    { period: 'monthly', count: 5, categoryId: tech.id },
  ]);
}
