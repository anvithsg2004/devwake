// app/(dashboard)/dashboard/page.jsx
// The main dashboard page for logged-in users.

'use client';

import { useSession } from 'next-auth/react';

export default function DashboardPage() {
    const { data: session } = useSession();

    if (!session) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <p className="text-lg text-gray-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {session.user.name}!</h1>
            <p className="mt-2 text-gray-600">You are now logged in. This is your main dashboard.</p>

            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <h2 className="text-lg font-semibold">Session Details (for debugging)</h2>
                <pre className="mt-2 text-sm bg-white p-3 rounded overflow-x-auto">
                    {JSON.stringify(session, null, 2)}
                </pre>
            </div>
        </div>
    );
}
