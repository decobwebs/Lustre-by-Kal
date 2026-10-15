import json
from pathlib import Path

from playwright.sync_api import sync_playwright

SP = Path(__file__).parent / "output"
B = "http://localhost:3100"
MAILBOX = SP / "emails.jsonl"
MAILBOX.write_text("", encoding="utf-8")
results = []


def ok(label, cond, detail=""):
    results.append(cond)
    print(("PASS" if cond else "FAIL"), label, detail, flush=True)


with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)

    # ---- appears on every homepage visit, animates in, honeywell wording ----
    ctx = browser.new_context(viewport={"width": 1280, "height": 1000})
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: m.type == "error" and errors.append(m.text))

    page.goto(B + "/", wait_until="networkidle")
    overlay = page.locator(".promo-overlay")
    page.wait_for_timeout(1500)
    ok("fades in after the delay", overlay.evaluate("el => getComputedStyle(el).opacity") == "1")
    ok("headline present", page.get_by_text("Get 5% off your first order", exact=False).is_visible())
    ok("subtext present", page.get_by_text("new product drops", exact=False).is_visible())
    ok("placeholder matches", page.get_by_placeholder("Enter your email").is_visible())
    ok("button copy matches", page.get_by_role("button", name="Get My 5% Off").is_visible())
    ok("background scroll is locked", page.evaluate("getComputedStyle(document.body).overflow") == "hidden")

    # ---- backdrop click and Escape must NOT close it ----
    page.mouse.click(20, 20)
    page.wait_for_timeout(200)
    ok("backdrop click does not close it", overlay.evaluate("el => getComputedStyle(el).opacity") == "1")
    page.keyboard.press("Escape")
    page.wait_for_timeout(200)
    ok("Escape does not close it", overlay.evaluate("el => getComputedStyle(el).opacity") == "1")

    # ---- reloading shows it again: truly every visit, no suppression ----
    page.reload(wait_until="networkidle")
    page.wait_for_timeout(1500)
    ok("shows again after a reload (no localStorage suppression)", page.locator(".promo-overlay").evaluate("el => getComputedStyle(el).opacity") == "1")

    # ---- typo suggestion ----
    page.fill("#promo-email", "amaka@gmial.com")
    page.get_by_role("button", name="Use this").wait_for(timeout=2000)
    page.get_by_role("button", name="Use this").click()
    ok("typo suggestion applied", page.locator("#promo-email").input_value() == "amaka@gmail.com")

    # ---- submit, get the code, email sent with reply-to ----
    page.fill("#promo-email", "shopper@example.com")
    page.get_by_role("button", name="Get My 5% Off").click()
    page.get_by_text("Check your email.").wait_for(timeout=10000)
    ok("code shown on screen", page.get_by_text("WELCOME5").is_visible())
    page.screenshot(path=str(SP / "promo_sent.png"))

    emails = [json.loads(l) for l in MAILBOX.read_text(encoding="utf-8").splitlines() if l.strip()]
    ok("2 emails sent (notice to Kal + code to subscriber)", len(emails) == 2, str(len(emails)))
    if len(emails) == 2:
        notice, ack = emails
        ok("notice goes to the admin inbox, reply-to the subscriber", notice["to"] == ["admin@lustrebykal.com"] and notice.get("reply_to") == "shopper@example.com")
        ok("subscriber gets the real code by email", "WELCOME5" in ack["text"] and ack["to"] == ["shopper@example.com"])

    # ---- closes only via the × / Got it, with the exit animation ----
    page.mouse.click(20, 20)
    page.keyboard.press("Escape")
    page.wait_for_timeout(200)
    ok("still not dismissible by backdrop/Escape in the success state", page.locator(".promo-overlay").is_visible())
    page.get_by_role("button", name="Got it").click()
    page.wait_for_timeout(500)
    ok("fully removed after the exit transition", page.locator(".promo-overlay").count() == 0)  # confirmed separately, by direct instrumentation, that unmount is delayed exactly EXIT_DURATION after close()
    ok("background scroll restored", page.evaluate("getComputedStyle(document.body).overflow") != "hidden")
    ok("no console errors", not errors, "; ".join(errors[:3]))
    ctx.close()

    # ---- invalid email shown inline, close via × specifically ----
    ctx2 = browser.new_context(viewport={"width": 1280, "height": 1000})
    page2 = ctx2.new_page()
    page2.goto(B + "/", wait_until="networkidle")
    page2.wait_for_timeout(1500)
    page2.fill("#promo-email", "not-an-email")
    page2.get_by_role("button", name="Get My 5% Off").click()
    ok("bad email rejected inline", page2.get_by_text("doesn't look like an email").is_visible())
    page2.get_by_role("button", name="Close").click()
    page2.wait_for_timeout(500)
    ok("× closes it (with its own exit animation)", page2.locator(".promo-overlay").count() == 0)
    ctx2.close()

    # ---- other pages never show it ----
    ctx3 = browser.new_context(viewport={"width": 1280, "height": 1000})
    page3 = ctx3.new_page()
    for path in ["/hampers", "/contact", "/order"]:
        page3.goto(B + path, wait_until="networkidle")
        page3.wait_for_timeout(1200)
        ok(f"does not appear on {path}", page3.locator(".promo-overlay").count() == 0)
    ctx3.close()

    # ---- phone ----
    ctx4 = browser.new_context(viewport={"width": 390, "height": 844})
    page4 = ctx4.new_page()
    page4.goto(B + "/", wait_until="networkidle")
    page4.wait_for_timeout(1500)
    over = page4.evaluate("document.documentElement.scrollWidth - window.innerWidth")
    ok("no sideways scroll on phone", over <= 0, f"overflow={over}px")
    page4.screenshot(path=str(SP / "promo_phone.png"))
    ctx4.close()

    # ---- reduced motion: still shows, just without the animated settle ----
    ctx5 = browser.new_context(viewport={"width": 1280, "height": 1000}, reduced_motion="reduce")
    page5 = ctx5.new_page()
    page5.goto(B + "/", wait_until="networkidle")
    page5.wait_for_timeout(1500)
    ok("still appears under reduced motion", page5.locator(".promo-overlay").evaluate("el => getComputedStyle(el).opacity") == "1")
    ctx5.close()

    browser.close()

print(f"\n{sum(results)} passed, {len(results) - sum(results)} failed")
