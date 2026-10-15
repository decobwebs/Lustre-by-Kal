import urllib.parse
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

    # ---- desktop: layout, default state, changing the occasion
    ctx = browser.new_context(viewport={"width": 1280, "height": 1000})
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: m.type == "error" and errors.append(m.text))

    page.goto(B + "/#seasonal", wait_until="networkidle")
    section = page.locator("#seasonal")
    ok("section present", section.count() == 1)
    ok("hero gift-box photo visible", page.locator("#seasonal img[alt*='gift box']").is_visible())
    ok("Birthday selected by default", page.locator("#seasonal input[value='Birthday']").is_checked())

    wa_btn = page.locator("#seasonal a:has-text('Chat on WhatsApp')")
    ok("WhatsApp button present (number is configured)", wa_btn.count() == 1)

    page.locator("#seasonal label:has-text(\"Valentine's Day\")").click()
    page.fill("#seasonal-budget", "₦60,000")
    page.fill("#seasonal-requirements", "A box for my wife, she loves tea and skincare")

    href = wa_btn.get_attribute("href")
    text = urllib.parse.parse_qs(urllib.parse.urlparse(href).query).get("text", [""])[0]
    ok("message has the chosen occasion", "Occasion: Valentine's Day" in text, text[:60])
    ok("message has the budget", "Budget: ₦60,000" in text)
    ok("message has the requirements", "my wife, she loves tea" in text)
    (SP / "seasonal_message.txt").write_text(text, encoding="utf-8")

    mail_href = page.locator("#seasonal a:has-text('Email us instead')").get_attribute("href")
    ok("email fallback always present", mail_href.startswith("mailto:"))

    page.screenshot(path=str(SP / "seasonal_desktop.png"), clip=section.bounding_box())

    # nav + footer links
    page.goto(B + "/", wait_until="networkidle")
    ok("nav link to seasonal", page.locator("header a[href='/#seasonal']").count() >= 1)
    ok("footer link to seasonal", page.locator("footer a[href='/#seasonal']").count() == 1)
    page.locator("nav[aria-label='Main'] a[href='/#seasonal']").first.click()
    page.wait_for_timeout(1800)  # the home page is long; smooth-scroll takes a while to settle
    in_view = page.evaluate("document.getElementById('seasonal').getBoundingClientRect().top < window.innerHeight")
    ok("nav link actually scrolls to the section", in_view)

    ok("no console errors (desktop)", not errors, "; ".join(errors[:3]))
    ctx.close()

    # ---- air fryer now shows in Radiant Lux
    ctx2 = browser.new_context(viewport={"width": 1280, "height": 1000})
    page2 = ctx2.new_page()
    page2.goto(B + "/hampers/radiant-lux", wait_until="networkidle")
    body = page2.inner_text("main")
    ok("air fryer listed in Radiant Lux contents", "Air fryer" in body)
    ok("air fryer photo appears in the gallery", page2.locator("img[alt*='Black air fryer']").count() >= 1)
    ctx2.close()

    # ---- phone: no overflow, section still usable
    ctx3 = browser.new_context(viewport={"width": 390, "height": 844})
    page3 = ctx3.new_page()
    page3.goto(B + "/#seasonal", wait_until="networkidle")
    page3.wait_for_timeout(600)
    over = page3.evaluate("document.documentElement.scrollWidth - window.innerWidth")
    ok("no sideways scroll on phone", over <= 0, f"overflow={over}px")
    page3.locator("#seasonal label:has-text('Eid')").click()
    page3.screenshot(path=str(SP / "seasonal_phone.png"), full_page=False)
    ctx3.close()

    # ---- reduced motion / tab still works without WhatsApp configured: simulate by stripping the button via a second check isn't needed, skip

    browser.close()

print(f"\n{sum(results)} passed, {len(results) - sum(results)} failed")
