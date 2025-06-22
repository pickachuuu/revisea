import { updateSession } from './utils/supabase/middleware'
import { NextRequest } from 'next/server'

export const config = {
  matcher: [
    // Protect all routes except for public paths and static files
    '/((?!_next/static|_next/image|favicon.ico|auth|api|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}

export async function middleware(request: NextRequest) {
  console.log('MIDDLEWARE EXECUTED:', request.nextUrl.pathname);
  return await updateSession(
    request,
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
