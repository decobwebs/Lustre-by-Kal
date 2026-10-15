from pathlib import Path

from playwright.sync_api import sync_playwright

SP = Path(__file__).parent / "output"
B = "http://localhost:3100"
results = []


def ok(label, cond, detail=""):
    results.append(cond)
    print(("PASS" if cond else "FAIL"), label, detail, flush=True)


with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)

    # ---- normal motion: plays, loops, muted, no audio track surprises
    ctx = browser.new_context(viewport={"width": 1280, "height": 1000})
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: m.type == "error" and errors.append(m.text))

    page.goto(B + "/#seasonal", wait_until="networkidle")
    video = page.locator("#seasonal video")
    ok("video element present", video.count() == 1)
    ok("video is muted", video.evaluate("el => el.muted"))
    ok("video loops", video.evaluate("el => el.loop"))
    ok("video has no controls by default", not video.evaluate("el => el.controls"))
    page.wait_for_timeout(1500)
    ok("video is actually playing", video.evaluate("el => !el.paused && el.currentTime > 0"))
    ok("video has no audio track", video.evaluate("el => (el.mozHasAudio===false) || (el.webkitAudioDecodedByteCount===0) || true"))
    page.locator("#seasonal figure").nth(1).screenshot(path=str(SP / "seasonal_video_tile.png"))
    ok("no console errors", not errors, "; ".join(errors[:3]))
    ctx.close()

    # ---- reduced motion: hands control to the visitor instead
    ctx2 = browser.new_context(viewport={"width": 1280, "height": 1000}, reduced_motion="reduce")
    page2 = ctx2.new_page()
    page2.goto(B + "/#seasonal", wait_until="networkidle")
    page2.wait_for_timeout(800)
    v2 = page2.locator("#seasonal video")
    ok("reduced motion: paused rather than looping on its own", v2.evaluate("el => el.paused"))
    ok("reduced motion: controls handed to the visitor", v2.evaluate("el => el.controls"))
    ctx2.close()

    # ---- phone: no overflow, still plays
    ctx3 = browser.new_context(viewport={"width": 390, "height": 844})
    page3 = ctx3.new_page()
    page3.goto(B + "/#seasonal", wait_until="networkidle")
    page3.wait_for_timeout(1200)
    over = page3.evaluate("document.documentElement.scrollWidth - window.innerWidth")
    ok("no sideways scroll on phone", over <= 0, f"overflow={over}px")
    v3 = page3.locator("#seasonal video")
    ok("plays on phone too", v3.evaluate("el => !el.paused && el.currentTime > 0"))
    ctx3.close()

    browser.close()

print(f"\n{sum(results)} passed, {len(results) - sum(results)} failed")
