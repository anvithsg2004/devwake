// components/shared/EndpointForm.jsx
// UPDATED - Now redirects to the new details page on success.

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Tooltip from '@/components/ui/tooltip';

const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

// Code snippets for Smart Pinging
const codeSnippets = {
    'nodejs-express': `// In your main Express file (e.g., server.js)
import fetch from 'node-fetch';
const DEV_WAKE_URL = 'YOUR_SMART_PING_URL_HERE';

const devWakeNotifier = (req, res, next) => {
  fetch(DEV_WAKE_URL, { method: 'POST' }).catch(err => console.error('DevWake Error:', err));
  next();
};

app.use(devWakeNotifier);`,
    'springboot': `// Create a Filter class in your Spring Boot project
@Component
public class DevWakeNotifierFilter implements Filter {
    private final WebClient webClient = WebClient.create();
    private static final String DEV_WAKE_URL = "YOUR_SMART_PING_URL_HERE";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        webClient.post().uri(DEV_WAKE_URL).retrieve().bodyToMono(Void.class).subscribe();
        chain.doFilter(request, response);
    }
}`,
    'nextjs': `// In your middleware.ts (or .js) file
import { NextResponse } from 'next/server';
const DEV_WAKE_URL = 'YOUR_SMART_PING_URL_HERE';

export function middleware(request) {
  request.waitUntil(
    fetch(DEV_WAKE_URL, { method: 'POST' }).catch(e => console.error(e))
  );
  return NextResponse.next();
}`
};

export default function EndpointForm() {
    const [step, setStep] = useState(1);
    const [urlToPing, setUrlToPing] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [validationResult, setValidationResult] = useState(null);

    const [pingIntervalMinutes, setPingIntervalMinutes] = useState(15);
    const [pingMethod, setPingMethod] = useState('regular');
    const [backendLanguage, setBackendLanguage] = useState('nodejs-express');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const router = useRouter();


    const validateUrl = async (url) => {
        if (!url || !url.startsWith('http')) {
            setValidationResult({ success: false, message: 'Please enter a valid URL starting with http:// or https://' });
            return;
        }
        setIsValidating(true);
        setValidationResult(null);
        try {
            const res = await fetch('/api/endpoints/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });
            const data = await res.json();
            setValidationResult(data);
            if (data.success) {
                setStep(2);
            }
        } catch (err) {
            setValidationResult({ success: false, message: 'An error occurred during validation.' });
        } finally {
            setIsValidating(false);
        }
    };

    const debouncedValidateUrl = useCallback(debounce(validateUrl, 500), []);

    const handleUrlChange = (e) => {
        const newUrl = e.target.value;
        setUrlToPing(newUrl);
        setValidationResult(null);
        setStep(1);
        debouncedValidateUrl(newUrl);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/endpoints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    urlToPing,
                    pingIntervalMinutes,
                    isSmartPingEnabled: pingMethod === 'smart'
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create endpoint.');
            }

            const newEndpoint = await res.json();

            // *** KEY CHANGE HERE ***
            // Redirect to the new endpoint's details page instead of the list.
            router.push(`/endpoints/${newEndpoint._id}`);

        } catch (err) {
            setSubmitError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
            {/* Step 1: URL Validation */}
            <div className="p-6 border rounded-lg bg-white">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Step 1: Health Check URL</h3>
                <p className="mt-1 text-sm text-gray-500">Enter the full URL of the health endpoint you want us to monitor.</p>
                <div className="mt-4">
                    <input
                        type="url"
                        value={urlToPing}
                        onChange={handleUrlChange}
                        placeholder="[https://your-api.onrender.com/health](https://your-api.onrender.com/health)"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                    />
                </div>
                {isValidating && <p className="mt-2 text-sm text-gray-500">Validating...</p>}
                {validationResult && (
                    <p className={`mt-2 text-sm ${validationResult.success ? 'text-green-600' : 'text-red-600'}`}>
                        {validationResult.message}
                    </p>
                )}
            </div>

            {/* Step 2: Configuration */}
            {step === 2 && (
                <div className="p-6 border rounded-lg bg-white animate-fade-in">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Step 2: Configuration</h3>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700">Ping Interval (minutes)</label>
                        <input
                            type="number"
                            value={pingIntervalMinutes}
                            onChange={(e) => setPingIntervalMinutes(Number(e.target.value))}
                            min="1" max="60"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                        />
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700">Pinging Method</label>
                        <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-2">
                                <input type="radio" id="regular" name="pingMethod" value="regular" checked={pingMethod === 'regular'} onChange={() => setPingMethod('regular')} className="h-4 w-4 text-gray-600 border-gray-300 focus:ring-gray-500" />
                                <label htmlFor="regular">Regular</label>
                                <Tooltip text="We ping your URL at a fixed interval to keep it awake. Simple and effective.">
                                    <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                                </Tooltip>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input type="radio" id="smart" name="pingMethod" value="smart" checked={pingMethod === 'smart'} onChange={() => setPingMethod('smart')} className="h-4 w-4 text-gray-600 border-gray-300 focus:ring-gray-500" />
                                <label htmlFor="smart">Smart</label>
                                <Tooltip text="We only ping your URL when it's idle. You add a middleware to your app to notify us of real traffic, making it more efficient.">
                                    <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                                </Tooltip>
                            </div>
                        </div>
                    </div>

                    {pingMethod === 'smart' && (
                        <div className="mt-6 p-4 border rounded-lg bg-gray-50 animate-fade-in">
                            <h4 className="text-md font-medium text-gray-800">Smart Pinging Setup</h4>
                            <p className="mt-1 text-sm text-gray-600">Add this middleware to your backend to notify us of real traffic. We will generate your unique URL after you save.</p>
                            <div className="mt-4">
                                <label htmlFor="language" className="block text-sm font-medium text-gray-700">Select your framework:</label>
                                <select id="language" value={backendLanguage} onChange={(e) => setBackendLanguage(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md">
                                    <option value="nodejs-express">Node.js (Express)</option>
                                    <option value="springboot">Spring Boot (Java)</option>
                                    <option value="nextjs">Next.js</option>
                                </select>
                            </div>
                            <div className="mt-4">
                                <pre className="p-3 bg-gray-900 text-white rounded-md text-sm overflow-x-auto">
                                    <code>{codeSnippets[backendLanguage]}</code>
                                </pre>
                            </div>
                        </div>
                    )}

                    {submitError && <p className="mt-4 text-sm text-red-600">{submitError}</p>}

                    <div className="mt-8">
                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting ? 'Saving...' : 'Set Up and Start Monitoring'}
                        </Button>
                    </div>
                </div>
            )}
        </form>
    );
}
