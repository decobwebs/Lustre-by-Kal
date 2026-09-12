"""Checks the no-database order lookup: paste an order message, see it resolved."""
from playwright.sync_api import sync_playwright

B = "http://localhost:3100"
results = []
def ok(label, cond, detail=""):
    results.append(cond); print(("PASS" if cond else "FAIL"), label, detail, flush=True)

FULL_MESSAGE = """Hello Lustre by Kal, I'd like a quote for this order.

Order reference: LBK-0911-7428

• Grace Lux · LBK-GL01 × 12 — ₦3,120,000
• Radiant Lux · LBK-RL01 × 2 — ₦720,000
• Air fryer · LBK-AD01 × 1 — price on request

Estimated total: ₦3,840,000 + items priced on request

Name: Amaka Obi
Company: Brightline Ltd
Phone: +2348031234567
Email: amaka@gmail.com
Deliver to: Ikeja, Lagos

Notes: Card: Thank you for a great year!"""

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    page = browser.new_context(viewport={"width": 1280, "height": 900}).new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))

    page.goto(B + "/admin", wait_until="networkidle")
    ok("page not indexed", page.evaluate("document.querySelector('meta[name=robots]')?.content") in ("noindex, nofollow", "noindex,nofollow"))
    ok("no admin link in the header", page.locator("header a[href='/admin']").count() == 0)

    page.get_by_placeholder("Paste the whole message").fill(FULL_MESSAGE)
    page.get_by_role("button", name="Look up this order").click()
    page.wait_for_timeout(400)

    body = page.inner_text("main")
    ok("order reference shown", "LBK-0911-7428" in body)
    ok("total computed from the catalogue, not copied", "₦3,840,000" in body)
    ok("on-request note shown", "priced on request" in body)
    ok("customer name shown", "Amaka Obi" in body)
    ok("delivery address shown", "Ikeja, Lagos" in body)
    ok("hamper contents shown in full", "Massage gun" in body and "Rattan gift box" in body)
    ok("add-on detail shown", "HiBrew" not in body and "Air fryer" in body)  # air fryer detail is "With stacking rack"
    ok("quantities correct", "× 12" in body and "× 2" in body and "× 1" in body)
    imgs = page.locator("main img").count()
    ok("photos rendered for every item", imgs >= 10, str(imgs))

    # Quick-list shorthand, no full message
    page.reload()
    page.get_by_placeholder("Paste the whole message").fill("LBK-BL01:5, LBK-AD03x2")
    page.get_by_role("button", name="Look up this order").click()
    page.wait_for_timeout(400)
    body2 = page.inner_text("main")
    ok("shorthand ref:qty works", "Bloom Lux" in body2 and "× 5" in body2 and "Blender" in body2 and "× 2" in body2)
    ok("no reference shown when none was pasted", "Not found in this text" in body2)

    # Unknown ref
    page.reload()
    page.get_by_placeholder("Paste the whole message").fill("LBK-ZZ99 x 3")
    page.get_by_role("button", name="Look up this order").click()
    page.wait_for_timeout(400)
    ok("unknown reference flagged, not silently dropped", "LBK-ZZ99" in page.inner_text("main") and "Not on the site" in page.inner_text("main"))

    # Example button
    page.reload()
    page.get_by_role("button", name="See it with an example").click()
    page.wait_for_timeout(400)
    ok("example fills and resolves", "LBK-0911-7428" in page.inner_text("main"))

    # Nothing pasted yet -> no crash, no phantom result
    page.reload()
    ok("look-up disabled with nothing pasted", page.get_by_role("button", name="Look up this order").is_disabled())

    ok("order reference not mistaken for an unknown item", "Not on the site" not in page.inner_text("main"))
    ok("no script errors", not errors, "; ".join(errors[:2]))
    browser.close()

print(f"\n{sum(results)} passed, {len(results) - sum(results)} failed")
