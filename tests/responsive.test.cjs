const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const crypto=require('node:crypto');
const {chromium}=require('playwright');
const root=process.cwd();
const output=process.env.SCREENSHOT_DIR||'/tmp/studiya-screenshots';
fs.mkdirSync(output,{recursive:true});
const manifest=JSON.parse(fs.readFileSync('assets/course-watercolor-manifest.json','utf8'));
assert.equal(Object.keys(manifest).length,6);
for(const asset of Object.values(manifest)){
  const bytes=fs.readFileSync(asset.path);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),asset.sha256,asset.path);
}
const server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
    res.writeHead(404);res.end();return;
  }
  const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png'};
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage({viewport:{width:276,height:541},reducedMotion:'reduce'});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/`,{waitUntil:'networkidle'});
    await page.evaluate(()=>document.fonts.ready);
    for(const width of [276,320,375,486,650,768,980,981,1024,1280,1606]){
      await page.setViewportSize({width,height:541});
      await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
      await page.waitForTimeout(100);
      const layout=await page.evaluate(()=>({
        viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,
        headingRight:document.querySelector('h1').getBoundingClientRect().right,
        burgerRight:document.querySelector('#mobileToggle').getBoundingClientRect().right
      }));
      assert.ok(layout.documentWidth<=width+1,`${width}: horizontal overflow ${JSON.stringify(layout)}`);
      assert.ok(layout.headingRight<=width+1,`${width}: heading overflow`);
      const button=page.locator('#mobileToggle');
      const nav=page.locator('#navLinks');
      if(width<=980){
        assert.ok(await button.isVisible(),`${width}: burger invisible`);
        assert.ok(layout.burgerRight<=width,`${width}: burger offscreen`);
        assert.equal(await page.locator('.mobile-cta').isVisible(),false,'No duplicate floating CTA over hero');
        await button.click();
        assert.equal(await button.getAttribute('aria-expanded'),'true');
        assert.ok(await nav.isVisible());
        const b=await nav.boundingBox();
        assert.ok(b.x>=0&&b.x+b.width<=width+1,`${width}: menu outside viewport`);
        await page.keyboard.press('Escape');
        assert.equal(await nav.isVisible(),false);
        assert.equal(await button.getAttribute('aria-expanded'),'false');
        await button.click();
        await page.locator('.header .brand-logo').click();
        assert.equal(await nav.isVisible(),false,'Click outside closes menu');
      }else{
        assert.equal(await button.isVisible(),false);
        assert.ok(await nav.isVisible());
      }
      if([276,486,1024].includes(width))await page.screenshot({path:path.join(output,`responsive-${width}.png`)});
      console.log(`PASS ${width}px: layout and navigation`);
    }
    await page.setViewportSize({width:1400,height:1150});
    await page.locator('#courses').scrollIntoViewIfNeeded();
    for(const img of await page.locator('.course img').all()){
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(e=>e.decode());
      const info=await img.evaluate(e=>({width:e.naturalWidth,height:e.naturalHeight,fit:getComputedStyle(e).objectFit,src:e.getAttribute('src')}));
      assert.equal(info.width,1774);assert.equal(info.height,887);assert.equal(info.fit,'contain');
      assert.ok(info.src.endsWith('-watercolor.png'));
    }
    await page.locator('#courses').scrollIntoViewIfNeeded();
    await page.locator('#courses').screenshot({path:path.join(output,'watercolor-courses.png')});
    assert.deepEqual(errors,[],'No browser JavaScript errors');
    console.log('PASS six original PNGs: SHA-256, loaded dimensions, uncropped display');
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
