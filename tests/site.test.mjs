import fs from 'node:fs';
import assert from 'node:assert/strict';
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('styles.css','utf8');
const must=(c,m)=>assert.ok(c,m);

must(!html.includes('images.unsplash.com'),'stock Unsplash images must be removed');
must(html.includes('class="brand brand-original"'),'brand anchor must be present');
must(fs.existsSync('assets/logo.png'),'original logo PNG must exist');
must(fs.existsSync('watercolor.css'),'logo override stylesheet must exist');
const override=fs.readFileSync('watercolor.css','utf8');
must(override.includes("assets/logo.png"),'original logo PNG must be used by the live site');
must(html.includes('id="video"'),'video section must exist');

for(const path of ['assets/hero-watercolor.svg','assets/about-watercolor.svg','assets/video-poster.svg','assets/course-early.svg','assets/course-math.svg','assets/course-robot.svg','assets/course-lego.svg','assets/course-music.svg','assets/course-school.svg']) must(fs.existsSync(path),`current artwork file missing: ${path}`);

must(html.includes('name="consent"'),'consent checkbox must exist');
must(html.includes('name="consent" required'),'consent checkbox must be required');
must(html.includes('Согласием на обработку персональных данных'),'consent text must be visible');
must(html.includes('href="consent.html"'),'consent page must be linked from the form');
must(css.toLowerCase().includes('#f2389e'),'original site pink #f2389e must be part of the palette');
must(css.includes('--brand-pink'),'brand palette variables must be declared');
must(fs.existsSync('consent.html'),'consent page must exist');

console.log('site acceptance checks passed');
