const toggle=document.getElementById('mobileToggle'),nav=document.getElementById('navLinks');
const mobileNavQuery=matchMedia('(max-width:980px)');
toggle.type='button';
toggle.setAttribute('aria-controls','navLinks');
toggle.setAttribute('aria-expanded','false');
function setMenuOpen(open){
  const expanded=Boolean(open&&mobileNavQuery.matches);
  nav.classList.toggle('open',expanded);
  toggle.setAttribute('aria-expanded',String(expanded));
  toggle.setAttribute('aria-label',expanded?'Закрыть меню':'Открыть меню');
  updateMobileCta();
}
toggle.addEventListener('click',()=>setMenuOpen(!nav.classList.contains('open')));
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenuOpen(false)));
document.addEventListener('pointerdown',e=>{if(!nav.contains(e.target)&&!toggle.contains(e.target))setMenuOpen(false)});
addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){setMenuOpen(false);toggle.focus()}});
mobileNavQuery.addEventListener('change',()=>{if(!mobileNavQuery.matches)setMenuOpen(false)});
// Avoid a floating duplicate over the hero action and the registration form.
const floatingCta=document.querySelector('.mobile-cta');
const ctaTargets=[document.querySelector('.hero'),document.getElementById('signup')].filter(Boolean);
const ctaVisibility=new Map(ctaTargets.map(el=>[el,false]));
function updateMobileCta(){
  if(!floatingCta)return;
  floatingCta.hidden=nav.classList.contains('open')||[...ctaVisibility.values()].some(Boolean);
}
const ctaObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>ctaVisibility.set(entry.target,entry.isIntersecting));
  updateMobileCta();
});
ctaTargets.forEach(el=>{
  const r=el.getBoundingClientRect();
  ctaVisibility.set(el,r.bottom>0&&r.top<innerHeight);
  ctaObserver.observe(el);
});
updateMobileCta();
