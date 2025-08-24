// app/api/endpoints/validate/route.js
// NEW FILE - Handles live validation of a user-provided URL.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const { url } = await request.json();

        if (!url || !url.startsWith('http')) {
            return NextResponse.json({ error: "Invalid URL provided." }, { status: 400 });
        }

        // Use a HEAD request for efficiency as we only need the status code.
        // Set a timeout to prevent long waits.
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout

        const response = await fetch(url, { method: 'HEAD', signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) { // response.ok is true for status codes 200-299
            return NextResponse.json({ success: true, message: "URL is valid and responding." });
        } else {
            return NextResponse.json({ success: false, message: `URL responded with status: ${response.status}` }, { status: 400 });
        }

    } catch (error) {
        // This catches network errors, timeouts, etc.
        return NextResponse.json({ success: false, message: "Failed to reach the URL. It might be offline or incorrect." }, { status: 400 });
    }
}
