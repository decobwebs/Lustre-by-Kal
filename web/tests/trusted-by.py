from pathlib import Path

from playwright.sync_api import sync_playwright

SP = Path(__file__).parent / "output"
B = "http://localhost:3100"
results = []


def ok(label, cond, detail=""):
    results.append(cond)
    print(("PASS" if cond else "FAIL"), label, detail, flush=True)


def dismiss_promo(page, timeout=2500):
    overlay = page.locator(".promo-overlay")
    try:
        overlay.wait_for(state="visible", timeout=timeout)
    except Exception:
        return
    page.get_by_role("button", name="Close").click()
    page.wait_for_timeout(400)


with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)

    ctx = browser.new_context(viewport={"width": 1280, "height": 1000})
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: m.type == "error" and errors.append(m.text))

    page.goto(B + "/", wait_until="networkidle")
    dismiss_promo(page)

    section = page.locator("section:has(#trusted-by-title)")
    ok("section present", section.count() == 1)
    ok("eyebrow reads Trusted by", page.get_by_text("Trusted by", exact=True).is_visible())

    imgs = section.locator("img")
    ok("both logos appear, each duplicated for the seam (2 x 8 = 16)", imgs.count() == 16, str(imgs.count()))
    alts = [imgs.nth(i).get_attribute("alt") for i in range(imgs.count())]
    ok("real copies carry the real names", "Quick Trips Travels Agency" in alts and "Reliant Anchor Foundation" in alts)
    ok("duplicate copies are alt=\"\" (aria-hidden)", alts.count("") == 8, str(alts.count("")))

    track = page.locator(".marquee-track").filter(has=page.locator("img[alt='Quick Trips Travels Agency']"))
    ok("track found", track.count() == 1)
    before = track.evaluate("el => getComputedStyle(el).transform")
    page.wait_for_timeout(1200)
    after = track.evaluate("el => getComputedStyle(el).transform")
    ok("strip is actually moving", before != after, f"{before[:20]} -> {after[:20]}")

    marquee = section.locator(".marquee")
    marquee.hover()
    page.wait_for_timeout(200)
    held = track.evaluate("el => getComputedStyle(el).transform")
    page.wait_for_timeout(900)
    ok("stops moving on hover", held == track.evaluate("el => getComputedStyle(el).transform"))

    # Now that the track is paused (not mid-translate), it's safe to hover a single logo.
    first_logo = imgs.first
    ok("logos are desaturated at rest", "grayscale" in (first_logo.get_attribute("class") or ""))
    first_logo.hover()
    page.wait_for_timeout(350)
    opacity_on_hover = first_logo.evaluate("el => getComputedStyle(el).opacity")
    ok("hovering a logo brings it to full opacity", opacity_on_hover == "1", opacity_on_hover)

    page.mouse.move(640, 10)
    page.wait_for_timeout(300)
    section.screenshot(path=str(SP / "trusted_by.png"))
    ok("no console errors", not errors, "; ".join(errors[:3]))
    ctx.close()

    # ---- reduced motion: still visible, just not animating ----
    ctx2 = browser.new_context(viewport={"width": 1280, "height": 1000}, reduced_motion="reduce")
    page2 = ctx2.new_page()
    page2.goto(B + "/", wait_until="networkidle")
    dismiss_promo(page2)
    t2 = page2.locator(".marquee-track").filter(has=page2.locator("img[alt='Quick Trips Travels Agency']"))
    ok("logos still visible under reduced motion", t2.locator("img").first.is_visible())
    b1 = t2.evaluate("el => getComputedStyle(el).transform")
    page2.wait_for_timeout(1200)
    ok("does not drift under reduced motion", b1 == t2.evaluate("el => getComputedStyle(el).transform"))
    ctx2.close()

    # ---- phone ----
    ctx3 = browser.new_context(viewport={"width": 390, "height": 844})
    page3 = ctx3.new_page()
    page3.goto(B + "/", wait_until="networkidle")
    dismiss_promo(page3)
    over = page3.evaluate("document.documentElement.scrollWidth - window.innerWidth")
    ok("no sideways scroll on phone", over <= 0, f"overflow={over}px")
    page3.locator("section:has(#trusted-by-title)").screenshot(path=str(SP / "trusted_by_phone.png"))
    ctx3.close()

    browser.close()

print(f"\n{sum(results)} passed, {len(results) - sum(results)} failed")
