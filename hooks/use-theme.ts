import { useContext } from 'react';
import { AppContext } from '@/app/_layout';

export const LIGHT = {
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#111827',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  inputBg: '#FFFFFF',
  inputBorder: '#CBD5E1',
  label: '#334155',
  divider: '#F3F4F6',
  chipText: '#374151',
  chipBorder: '#CBD5E1',
};

export const DARK = {
  background: '#0F172A',
  card: '#1E293B',
  text: '#F1F5F9',
  textMuted: '#94A3B8',
  border: '#334155',
  inputBg: '#1E293B',
  inputBorder: '#475569',
  label: '#94A3B8',
  divider: '#334155',
  chipText: '#CBD5E1',
  chipBorder: '#475569',
};

export type Theme = typeof LIGHT;

export function useTheme(): Theme {
  const context = useContext(AppContext);
  return context?.theme === 'dark' ? DARK : LIGHT;
}
