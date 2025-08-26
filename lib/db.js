// lib/db.js
import mongoose from 'mongoose';

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set');
}

let cached = global._mongooseCached;

if (!cached) {
    cached = global._mongooseCached = { conn: null, promise: null };
}

export default async function dbConnect() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
            maxPoolSize: 10,
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}
