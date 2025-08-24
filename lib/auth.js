// lib/auth.js
import NextAuth from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "./dbClient.js"

export const authOptions = {
    adapter: MongoDBAdapter(await clientPromise),
    providers: [
        GitHubProvider.default({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }),
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async session({ session, token }) {
            if (token && session.user) session.user.id = token.sub
            return session
        },
    },
}

export default NextAuth.default(authOptions)
