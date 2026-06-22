/* ============================================================
   RAÍZ — Script principal
   Funcionalidades: nav scroll, menú mobile, intro effect
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. NAV — Cambio de estado al hacer scroll
  ---------------------------------------------------------- */
  const nav = document.querySelector('.nav');

  function updateNav() {
    if (window.scrollY > 60) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }

  if (nav) {
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav(); // Estado inicial
  }

  /* ----------------------------------------------------------
     2. MENÚ MOBILE — Toggle
  ---------------------------------------------------------- */
  const menuToggle = document.querySelector('.nav__menu-toggle');
  const navLinks   = document.querySelector('.nav__links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function () {
      const isOpen = this.getAttribute('aria-expanded') === 'true';

      this.setAttribute('aria-expanded', String(!isOpen));
      navLinks.classList.toggle('nav__links--open');
    });

    // Cerrar menú al hacer click en un link
    navLinks.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        menuToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('nav__links--open');
      });
    });
  }

  /* ----------------------------------------------------------
     3. INTRO — Efecto de expansión (OrnaVillas style)
  ---------------------------------------------------------- */
  // Ejecuta el código cuando el HTML base esté listo en el navegador
  const heroSection = document.querySelector('.hero');

  if (heroSection) {
    // Espera 300ms de cortesía para que la carga visual sea limpia y quita la clase
    setTimeout(function () {
      heroSection.classList.remove('loading');
    }, 300);
  }

  
})();

/* ── Hero RAÍZ — Spotlight cursor reveal ─────────────────── */
(function () {
  const SPOTLIGHT_R = 260;

  const canvas  = document.getElementById('heroCanvas');
  const reveal  = document.getElementById('heroReveal');
  const section = canvas ? canvas.closest('.hero-raiz') : null;

  if (!canvas || !reveal || !section) return;

  // Ajustar canvas al tamaño de la ventana
  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Posición raw del mouse y posición suavizada
  const mouse  = { x: -999, y: -999 };
  const smooth = { x: -999, y: -999 };
  let   raf    = null;

  // Pintar la máscara en el canvas y aplicarla al reveal
  function paintMask(x, y) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const grad = ctx.createRadialGradient(x, y, 0, x, y, SPOTLIGHT_R);
    grad.addColorStop(0,    'rgba(255,255,255,1)');
    grad.addColorStop(0.40, 'rgba(255,255,255,1)');
    grad.addColorStop(0.60, 'rgba(255,255,255,0.75)');
    grad.addColorStop(0.75, 'rgba(255,255,255,0.4)');
    grad.addColorStop(0.88, 'rgba(255,255,255,0.12)');
    grad.addColorStop(1,    'rgba(255,255,255,0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, SPOTLIGHT_R, 0, Math.PI * 2);
    ctx.fill();

    const dataURL = canvas.toDataURL();
    reveal.style.maskImage         = 'url(' + dataURL + ')';
    reveal.style.webkitMaskImage   = 'url(' + dataURL + ')';
    reveal.style.maskSize          = '100% 100%';
    reveal.style.webkitMaskSize    = '100% 100%';
  }

  // Loop de animación con lerp (suavizado)
  function loop() {
    smooth.x += (mouse.x - smooth.x) * 0.1;
    smooth.y += (mouse.y - smooth.y) * 0.1;
    paintMask(smooth.x, smooth.y);
    raf = requestAnimationFrame(loop);
  }

  // Escuchar el mouse solo dentro del hero
  section.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Ocultar el reveal cuando el mouse sale del hero
  section.addEventListener('mouseleave', function () {
    mouse.x = -999;
    mouse.y = -999;
  });

  // Arrancar el loop
  raf = requestAnimationFrame(loop);
})();

// ------------------------------------------------------------
// LÓGICA DEL CARRUSEL DE CURSOS (3D LAYOUT)
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.course-card');
  const prevBtn = document.getElementById('coursePrev');
  const nextBtn = document.getElementById('courseNext');
  
  if (!cards.length || !prevBtn || !nextBtn) return;

  // El estado inicial sigue el orden de los data-index del HTML
  // 0: is-left, 1: is-active, 2: is-right
  let activeIndex = 1; 

  function updateCarousel() {
    cards.forEach((card) => {
      const cardIndex = parseInt(card.getAttribute('data-index'), 10);
      
      // Limpiamos clases de posición previas
      card.classList.remove('is-left', 'is-active', 'is-right');

      // Calculamos la posición relativa respecto a la tarjeta activa
      if (cardIndex === activeIndex) {
        card.classList.add('is-active');
      } else if (cardIndex === (activeIndex - 1 + cards.length) % cards.length) {
        card.classList.add('is-left');
      } else {
        card.classList.add('is-right');
      }
    });
  }

  // Evento Flecha Derecha (Avanzar)
  nextBtn.addEventListener('click', () => {
    activeIndex = (activeIndex + 1) % cards.length;
    updateCarousel();
  });

  // Evento Flecha Izquierda (Retroceder)
  prevBtn.addEventListener('click', () => {
    activeIndex = (activeIndex - 1 + cards.length) % cards.length;
    updateCarousel();
  });
});

// ------------------------------------------------------------
// INTERACTIVIDAD 3D: CÁPSULA DE SILLA EN FRASE PRINCIPAL
// ------------------------------------------------------------
(function() {
  const capsule = document.getElementById('interactiveChairCapsule');
  const chair = document.getElementById('movingChair');

  // Si no existen los elementos en esta página, salimos de forma segura sin romper el resto del JS
  if (!capsule || !chair) return;

  capsule.addEventListener('mousemove', (e) => {
    const rect = capsule.getBoundingClientRect();
    
    // Coordenadas relativas respecto a la cápsula
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // Grados de rotación y traslación
    const rotateX = -y * 35; 
    const rotateY = x * 45;  
    const translateX = x * 15; 

    chair.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateX(${translateX}px) scale(1.15)`;
  });

  // Retorno elástico al salir
  capsule.addEventListener('mouseleave', () => {
    chair.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    chair.style.transform = 'rotateX(0deg) rotateY(0deg) translateX(0px) scale(1)';
  });

  // Respuesta inmediata al entrar
  capsule.addEventListener('mouseenter', () => {
    chair.style.transition = 'transform 0.1s ease-out';
  });
})();