// components/shared/Navbar.jsx
// UPDATED - Added links to "My Endpoints" and "Add New".

'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Navbar() {
    const { data: session, status } = useSession();

    return (
        <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0">
                        <Link href={status === 'authenticated' ? '/dashboard' : '/'} className="text-2xl font-bold text-gray-800">
                            DevWake
                        </Link>
                    </div>
                    <div className="flex items-center">
                        {status === 'loading' && (
                            <div className="w-24 h-8 bg-gray-200 rounded-md animate-pulse"></div>
                        )}
                        {status === 'unauthenticated' && (
                            <Button onClick={() => signIn('github')}>
                                Sign in with GitHub
                            </Button>
                        )}
                        {status === 'authenticated' && (
                            <div className="flex items-center space-x-4">
                                <Link href="/endpoints" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                                    My Endpoints
                                </Link>
                                <Link href="/endpoints/new">
                                    <Button>Add New</Button>
                                </Link>
                                <Button variant="outline" onClick={() => signOut()}>
                                    Sign Out
                                </Button>
                                <img src={session.user.image} alt="User avatar" className="w-8 h-8 rounded-full" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
