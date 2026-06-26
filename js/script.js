const GALLERY_IMAGES = [];
(function() {
    for (let i = 1; i <= 123; i++) {
        if (i === 80) continue;
        const n = String(i).padStart(3, '0');
        GALLERY_IMAGES.push({ src: `imagen/gallery/lobatohoyos_${n}.jpg`, thumb: `imagen/gallery/thumbs/lobatohoyos_${n}.jpg` });
    }
})();

(function buildGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    grid.innerHTML = GALLERY_IMAGES.map((img, i) =>
        `<figure class="gallery-card" data-lightbox data-index="${i}" tabindex="0" role="button" aria-label="Obra ${i + 1} de ${GALLERY_IMAGES.length} de Pedro Lobato Hoyos">
            <img src="${img.thumb}" data-full="${img.src}" alt="Obra ${i + 1} de ${GALLERY_IMAGES.length}" loading="lazy" decoding="async" width="300" height="225">
        </figure>`
    ).join('');
})();

document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG' && e.target.closest('#gallery-grid')) {
        e.target.alt = 'No se pudo cargar la imagen';
    }
}, true);

/* ===== REVEAL ANIMATIONS ===== */

const revealElements = document.querySelectorAll('[data-reveal]');
if (revealElements.length) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    revealElements.forEach(el => observer.observe(el));
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
    lightboxItems = Array.from(document.querySelectorAll('#gallery-grid .gallery-card[data-lightbox], .gallery-item[data-lightbox]'));
}

function openLightbox(index) {
    refreshLightboxItems();
    if (!lightboxItems.length || index < 0 || index >= lightboxItems.length) return;
    currentLightboxIndex = index;
    previousFocus = document.activeElement;

    const item = lightboxItems[index];
    const img = item.querySelector('img');
    const fullSrc = img.getAttribute('data-full') || img.src;

    lightbox.classList.add('loading');
    lightboxImg.src = fullSrc;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = '';

    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';

    lightboxClose.focus();
}

function openStandaloneLightbox(src, alt, caption) {
    currentLightboxIndex = -1;
    previousFocus = document.activeElement;
    lightboxPrev.style.display = 'none';
    lightboxNext.style.display = 'none';

    lightbox.classList.add('loading');
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightboxCaption.textContent = caption || '';

    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';

    lightboxClose.focus();
}

function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.classList.remove('loading');
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
    const fullSrc = img.getAttribute('data-full') || img.src;

    lightbox.classList.add('loading');
    lightboxImg.src = fullSrc;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = '';
    currentLightboxIndex = newIndex;
}

lightboxImg.addEventListener('load', () => {
    lightbox.classList.remove('loading');
});

lightboxImg.addEventListener('error', () => {
    lightbox.classList.remove('loading');
    lightboxImg.alt = 'No se pudo cargar la imagen';
});

lightboxImg.addEventListener('click', (e) => e.stopPropagation());

lightboxClose.addEventListener('click', (e) => {
    e.stopPropagation();
    closeLightbox();
});

lightboxPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    navigateLightbox(-1);
});

lightboxNext.addEventListener('click', (e) => {
    e.stopPropagation();
    navigateLightbox(1);
});

lightbox.addEventListener('click', closeLightbox);

document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;

    if (e.key === 'Escape') {
        closeLightbox();
        return;
    }
    if (e.key === 'ArrowLeft' && currentLightboxIndex !== -1) {
        e.preventDefault();
        navigateLightbox(-1);
    }
    if (e.key === 'ArrowRight' && currentLightboxIndex !== -1) {
        e.preventDefault();
        navigateLightbox(1);
    }

    if (e.key === 'Tab') {
        const focusable = lightbox.querySelectorAll('button:not([style*="display: none"])');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }
});

document.addEventListener('keydown', (e) => {
    const target = e.target.closest('[data-lightbox]');
    if (!target) return;
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const isGalleryCard = target.classList.contains('gallery-card');
        if (isGalleryCard) {
            refreshLightboxItems();
            const idx = lightboxItems.indexOf(target);
            if (idx !== -1) openLightbox(idx);
        } else {
            const img = target.querySelector('img');
            const figcaption = target.querySelector('figcaption');
            openStandaloneLightbox(img.src, img.alt, figcaption ? figcaption.textContent : '');
        }
    }
});

(function() {
    document.addEventListener('click', (e) => {
        const card = e.target.closest('[data-lightbox]');
        if (!card) return;
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
    });
})();

/* ===== SWIPE IN LIGHTBOX ===== */

let touchStartX = 0;
let touchStartY = 0;
lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

lightbox.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    const dy = e.changedTouches[0].screenY - touchStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx > 60 && absDx > absDy) {
        navigateLightbox(dx < 0 ? 1 : -1);
    } else if (absDy > 80 && absDy > absDx) {
        closeLightbox();
    }
}, { passive: true });

/* ===== BACK TO TOP ===== */

const backToTop = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
}, { passive: true });

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
