import fs from 'node:fs';
import assert from 'node:assert/strict';
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('styles.css','utf8');
const must=(c,m)=>assert.ok(c,m);

must(!html.includes('images.unsplash.com'),'stock Unsplash images must be removed');
must(html.includes('class="brand brand-original"'),'original-style brand treatment must be present');
must(html.includes('id="video"'),'video section must exist');
must(!html.includes('.svg'),'live HTML must not use SVG illustrations');

const pngAssets=[
  'assets/hero-watercolor.png',
  'assets/about-watercolor.png',
  'assets/video-poster.png',
  'assets/course-early.png',
  'assets/course-math.png',
  'assets/course-robot.png',
  'assets/course-lego.png',
  'assets/course-music.png',
  'assets/course-school.png'
];
for(const path of pngAssets){
  must(html.includes(path),`PNG artwork must be referenced: ${path}`);
  must(fs.existsSync(path),`PNG artwork file missing: ${path}`);
}

must(html.includes('name="consent"'),'consent checkbox must exist');
must(html.includes('name="consent" required'),'consent checkbox must be required');
must(html.includes('Согласием на обработку персональных данных'),'consent text must be visible');
must(html.includes('href="consent.html"'),'consent page must be linked from the form');
must(css.toLowerCase().includes('#f2389e'),'original site pink #f2389e must be part of the palette');
must(css.includes('--brand-pink'),'brand palette variables must be declared');
must(fs.existsSync('consent.html'),'consent page must exist');

console.log('PNG site acceptance checks passed');
