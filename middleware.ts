import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Parse the auth storage from localStorage
  const authStorage = request.cookies.get('auth-storage')?.value;
  let token = null;
  
  if (authStorage) {
    try {
      const parsedStorage = JSON.parse(authStorage);
      token = parsedStorage.state.token;
    } catch (e) {
      console.error('Failed to parse auth storage');
    }
  }

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/signup');

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
};