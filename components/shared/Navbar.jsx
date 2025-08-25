// components/shared/Navbar.jsx
// UPDATED - Replaced with the new, beautiful navigation component.

'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Plus, Home } from 'lucide-react';

export default function Navbar() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const handleNavigate = (path) => {
        router.push(path);
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href={session ? "/dashboard" : "/"} className="flex items-center space-x-2 cursor-pointer">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-sm">DW</span>
                        </div>
                        <span className="text-xl font-semibold text-foreground">DevWake</span>
                    </Link>

                    <div className="flex items-center space-x-4">
                        {status === 'loading' && (
                            <div className="w-24 h-8 bg-gray-200 rounded-md animate-pulse"></div>
                        )}
                        {status === 'authenticated' && session.user ? (
                            <>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleNavigate('/endpoints')}
                                    className="hidden sm:flex items-center space-x-2"
                                >
                                    <Home className="w-4 h-4" />
                                    <span>My Endpoints</span>
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleNavigate('/endpoints/new')}
                                    className="hidden sm:flex items-center space-x-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Add New</span>
                                </Button>

                                <div className="flex items-center space-x-3">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => signOut()}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span className="sr-only">Sign Out</span>
                                    </Button>
                                    <img src={session.user.image} alt={session.user.name} className="w-8 h-8 rounded-full" />
                                </div>
                            </>
                        ) : (
                            <Button onClick={() => signIn('github')} className="items-center space-x-2">
                                <span>Sign in with GitHub</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};
