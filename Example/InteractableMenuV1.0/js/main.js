// ===== NAVEGACIÓN =====
function navigateTo(page) {
    window.location.href = page;
}

// ===== ANIMACIONES DE ENTRADA =====
function triggerEntranceAnimations() {
    const animatedElements = document.querySelectorAll('[class*="animate-"]');

    // Agregar animaciones por tipo
    const fadeElements = document.querySelectorAll('.animate-fade-in');
    const slideUpElements = document.querySelectorAll('.animate-slide-up');
    const slideDownElements = document.querySelectorAll('.animate-slide-down');
    const slideLeftElements = document.querySelectorAll('.animate-slide-in-left');
    const slideRightElements = document.querySelectorAll('.animate-slide-in-right');

    fadeElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.1}s`;
    });

    slideUpElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.1}s`;
    });

    slideDownElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.1}s`;
    });

    slideLeftElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.1}s`;
    });

    slideRightElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.1}s`;
    });

    // Agregar clase de stagger a elementos sin animación específica
    const staggerElements = document.querySelectorAll('[class*="stagger-"]');
    staggerElements.forEach((el) => {
        const match = el.className.match(/stagger-(\d+)/);
        if (match) {
            el.style.animationDelay = `${(parseInt(match[1]) - 1) * 0.1}s`;
        }
    });
}

// ===== BACK BUTTON HANDLER =====
function setupBackButton() {
    const backButtons = document.querySelectorAll('.back-button');
    backButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    });
}

// ===== ACTIVAR GLOW EN HOVER =====
function setupHoverGlow() {
    const glowElements = document.querySelectorAll('.hover-glow, .stat-card, .nav-btn');

    glowElements.forEach(el => {
        el.addEventListener('mouseenter', function() {
            this.classList.add('glow-cian');
        });

        el.addEventListener('mouseleave', function() {
            this.classList.remove('glow-cian');
        });
    });
}

// ===== SETUP NAVEGACIÓN DE BOTONES =====
function setupNavButtons() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href) {
                e.preventDefault();
                navigateTo(href);
            }
        });
    });
}

// ===== OBSERVAR INTERSECCIONES PARA ANIMACIONES LAZY =====
function setupIntersectionAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatableElements = document.querySelectorAll('[class*="animate-"]');
    animatableElements.forEach(el => {
        observer.observe(el);
    });
}

// ===== INICIALIZACIÓN GENERAL =====
function initPage() {
    // Esperar a que el DOM esté completamente cargado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPage);
        return;
    }

    // Activar animaciones de entrada
    triggerEntranceAnimations();

    // Configurar botones de navegación
    setupNavButtons();
    setupBackButton();

    // Activar efectos de hover
    setupHoverGlow();

    // Configurar observador para animaciones lazy
    setupIntersectionAnimations();

    // Log de inicialización (remover en producción)
    console.log('MesaXR Interface initialized');
}

// ===== UTILIDADES DE ANIMACIÓN =====
function addStaggerDelay(elements, baseDelay = 0.1) {
    elements.forEach((el, index) => {
        el.style.animationDelay = `${baseDelay * (index + 1)}s`;
    });
}

function removeAnimation(element) {
    element.classList.remove(...Array.from(element.classList).filter(cls => cls.includes('animate-')));
}

// ===== AUTO INIT =====
initPage();
