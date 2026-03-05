import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/register'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isPublicPath = publicPaths.some(
        (path) => pathname === path || pathname.startsWith(path + '/')
    );

    const token = request.cookies.get('client_token')?.value;

    if (!isPublicPath && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isPublicPath && token) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
