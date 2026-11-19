ULTRON WEBSITE — DESIGN PROTOTYPE
=================================

HOW TO VIEW IT
1. Unzip this folder.
2. Double-click index.html. It opens in your web browser.
   Every page, menu, form, the pricing calculator and the help chat work offline.
   (An internet connection is only needed for the Figtree font.)

HOW TO OPEN THE CODE
- Open the whole "ultron-website" folder in VS Code (File > Open Folder).
- Optional: install the "Live Server" extension, right-click index.html and choose
  "Open with Live Server" to preview changes as you edit.

WHAT'S INSIDE
  index.html                    Home
  pricing.html                  Pricing calculator and booking form
  about.html                    About us
  faqs.html                     Help centre / FAQs
  get-a-quote.html              Quote request form
  electrical-check.html, gas-check.html, smoke-alarm-check.html,
  essential-fire-safety.html, safety-switch-testing.html, water-efficiency.html,
  corded-blind-safety.html, minimum-standards-check.html     Service pages
  assets/                       Logo, photos and runtime.js (makes the pages interactive)

PUTTING IT ONLINE
The folder is a static website. Drag it onto Netlify (app.netlify.com/drop), or use
Vercel, Cloudflare Pages or GitHub Pages, then connect the Ultron domain.

BEFORE LAUNCH
- Replace placeholders in [square brackets]: phone, email, ABN, licence numbers,
  accreditation logos.
- Prices in the calculator are SAMPLE figures (set in pricing.html, look for "bundleNoGas").
- Forms check what is typed but do not send anywhere yet. Connect a form service
  (e.g. Netlify Forms or Formspree) and a payment provider (e.g. Stripe) for bookings.
- Photos are AI-generated placeholders; replace with real photos of the Ultron team.
- The help chat gives scripted answers; it can be upgraded to an AI chat service.
- Check the Victorian compliance wording against Consumer Affairs Victoria.
