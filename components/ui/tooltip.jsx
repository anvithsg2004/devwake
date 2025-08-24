// components/ui/tooltip.jsx
// NEW FILE - A simple tooltip component for hover effects.

'use client';

import { useState } from 'react';

export default function Tooltip({ children, text }) {
    const [show, setShow] = useState(false);

    return (
        <div className="relative flex items-center">
            <div
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
            >
                {children}
            </div>
            {show && (
                <div className="absolute bottom-full mb-2 w-64 p-2 text-sm text-white bg-gray-800 rounded-md shadow-lg z-10">
                    {text}
                </div>
            )}
        </div>
    );
}
