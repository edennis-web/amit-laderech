# Amit LaDerech - website

Static website for the nonprofit **עמית לדרך (Amit LaDerech)**, built by Moveo Creative.

- `site/index.html` - main site (donors, mentors, companies)
- `site/young/` - mini-site for discharged soldiers (mobile-first, TikTok-style feed)
- `site/css`, `site/js`, `site/assets` - styles, scripts, brand assets, fonts (Heebo, Montserrat - OFL)

Plain HTML/CSS/JS, Hebrew RTL, no build step.

## Preview locally

Double-click `פתיחת האתר.command` (macOS), or run:

```bash
cd site && python3 -m http.server 4400
```

Then open http://localhost:4400/ and http://localhost:4400/young/

## Notes

- The Ministry of Defense landing page URL (`/landing-page-v2`) must not change.
- Legal pages (privacy, terms, accessibility) are pending text from the client's lawyer.
- No marketing pixels or social embeds load before cookie consent (`js/cookies.js`).
