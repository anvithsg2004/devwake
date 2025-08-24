// worker/scheduler.js
// UPDATED - Added explicit dotenv configuration to load .env.local

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Debug: Check if variables are loaded
console.log('MONGODB_URI:', process.env.MONGODB_URI);

import { pingQueue } from '../lib/queue.js';
import dbConnect from '../lib/db.js';
import MonitoredEndpoint from '../models/MonitoredEndpoint.js';

async function schedulePings() {
    console.log('Scheduler running...');
    await dbConnect();

    const now = new Date();

    const endpointsToPing = await MonitoredEndpoint.find({
        nextPingTimestamp: { $lte: now },
    });

    if (endpointsToPing.length === 0) {
        console.log('No endpoints are due for a ping.');
        return;
    }

    console.log(`Found ${endpointsToPing.length} endpoints to schedule.`);

    for (const endpoint of endpointsToPing) {
        await pingQueue.add('ping', {
            endpointId: endpoint._id.toString(),
            url: endpoint.urlToPing,
        });
        console.log(`Scheduled ping for ${endpoint.urlToPing}`);
    }
}

schedulePings().then(() => {
    console.log('Scheduler finished.');
    process.exit(0);
}).catch(err => {
    console.error('Scheduler failed:', err);
    process.exit(1);
});
