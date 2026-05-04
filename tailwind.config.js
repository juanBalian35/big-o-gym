/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      colors: {
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        panel: 'rgb(var(--color-panel) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        warn: 'rgb(var(--color-warn) / <alpha-value>)',
        error: 'rgb(var(--color-error) / <alpha-value>)',
        ok: 'rgb(var(--color-ok) / <alpha-value>)',
      },
    },
  },
  plugins: [],
};
