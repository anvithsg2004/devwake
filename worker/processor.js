// worker/processor.js
// UPDATED - Now imports the centralized Redis connection config.

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { Worker } from 'bullmq';
import dbConnect from '../lib/db.js';
import MonitoredEndpoint from '../models/MonitoredEndpoint.js';
import { redisConnection } from '../lib/queue.js'; // Import the connection config

// The main worker logic
const worker = new Worker('pingQueue', async (job) => {
    await dbConnect();
    const { endpointId, url } = job.data;
    console.log(`Processing ping for: ${url} (Job ID: ${job.id})`);

    let status, statusText, responseTime;
    const startTime = Date.now();

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        responseTime = Date.now() - startTime;
        status = response.status;
        statusText = response.statusText;

        console.log(`Ping successful for ${url}: Status ${status}, Time ${responseTime}ms`);

    } catch (error) {
        responseTime = Date.now() - startTime;
        status = 503;
        statusText = error.message;
        console.error(`Ping failed for ${url}: ${error.message}`);
    }

    const endpoint = await MonitoredEndpoint.findById(endpointId);
    if (!endpoint) {
        console.log(`Endpoint ${endpointId} not found, skipping update.`);
        return;
    }

    const newLog = {
        timestamp: new Date(),
        status,
        responseTime,
        statusText,
    };

    endpoint.pingLogs.unshift(newLog);
    if (endpoint.pingLogs.length > 50) {
        endpoint.pingLogs.pop();
    }

    endpoint.nextPingTimestamp = new Date(Date.now() + endpoint.pingIntervalMinutes * 60 * 1000);

    await endpoint.save();
    console.log(`Updated logs and next ping time for ${url}`);

}, { connection: redisConnection }); // Use the imported connection config

console.log('Worker started and listening for jobs...');

worker.on('completed', (job) => {
    console.log(`Job ${job.id} has completed.`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} has failed with error: ${err.message}`);
});
