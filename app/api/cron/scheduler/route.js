// app/api/cron/scheduler/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MonitoredEndpoint from '@/models/MonitoredEndpoint';

// Ensure Node runtime (Mongoose needs Node, not Edge)
export const runtime = 'nodejs';

// Disable caching to always execute fresh logic
export const dynamic = 'force-dynamic';

export async function GET(request) {
    // 1) Authorization via Vercel's injected header (requires CRON_SECRET set in the project)
    const auth = request.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

    if (!token || token !== process.env.CRON_SECRET) {
        return new Response('Unauthorized', { status: 401 });
    }

    // 2) Connect to Mongo (idempotent)
    await dbConnect();

    // 3) Find due endpoints
    const now = new Date();
    const endpointsToPing = await MonitoredEndpoint.find({
        nextPingTimestamp: { $lte: now },
    });

    if (!endpointsToPing.length) {
        return NextResponse.json({
            success: true,
            processed: 0,
            message: 'No endpoints due.',
        });
    }

    // 4) Helper: process one endpoint
    const processEndpoint = async (endpoint) => {
        let status, statusText, responseTime;
        const startTime = Date.now();
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s
            const res = await fetch(endpoint.urlToPing, { signal: controller.signal });
            clearTimeout(timeoutId);
            responseTime = Date.now() - startTime;
            status = res.status;
            statusText = res.statusText || '';
        } catch (err) {
            responseTime = Date.now() - startTime;
            status = 503;
            statusText = (err?.message || 'fetch failed').slice(0, 512);
        }

        // Keep latest 50 logs
        endpoint.pingLogs.unshift({
            timestamp: new Date(),
            status,
            responseTime,
            statusText,
        });
        if (endpoint.pingLogs.length > 50) endpoint.pingLogs.pop();

        // Schedule next run
        endpoint.nextPingTimestamp = new Date(
            Date.now() + endpoint.pingIntervalMinutes * 60 * 1000
        );
        await endpoint.save();
    };

    // 5) Bounded concurrency to avoid timeouts
    const concurrency = 5;
    for (let i = 0; i < endpointsToPing.length; i += concurrency) {
        const batch = endpointsToPing.slice(i, i + concurrency);
        await Promise.allSettled(batch.map(processEndpoint));
    }

    return NextResponse.json({
        success: true,
        processed: endpointsToPing.length,
    });
}
