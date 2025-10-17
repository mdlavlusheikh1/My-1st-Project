import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Add security headers to all responses
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Add HSTS header for HTTPS (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://firestore.googleapis.com wss://*.firebaseio.com",
    "frame-src 'self' https://*.firebaseapp.com",
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Block access to sensitive files
  const sensitivePatterns = [
    /\.env/,
    /\.git/,
    /\.firebase/,
    /firebase.*\.json$/,
    /\.rules$/,
  ];
  
  for (const pattern of sensitivePatterns) {
    if (pattern.test(path)) {
      return new NextResponse('Not Found', { status: 404 });
    }
  }
  
  // Most authentication will be handled by the AuthContext and ProtectedRoute components
  // This middleware focuses on security headers and basic protection
  
  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
