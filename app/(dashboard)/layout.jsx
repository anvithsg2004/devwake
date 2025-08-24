// app/(dashboard)/layout.jsx
// This layout protects all routes inside the (dashboard) group.
// It checks for a session and redirects if the user is not authenticated.

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/shared/Navbar'; // We can reuse the navbar

export default async function DashboardLayout({ children }) {
    const session = await getServerSession(authOptions);

    // If there is no session, redirect the user to the homepage.
    if (!session) {
        redirect('/');
    }

    // If there is a session, render the layout with the children (the actual page).
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main>{children}</main>
        </div>
    );
}
