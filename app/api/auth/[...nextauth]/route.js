// app/api/auth/[...nextauth]/route.js
// This API route handles all authentication requests.

import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth.js"

const handler = NextAuth.default(authOptions)

export { handler as GET, handler as POST }
