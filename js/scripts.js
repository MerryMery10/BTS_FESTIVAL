// scripts.js (module)
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
   NAVBAR / HAMBURGER MENU
--------------------------- */
const navToggle = qs('#nav-toggle');
const nav = qs('#main-nav');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !expanded);
    nav.classList.toggle('open');
    navToggle.classList.toggle('is-open');
  });

  // Cerrar menú al hacer click fuera (solo móvil)
  document.addEventListener('click', (e) => {
    if (window.innerWidth > 768) return;
    if (!nav.contains(e.target) && !navToggle.contains(e.target)) {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.classList.remove('is-open');
    }
  });
}
/* ---------------------------
   CAROUSEL (solo en index)
--------------------------- */
const slides = qsa('.slide');
const dotsWrap = qs('.dots');
let current = 0;
let autoTimer = null;

if (slides.length > 0 && dotsWrap) {
  function createDots() {
    slides.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.setAttribute('aria-label', `Ir al slide ${i + 1}`);
      btn.addEventListener('click', () => showSlide(i));
      dotsWrap.appendChild(btn);
    });
  }

  function updateDots() {
    qsa('.dots button').forEach((b, i) =>
      b.classList.toggle('active', i === current)
    );
  }

  function showSlide(i) {
    slides.forEach((s, idx) => {
      s.setAttribute('aria-hidden', idx !== i ? 'true' : 'false');
      const v = s.querySelector('video');
      if (v) {
        if (idx === i) v.play().catch(() => {});
        else {
          v.pause();
          v.currentTime = 0;
        }
      }
    });
    current = i;
    updateDots();
  }

  function nextSlide() {
    showSlide((current + 1) % slides.length);
  }
  function prevSlide() {
    showSlide((current - 1 + slides.length) % slides.length);
  }

  createDots();
  updateDots();
  showSlide(0);

  const nextBtn = qs('#next-slide');
  const prevBtn = qs('#prev-slide');
  if (nextBtn && prevBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetAuto();
    });
    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetAuto();
    });
  }

  function startAuto() {
    autoTimer = setInterval(nextSlide, 7000);
  }
  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }
  startAuto();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearInterval(autoTimer);
    else startAuto();
  });
}
/* ---------------------------
   BOTONES “VER MÁS” (programa)
--------------------------- */
const botones = qsa(".ver-mas");

if (botones.length > 0) {
  botones.forEach((boton) => {
    boton.addEventListener("click", () => {
      const setlist = boton.nextElementSibling;
      if (!setlist) return;
      setlist.classList.toggle("visible");
      boton.textContent = setlist.classList.contains("visible")
        ? "Ver menos"
        : "Ver más";
    });
  });
}
/* ---------------------------
   FORMULARIO DE CONTACTO
--------------------------- */
const form = qs("#contact-form");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = form.nombre.value.trim();
    const email = form.email.value.trim();
    const mensaje = form.mensaje.value.trim();

    if (!nombre || !email || !mensaje) {
      showError("Por favor, completa todos los campos.");
      return;
    }

    if (!validateEmail(email)) {
      showError("Por favor, introduce un correo electrónico válido.");
      return;
    }

    showSuccess("¡Gracias por tu mensaje! Te responderemos pronto.");
    form.reset();
  });
}

function showError(msg) {
  const box = qs("#form-error");
  if (!box) return;
  box.textContent = msg;
  box.classList.add("show");
  setTimeout(() => box.classList.remove("show"), 4000);
}

function showSuccess(msg) {
  const box = qs("#form-success");
  if (!box) return;
  box.textContent = msg;
  box.classList.add("show");
  setTimeout(() => box.classList.remove("show"), 4000);
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/* ======== MODAL COMPRA ======== */
const modal = document.getElementById("modal-overlay");
const confirmarBtn = document.getElementById("confirmar-compra");
const cancelarBtn = document.getElementById("cancelar-compra");
const comprarBtns = document.querySelectorAll(".select-ticket");

comprarBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const ticketType = btn.getAttribute("data-ticket");
    const modalText = modal.querySelector("p");
    modalText.innerHTML = `¿Deseas confirmar tu entrada <strong>${ticketType.toUpperCase()}</strong> para el día seleccionado?`;
    modal.classList.add("active");
  });
});

cancelarBtn.addEventListener("click", () => {
  modal.classList.remove("active");
});

confirmarBtn.addEventListener("click", () => {
  const modalContent = modal.querySelector(".modal-content");
  modalContent.innerHTML = `
    <h2>¡Gracias por tu compra!</h2>
    <p>Te hemos enviado un correo con la información de tu entrada.</p>
  `;
  setTimeout(() => {
    modal.classList.remove("active");
  }, 3000);
});

// Cerrar con clic fuera
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.remove("active");
});

