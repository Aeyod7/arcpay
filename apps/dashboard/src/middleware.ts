import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/invoices/pay/(.*)',
  '/receipt/(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)'
]);

export default function middleware(req: any, event: any) {
  // Offline Hybrid Auth Fallback & Local Dev Bypass to prevent accounts.arcpaye.com DNS issues
  if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return;
  }
  
  return clerkMiddleware(async (auth, request) => {
    if (!isPublicRoute(request)) {
      await auth.protect();
    }
  })(req, event);
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)', '/__clerk/(.*)'],
};
