import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  // Skip authentication for the Zapier webhook endpoint
  if (request.nextUrl.pathname.startsWith('/api/webhooks/zapier')) {
    return NextResponse.next();
  }

  // Skip authentication for public routes
  if (
    request.nextUrl.pathname === '/' || 
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/favicon.ico') ||
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname.startsWith('/login')
  ) {
    return NextResponse.next();
  }

  const session = await auth();
  
  // Check if this is an API route
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');

  // If no session and trying to access a protected route
  if (!session) {
    if (isApiRoute) {
      // For API routes, return 401 Unauthorized
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } else {
      // For non-API routes, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Skip public files and API routes we want to exclude
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};