import type { Config } from 'tailwindcss';
const config: Config = { darkMode: ['class'], content: ['./src/**/*.{ts,tsx}'], theme: { extend: { colors: { cage: '#07080d', mat: '#111827', neon: '#b6ff3b', ember: '#ff3d2e', gold: '#fbbf24' }, boxShadow: { glow: '0 0 40px rgba(182,255,59,.24)' } } }, plugins: [require('tailwindcss-animate')] };
export default config;
