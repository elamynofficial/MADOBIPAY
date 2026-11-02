export const palette = {
  yellow: '#FFC107',
  red: '#E53935',
  orange: '#FF6F00',
  sky: '#38BDF8',
  white: '#FFFFFF',
  dark: '#0F172A',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
};

export const lightTheme = {
  mode: 'light' as const,
  bg: '#F4F6FB',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  primary: palette.orange,
  accent: palette.yellow,
  danger: palette.danger,
  success: palette.success,
  tab: '#FFFFFF',
  header: [palette.orange, palette.red] as const,
};

export const darkTheme = {
  mode: 'dark' as const,
  bg: '#0B1220',
  surface: '#111827',
  card: '#1E293B',
  text: '#F8FAFC',
  muted: '#94A3B8',
  border: '#334155',
  primary: palette.orange,
  accent: palette.yellow,
  danger: palette.danger,
  success: palette.success,
  tab: '#0F172A',
  header: [palette.orange, '#9B1C1C'] as const,
};

export type AppTheme = typeof lightTheme | typeof darkTheme;
