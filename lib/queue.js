// lib/queue.js
// UPDATED - Centralized Redis connection config and made it more robust.

import { Queue } from 'bullmq';

// Centralized Redis connection options
export const redisConnection = {
    host: process.env.UPSTASH_REDIS_HOST,
    port: process.env.UPSTASH_REDIS_PORT,
    username: process.env.UPSTASH_REDIS_USERNAME,
    password: process.env.UPSTASH_REDIS_PASSWORD,
    // This explicitly enables TLS/SSL for the connection, which is required by Upstash.
    tls: {},
    // This can help with initial connection issues on some cloud providers.
    enableReadyCheck: false,
};

// Create and export the queue
export const pingQueue = new Queue('pingQueue', {
    connection: redisConnection,
});
