// app/(dashboard)/endpoints/new/page.jsx
// UPDATED - Replaced with the new UI and components.

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Check, Loader2, Info, Copy } from 'lucide-react';
import Link from 'next/link';

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

const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

export default function NewEndpointPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        url: '',
        interval: 15,
        method: 'Regular',
        framework: 'nodejs-express',
    });
    const [validation, setValidation] = useState({
        isValid: false, isValidating: false, message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const validateUrl = async (url) => {
        if (!url) return;
        setValidation({ isValid: false, isValidating: true, message: '' });

        try {
            const res = await fetch('/api/endpoints/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });
            const data = await res.json();
            setValidation({ isValid: data.success, isValidating: false, message: data.message });
        } catch (error) {
            setValidation({ isValid: false, isValidating: false, message: 'Failed to validate URL.' });
        }
    };

    const debouncedValidateUrl = useCallback(debounce(validateUrl, 500), []);

    const handleUrlChange = (e) => {
        const newUrl = e.target.value;
        setFormData(prev => ({ ...prev, url: newUrl }));
        setValidation({ isValid: false, isValidating: false, message: '' });
        setStep(1);
        debouncedValidateUrl(newUrl);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/endpoints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    urlToPing: formData.url,
                    pingIntervalMinutes: formData.interval,
                    isSmartPingEnabled: formData.method === 'Smart'
                }),
            });
            if (!res.ok) throw new Error("Failed to create endpoint.");
            const newEndpoint = await res.json();
            router.push(`/endpoints/${newEndpoint._id}`);
        } catch (error) {
            console.error(error);
            setIsSubmitting(false);
        }
    };

    const canProceed = (currentStep) => {
        if (currentStep === 1) return validation.isValid;
        return true;
    };

    return (
        <div className="pt-24 pb-12 px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <Button variant="ghost" className="mb-4 -ml-2" asChild>
                        <Link href="/endpoints"><ArrowLeft className="w-4 h-4 mr-2" />Back to Endpoints</Link>
                    </Button>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Add New Endpoint</h1>
                    <p className="text-muted-foreground">Set up monitoring for your service in just a few steps.</p>
                </div>

                <Card className="shadow-lg border-border">
                    <CardHeader>
                        <CardTitle className="text-xl">
                            {step === 1 && 'Step 1: Health Check URL'}
                            {step === 2 && 'Step 2: Configuration'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {step === 1 && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="url">Endpoint URL</Label>
                                    <div className="relative">
                                        <Input
                                            id="url"
                                            type="url"
                                            placeholder="[https://your-app.onrender.com/health](https://your-app.onrender.com/health)"
                                            value={formData.url}
                                            onChange={handleUrlChange}
                                            className="pr-10"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            {validation.isValidating ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                            ) : validation.isValid ? (
                                                <Check className="w-4 h-4 text-success" />
                                            ) : formData.url && !validation.isValidating ? (
                                                <div className="w-2 h-2 bg-error rounded-full" />
                                            ) : null}
                                        </div>
                                    </div>
                                    {validation.message && (
                                        <p className={`text-sm ${validation.isValid ? 'text-success' : 'text-error'}`}>
                                            {validation.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="interval">Ping Interval (minutes)</Label>
                                    <Input
                                        id="interval"
                                        type="number"
                                        min="1"
                                        max="60"
                                        value={formData.interval}
                                        onChange={(e) => setFormData(prev => ({ ...prev, interval: parseInt(e.target.value) || 15 }))}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label>Pinging Method</Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div onClick={() => setFormData(prev => ({ ...prev, method: 'Regular' }))}>
                                            <Card className={`cursor-pointer transition-all duration-fast ${formData.method === 'Regular' ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'}`}>
                                                <CardContent className="p-4">
                                                    <h3 className="font-medium">Regular</h3>
                                                    <p className="text-sm text-muted-foreground">Pings at a fixed interval.</p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                        <div onClick={() => setFormData(prev => ({ ...prev, method: 'Smart' }))}>
                                            <Card className={`cursor-pointer transition-all duration-fast ${formData.method === 'Smart' ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'}`}>
                                                <CardContent className="p-4">
                                                    <h3 className="font-medium flex items-center space-x-2">
                                                        <span>Smart</span>
                                                        <Badge variant="outline" className="text-xs">Recommended</Badge>
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">Only pings when idle.</p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </div>

                                {formData.method === 'Smart' && (
                                    <div className="space-y-4 pt-4 border-t">
                                        <Label>Integration Code</Label>
                                        <p className="text-sm text-muted-foreground">Add this to your app. Your unique URL will be available after creation.</p>
                                        <Select value={formData.framework} onValueChange={(value) => setFormData(prev => ({ ...prev, framework: value }))}>
                                            <SelectTrigger><SelectValue placeholder="Select framework" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="nodejs-express">Node.js (Express)</SelectItem>
                                                <SelectItem value="springboot">Spring Boot</SelectItem>
                                                <SelectItem value="nextjs">Next.js</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <div className="relative bg-secondary/50 rounded-lg border">
                                            <pre className="p-4 text-sm text-foreground overflow-x-auto">
                                                <code>{codeSnippets[formData.framework]}</code>
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-6 border-t">
                            <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 1}>Previous</Button>
                            {step === 1 ? (
                                <Button onClick={() => setStep(step + 1)} disabled={!canProceed(step)}>Next</Button>
                            ) : (
                                <Button onClick={handleSubmit} disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isSubmitting ? 'Saving...' : 'Start Monitoring'}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
