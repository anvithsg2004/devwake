// app/api/cron/scheduler/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MonitoredEndpoint from '@/models/MonitoredEndpoint';

export async function GET(request) {
    // 1. Secure the endpoint
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    // 2. Connect to the database
    await dbConnect();

    const now = new Date();
    // Find all endpoints that are due for a ping
    const endpointsToPing = await MonitoredEndpoint.find({
        nextPingTimestamp: { $lte: now },
    });

    if (endpointsToPing.length === 0) {
        console.log('Vercel Cron Job: No endpoints are due for a ping.');
        return NextResponse.json({ success: true, message: 'No endpoints due.' });
    }

    console.log(`Vercel Cron Job: Found ${endpointsToPing.length} endpoints to schedule.`);

    // 3. Process each endpoint directly
    const pingPromises = endpointsToPing.map(async (endpoint) => {
        let status, statusText, responseTime;
        const startTime = Date.now();

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

            const response = await fetch(endpoint.urlToPing, { signal: controller.signal });
            clearTimeout(timeoutId);

            responseTime = Date.now() - startTime;
            status = response.status;
            statusText = response.statusText;
        } catch (error) {
            responseTime = Date.now() - startTime;
            status = 503; // Service Unavailable
            statusText = error.message;
        }

        // Create the new ping log
        const newLog = {
            timestamp: new Date(),
            status,
            responseTime,
            statusText,
        };

        // Add the new log and keep the array size limited
        endpoint.pingLogs.unshift(newLog);
        if (endpoint.pingLogs.length > 50) {
            endpoint.pingLogs.pop();
        }

        // Update the next ping time
        endpoint.nextPingTimestamp = new Date(Date.now() + endpoint.pingIntervalMinutes * 60 * 1000);

        // Save the changes
        await endpoint.save();
        console.log(`Processed and saved ping for ${endpoint.urlToPing}`);
    });

    // Wait for all pings to complete
    await Promise.all(pingPromises);

    return NextResponse.json({ success: true, processed: endpointsToPing.length });
}
