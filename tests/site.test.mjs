import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync('index.html','utf8');
const css = fs.readFileSync('styles.css','utf8');

const must = (condition, message) => assert.ok(condition, message);

must(!html.includes('images.unsplash.com'), 'stock Unsplash images must be removed');
must(html.includes('class="brand brand-original"'), 'original-style brand treatment must be present');
must(html.includes('id="video"'), 'video section must exist');
must(html.includes('assets/hero-watercolor.webp'), 'detailed watercolor hero artwork must be used');
must(html.includes('assets/about-watercolor.webp'), 'detailed watercolor about artwork must be used');
for (const name of ['early','math','robot','lego','music','school']) {
  must(html.includes(`assets/course-${name}.webp`), `course watercolor image missing: ${name}`);
}
must(html.includes('name="consent"'), 'consent checkbox must exist');
must(html.includes('required') && html.includes('Согласие на обработку персональных данных'), 'consent checkbox must be required and labeled');
must(html.includes('docs/Soglasie-na-obrabotku-personalnyh-dannyh.docx'), 'uploaded consent document must be linked');
must(css.toLowerCase().includes('#f2389e'), 'original site pink #f2389e must be part of the palette');
must(css.includes('--brand-pink'), 'brand palette variables must be declared');

console.log('site acceptance checks passed');
