import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only protect the dashboard route - let other pages be accessible without auth
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');
  
  if (isDashboardPage) {
    // For dashboard, check if user is authenticated
    // Since we can't access localStorage in middleware, we'll let the client-side handle auth
    // The useAuth hook in the dashboard page will redirect if not authenticated
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};