"""Drives a real browser through the whole ordering flow.

Start the site with the mock email server first (see README). Set WHATSAPP to
the number the site was built with.
"""
import json, os, urllib.parse
from pathlib import Path

from playwright.sync_api import sync_playwright

WHATSAPP = os.environ.get("WHATSAPP", "2348060897446")
SP = Path(__file__).parent
SHOTS = SP / "output"; SHOTS.mkdir(exist_ok=True)
MAILBOX = SP / "output/emails.jsonl"
MAILBOX.write_text("", encoding="utf-8")  # only count what this run sends
B = "http://localhost:3100"
results = []
def ok(label, cond, detail=""):
    results.append(("PASS" if cond else "FAIL", label, detail)); print(("PASS" if cond else "FAIL"), label, detail, flush=True)

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)

    # ---------- screenshots at rest: desktop + phone
    for name, vp in [("desktop", {"width": 1440, "height": 900}), ("phone", {"width": 390, "height": 844})]:
        ctx = browser.new_context(viewport=vp, device_scale_factor=1)
        page = ctx.new_page()
        errors = []
        page.on("console", lambda m: m.type == "error" and errors.append(m.text))
        page.on("pageerror", lambda e: errors.append(str(e)))
        for path, slug in [("/", "home"), ("/hampers", "hampers"), ("/hampers/grace-lux", "grace"), ("/contact", "contact"), ("/order", "order-empty")]:
            page.goto(B + path, wait_until="networkidle")
            page.wait_for_timeout(700)
            page.screenshot(path=str(SHOTS / f"{name}-{slug}.png"), full_page=True)
        # horizontal overflow check on phone
        if name == "phone":
            for path in ["/", "/hampers", "/hampers/radiant-lux", "/order", "/contact", "/privacy"]:
                page.goto(B + path, wait_until="networkidle")
                over = page.evaluate("document.documentElement.scrollWidth - window.innerWidth")
                ok(f"no sideways scroll on phone {path}", over <= 0, f"overflow={over}px")
        ok(f"no console errors ({name})", not errors, "; ".join(errors[:3]))
        ctx.close()

    # ---------- order flow on a phone
    ctx = browser.new_context(viewport={"width": 390, "height": 844})
    page = ctx.new_page()
    page.goto(B + "/hampers/grace-lux", wait_until="networkidle")
    qty = page.get_by_role("group", name="How many Grace Lux hampers").get_by_role("textbox", name="Quantity")
    qty.fill("12"); qty.press("Enter")
    page.get_by_role("button", name="Add to order list").click()
    ok("toast after adding", page.get_by_text("12 × Grace Lux added to your order list").is_visible())
    badge = page.locator("header a[href='/order']").first.get_attribute("aria-label")
    ok("header count updates", badge == "Order list, 12 items", badge)

    # quick estimate on home
    page.goto(B + "/#team-title", wait_until="networkidle")
    page.get_by_label("One more: Radiant Lux quantity").click()
    page.get_by_label("One more: Radiant Lux quantity").click()
    ok("estimate total", page.get_by_text("₦720,000").first.is_visible())
    page.get_by_role("button", name="Add to my order list").click()
    # an add-on
    page.goto(B + "/hampers#add-ons", wait_until="networkidle")
    page.locator("#add-ons li").filter(has_text="Air fryer").get_by_role("button", name="Add to order").click()

    page.goto(B + "/order", wait_until="networkidle")
    page.wait_for_timeout(400)
    body = page.inner_text("main")
    ok("order total correct", "₦3,840,000" in body, "12×260k + 2×360k = 3,840,000")
    ok("add-on on request", "On request" in body)

    # validation: submit empty
    page.get_by_role("button", name="Send by email").click()
    ok("empty form shows errors", page.get_by_text("Please enter your name.").is_visible())
    page.get_by_label("Your name").fill("Amaka Obi")
    page.get_by_label("Company").fill("Brightline Ltd")
    page.get_by_label("Email").fill("amaka@gmial.com")
    page.get_by_label("Email").blur()
    ok("email typo suggestion", page.get_by_text("amaka@gmail.com").is_visible())
    page.get_by_role("button", name="Use this").click()
    ok("suggestion applied", page.get_by_label("Email").input_value() == "amaka@gmail.com")
    page.get_by_label("Phone").fill("0803 123 456")
    page.get_by_label("Phone").blur()
    ok("short phone rejected", page.get_by_text("This one has 10").is_visible())
    page.get_by_label("Phone").fill("0803 123 4567")
    page.get_by_label("Phone").blur()
    ok("phone normalised", page.get_by_text("We'll use +2348031234567.").is_visible())
    ok("stale error cleared on edit", not page.get_by_text("Please enter your name.").is_visible())
    page.get_by_label("Deliver to").fill("Ikeja, Lagos")
    page.get_by_label("Notes").fill("Card: Thank you for a great year <team>!")
    page.screenshot(path=str(SHOTS / "phone-order-filled.png"), full_page=True)

    # WhatsApp route: catch the address the button opens, without leaving the site
    opened = {}
    ctx.route("**wa.me/**", lambda route: (opened.setdefault("url", route.request.url), route.abort()))
    with page.expect_popup() as pop:
        page.get_by_role("button", name="Send on WhatsApp").click()
    popup = pop.value
    try:
        popup.wait_for_load_state("domcontentloaded", timeout=4000)
    except Exception:
        pass
    url = opened.get("url") or popup.url
    popup.close()
    text = urllib.parse.parse_qs(urllib.parse.urlparse(url).query).get("text", [""])[0]
    ok("WhatsApp opens Kal's number", f"wa.me/{WHATSAPP}" in url, url[:60])
    ok("WhatsApp message itemised", "Grace Lux · LBK-GL01 × 12 — ₦3,120,000" in text and "Air fryer · LBK-AD01 × 1 — price on request" in text, text[:60])
    (SP / "output/whatsapp-message.txt").write_text(text, encoding="utf-8")
    ok("finish-in-WhatsApp screen", page.get_by_text("Finish in WhatsApp.").is_visible())
    page.screenshot(path=str(SHOTS / "phone-order-whatsapp.png"))
    page.get_by_role("button", name="Back to my list").click()

    # Email route (form re-mounts, fill again)
    page.get_by_label("Your name").fill("Amaka Obi")
    page.get_by_label("Company").fill("Brightline Ltd")
    page.get_by_label("Email").fill("amaka@gmail.com")
    page.get_by_label("Phone").fill("0803 123 4567")
    page.get_by_label("Deliver to").fill("Ikeja, Lagos")
    page.get_by_label("Notes").fill("Card: Thank you for a great year <team>!")
    page.wait_for_timeout(3200)  # the form ignores submissions faster than 3 seconds
    page.get_by_role("button", name="Send by email").click()
    page.get_by_text("Your order is on its way to us.").wait_for(timeout=15000)
    ref = page.locator("p.font-display").first.inner_text()
    ok("email success with reference", ref.startswith("LBK-"), ref)
    page.screenshot(path=str(SHOTS / "phone-order-sent.png"))
    ok("list cleared after email", page.evaluate("localStorage.getItem('lbk-order-v1')") == "[]")

    # contact form
    page.goto(B + "/contact", wait_until="networkidle")
    page.get_by_label("Your name").fill("Tunde Bello")
    page.get_by_label("Email").fill("tunde@example.com")
    page.get_by_text("A company order").click()
    page.get_by_label("Message").fill("We need 80 hampers for December. Can you deliver to Abuja and Lagos?")
    page.wait_for_timeout(3200)
    page.get_by_role("button", name="Send message").click()
    page.get_by_text("Message sent.").wait_for(timeout=15000)
    ok("enquiry sent", True)
    ctx.close()
    browser.close()

emails = [json.loads(l) for l in MAILBOX.read_text(encoding="utf-8").splitlines() if l.strip()]
ok("4 emails sent (order ×2, enquiry ×2)", len(emails) == 4, str(len(emails)))
if emails:
    o = emails[0]
    ok("order to inbox, reply-to customer", o["to"] == ["admin@lustrebykal.com"] and o.get("reply_to") == "amaka@gmail.com", o["subject"])
    ok("customer notes escaped in html", "&lt;team&gt;" in o["html"] and "<team>" not in o["html"])
    ok("server recalculated total", "₦3,840,000" in o["subject"], o["subject"])
    (SP / "output/email-order.html").write_text(o["html"], encoding="utf-8")
    (SP / "output/email-ack.html").write_text(emails[1]["html"], encoding="utf-8")
fails = [r for r in results if r[0] == "FAIL"]
print(f"\n{len(results) - len(fails)} passed, {len(fails)} failed")
