// app/layout.jsx
// This is the root layout for the entire application.
// We wrap our app in a SessionProvider to make auth state available everywhere.

'use client'; // SessionProvider requires this to be a client component

import { SessionProvider } from 'next-auth/react';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
    // The session prop is optional and can be used to pre-populate the session
    // on the server, reducing the initial loading time on the client.
    return (
        <html lang="en">
            <body className={inter.className}>
                <SessionProvider>
                    {children}
                </SessionProvider>
            </body>
        </html>
    );
}
