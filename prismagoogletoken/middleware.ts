import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
    const protectedRoutes = ["/dashboard"];

    if (protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))) {
        const token = req.cookies.get("jwt")?.value || req.headers.get("authorization")?.replace("Bearer ", "");

        if (!token) return NextResponse.redirect(new URL("/", req.url));

        try {
            jwt.verify(token, process.env.JWT_SECRET!);
            return NextResponse.next();
        } catch {
            return NextResponse.redirect(new URL("/", req.url));
        }
    }
}

export const config = {
    matcher: ["/dashboard/:path*"],
};
