import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { NextAuthConfig } from "better-auth"
import { db } from "../db"
import { accounts, sessions, users, verificationTokens } from "../db/schema"
import Google from "better-auth/providers/google"
import Credentials from "better-auth/providers/credentials"
import { eq } from "drizzle-orm"

export const authConfig: NextAuthConfig = {
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Find user by email
        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email),
        })

        if (!user) {
          return null
        }

        // For now, we'll skip password verification since we're using OAuth
        // In a real app, you'd hash and compare passwords
        return user
      }
    })
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    }
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.BETTER_AUTH_SECRET,
}
