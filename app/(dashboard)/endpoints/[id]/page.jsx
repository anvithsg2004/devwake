// app/(dashboard)/endpoints/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDataForChart } from '@/lib/analytics';
import ResponseChart from '@/components/shared/ResponseChart';

const getCodeSnippets = (smartPingUrl) => ({
    'nodejs-express': `// In your main Express file (e.g., server.js)
import fetch from 'node-fetch';
const DEV_WAKE_URL = '${smartPingUrl}';

const devWakeNotifier = (req, res, next) => {
  fetch(DEV_WAKE_URL, { method: 'POST' }).catch(err => console.error('DevWake Error:', err));
  next();
};

app.use(devWakeNotifier);`,
    'springboot': `// Create a Filter class in your Spring Boot project
@Component
public class DevWakeNotifierFilter implements Filter {
    private final WebClient webClient = WebClient.create();
    private static final String DEV_WAKE_URL = "${smartPingUrl}";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        webClient.post().uri(DEV_WAKE_URL).retrieve().bodyToMono(Void.class).subscribe();
        chain.doFilter(request, response);
    }
}`,
    'nextjs': `// In your middleware.ts (or .js) file
import { NextResponse } from 'next/server';
const DEV_WAKE_URL = '${smartPingUrl}';

export function middleware(request) {
  request.waitUntil(
    fetch(DEV_WAKE_URL, { method: 'POST' }).catch(e => console.error(e))
  );
  return NextResponse.next();
}`
});

export default function EndpointDetailsPage() {
    const [endpoint, setEndpoint] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('nodejs-express');
    const params = useParams();
    const { id } = params;

    useEffect(() => {
        if (!id) return;
        const fetchEndpoint = async () => {
            try {
                const res = await fetch(`/api/endpoints/${id}`);
                if (!res.ok) throw new Error('Failed to fetch endpoint details.');
                const data = await res.json();
                setEndpoint(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEndpoint();
    }, [id]);

    if (isLoading) return <div className="text-center p-10">Loading endpoint details...</div>;
    if (error) return <div className="text-center p-10 text-red-600">Error: {error}</div>;
    if (!endpoint) return <div className="text-center p-10">Endpoint not found.</div>;

    const chartData = formatDataForChart(endpoint.pingLogs);
    const smartPingUrl = `${window.location.origin}/api/notify/${endpoint.smartPingId}`;
    const codeSnippets = getCodeSnippets(smartPingUrl);

    const handleCopy = () => {
        navigator.clipboard.writeText(smartPingUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <Link href="/endpoints" className="text-sm text-gray-600 hover:text-gray-900">&larr; Back to all endpoints</Link>
                <h1 className="text-3xl font-bold text-gray-900 truncate mt-2">{endpoint.urlToPing}</h1>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Endpoint Details</h3>
                </div>
                <div className="border-t border-gray-200">
                    <dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Status</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2"><span className="font-medium text-green-600">Active</span></dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Pinging Method</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{endpoint.isSmartPingEnabled ? 'Smart Pinging' : 'Regular Pinging'}</dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Interval</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">Every {endpoint.pingIntervalMinutes} minutes</dd>
                        </div>
                    </dl>
                </div>
            </div>

            {endpoint.isSmartPingEnabled && (
                <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900">Smart Pinging Setup</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        To complete the setup, add the following middleware to your backend application. This will notify DevWake of real user traffic and prevent unnecessary pings.
                    </p>
                    <div className="mt-4 bg-white shadow sm:rounded-lg p-6">
                        <label className="block text-sm font-medium text-gray-700">Your Unique Smart Ping URL</label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <input type="text" readOnly value={smartPingUrl} className="flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 bg-gray-50" />
                            <button onClick={handleCopy} className="relative -ml-px inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100">
                                <span>{copied ? 'Copied!' : 'Copy'}</span>
                            </button>
                        </div>
                        <div className="mt-4">
                            <label htmlFor="language" className="block text-sm font-medium text-gray-700">Select your framework:</label>
                            <select id="language" value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md">
                                <option value="nodejs-express">Node.js (Express)</option>
                                <option value="springboot">Spring Boot (Java)</option>
                                <option value="nextjs">Next.js</option>
                            </select>
                        </div>
                        <div className="mt-4">
                            <pre className="p-3 bg-gray-900 text-white rounded-md text-sm overflow-x-auto">
                                <code>{codeSnippets[selectedLanguage]}</code>
                            </pre>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900">Response Time (Last 50 Pings)</h3>
                <div className="mt-4 bg-white p-6 rounded-lg shadow">
                    <ResponseChart data={chartData} />
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900">Recent Pings</h3>
                <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                    {endpoint.pingLogs && endpoint.pingLogs.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Time</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {endpoint.pingLogs.slice(0, 5).map((log) => (
                                    <tr key={log._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.status >= 200 && log.status < 300 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {log.status} {log.statusText}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.responseTime} ms</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-gray-500 py-8">No pings have been recorded yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
