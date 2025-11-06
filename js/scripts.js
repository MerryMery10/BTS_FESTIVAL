
const qs = s => document.querySelector(s);
const qsa = s => Array.from(document.querySelectorAll(s));

/* ---------------------------
   Theme toggle (light default)
   --------------------------- */
const themeToggle = qs('#theme-toggle');
const themeIcon = qs('#theme-icon');
const root = document.documentElement;
const saved = localStorage.getItem('bts-theme');
if(saved) root.setAttribute('data-theme', saved);
else root.setAttribute('data-theme', 'light'); // default

function updateThemeUI(){
  const isDark = root.getAttribute('data-theme') === 'dark';
  themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  // animate icon: set opacity on sun/moon groups
  const sun = themeIcon.querySelector('.sun');
  const moon = themeIcon.querySelector('.moon');
  if(isDark){ sun.style.opacity = 0; moon.style.opacity = 1; }
  else { sun.style.opacity = 1; moon.style.opacity = 0; }
}
updateThemeUI();

themeToggle.addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('bts-theme', next);
  updateThemeUI();
});

/* ---------------------------
   Hamburger menu
   --------------------------- */
const navToggle = qs('#nav-toggle');
const nav = qs('#main-nav');
navToggle.addEventListener('click', (e)=>{
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', !expanded);
  nav.classList.toggle('open');
  // animate hamburger bars
  navToggle.classList.toggle('is-open');
});

/* Close nav on outside click for mobile */
document.addEventListener('click', (e) => {
  if(window.innerWidth > 700) return;
  if(!nav.contains(e.target) && !navToggle.contains(e.target)){
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded','false');
    navToggle.classList.remove('is-open');
  }
});

/* Simple accessibility: show/hide nav when open (mobile) */
const styleNavObserver = new MutationObserver(()=> {
  if(nav.classList.contains('open')) nav.style.display = 'block';
  else nav.style.display = '';
});
styleNavObserver.observe(nav, { attributes: true, attributeFilter: ['class'] });

/* ---------------------------
   Carousel logic
   --------------------------- */
const slides = qsa('.slide');
const dotsWrap = qs('.dots');
let current = 0;
let autoTimer = null;

function createDots(){
  slides.forEach((_,i)=>{
    const btn = document.createElement('button');
    btn.setAttribute('aria-label','Ir al slide ' + (i+1));
    btn.addEventListener('click', ()=> showSlide(i));
    dotsWrap.appendChild(btn);
  });
}
function updateDots(){
  qsa('.dots button').forEach((b,i)=> {
    b.classList.toggle('active', i===current);
  });
}
function showSlide(i){
  slides.forEach((s, idx) => {
    s.setAttribute('aria-hidden', idx!==i ? 'true' : 'false');
    const v = s.querySelector('video');
    if(v){ if(idx===i){ v.play().catch(()=>{}); } else { v.pause(); v.currentTime = 0; } }
  });
  current = i;
  updateDots();
}
function nextSlide(){ showSlide((current+1)%slides.length) }
function prevSlide(){ showSlide((current-1+slides.length)%slides.length) }

createDots();
updateDots();
showSlide(0);

qs('#next-slide').addEventListener('click', ()=> { nextSlide(); resetAuto(); });
qs('#prev-slide').addEventListener('click', ()=> { prevSlide(); resetAuto(); });

function startAuto(){ autoTimer = setInterval(nextSlide, 7000); }
function resetAuto(){ clearInterval(autoTimer); startAuto(); }
startAuto();

document.addEventListener('visibilitychange', ()=> {
  if(document.hidden) clearInterval(autoTimer);
  else startAuto();
});

/* ---------------------------
   Program rows toggle
   --------------------------- */
qsa('.toggle-row').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const tr = btn.closest('tr');
    const id = tr.dataset.target || tr.getAttribute('data-target');
    const details = qs('#' + id);
    if(!details) return;
    const open = !details.hidden;
    details.hidden = open;
    btn.setAttribute('aria-expanded', String(!open));
  });
});