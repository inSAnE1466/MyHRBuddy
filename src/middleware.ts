import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

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
    request.nextUrl.pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }

  // Check if this is an API route
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');

  // For API routes, check for JWT token
  if (isApiRoute) {
    // Get the token from the request if present
    const token = await getToken({ req: request });

    // If no token and not authorized route, return 401
    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  } else {
    // For non-API routes, redirect to login if not authenticated
    const token = await getToken({ req: request });
    
    if (!token) {
      const url = new URL('/api/auth/signin', request.url);
      url.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(url);
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