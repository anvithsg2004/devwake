// app/(dashboard)/endpoints/new/page.jsx
// NEW FILE - The page that renders the EndpointForm component.

import EndpointForm from '@/components/shared/EndpointForm';

export default function NewEndpointPage() {
    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">Add a New Endpoint</h1>
                <p className="mt-2 text-lg text-gray-600">
                    Enter the details of the service you want to keep awake.
                </p>
            </div>
            <div className="mt-10">
                <EndpointForm />
            </div>
        </div>
    );
}
