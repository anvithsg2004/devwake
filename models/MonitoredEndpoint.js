// models/MonitoredEndpoint.js
import mongoose, { Schema } from 'mongoose';

const PingLogSchema = new Schema(
    {
        timestamp: { type: Date, required: true },
        status: { type: Number, required: true },
        responseTime: { type: Number, required: true },
        statusText: { type: String, default: '' },
    },
    { _id: false }
);

const MonitoredEndpointSchema = new Schema(
    {
        urlToPing: { type: String, required: true },
        pingIntervalMinutes: { type: Number, default: 15, min: 1 },
        nextPingTimestamp: { type: Date, default: () => new Date() },
        pingLogs: { type: [PingLogSchema], default: [] },
        // You will need to add back your other fields like userId, smartPingId, etc.
        // This is just the core schema for the cron job.
    },
    { timestamps: true }
);

export default mongoose.models.MonitoredEndpoint ||
    mongoose.model('MonitoredEndpoint', MonitoredEndpointSchema);
