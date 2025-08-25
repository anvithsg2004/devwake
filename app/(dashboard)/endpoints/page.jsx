// app/(dashboard)/endpoints/page.jsx
// UPDATED - Replaced with the new UI and components.

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Activity } from 'lucide-react';
import ResponseChart from '@/components/shared/ResponseChart';
import { formatDataForChart } from '@/lib/analytics';

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
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-foreground">My Endpoints</h1>
                <Button asChild>
                    <Link href="/endpoints/new">Add New Endpoint</Link>
                </Button>
            </div>

            <div className="space-y-6">
                {endpoints.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent>
                            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">No endpoints yet</h3>
                            <p className="text-muted-foreground mb-6">
                                Get started by adding your first endpoint to monitor.
                            </p>
                            <Button asChild>
                                <Link href="/endpoints/new">Add Your First Endpoint</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {endpoints.map((endpoint) => {
                            const chartData = formatDataForChart(endpoint.pingLogs);
                            const lastPing = endpoint.pingLogs?.[0];

                            return (
                                <Link href={`/endpoints/${endpoint._id}`} key={endpoint._id}>
                                    <Card className="cursor-pointer hover:shadow-lg transition-all duration-fast border-border">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-lg font-semibold text-foreground truncate flex items-center space-x-2">
                                                <span className="truncate">{endpoint.urlToPing}</span>
                                                <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                            </CardTitle>
                                            <div className="flex items-center space-x-2 pt-2">
                                                <Badge variant={lastPing?.status >= 200 && lastPing?.status < 300 ? 'success' : 'error'}>
                                                    {lastPing ? 'Active' : 'Pending'}
                                                </Badge>
                                                <Badge variant="outline">
                                                    {endpoint.isSmartPingEnabled ? 'Smart' : 'Regular'}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    Every {endpoint.pingIntervalMinutes} min
                                                </span>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="mb-4">
                                                <p className="text-xs text-muted-foreground mb-2">
                                                    Response Time (Last 50 pings)
                                                </p>
                                                <ResponseChart
                                                    data={chartData}
                                                    height={120}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
