import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/auth");

  const isOnboardingPage = pathname.startsWith("/onboarding");

  const isPublicPage = pathname === "/" || isAuthPage || isOnboardingPage || pathname.startsWith("/shop") || pathname.startsWith("/pricing") || pathname.startsWith("/download") || pathname.startsWith("/faq") || pathname.startsWith("/security");

  // Redirect unauthenticated users to login
  if (!user && !isPublicPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Diamond-only routes: check plan from query/cookie
  const diamondOnlyRoutes = ["/settings/team"];
  const isDiamondOnlyRoute = diamondOnlyRoutes.some((r) => pathname.startsWith(r));

  if (isDiamondOnlyRoute && user) {
    // Plan is managed client-side via Zustand; server can't easily check.
    // The PlanGate component handles this on the client side.
    // Middleware just ensures auth is present.
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
