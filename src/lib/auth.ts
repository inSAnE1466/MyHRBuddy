import { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import NextAuth from "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
  }

  interface JWT {
    role?: string;
  }
}

const users = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@myhrbuddy.com',
    password: 'admin1234',
    role: 'admin',
  },
];

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
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
          role: user.role,
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
        return false;
      } else if (isLoggedIn) {
        return true;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || 'user';
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string | undefined;
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
  secret: process.env.NEXTAUTH_SECRET || 'placeholder-secret-for-development',
};

// Export the NextAuth handler with the configuration
export const { auth, signIn, signOut } = NextAuth(authConfig);