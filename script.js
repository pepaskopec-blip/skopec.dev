const header = document.querySelector('header');
const SCROLL_ADD_THRESHOLD = 64;
const SCROLL_REMOVE_THRESHOLD = 20;
let isHeaderScrolled = window.scrollY > SCROLL_ADD_THRESHOLD;

function updateHeaderOnScroll() {
    if (!header) return;

    if (!isHeaderScrolled && window.scrollY >= SCROLL_ADD_THRESHOLD) {
        isHeaderScrolled = true;
    } else if (isHeaderScrolled && window.scrollY <= SCROLL_REMOVE_THRESHOLD) {
        isHeaderScrolled = false;
    }

    header.classList.toggle('scrolled', isHeaderScrolled);
}

function initRevealAnimations() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const revealTargets = document.querySelectorAll(
        '.hero h1, .hero p, .badge, section h2, .interest-item, .hardware-item, .project-card, .social-btn, .project-content h3'
    );

    revealTargets.forEach((el) => {
        el.classList.add('reveal-on-scroll');
    });

    document.querySelectorAll('.project-card, .interest-item, .hardware-item').forEach((el) => {
        el.classList.add('lift-on-hover');
    });

    if (!('IntersectionObserver' in window)) {
        revealTargets.forEach((el) => el.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.14,
        rootMargin: '0px 0px -8% 0px'
    });

    revealTargets.forEach((el) => observer.observe(el));
}

// Logika pro kliknutí na celou kartu projektu (přesunuto z projects.html)
function initProjectCardLinks() {
    const clickableCards = document.querySelectorAll('.project-link-card');
    if (!clickableCards.length) return;

    clickableCards.forEach((card) => {
        const projectUrl = card.getAttribute('data-project-url');
        if (!projectUrl) return;

        card.addEventListener('click', (event) => {
            // Reagovat pouze na levé tlačítko myši
            if (event.button !== 0) return;

            const modifierClick = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
            event.preventDefault();
            event.stopPropagation();

            if (modifierClick) {
                window.open(projectUrl, '_blank', 'noopener,noreferrer');
            } else {
                window.location.assign(projectUrl);
            }
        }, true);
    });
}

// Inicializace
updateHeaderOnScroll();
initRevealAnimations();
initProjectCardLinks();
window.addEventListener('scroll', updateHeaderOnScroll, { passive: true });