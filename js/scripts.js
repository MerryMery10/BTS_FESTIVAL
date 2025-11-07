
const qs = s => document.querySelector(s);
const qsa = s => Array.from(document.querySelectorAll(s));

const themeToggle = qs('#theme-toggle');
const themeIcon = qs('#theme-icon');
const root = document.documentElement;
const saved = localStorage.getItem('bts-theme');
if(saved) root.setAttribute('data-theme', saved);
else root.setAttribute('data-theme', 'light'); // default

function updateThemeUI(){
  const isDark = root.getAttribute('data-theme') === 'dark';
  themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  // animación sol-luna
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

/* Hamburger menu (móvil) */
const navToggle = qs('#nav-toggle');
const nav = qs('#main-nav');
navToggle.addEventListener('click', (e)=>{
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', !expanded);
  nav.classList.toggle('open');
  // animación menú hamburguesa
  navToggle.classList.toggle('is-open');
});

/* que se cierre el menú cuando pulso por fuera (móvil) */
document.addEventListener('click', (e) => {
  if(window.innerWidth > 700) return;
  if(!nav.contains(e.target) && !navToggle.contains(e.target)){
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded','false');
    navToggle.classList.remove('is-open');
  }
});

/* móvil */
const styleNavObserver = new MutationObserver(()=> {
  if(nav.classList.contains('open')) nav.style.display = 'block';
  else nav.style.display = '';
});
styleNavObserver.observe(nav, { attributes: true, attributeFilter: ['class'] });

/* Carousel --> LÓGICA EXPLICADA EN CLASE*/ 
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

/* FUNCIÓN PARA QUE SE PASEN LAS FOTOS SOLAS --> EXPLICADO EN CLASE 061125*/
function startAuto(){ autoTimer = setInterval(nextSlide, 7000); }
/*FUNCIÓN RESET-QUE VUELVA EL CARUSEL AL PRINCPIO*/
function resetAuto(){ clearInterval(autoTimer); startAuto(); }
startAuto();

/* CONDICIONAL */
document.addEventListener('visibilitychange', ()=> {
  if(document.hidden) clearInterval(autoTimer);
  else startAuto();
});

/*  PROGRAMA */
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

/* Modal - for forms + GALERÍA */

const modal = qs('#modal');
const modalBody = qs('#modal-body');
const modalClose = qs('.modal-close');

function openModal(contentHtml){
  modalBody.innerHTML = '';
  modalBody.insertAdjacentHTML('beforeend', contentHtml);
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden'; // lock scroll
}
function closeModal(){
  modal.setAttribute('aria-hidden','true');
  modalBody.innerHTML = '';
  document.body.style.overflow = '';
}
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e)=> { if(e.target === modal) closeModal(); });

/* ---------------------------
   Tickets: open purchase form modal (pre-fill)
   --------------------------- */
qsa('.select-ticket').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    const day = btn.dataset.ticketDay || '';
    const type = btn.dataset.ticket || 'general';
    const html = `
      <h3>Formulario de compra</h3>
      <p>Tipo: <strong>${type.toUpperCase()}</strong> ${day ? '- Día ' + day : ''}</p>
      <form id="purchase-form" class="purchase-form">
        <label>Nombre completo<input name="name" required></label>
        <div class="error error-name" aria-live="polite"></div>

        <label>Correo<input name="email" type="email" required></label>
        <div class="error error-email" aria-live="polite"></div>

        <label>Tipo de entrada
          <select name="ticket">
            <option value="general"${type==='general'?' selected':''}>General</option>
            <option value="vip"${type==='vip'?' selected':''}>VIP</option>
            <option value="premium">Premium</option>
          </select>
        </label>

        <label>Cantidad<input name="quantity" type="number" min="1" value="1" required></label>
        <div class="error error-quantity" aria-live="polite"></div>

        <div style="margin-top:12px">
          <button class="btn primary" type="submit">Confirmar compra (simulada)</button>
          <button type="button" class="btn outline modal-close-btn">Cancelar</button>
        </div>
      </form>
    `;
    openModal(html);

    // attach local handlers
    const pf = qs('#purchase-form');
    if(!pf) return;
    pf.addEventListener('submit', (ev)=> {
      ev.preventDefault();
      pf.querySelectorAll('.error').forEach(n=>n.textContent='');
      const name = pf.querySelector('[name="name"]').value.trim();
      const email = pf.querySelector('[name="email"]').value.trim();
      const qty = Number(pf.querySelector('[name="quantity"]').value);

      let valid = true;
      if(name.length < 2){ valid=false; pf.querySelector('.error-name').textContent = 'Introduce tu nombre'; }
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ valid=false; pf.querySelector('.error-email').textContent = 'Email no válido'; }
      if(!(qty >= 1)){ valid=false; pf.querySelector('.error-quantity').textContent = 'Cantidad mínima 1'; }

      if(valid){
        // Simulación: mostrar confirmación
        openModal(`<h3>Compra confirmada (simulada)</h3><p>Gracias, ${name}. Hemos registrado ${qty} entrada(s). Se ha enviado un email a ${email} (simulado).</p><p style="margin-top:12px"><button class="btn primary modal-close-btn">Cerrar</button></p>`);
      }
    });
    // close buttons inside modals
    modalBody.addEventListener('click', (e)=> {
      if(e.target.matches('.modal-close-btn')) closeModal();
    }, { once: true });
  });
});

/* ---------------------------
   GALERÍA
   --------------------------- */
qsa('.thumb img').forEach(img => {
  img.addEventListener('click', ()=> {
    const src = img.getAttribute('src');
    openModal(`<img src="${src}" alt="" style="width:100%;height:auto;border-radius:8px">`);
  });
});

/* ---------------------------
   CONTACTO - LÓGICA
   --------------------------- */
const contactForm = qs('#contact-form');
if(contactForm){
  contactForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    contactForm.querySelectorAll('.error').forEach(n=>n.textContent='');
    const name = contactForm.querySelector('[name="name"]').value.trim();
    const email = contactForm.querySelector('[name="email"]').value.trim();
    const message = contactForm.querySelector('[name="message"]').value.trim();
    let valid = true;
    if(name.length < 2){ valid=false; contactForm.querySelector('.error-name').textContent = 'Introduce tu nombre'; }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ valid=false; contactForm.querySelector('.error-email').textContent = 'Email no válido'; }
    if(message.length < 10){ valid=false; contactForm.querySelector('.error-message').textContent = 'Escribe un mensaje más largo'; }
    if(valid){
      contactForm.reset();
      // micro-feedback
      const tmp = document.createElement('div');
      tmp.className = 'toast';
      tmp.textContent = 'Tu mensaje ha sido enviado (simulado). ¡Gracias!';
      document.body.appendChild(tmp);
      setTimeout(()=> tmp.classList.add('show'), 10);
      setTimeout(()=> tmp.classList.remove('show'), 2500);
      setTimeout(()=> tmp.remove(), 3000);
    }
  });
}