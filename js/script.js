const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

function activateTab(button) {
    const tabName = button.getAttribute('data-tab');

    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
    });
    tabContents.forEach(content => content.classList.remove('active'));

    button.classList.add('active');
    button.setAttribute('aria-selected', 'true');

    const tabElement = document.getElementById(tabName);
    if (tabElement) {
        tabElement.classList.add('active');
    }
}

tabButtons.forEach(button => {
    button.addEventListener('click', () => activateTab(button));
});

const tabList = document.querySelector('.tabs-buttons');
const tabArray = Array.from(tabButtons);

tabList.addEventListener('keydown', (e) => {
    const current = document.activeElement;
    const idx = tabArray.indexOf(current);
    if (idx === -1) return;

    let nextIdx;
    if (e.key === 'ArrowRight') {
        nextIdx = (idx + 1) % tabArray.length;
    } else if (e.key === 'ArrowLeft') {
        nextIdx = (idx - 1 + tabArray.length) % tabArray.length;
    } else {
        return;
    }

    e.preventDefault();
    tabArray[nextIdx].focus();
    activateTab(tabArray[nextIdx]);
});

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

const lightbox = document.querySelector('.lightbox');
const lightboxImg = lightbox.querySelector('.lightbox-image');
const lightboxCaption = lightbox.querySelector('.lightbox-caption');
const lightboxClose = lightbox.querySelector('.lightbox-close');
const galleryItems = document.querySelectorAll('[data-lightbox]');

galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const figcaption = item.querySelector('figcaption');
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxCaption.textContent = figcaption ? figcaption.textContent : '';
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
    });
});

function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
}

lightboxImg.addEventListener('click', (e) => e.stopPropagation());

lightboxClose.addEventListener('click', (e) => {
    e.stopPropagation();
    closeLightbox();
});

lightbox.addEventListener('click', closeLightbox);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) {
        closeLightbox();
    }
});

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
