import { type NextRequest } from 'next/server';

// No-op middleware (or add new session logic here if needed)
export async function middleware(request: NextRequest) {
  return;
}

export const config = {
  matcher: [
    // Match all routes except for public paths and static files
    '/((?!_next/static|_next/image|favicon.ico|auth|api|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}; 