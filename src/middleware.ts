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

const ADMIN_PATHS = ["/list/attendance/admin", "/admin", "/adminAttendance"];
const EMPLOYEE_HOME = "/list/attendance/employee";
const LOGIN_PATH = "/login";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("access")?.value;
  const payload = token ? getPayloadFromToken(token) : null;
  const role = payload?.role;

  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p) || pathname === p);

  if (!token || !payload) {
    if (pathname.startsWith("/list") || pathname === "/admin" || pathname === "/adminAttendance" || pathname === "/attendance") {
      return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
    }
    return NextResponse.next();
  }

  if (isAdminPath && role !== "admin") {
    return NextResponse.redirect(new URL(EMPLOYEE_HOME, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/list/:path*", "/admin", "/adminAttendance", "/attendance"],
};
