import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

// Define a simple hardcoded user for initial setup
// In production, replace with database-backed authentication
const users = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@myhrbuddy.com',
    // In a real app, this would be hashed
    password: 'admin1234', 
  },
];

export const authConfig: NextAuthConfig = {
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // This is where you would typically check against your database
        // For demo purposes, we're using hardcoded values
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = users.find(user => user.email === credentials.email);

        if (!user || user.password !== credentials.password) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      } else if (isLoggedIn) {
        return true;
      }
      return true; // Allow public access to other pages
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = 'admin'; // For simplicity, everyone is admin
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};