import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
    session: {
        strategy: "jwt", // Use JWT 
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) {
                    return null; // User not found
                }

                const isPasswordValid = await compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    return null; // Invalid password
                }

                // Return user object if login is successful
                return {
                    id: user.id,
                    email: user.email,
                };
            },
        }),
    ],
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };