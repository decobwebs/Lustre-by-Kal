"""Checks the built site: WhatsApp wiring, home-screen install and offline behaviour.

Set WHATSAPP to the number the site was built with, or "" to check the
hidden-until-configured state instead.
"""
import os
from pathlib import Path

from playwright.sync_api import sync_playwright

WHATSAPP = os.environ.get("WHATSAPP", "2348060897446")

B = "http://localhost:3100"
SP = Path(__file__).parent
results = []
def ok(label, cond, detail=""):
    results.append(cond); print(("PASS" if cond else "FAIL"), label, detail, flush=True)

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, service_workers="allow")
    page = ctx.new_page()

    page.goto(B + "/", wait_until="networkidle")
    html = page.content()
    ok("no leftover placeholder number", "800 000 0000" not in page.inner_text("body"))
    if WHATSAPP:
        ok("chat buttons use Kal's number", f"wa.me/{WHATSAPP}" in html)
        ok("number shown to visitors", "+234 806 089 7446" in page.inner_text("body"))
    else:
        ok("no WhatsApp links when no number is set", "wa.me" not in html)
        ok("fallback call to action instead", page.get_by_role("link", name="Ask us a question").is_visible())

    page.goto(B + "/hampers/bloom-lux", wait_until="networkidle")
    page.get_by_role("button", name="Add to order list").click()
    page.goto(B + "/order", wait_until="networkidle")
    page.wait_for_timeout(500)
    has_whatsapp = page.get_by_role("button", name="Send on WhatsApp").count() == 1
    ok("send routes match the setup", has_whatsapp == bool(WHATSAPP) and page.get_by_role("button", name="Send by email").is_visible())

    # Home-screen install details
    manifest = page.evaluate("fetch('/manifest.webmanifest').then(r => r.json())")
    ok("manifest names the business", manifest["name"] == "Lustre by Kal" and manifest["display"] == "standalone", manifest["name"])
    ok("manifest icons present", len(manifest["icons"]) == 3)

    # Service worker
    page.goto(B + "/hampers", wait_until="networkidle")
    page.wait_for_timeout(2500)
    state = page.evaluate("navigator.serviceWorker.getRegistration().then(r => r ? (r.active ? 'active' : 'installing') : 'none')")
    ok("service worker registered", state == "active", state)
    page.goto(B + "/hampers/bloom-lux", wait_until="networkidle")  # visit a page, then lose the connection
    page.wait_for_timeout(1200)

    ctx.set_offline(True)
    page.goto(B + "/hampers/bloom-lux", wait_until="domcontentloaded")
    ok("visited page still opens offline", "Bloom Lux" in page.inner_text("body"))
    page.goto(B + "/contact", wait_until="domcontentloaded")
    body = page.inner_text("body")
    ok("unvisited page shows the offline notice", "You're offline." in body, body[:60].replace("\n", " "))
    page.screenshot(path=str(SP / "output/phone-offline.png"))
    ctx.set_offline(False)

    ctx.close(); browser.close()

print(f"\n{sum(results)} passed, {len(results) - sum(results)} failed")
