// app/api/notify/[smartPingId]/route.js
// This is the public-facing webhook that a user's middleware will call.
// Its only job is to be extremely fast and reset the ping timer.

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MonitoredEndpoint from '@/models/MonitoredEndpoint';

// We only need to handle POST requests for this route.
export async function POST(request, { params }) {
    try {
        // 1. Extract the unique ID from the URL.
        const { smartPingId } = params;

        if (!smartPingId) {
            // This case should ideally not happen with correct routing.
            return new Response('Bad Request: Missing ID', { status: 400 });
        }

        // 2. Connect to the database.
        await dbConnect();

        // 3. Find the corresponding endpoint in the database.
        // We only select the fields we absolutely need for max efficiency.
        const endpoint = await MonitoredEndpoint.findOne({ smartPingId }).select('_id pingIntervalMinutes').lean();

        // If no endpoint is found, we still return a success-like response.
        // This prevents attackers from guessing valid IDs by checking for errors.
        if (!endpoint) {
            return NextResponse.json({ message: "Accepted" }, { status: 202 });
        }

        // 4. Calculate the new timestamp.
        const newNextPingTime = new Date(Date.now() + endpoint.pingIntervalMinutes * 60 * 1000);

        // 5. Update the document with the new timestamp.
        // We use updateOne for performance as we don't need the full document back.
        await MonitoredEndpoint.updateOne(
            { _id: endpoint._id },
            { $set: { nextPingTimestamp: newNextPingTime } }
        );

        // 6. Return a fast, positive response to the user's middleware.
        // 202 Accepted is a great status code here, as it means "I've received
        // the request and will process it", without making the user's app wait.
        return NextResponse.json({ message: "Accepted" }, { status: 202 });

    } catch (error) {
        console.error(`Error in Smart Ping webhook for ID ${params.smartPingId}:`, error);
        // Even if our server has an error, we don't want to cause an error
        // on the user's server. We'll still return a success-like response
        // and log the error on our end for debugging.
        return NextResponse.json({ message: "Accepted" }, { status: 202 });
    }
}
