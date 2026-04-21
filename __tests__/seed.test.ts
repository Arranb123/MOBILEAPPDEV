// Unit test: seed function inserts sample data into all core tables without duplication

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn().mockReturnValue({ execSync: jest.fn() }),
}));

jest.mock('drizzle-orm/expo-sqlite', () => ({
  drizzle: jest.fn(),
}));

// Put mock functions inside the factory to avoid jest hoisting issues.
// Expose them via extra keys so tests can access them with jest.requireMock.
jest.mock('@/db/client', () => {
  const mockFrom = jest.fn().mockResolvedValue([]);
  const mockValues = jest.fn().mockResolvedValue(undefined);
  const mockInsert = jest.fn(() => ({ values: mockValues }));
  const mockSelect = jest.fn(() => ({ from: mockFrom }));
  return {
    db: { select: mockSelect, insert: mockInsert },
    __mockFrom: mockFrom,
    __mockInsert: mockInsert,
    __mockSelect: mockSelect,
  };
});

jest.mock('@/db/schema', () => ({
  users: 'users',
  categories: 'categories',
  applications: 'applications',
  statusLogs: 'statusLogs',
  targets: 'targets',
}));

import { seedIfEmpty } from '@/db/seed';

function getMocks() {
  const mod = jest.requireMock('@/db/client') as {
    __mockFrom: jest.Mock;
    __mockInsert: jest.Mock;
    __mockSelect: jest.Mock;
  };
  return mod;
}

const mockCategories = [
  { id: 1, name: 'Technology', color: '#0F766E', icon: '💻' },
  { id: 2, name: 'Finance', color: '#1D4ED8', icon: '💰' },
  { id: 3, name: 'Marketing', color: '#9333EA', icon: '📢' },
];

const mockApplications = [
  { id: 1, company: 'Google', role: 'SE', date: '2025-01-15', status: 'Interviewing', categoryId: 1, notes: null },
  { id: 2, company: 'Goldman Sachs', role: 'Analyst', date: '2025-01-22', status: 'Rejected', categoryId: 2, notes: null },
  { id: 3, company: 'HubSpot', role: 'Growth Engineer', date: '2025-02-05', status: 'Offer', categoryId: 3, notes: null },
  { id: 4, company: 'Shopify', role: 'Mobile Dev', date: '2025-02-14', status: 'Interviewing', categoryId: 1, notes: null },
];

beforeEach(() => {
  const { __mockFrom, __mockInsert, __mockSelect } = getMocks();
  __mockFrom.mockReset();
  __mockInsert.mockReset();
  __mockSelect.mockReset();
  // Restore implementations after reset
  __mockSelect.mockImplementation(() => ({ from: __mockFrom }));
  __mockInsert.mockImplementation(() => ({ values: jest.fn().mockResolvedValue(undefined) }));
  // Sequence: users empty → categories empty → cats after insert → apps after insert
  __mockFrom
    .mockResolvedValueOnce([])               // users check (empty)
    .mockResolvedValueOnce([])               // categories check (empty)
    .mockResolvedValueOnce(mockCategories)   // categories loaded after insert
    .mockResolvedValueOnce(mockApplications) // applications loaded after insert
    .mockResolvedValue([]);                  // fallback
});

describe('seedIfEmpty', () => {
  it('inserts a demo user when the users table is empty', async () => {
    await seedIfEmpty();
    const { __mockInsert } = getMocks();
    const insertedTables = __mockInsert.mock.calls.map(call => call[0]);
    expect(insertedTables).toContain('users');
  });

  it('inserts categories when the categories table is empty', async () => {
    await seedIfEmpty();
    const { __mockInsert } = getMocks();
    const insertedTables = __mockInsert.mock.calls.map(call => call[0]);
    expect(insertedTables).toContain('categories');
  });

  it('inserts applications into the applications table', async () => {
    await seedIfEmpty();
    const { __mockInsert } = getMocks();
    const insertedTables = __mockInsert.mock.calls.map(call => call[0]);
    expect(insertedTables).toContain('applications');
  });

  it('inserts status logs into the statusLogs table', async () => {
    await seedIfEmpty();
    const { __mockInsert } = getMocks();
    const insertedTables = __mockInsert.mock.calls.map(call => call[0]);
    expect(insertedTables).toContain('statusLogs');
  });

  it('inserts targets into the targets table', async () => {
    await seedIfEmpty();
    const { __mockInsert } = getMocks();
    const insertedTables = __mockInsert.mock.calls.map(call => call[0]);
    expect(insertedTables).toContain('targets');
  });

  it('does not re-seed categories if data already exists', async () => {
    const { __mockFrom, __mockInsert } = getMocks();
    // Reset and provide a fresh sequence for this specific test
    __mockFrom.mockReset();
    __mockFrom
      .mockResolvedValueOnce([])  // users empty → seed user
      .mockResolvedValueOnce([{ id: 1, name: 'Technology', color: '#0F766E', icon: '💻' }]); // categories not empty → stop

    await seedIfEmpty();

    const insertedTables = __mockInsert.mock.calls.map(call => call[0]);
    expect(insertedTables).not.toContain('applications');
  });
});
