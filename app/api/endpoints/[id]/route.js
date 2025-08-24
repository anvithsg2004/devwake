// app/api/endpoints/[id]/route.js
// UPDATED - Correctly handles the dynamic route parameter to fix the error.

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import MonitoredEndpoint from "@/models/MonitoredEndpoint";
import { NextResponse } from "next/server";
import User from "@/models/User";

// The second argument to the handler is an object with a `params` property.
// We destructure it directly in the function signature.
export async function GET(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();

    try {
        // We can now directly use `params.id`.
        const { id } = await params;

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Find the endpoint and ensure it belongs to the logged-in user
        const endpoint = await MonitoredEndpoint.findOne({ _id: id, userId: user._id });

        if (!endpoint) {
            return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
        }

        return NextResponse.json(endpoint);
    } catch (error) {
        console.error("Failed to fetch endpoint:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
