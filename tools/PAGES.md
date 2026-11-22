# Inner pages - how they are built

Each page is one file in `tools/pages/<slug>.html`. Run `python3 tools/build.py` and it becomes `site/<slug>.html`
with the shared header and footer around it. Do not edit `site/<slug>.html` by hand (except `site/index.html`
and `site/young/`, which are hand-made).

## File format

```html
<!--
title: צוות העמותה
description: one Hebrew sentence for search results and sharing (no quotes inside)
section: about
-->
<main id="main">
  <section class="page-hero"> ... </section>
  <section class="section"> <div class="wrap"> ... </div> </section>
</main>
```

`section` highlights the nav item: about | join | model | resources | news (blog, press) | contact (omit for legal pages).

## Rules

- Hebrew, RTL. Use a plain hyphen "-" only. Never the long dash (—, –) or the Hebrew maqaf (־). No arrow characters (← → ↗).
- Text comes from the client's current site (files under the scratchpad `web/txt/`). Keep the wording; trimming and
  splitting into short paragraphs is fine, rewriting facts is not. Fix obvious typos only.
- Brand: only the classes below and the tokens in `site/css/tokens.css`. No inline colors, no new CSS.
- Buttons: `btn btn-orange` = the main action on a page (one per block). `btn btn-outline` (on light) /
  `btn btn-outline-white` (on navy) = secondary. `btn btn-navy` only on orange/cyan backgrounds.
- External links (forms, PDFs, other sites): add `target="_blank" rel="noopener"`.
- Images: none yet (photos come later). Where a photo or video belongs, use the media slot block.
- Every page starts with a `page-hero` with breadcrumbs, and ends with a `cta-band` pointing to the next useful step.

## Building blocks (site/css/pages.css + main.css)

```html
<!-- hero (navy by default; add is-orange or is-cyan for variety) -->
<section class="page-hero">
  <img class="route" data-draw="load" src="assets/brand/patterns/route-lines-cyan.svg" alt="" aria-hidden="true">
  <div class="wrap">
    <nav class="crumbs" aria-label="מיקום בעמוד"><a href="./">בית</a><span aria-hidden="true">/</span><a href="about.html">אודות</a><span aria-hidden="true">/</span><span aria-current="page">צוות העמותה</span></nav>
    <p class="eyebrow">אודות</p>
    <h1>צוות העמותה</h1>
    <p class="lead">...</p>
    <div class="actions"><a class="btn btn-orange" href="...">...</a></div>   <!-- optional -->
  </div>
</section>
<!-- on is-orange / is-cyan heroes drop the route image -->

<!-- in-page links for long pages (put right after the hero) -->
<nav class="anchor-nav" aria-label="בעמוד זה"><div class="wrap"><ul><li><a href="#story">הסיפור</a></li>...</ul></div></nav>

<!-- sections: .section (white), .section.is-paper (light grey), .section.is-navy -->
<section class="section" id="story"><div class="wrap">
  <div class="section-head"><p class="eyebrow">...</p><h2 class="h1">...</h2></div>
  <div class="prose"><p>...</p><h3>...</h3><ul><li>...</li></ul></div>
</div></section>

<div class="split"> <div class="prose">...</div> <aside>...</aside> </div>

<!-- cards (white, colored top line: default navy, is-orange, is-cyan, is-coral) -->
<div class="cards">
  <article class="card-item is-orange"><p class="tag">...</p><h3>...</h3><p>...</p><div class="actions"><a class="btn btn-outline" href="...">...</a></div></article>
  <a class="card-item" href="..."><h3>...</h3><p>...</p><span class="more">לקריאה</span></a>
</div>

<!-- solid color tiles (navy, orange, coral, cyan in turn) -->
<ol class="tiles"><li class="tile"><span class="num" aria-hidden="true">01</span><h3>...</h3><p>...</p></li></ol>

<!-- people: avatar shows initials until photos arrive; long bios go inside <details> -->
<ul class="people">
  <li class="person"><span class="avatar" aria-hidden="true">ע״ש</span><h3>שם</h3><p class="role">תפקיד</p>
    <p>first sentence...</p><details><summary>קראו עוד</summary><p>rest...</p></details></li>
</ul>

<!-- documents / downloads -->
<ul class="doc-list"><li><a href="URL" target="_blank" rel="noopener"><span class="ico">PDF</span>שם המסמך<span class="go">לצפייה</span></a></li></ul>

<!-- list of outside resources -->
<ul class="link-list"><li><h3>...</h3><p>...</p><a href="URL" target="_blank" rel="noopener">לאתר</a></li></ul>

<figure class="pull-quote"><div class="mark" aria-hidden="true">"</div><blockquote>...</blockquote><figcaption>...</figcaption></figure>

<div class="notice"><strong>...</strong><p>...</p></div>              <!-- placeholder / note -->
<ul class="logo-wall"><li>שם השותף</li></ul>                            <!-- partner logos (text until logos arrive) -->
<div class="media-slot"><div><strong>סרטון</strong><p>יתווסף בהמשך</p></div></div>

<div class="contact-grid"><a class="card-item" href="tel:+972547924900"><p class="tag">טלפון</p><span class="big">054-792-4900</span></a></div>

<section class="cta-band"><div class="wrap"><div><h2>...</h2><p>...</p></div>
  <div class="actions"><a class="btn btn-navy" href="...">...</a></div></div></section>
```

## Site map (internal pages)

| page | file | live site page it replaces |
|---|---|---|
| בית | `./` (index.html) | / |
| אודות - סיפור, חזון, תוכניות | about.html (#story, #vision, #programs, #how) | /אודות |
| צוות העמותה | team.html | /blank-12 |
| הוועד המנהל | board.html | /blank-3 |
| השותפים לדרך | partners.html | /blank-8 |
| מסמכי העמותה | documents.html | /blank-13 |
| המודל שלנו | model.html | /המודלשלנו |
| הצטרפו לדרך (hub, #donate) | join.html | /הצטרפולדרך, /blank |
| מנטורים ומנטוריות | mentors.html | /התנדבות |
| חברות וארגונים | companies.html | /ארגוניםוחברות |
| חיילות וחיילים משוחררים | young/ | /צעיריםות, /landing-page-v2 |
| מאגר מענים | resources.html | /maagar-maanim |
| תעסוקה והשכלה | employment-education.html | /employment-education |
| תמיכה רגשית | emotional-support.html | /emotionalsupport |
| מלגות | scholarships.html | /scholarships |
| ייעוץ מקצועי | professional-advice.html | /professional-advice |
| מיצוי זכויות | rights.html | /rights |
| התנדבות (for young people) | volunteering.html | /volunteer |
| בלוג (newsletters) | blog.html | new |
| מדברים עלינו | press.html | /מדבריםעלינו |
| דברו איתנו | contact.html | /דברואיתנו |
| פרטיות / תנאי שימוש / נגישות | privacy.html, terms.html, accessibility.html | new (lawyer's text pending) |

## Outside links (same as the live site)

| action | URL |
|---|---|
| donate (main) | https://meshulam.co.il/quick_payment?b=8d4ee407628d09dd5983479d393cd06f |
| donate via עיגול לטובה | https://www.igul.org.il/amutot/amitladerech/ |
| donate via JGive | https://www.jgive.com/new/he/ils/charity-organizations/3351 |
| donate via ישראל תורמת (on documents page) | https://secured.israeltoremet.org/donate/makedonation?MakeDonation=1&AmutaGovId=580611655 |
| mentor sign-up form ("הצטרפו אלינו לדרך" for volunteers) | https://wkf.ms/3MEULDG |
| young person sign-up form | https://wkf.ms/41ouIcn |
| general "דברו איתנו" / join form | https://wkf.ms/3yWQKar |
| contact form ("ליצירת קשר", every page) | https://forms.monday.com/forms/52748af7ecc5ed9221f1c259c17319fb?r=use1 |
| internal volunteering sign-up (volunteer page) | https://forms.monday.com/forms/b11920a44c04b806e9dd15d7370772df?r=use1 |
| volunteering questionnaire (volunteer page) | https://wkf.ms/3FifWHR |
| companies contact | mailto:hadas@amitladerech.org |
| general email / phone | mailto:info@amitladerech.org / tel:+972547924900 |
| youth program sign-up (Ministry of Defense, URL must not change) | https://www.amitladerech.org/landing-page-v2 |
| Startline program | https://www.startline.org.il/ |
| English site | https://www.amitladerech.org/english |
