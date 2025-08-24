// app/api/endpoints/route.js
// UPDATED - The POST handler now accepts the `isSmartPingEnabled` flag.

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import MonitoredEndpoint from "@/models/MonitoredEndpoint";
import { NextResponse } from "next/server";
import User from "@/models/User";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();

    try {
        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const endpoints = await MonitoredEndpoint.find({ userId: user._id }).sort({ createdAt: -1 });
        return NextResponse.json(endpoints);
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();

    try {
        const { urlToPing, pingIntervalMinutes, isSmartPingEnabled } = await request.json();

        if (!urlToPing || !pingIntervalMinutes) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const newEndpoint = new MonitoredEndpoint({
            userId: user._id,
            urlToPing,
            pingIntervalMinutes,
            isSmartPingEnabled: isSmartPingEnabled || false, // Default to false if not provided
            nextPingTimestamp: new Date(Date.now() + pingIntervalMinutes * 60 * 1000),
        });

        await newEndpoint.save();
        return NextResponse.json(newEndpoint, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
