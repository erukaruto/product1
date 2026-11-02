# Upsell email for existing buyers

Customers who bought one product can get the other for the difference between the bundle price and the individual price.

With the suggested prices (bundle $59, SaaSDrop $29, DashDrop $49), both codes take **$19 off**:

| They already own | They get | Normal price | With code | They pay in total |
| --- | --- | --- | --- | --- |
| SaaSDrop ($29) | DashDrop | $49 | **$30** | $59, the bundle price |
| DashDrop ($49) | SaaSDrop | $29 | **$10** | $59, the bundle price |

If you change the prices, the discount is (SaaSDrop price + DashDrop price) minus the bundle price, which is the amount the bundle saves. Recalculate before sending.

---

## Email A: to SaaSDrop buyers

**Subject:** DashDrop for $30, since you already have SaaSDrop

Hi,

Thanks for buying SaaSDrop.

I've released DashDrop, the admin dashboard that goes with it. It uses the same tokens.css, the same font and the same three themes, so your landing page and your app look like one product. The "Sign in" and "Get started" buttons in SaaSDrop already point to its login and signup screens.

DashDrop has 64 screens, from sign-up and onboarding to MRR, churn and forecast reports, a pipeline board, alerts, an inbox, billing, team settings and a UI kit. Built with React 19, TypeScript and Vite.

Because you own SaaSDrop, you can get DashDrop for $30 instead of $49. That's the bundle price minus what you've already paid.

Code: {{CODE_ADD_DASHDROP}}
Link with the code applied: {{GUMROAD_URL_DASHDROP}}/{{CODE_ADD_DASHDROP}}
Demo: {{DEMO_URL_DASHDROP}}

The code works until {{UPSELL_END_DATE}}.

Questions: reply to this email or write to {{SUPPORT_EMAIL}}.

{{SELLER_NAME}}

---

## Email B: to DashDrop buyers

**Subject:** SaaSDrop for $10, since you already have DashDrop

Hi,

Thanks for buying DashDrop.

SaaSDrop is the landing page that goes with it: 36 pages (two home layouts, features, solutions, integrations, pricing, blog, help center, API docs, status, careers and more) in plain HTML and CSS, built with Vite. It uses the same tokens.css and themes as DashDrop, and its "Sign in" and "Get started" buttons open DashDrop's login and signup screens.

Because you own DashDrop, you can get SaaSDrop for $10 instead of $29. That's the bundle price minus what you've already paid.

Code: {{CODE_ADD_SAASDROP}}
Link with the code applied: {{GUMROAD_URL_SAASDROP}}/{{CODE_ADD_SAASDROP}}
Demo: {{DEMO_URL_SAASDROP}}

The code works until {{UPSELL_END_DATE}}.

Questions: reply to this email or write to {{SUPPORT_EMAIL}}.

{{SELLER_NAME}}

---

## Gumroad discount code setup (steps only)

I couldn't open Gumroad from here, so menu names may differ slightly from what you see.

1. In Gumroad, go to **Checkout → Discounts** and click **New discount**.
2. Name: `Add DashDrop for SaaSDrop owners`. Code: the value you chose for `{{CODE_ADD_DASHDROP}}` (for example `ADD-DASHDROP`).
3. Products: select **DashDrop** only.
4. Type: fixed amount. Amount: **$19**.
5. Set an end date ({{UPSELL_END_DATE}}) and, if you like, a usage limit. Anyone who has the code can use it, so don't leave it open forever.
6. Save.
7. Repeat steps 1 to 6 for SaaSDrop: name `Add SaaSDrop for DashDrop owners`, code `{{CODE_ADD_SAASDROP}}`, product **SaaSDrop**, $19 off.
8. Test both links (product URL + `/` + code) in a private browser window. DashDrop should show $30 and SaaSDrop $10.
9. Go to **Emails** and create a new email. Audience: customers who **bought SaaSDrop** and **have not bought** DashDrop or the bundle. Paste Email A and send.
10. Create a second email for customers who **bought DashDrop** and **have not bought** SaaSDrop or the bundle. Paste Email B and send.
11. After {{UPSELL_END_DATE}}, check that both codes have expired.

## Placeholders in this file

`{{CODE_ADD_DASHDROP}}`, `{{CODE_ADD_SAASDROP}}`, `{{GUMROAD_URL_DASHDROP}}`, `{{GUMROAD_URL_SAASDROP}}`, `{{DEMO_URL_DASHDROP}}`, `{{DEMO_URL_SAASDROP}}`, `{{UPSELL_END_DATE}}`, `{{SUPPORT_EMAIL}}`, `{{SELLER_NAME}}`
