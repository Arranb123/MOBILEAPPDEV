// Integration test: applications list displays seeded data after DB initialisation

// Mock native modules so db/client.ts can be imported without crashing
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn().mockReturnValue({ execSync: jest.fn() }),
}));
jest.mock('drizzle-orm/expo-sqlite', () => ({ drizzle: jest.fn() }));
jest.mock('@/db/client', () => ({ db: {} }));
jest.mock('@/db/seed', () => ({ seedIfEmpty: jest.fn() }));

import { render } from '@testing-library/react-native';
import React from 'react';
import { AppContext } from '@/app/_layout';
import IndexScreen from '@/app/(tabs)/index';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
}));

const mockContext = {
  applications: [
    { id: 1, company: 'Google', role: 'Software Engineer', date: '2026-03-01', status: 'Applied', categoryId: 1, notes: null },
    { id: 2, company: 'Meta', role: 'Frontend Developer', date: '2026-03-05', status: 'Interviewing', categoryId: 1, notes: null },
    { id: 3, company: 'Stripe', role: 'Backend Engineer', date: '2026-03-10', status: 'Offer', categoryId: 2, notes: 'Great team' },
  ],
  categories: [
    { id: 1, name: 'Technology', color: '#0F766E', icon: '' },
    { id: 2, name: 'Finance', color: '#1D4ED8', icon: '' },
  ],
  currentUser: { id: 1, name: 'Demo User', email: 'demo@example.com', password: 'password' },
  setApplications: jest.fn(),
  setCategories: jest.fn(),
  setCurrentUser: jest.fn(),
  isLoading: false,
};

describe('Applications list screen', () => {
  it('renders seeded applications after DB initialisation', () => {
    const { getByText } = render(
      <AppContext.Provider value={mockContext}>
        <IndexScreen />
      </AppContext.Provider>
    );
    expect(getByText('Google')).toBeTruthy();
    expect(getByText('Meta')).toBeTruthy();
    expect(getByText('Stripe')).toBeTruthy();
  });

  it('displays the correct application count in the subtitle', () => {
    const { getByText } = render(
      <AppContext.Provider value={mockContext}>
        <IndexScreen />
      </AppContext.Provider>
    );
    expect(getByText('3 of 3 shown')).toBeTruthy();
  });

  it('shows an empty state when no applications match filters', () => {
    const emptyContext = { ...mockContext, applications: [] };
    const { getByText } = render(
      <AppContext.Provider value={emptyContext}>
        <IndexScreen />
      </AppContext.Provider>
    );
    expect(getByText('No applications match your filters.')).toBeTruthy();
  });
});
