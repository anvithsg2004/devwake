// models/MonitoredEndpoint.js
// UPDATED - Changed mongoose import to be compatible with standalone Node scripts.

import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
const { Schema, model, models } = mongoose;

// Sub-schema for individual ping records
const PingLogSchema = new Schema({
    timestamp: { type: Date, required: true },
    status: { type: Number, required: true },
    responseTime: { type: Number, required: true },
    statusText: { type: String, required: true },
});

const MonitoredEndpointSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    urlToPing: {
        type: String,
        required: true,
    },
    pingIntervalMinutes: {
        type: Number,
        required: true,
        default: 15,
    },
    smartPingId: {
        type: String,
        required: true,
        unique: true,
        default: () => uuidv4(),
        index: true,
    },
    nextPingTimestamp: {
        type: Date,
        required: true,
    },
    isSmartPingEnabled: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    pingLogs: {
        type: [PingLogSchema],
        default: [],
    },
});

const MonitoredEndpoint = models.MonitoredEndpoint || model('MonitoredEndpoint', MonitoredEndpointSchema);

export default MonitoredEndpoint;
