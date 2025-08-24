// app/(dashboard)/endpoints/page.jsx
// UPDATED - Each endpoint now links to its new details page.

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function EndpointsPage() {
    const [endpoints, setEndpoints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEndpoints = async () => {
            try {
                const res = await fetch('/api/endpoints');
                if (!res.ok) throw new Error('Failed to fetch endpoints.');
                const data = await res.json();
                setEndpoints(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEndpoints();
    }, []);

    if (isLoading) return <div className="text-center p-10">Loading your endpoints...</div>;
    if (error) return <div className="text-center p-10 text-red-600">Error: {error}</div>;

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">My Endpoints</h1>
                <Link href="/endpoints/new">
                    <Button>Add New Endpoint</Button>
                </Link>
            </div>

            <div className="mt-8">
                {endpoints.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900">No endpoints found.</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by adding your first one!</p>
                    </div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul role="list" className="divide-y divide-gray-200">
                            {endpoints.map((endpoint) => (
                                <li key={endpoint._id}>
                                    {/* *** KEY CHANGE HERE: Link to the details page *** */}
                                    <Link href={`/endpoints/${endpoint._id}`} className="block hover:bg-gray-50">
                                        <div className="px-4 py-4 sm:px-6">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-indigo-600 truncate">{endpoint.urlToPing}</p>
                                                <div className="ml-2 flex-shrink-0 flex">
                                                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${endpoint.isSmartPingEnabled ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {endpoint.isSmartPingEnabled ? 'Smart' : 'Regular'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-2 sm:flex sm:justify-between">
                                                <div className="sm:flex">
                                                    <p className="flex items-center text-sm text-gray-500">
                                                        Pinging every {endpoint.pingIntervalMinutes} minutes
                                                    </p>
                                                </div>
                                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                    <p>Status: <span className="font-medium text-green-600">Active</span></p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
