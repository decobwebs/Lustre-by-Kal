import { NextResponse } from "next/server";

/**
 * SITE LOCK
 *
 * While this is true, the deployed site answers 404 to every request: every
 * page, the order and enquiry endpoints, images, the sitemap, all of it. To a
 * visitor it looks like nothing lives at this address.
 *
 * TO LIFT THE LOCK: change `true` to `false`, commit and push.
 *
 * `npm run dev` is never locked. A production build (which is what the host
 * runs) is locked unless it is started with SITE_UNLOCK=1, which exists only so
 * the browser tests can exercise a production build on a developer's machine.
 */
const SITE_LOCKED = false;

const isLocked = () =>
  SITE_LOCKED && process.env.NODE_ENV === "production" && process.env.SITE_UNLOCK !== "1";

/** Deliberately plain, and close to the framework's own 404, so it carries no branding. */
const NOT_FOUND_HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>404: This page could not be found.</title><style>html,body{height:100%;margin:0}body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;color:#000;background:#fff;display:flex;align-items:center;justify-content:center}h1{display:inline-block;margin:0 20px 0 0;padding:0 23px 0 0;font-size:24px;font-weight:500;line-height:49px;border-right:1px solid rgba(0,0,0,.3)}h2{display:inline-block;margin:0;font-size:14px;font-weight:400;line-height:49px}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}h1{border-right-color:rgba(255,255,255,.3)}}</style></head><body><div><h1>404</h1><h2>This page could not be found.</h2></div></body></html>`;

export function proxy() {
  if (!isLocked()) return NextResponse.next();

  return new NextResponse(NOT_FOUND_HTML, {
    status: 404,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Never cached, so nobody is left holding a stale 404 once the lock is lifted.
      "Cache-Control": "no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}
