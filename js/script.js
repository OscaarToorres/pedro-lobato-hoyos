const CONFIG = Object.freeze({
  galleryCount: 123,
  skipIndex: 80,
  thumbPrefix: 'imagen/gallery/thumbs/lobatohoyos_',
  fullPrefix: 'imagen/gallery/lobatohoyos_',
  parallaxSpeed: 0.02,
  parallaxMaxShift: 15,
  parallaxBasePos: 25,
  progressThrottle: true,
  revealThreshold: 0.1,
  revealMargin: '-40px',
  navDotThreshold: 0.3,
  counterDuration: 2000,
  scrollThreshold: 400,
  swipeThresholdX: 60,
  swipeThresholdY: 80,
  lightboxRootMargin: '100px',
  desktopBreakpoint: 769,
  mobileBreakpoint: 768,
});

const GALLERY_IMAGES = (() => {
  const images = [];
  for (let i = 1; i <= CONFIG.galleryCount; i++) {
    if (i === CONFIG.skipIndex) continue;
    const n = String(i).padStart(3, '0');
    images.push({
      src: `${CONFIG.fullPrefix}${n}.jpg`,
      thumb: `${CONFIG.thumbPrefix}${n}.jpg`,
    });
  }
  return images;
})();

(function buildGallery() {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;
  grid.innerHTML = GALLERY_IMAGES.map(
    (img, i) =>
      `<figure class="gallery-card" data-lightbox data-index="${i}" tabindex="0" role="listitem" aria-label="Obra ${i + 1} de ${GALLERY_IMAGES.length} de Pedro Lobato Hoyos">
        <img src="${img.thumb}" data-full="${img.src}" alt="Obra ${i + 1} de ${GALLERY_IMAGES.length}" loading="lazy" decoding="async" width="300" height="225">
      </figure>`
  ).join('');
})();

const galleryCountEl = document.querySelector('.gallery-count');
if (galleryCountEl) {
  galleryCountEl.textContent = `Galería completa \u2014 ${GALLERY_IMAGES.length} obras`;
}

document.addEventListener(
  'error',
  (e) => {
    if (e.target.tagName === 'IMG' && e.target.closest('#gallery-grid')) {
      e.target.alt = 'No se pudo cargar la imagen';
    }
  },
  true
);

function rafThrottle(fn) {
  let ticking = false;
  return (...args) => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        fn(...args);
      });
    }
  };
}

/* ===== REVEAL ANIMATIONS ===== */

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealElements = document.querySelectorAll('[data-reveal]');
if (!prefersReduced && revealElements.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: CONFIG.revealThreshold, rootMargin: `0px 0px ${CONFIG.revealMargin} 0px` }
  );
  revealElements.forEach((el) => observer.observe(el));
} else if (revealElements.length) {
  revealElements.forEach((el) => el.classList.add('revealed'));
}

/* ===== LIGHTBOX ===== */

const lightbox = document.querySelector('.lightbox');
const lightboxImg = lightbox.querySelector('.lightbox-image');
const lightboxCaption = lightbox.querySelector('.lightbox-caption');
const lightboxClose = lightbox.querySelector('.lightbox-close');
const lightboxPrev = lightbox.querySelector('.lightbox-prev');
const lightboxNext = lightbox.querySelector('.lightbox-next');
let currentLightboxIndex = -1;
let previousFocus = null;
let lightboxItems = [];

function refreshLightboxItems() {
  lightboxItems = Array.from(
    document.querySelectorAll('#gallery-grid .gallery-card[data-lightbox], .gallery-item[data-lightbox]')
  );
}

function showLightbox(src, alt, caption, index) {
  previousFocus = document.activeElement;
  currentLightboxIndex = index ?? -1;

  if (index == null) {
    lightboxPrev.style.display = 'none';
    lightboxNext.style.display = 'none';
  } else {
    lightboxPrev.style.display = '';
    lightboxNext.style.display = '';
  }

  lightbox.classList.add('loading');
  lightboxImg.src = src;
  lightboxImg.alt = alt;
  lightboxCaption.textContent = caption ?? '';
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  lightboxClose.focus();
}

function openLightbox(index) {
  refreshLightboxItems();
  if (!lightboxItems.length || index < 0 || index >= lightboxItems.length) return;
  const item = lightboxItems[index];
  const img = item.querySelector('img');
  showLightbox(img.getAttribute('data-full') || img.src, img.alt, '', index);
}

function openStandaloneLightbox(src, alt, caption) {
  showLightbox(src, alt, caption || '', null);
}

function closeLightbox() {
  lightbox.classList.remove('open', 'loading');
  lightboxImg.src = '';
  lightboxCaption.textContent = '';
  document.body.style.overflow = '';
  currentLightboxIndex = -1;
  lightboxPrev.style.display = '';
  lightboxNext.style.display = '';
  if (previousFocus) {
    previousFocus.focus();
    previousFocus = null;
  }
}

function navigateLightbox(direction) {
  refreshLightboxItems();
  if (!lightboxItems.length) return;
  let newIndex = currentLightboxIndex + direction;
  if (newIndex < 0) newIndex = lightboxItems.length - 1;
  if (newIndex >= lightboxItems.length) newIndex = 0;

  const item = lightboxItems[newIndex];
  const img = item.querySelector('img');
  const figcaption = item.querySelector('figcaption');
  lightbox.classList.add('loading');
  lightboxImg.src = img.getAttribute('data-full') || img.src;
  lightboxImg.alt = img.alt;
  lightboxCaption.textContent = figcaption ? figcaption.textContent : '';
  currentLightboxIndex = newIndex;
}

lightboxImg.addEventListener('load', () => lightbox.classList.remove('loading'));
lightboxImg.addEventListener('error', () => {
  lightbox.classList.remove('loading');
  lightboxImg.alt = 'No se pudo cargar la imagen';
});

lightboxImg.addEventListener('click', (e) => e.stopPropagation());
lightboxClose.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });
lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(-1); });
lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(1); });
lightbox.addEventListener('click', closeLightbox);

function openLightboxForCard(card) {
  const isGalleryCard = card.classList.contains('gallery-card');
  if (isGalleryCard) {
    refreshLightboxItems();
    const idx = lightboxItems.indexOf(card);
    if (idx !== -1) openLightbox(idx);
  } else {
    const img = card.querySelector('img');
    const figcaption = card.querySelector('figcaption');
    openStandaloneLightbox(img.src, img.alt, figcaption ? figcaption.textContent : '');
  }
}

document.addEventListener('click', (e) => {
  const card = e.target.closest('[data-lightbox]');
  if (card) openLightboxForCard(card);
});

document.addEventListener('keydown', (e) => {
  if (lightbox.classList.contains('open')) {
    if (e.key === 'Escape') { closeLightbox(); return; }
    if (e.key === 'ArrowLeft' && currentLightboxIndex !== -1) { e.preventDefault(); navigateLightbox(-1); }
    if (e.key === 'ArrowRight' && currentLightboxIndex !== -1) { e.preventDefault(); navigateLightbox(1); }
    if (e.key === 'Tab') {
      const focusable = lightbox.querySelectorAll('button:not([style*="display: none"])');
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    return;
  }

  const target = e.target.closest('[data-lightbox]');
  if (target && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    openLightboxForCard(target);
  }
});

/* ===== SWIPE IN LIGHTBOX ===== */

let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;
lightbox.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
  touchStartTime = Date.now();
}, { passive: true });

lightbox.addEventListener('touchend', (e) => {
  const dt = Date.now() - touchStartTime;
  if (dt > 500) return;
  const dx = e.changedTouches[0].screenX - touchStartX;
  const dy = e.changedTouches[0].screenY - touchStartY;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (absDx > CONFIG.swipeThresholdX && absDx > absDy) {
    navigateLightbox(dx < 0 ? 1 : -1);
  } else if (absDy > CONFIG.swipeThresholdY && absDy > absDx) {
    closeLightbox();
  }
}, { passive: true });

/* ===== BACK TO TOP ===== */

const backToTop = document.querySelector('.back-to-top');

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ===== SHARED SCROLL LOGIC ===== */

const onScroll = rafThrottle(() => {
  const y = window.scrollY;
  backToTop.classList.toggle('visible', y > CONFIG.scrollThreshold);
});

window.addEventListener('scroll', onScroll, { passive: true });

/* ===== NAVIGATION DOTS ACTIVE STATE ===== */

const navDots = document.querySelectorAll('.slide-nav-dot');
const slides = document.querySelectorAll('.slide[id]');

if (navDots.length && slides.length) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navDots.forEach((dot) => {
            dot.classList.toggle('active', dot.getAttribute('href').slice(1) === id);
          });
        }
      });
    },
    { threshold: CONFIG.navDotThreshold }
  );
  slides.forEach((slide) => navObserver.observe(slide));
}

/* ===== READING PROGRESS BAR ===== */

const progressBar = document.querySelector('.progress-bar');
if (progressBar) {
  const updateProgress = rafThrottle(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    progressBar.style.width = Math.min(progress, 100) + '%';
    progressBar.setAttribute('aria-valuenow', Math.round(progress));
  });
  window.addEventListener('scroll', updateProgress, { passive: true });
}

/* ===== TIMELINE COUNTER ANIMATION ===== */

const counterElements = document.querySelectorAll('.timeline-year[data-target]');
if (counterElements.length) {
  const setFinal = (el) => {
    el.textContent = parseInt(el.getAttribute('data-target'), 10) + (el.getAttribute('data-suffix') || '');
  };

  if (prefersReduced) {
    counterElements.forEach(setFinal);
  } else {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-target'), 10);
            const suffix = el.getAttribute('data-suffix') || '';
            const start = performance.now();

            function updateCounter(now) {
              const progress = Math.min((now - start) / CONFIG.counterDuration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              el.textContent = Math.round(eased * target) + (progress >= 1 ? suffix : '');
              if (progress < 1) requestAnimationFrame(updateCounter);
            }

            requestAnimationFrame(updateCounter);
            counterObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    counterElements.forEach((el) => counterObserver.observe(el));
  }
}

/* ===== PARALLAX HERO (disabled on mobile) ===== */

const heroSection = document.getElementById('slide-presentacion');
const isMobile = window.matchMedia(`(max-width: ${CONFIG.mobileBreakpoint}px)`).matches;

if (heroSection && !isMobile && !prefersReduced) {
  const updateParallax = rafThrottle(() => {
    const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
    if (window.scrollY <= heroBottom) {
      const shift = Math.min(window.scrollY * CONFIG.parallaxSpeed, CONFIG.parallaxMaxShift);
      heroSection.style.backgroundPosition = `center ${CONFIG.parallaxBasePos + shift}%`;
    }
  });
  window.addEventListener('scroll', updateParallax, { passive: true });
}

/* ===== LAZY LOAD GALLERY: swap thumb -> full on desktop ===== */

if ('IntersectionObserver' in window) {
  const galleryImages = document.querySelectorAll('#gallery-grid img[data-full]');
  if (window.matchMedia(`(min-width: ${CONFIG.desktopBreakpoint}px)`).matches && galleryImages.length) {
    const galleryObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.full && img.src !== img.dataset.full) img.src = img.dataset.full;
            galleryObserver.unobserve(img);
          }
        });
      },
      { rootMargin: CONFIG.lightboxRootMargin }
    );
    galleryImages.forEach((img) => galleryObserver.observe(img));
  }
}

/* ===== NAV PILLS AUTO-HIDE ===== */

const navPills = document.querySelector('.slide-nav');
if (navPills) {
  const isDesktop = window.matchMedia(`(min-width: ${CONFIG.desktopBreakpoint}px)`).matches;

  if (isDesktop && !prefersReduced) {
    let hideTimeout;

    function showNav() {
      navPills.classList.add('visible');
      clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => navPills.classList.remove('visible'), 3000);
    }

    window.addEventListener('scroll', rafThrottle(showNav), { passive: true });
    navPills.addEventListener('mouseenter', () => {
      clearTimeout(hideTimeout);
      navPills.classList.add('visible');
    });
    navPills.addEventListener('mouseleave', () => {
      hideTimeout = setTimeout(() => navPills.classList.remove('visible'), 3000);
    });
    showNav();
  } else {
    navPills.classList.add('visible');
  }
}
