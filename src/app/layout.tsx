import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'FightFit AI', description: 'Personalized martial arts and fitness roadmap for beginners.' };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className="dark"><body>{children}</body></html>}
