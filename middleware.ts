import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Routes anyone can open without being logged in */
const PUBLIC_PATHS = ["/login", "/signup", "/auth/callback"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

/**
 * Forward cookies from the Supabase response onto a redirect.
 * Needed so a refreshed session is not dropped when we redirect.
 */
function redirectWithSessionCookies(
  url: URL,
  supabaseResponse: NextResponse,
) {
  const redirectResponse = NextResponse.redirect(url);
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value);
  });
  return redirectResponse;
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

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
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Prefer getUser() over getSession() so auth is validated and cookies can refresh
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Step 1: Guest trying to open the app → send to login
  // Public routes (/login, /signup, /auth/callback) are excluded so auth can work
  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return redirectWithSessionCookies(url, supabaseResponse);
  }

  // Step 2: Logged-in user on login/signup → send into the app (home KB)
  // Not /dashboard — this project uses / and /chat
  if (user && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return redirectWithSessionCookies(url, supabaseResponse);
  }

  // Step 3: Allow the request; return the response that may include refreshed cookies
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Run on all routes except Next internals and static image files.
     * This keeps the session fresh across the app.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
