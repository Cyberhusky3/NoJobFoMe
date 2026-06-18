import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'FightFit AI', description: 'Find your fighting style and start safely.' };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
