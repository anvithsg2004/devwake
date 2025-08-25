// app/layout.jsx
// Root layout for the App Router. Keeps SessionProvider and offsets content
// so it doesn't slide under the fixed navbar (h-16 => pt-16).

'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import Navbar from '@/components/shared/Navbar';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <SessionProvider>
                    <Navbar />
                    {/* Offset equals navbar height: h-16 = 4rem */}
                    <main className="pt-16">{children}</main>
                </SessionProvider>
            </body>
        </html>
    );
}
