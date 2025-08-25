// app/page.jsx
'use client';

import { useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, BarChart3, Github } from 'lucide-react';

function FeatureCard({ title, description, more, icon: Icon }) {
    return (
        <Card
            tabIndex={0}
            className="
        group relative overflow-hidden text-center border-border
        transition-all duration-300
        hover:shadow-lg hover:-translate-y-0.5
        focus-visible:shadow-lg focus-visible:-translate-y-0.5
        outline-none
      "
            role="button"
        >
            <CardHeader className="pb-4">
                <div
                    className="
            w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center
            bg-primary/10 transition-colors duration-300
            group-hover:bg-primary/15 group-focus-within:bg-primary/15
          "
                >
                    <Icon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">
                    {title}
                </CardTitle>
            </CardHeader>

            <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                    {description}
                </p>

                {/* Expandable panel: 0fr -> 1fr on hover/focus for smooth height animation */}
                <div
                    className="
            mt-4 text-sm text-foreground/80
            grid [grid-template-rows:0fr]
            group-hover:[grid-template-rows:1fr]
            group-focus-within:[grid-template-rows:1fr]
            transition-all duration-300
          "
                    aria-hidden="true"
                >
                    <div className="overflow-hidden">
                        <p className="text-muted-foreground">
                            {more}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function HomePage() {
    const { status } = useSession();
    const router = useRouter();

    // Redirect after render to avoid "update during render" warning
    useEffect(() => {
        if (status === 'authenticated') {
            router.replace('/dashboard');
        }
    }, [status, router]);

    // Optional: avoid flicker while redirecting
    if (status === 'authenticated') return null;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main>
                {/* Hero */}
                <section className="pt-32 pb-20 px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                            Eliminate Cold Starts.
                        </h1>
                        <p className="text-xl text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto">
                            DevWake is a smart monitoring service that prevents your free-tier services from sleeping and provides detailed cold start analytics.
                        </p>
                        <Button
                            size="lg"
                            onClick={() => signIn('github')}
                            className="items-center space-x-3 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <Github className="w-5 h-5" />
                            <span>Sign in with GitHub</span>
                        </Button>
                    </div>
                </section>

                {/* Features with left sidebar callout */}
                <section className="py-20 px-6 lg:px-8 bg-secondary/50">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* LEFT: KEEP-AWAKE callout (sidebar) */}
                        <div className="md:col-span-4">
                            <Card className="h-full border-dashed">
                                <CardHeader>
                                    <CardTitle className="text-2xl">
                                        Prefer not to expose your backend API?
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-muted-foreground">
                                        Use the open‑source KEEP‑AWAKE utility to keep services alive without disclosing private endpoints. It’s a simple, privacy‑friendly option to run independently.
                                    </p>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Button asChild variant="outline" className="inline-flex items-center">
                                            <a
                                                href="https://github.com/anvithsg2004/KEEP-AWAKE"
                                                target="_blank"
                                                rel="noreferrer noopener"
                                                aria-label="Open KEEP-AWAKE repository on GitHub"
                                            >
                                                <Github className="w-4 h-4 mr-2" />
                                                View KEEP‑AWAKE on GitHub
                                            </a>
                                        </Button>
                                        <a
                                            href="https://github.com/anvithsg2004/KEEP-AWAKE"
                                            target="_blank"
                                            rel="noreferrer noopener"
                                            className="text-sm underline underline-offset-4 text-foreground/80 hover:text-foreground"
                                        >
                                            Learn more in the README
                                        </a>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* RIGHT: Feature cards grid */}
                        <div className="md:col-span-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                <FeatureCard
                                    title="Smart Pinging"
                                    description="Only pings when your service is truly idle."
                                    more="Adaptive schedules learn your app’s traffic patterns to minimize noise and cost, pausing automatically when real users are active."
                                    icon={Zap}
                                />
                                <FeatureCard
                                    title="Cold Start Analytics"
                                    description="Visualize response times and pinpoint cold starts."
                                    more="Drill into latency distributions, compare by time windows, and export insights for SLO reviews or incident reports."
                                    icon={BarChart3}
                                />
                                <FeatureCard
                                    title="Developer‑First"
                                    description="GitHub sign-in, webhooks, and a clean, modern UI."
                                    more="Simple onboarding, typed SDK stubs, and env-aware configs help ship faster across dev, staging, and production."
                                    icon={Github}
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-12 px-6 lg:px-8 border-t border-border">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-muted-foreground">© 2024 DevWake. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

