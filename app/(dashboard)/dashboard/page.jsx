// app/(dashboard)/dashboard/page.jsx
'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { calculateStats, formatDataForChart } from '@/lib/analytics';
import ResponseChart from '@/components/shared/ResponseChart';
import Link from 'next/link';

function StatCard({ title, value, unit }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="mt-1 text-3xl font-semibold text-gray-900">
                {value}
                {unit && <span className="text-lg font-medium text-gray-500 ml-1">{unit}</span>}
            </p>
        </div>
    );
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const [endpoints, setEndpoints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEndpoints = async () => {
            setIsLoading(true);
            const res = await fetch('/api/endpoints');
            const data = await res.json();
            setEndpoints(data);
            setIsLoading(false);
        };
        fetchEndpoints();
    }, []);

    if (isLoading) {
        return <div className="p-8">Loading dashboard...</div>;
    }

    const allLogs = endpoints.flatMap(e => e.pingLogs);
    const overallStats = calculateStats(allLogs);

    return (
        <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {session?.user?.name}!</h1>
            <p className="mt-1 text-gray-600">Here's a summary of your monitored services.</p>

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Endpoints" value={endpoints.length} />
                <StatCard title="Avg. Response Time" value={overallStats.averageResponseTime} unit="ms" />
                <StatCard title="Overall Uptime" value={overallStats.uptimePercentage} unit="%" />
                <StatCard title="Total Cold Starts" value={overallStats.coldStarts} />
            </div>

            <div className="mt-10 space-y-8">
                {endpoints.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900">No endpoints found.</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            <Link href="/endpoints/new" className="text-indigo-600 hover:underline">Add your first one</Link> to start seeing analytics!
                        </p>
                    </div>
                ) : (
                    endpoints.map(endpoint => {
                        const chartData = formatDataForChart(endpoint.pingLogs);
                        return (
                            <div key={endpoint._id} className="bg-white p-6 rounded-lg shadow">
                                <Link href={`/endpoints/${endpoint._id}`}>
                                    <h2 className="text-xl font-semibold text-gray-900 hover:text-indigo-600">{endpoint.urlToPing}</h2>
                                </Link>
                                <div className="mt-4">
                                    <ResponseChart data={chartData} />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
