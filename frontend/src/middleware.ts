import { NextRequest } from 'next/server';
import { i18nRouter } from 'next-i18n-router';
import i18nConfig from '@app/i18nConfig';

export async function middleware(req: NextRequest) {
  const {
    nextUrl: { pathname },
  } = req;

  req.headers.set('x-path', pathname);
  return i18nRouter(req, i18nConfig);
}

export const config = {
  matcher: '/((?!api|static|.*\\..*|_next).*)',
};
