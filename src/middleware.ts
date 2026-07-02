import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple JWT decode (no verify; verification is done by API). Only read payload for role.
function getPayloadFromToken(token: string): { id?: string; username?: string; role?: string } | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json) as { id?: string; username?: string; role?: string };
  } catch {
    return null;
  }
}

const ROUTES = {
  public:
    ['/login', '/'],

  admin: [
    '/admin',
    '/list/attendance/admin',
  ],

  employee: [
    "/employee",
  ],

  shared: [
    '/list/employees',
    "/list",
    "/ai-assist",
    "/database",
    "/database/add-candidate",
    '/list/attendance/employee',
    '/profile',
    '/documents',
    '/dashboard'
  ]
}

const ADMIN_HOME = "/admin";
const EMPLOYEE_HOME = "/list/attendance/employee";
const LOGIN_PATH = "/login";
const ORIGIN = "https://hrms.bytebuzz.in";

function matchesRoute (pathname: string, routes: string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const token = request.cookies.get("access")?.value;
  const payload = token ? getPayloadFromToken(token) : null;
  const role = payload?.role;

  const isPublic = matchesRoute(pathname, ROUTES.public);
  const isAdminRoute = matchesRoute(pathname, ROUTES.admin);
  const isEmployeeRoute = matchesRoute(pathname, ROUTES.employee);
  const isSharedRoute = matchesRoute(pathname, ROUTES.shared);

  if (!token || !payload) {
    if (!isPublic) {
      const loginUrl = new URL(LOGIN_PATH, ORIGIN);
      loginUrl.searchParams.set("returnUrl", pathname + search);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  /* ---------- Logged In but Wrong Role ---------- */
  if (isAdminRoute && role !== "admin") {
    return NextResponse.redirect(new URL(EMPLOYEE_HOME, ORIGIN));
  }

  if (isEmployeeRoute && role === "admin") {
    return NextResponse.redirect(new URL(ADMIN_HOME, ORIGIN));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/employee/:path*",
    "/list/:path*",
    "/profile/:path*",
    "/ai-assist/:path*",
    "/database/:path*",
    "/documents/:path*",
  ],
};
