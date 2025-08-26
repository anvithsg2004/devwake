// app/api/cron/scheduler/route.js

import { NextResponse } from 'next/server';
import { pingQueue } from '@/lib/queue';
import dbConnect from '@/lib/db';
import MonitoredEndpoint from '@/models/MonitoredEndpoint';

export async function GET(request) {
    // 1. Secure the endpoint
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    // 2. Run the scheduler logic
    console.log('Vercel Cron Job running...');
    await dbConnect();

    const now = new Date();
    const endpointsToPing = await MonitoredEndpoint.find({
        nextPingTimestamp: { $lte: now },
    });

    if (endpointsToPing.length === 0) {
        console.log('No endpoints are due for a ping.');
        return NextResponse.json({ success: true, message: 'No endpoints due.' });
    }

    console.log(`Found ${endpointsToPing.length} endpoints to schedule.`);

    for (const endpoint of endpointsToPing) {
        await pingQueue.add('ping', {
            endpointId: endpoint._id.toString(),
            url: endpoint.urlToPing,
        });
        console.log(`Scheduled ping for ${endpoint.urlToPing}`);
    }

    return NextResponse.json({ success: true, scheduled: endpointsToPing.length });
}
