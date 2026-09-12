"""Checks the new motion: rotating hamper photos, the scrolling strip, reveals, and the backdrop."""
from pathlib import Path
from playwright.sync_api import sync_playwright

B = "http://localhost:3100"
SP = Path(__file__).parent
SHOTS = SP / "output"; SHOTS.mkdir(exist_ok=True)
results = []
def ok(label, cond, detail=""):
    results.append(cond); print(("PASS" if cond else "FAIL"), label, detail, flush=True)

def showing(page):
    """Which photo each of the three frames is showing, by file name."""
    return page.eval_on_selector_all(
        ".rotator-frame img.is-showing",
        "els => els.map(e => decodeURIComponent(e.currentSrc || e.src).split('/').pop().split('?')[0].split('.')[0])",
    )

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: m.type == "error" and errors.append(m.text))

    page.goto(B + "/hampers", wait_until="networkidle")
    page.wait_for_timeout(1200)

    first = showing(page)
    ok("three frames per hamper, nine visible photos", len(first) == 9, str(len(first)))
    ok("no repeats within a card", len(set(first[:3])) == 3, ", ".join(first[:3]))

    page.wait_for_timeout(4200)
    second = showing(page)
    ok("photos moved on", second != first, f"{first[0]} -> {second[0]}")

    page.wait_for_timeout(4200)
    third = showing(page)
    ok("cards are not in lockstep", not (first == second == third) and second != third)

    # Everything a card can show, over time
    seen = set(first) | set(second) | set(third)
    for _ in range(8):
        page.wait_for_timeout(2200)
        seen |= set(showing(page))
    ok("many different photos shown", len(seen) >= 10, f"{len(seen)} distinct photos")

    # Hover pauses
    page.locator(".rotator").first.hover()
    paused = showing(page)[:3]
    page.wait_for_timeout(5200)
    ok("hovering holds the photo still", showing(page)[:3] == paused, ", ".join(paused))
    page.mouse.move(0, 0)


    # ---- the price ladder: each tier dressed differently
    page.goto(B + "/hampers", wait_until="networkidle")
    page.wait_for_timeout(1200)
    levels = page.eval_on_selector_all(".hamper-card", "els => els.map(e => e.dataset.level)")
    ok("cards ranked by price", levels == ["premium", "middle", "entry"], ",".join(levels))
    surfaces = page.eval_on_selector_all(
        ".hamper-card",
        "els => els.map(e => { const s = getComputedStyle(e); return s.backgroundImage === 'none' ? s.backgroundColor : s.backgroundImage })",
    )
    ok("three different card surfaces", len(set(surfaces)) == 3)
    ok("only the top tier is crested", page.locator(".hamper-crest").count() == 1)
    names = page.eval_on_selector_all(".hamper-name", "els => els.map(e => parseFloat(getComputedStyle(e).fontSize))")
    ok("names step down with price", names[0] > names[1] > names[2], " > ".join(str(n) for n in names))
    mats = page.eval_on_selector_all(".hamper-card .rotator-frame", "els => [...new Set(els.map(e => getComputedStyle(e).backgroundColor))]")
    ok("top tier has its own photo mats", len(mats) > 1, " | ".join(mats))

    # Scrolling strip
    page.goto(B + "/", wait_until="networkidle")
    page.wait_for_timeout(800)
    strip = page.locator(".marquee-track")
    ok("strip carries every hamper product twice", strip.locator("li").count() == 24, str(strip.locator("li").count()))
    before = page.evaluate("getComputedStyle(document.querySelector('.marquee-track')).transform")
    page.wait_for_timeout(1500)
    after = page.evaluate("getComputedStyle(document.querySelector('.marquee-track')).transform")
    ok("strip is moving", before != after)
    page.locator(".marquee").hover()
    page.wait_for_timeout(400)
    held = page.evaluate("getComputedStyle(document.querySelector('.marquee-track')).transform")
    page.wait_for_timeout(1200)
    ok("strip stops when hovered", held == page.evaluate("getComputedStyle(document.querySelector('.marquee-track')).transform"))
    page.mouse.move(0, 0)

    # Backdrop
    layers = page.evaluate("getComputedStyle(document.body, '::before').backgroundImage")
    ok("warm background layers behind the page", layers.count("radial-gradient") == 3, str(layers.count("radial-gradient")))
    grain = page.evaluate("getComputedStyle(document.body, '::after').backgroundImage")
    ok("paper grain present", "svg" in grain)

    # Reveals: nothing left invisible after scrolling through
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(1500)
    hidden = page.eval_on_selector_all(".reveal", "els => els.filter(e => getComputedStyle(e).opacity !== '1').length")
    ok("nothing stays hidden after scrolling", hidden == 0, f"{hidden} still hidden")
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(900)
    page.screenshot(path=str(SHOTS / "desktop-home-top.png"))
    page.screenshot(path=str(SHOTS / "desktop-home-full.png"), full_page=True)

    ok("no script errors", not errors, "; ".join(errors[:2]))

    # Reduced motion: everything holds still
    ctx2 = browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
    page2 = ctx2.new_page()
    page2.goto(B + "/hampers", wait_until="networkidle")
    page2.wait_for_timeout(800)
    start = showing(page2)
    page2.wait_for_timeout(5200)
    ok("still images when less motion is preferred", showing(page2) == start)
    page2.goto(B + "/", wait_until="networkidle")
    page2.wait_for_timeout(600)
    t1 = page2.evaluate("getComputedStyle(document.querySelector('.marquee-track')).transform")
    page2.wait_for_timeout(1400)
    ok("strip holds still too", t1 == page2.evaluate("getComputedStyle(document.querySelector('.marquee-track')).transform"))
    page2.screenshot(path=str(SHOTS / "reduced-motion-home.png"), full_page=True)

    # Phone
    ctx3 = browser.new_context(viewport={"width": 390, "height": 844})
    page3 = ctx3.new_page()
    page3.goto(B + "/", wait_until="networkidle")
    page3.wait_for_timeout(1200)
    over = page3.evaluate("document.documentElement.scrollWidth - window.innerWidth")
    ok("no sideways scroll on phone", over <= 0, f"overflow={over}px")

    page3.goto(B + "/hampers", wait_until="networkidle")
    for step in range(6):
        page3.mouse.wheel(0, 700)
        page3.wait_for_timeout(320)
    page3.wait_for_timeout(700)
    shown = page3.eval_on_selector_all(".hamper-card", "els => els.filter(e => e.getBoundingClientRect().height > 0 && getComputedStyle(e.closest('.reveal') || e).opacity === '1').length")
    ok("all three cards appear as you scroll on a phone", shown == 3, f"{shown} of 3")
    page3.screenshot(path=str(SHOTS / "phone-tiers.png"))
    page3.screenshot(path=str(SHOTS / "phone-home.png"), full_page=True)

    for c in (ctx, ctx2, ctx3):
        c.close()
    browser.close()

print(f"\n{sum(results)} passed, {len(results) - sum(results)} failed")
