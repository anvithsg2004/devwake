// app/page.jsx
// The main landing page for your application.

import Navbar from '@/components/shared/Navbar';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main>
                <div className="py-24 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-gray-900">
                        Keep Your Apps Awake.
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                        DevWake prevents your free-tier backend services from sleeping with our intelligent Smart Pinging technology.
                    </p>
                    <div className="mt-8">
                        {/* The sign-in button is handled in the Navbar */}
                    </div>
                </div>
            </main>
        </div>
    );
}
