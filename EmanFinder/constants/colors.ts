export type Colors = {
  primary: string;
  accent: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  highlight: string;
  error: string;
};

export const lightColors: Colors = {
  primary: '#0F6F4F',
  accent: '#D4AE6F',
  background: '#F5F1E9',
  card: '#FFFFFF',
  text: '#2E2E2E',
  textSecondary: '#666666',
  border: '#f0f0f0',
  highlight: '#F6ECD9',
  error: '#E04E5C',
} as const;

export const darkColors: Colors = {
  primary: '#0F6F4F',
  accent: '#D4AE6F',
  background: '#121212',
  card: '#1e1e1e',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  border: '#333333',
  highlight: '#26322c',
  error: '#E04E5C',
};

// Default export for compatibility
export const colors = lightColors;
