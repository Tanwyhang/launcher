import { NextResponse, type NextRequest } from "next/server";
import { getLocaleByPathSegment } from "@/lib/utils";

export function middleware(request: NextRequest) {
  const segment = request.nextUrl.pathname.split("/").filter(Boolean)[0] || "en";
  const locale = getLocaleByPathSegment(segment)?.htmlLang || "en";
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-launcher-locale", locale);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png).*)"],
};
