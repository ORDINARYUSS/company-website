/**
 * ANIMATIONS.JS - Animation Controllers and Effects
 * Handles scroll animations, counters, and visual effects
 */

class AnimationManager {
    constructor() {
        this.observedElements = new Set();
        this.animatedCounters = new Set();
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        this.init();
    }

    /**
     * Initialize animation system
     */
    init() {
        this.setupScrollAnimations();
        this.setupCounterAnimations();
        this.setupParallaxEffects();
        this.setupHoverEffects();
        
        console.log('Animation manager initialized');
    }

    /**
     * Setup scroll-triggered animations
     */
    setupScrollAnimations() {
        const animatedElements = document.querySelectorAll(`
            .card-component,
            .product-card,
            .section-header,
            .hero-content,
            .stats-component
        `);

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.observedElements.has(entry.target)) {
                    this.triggerScrollAnimation(entry.target);
                    this.observedElements.add(entry.target);
                }
            });
        }, observerOptions);

        animatedElements.forEach(element => {
            if (!this.isReducedMotion) {
                // Add initial state for animation
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            }
            
            observer.observe(element);
        });
    }

    /**
     * Trigger scroll animation for an element
     */
    triggerScrollAnimation(element) {
        if (this.isReducedMotion) {
            return;
        }

        // Add stagger delay based on element index
        const siblings = Array.from(element.parentNode.children);
        const index = siblings.indexOf(element);
        const delay = index * 0.1;

        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            
            // Add animation class
            element.classList.add('fade-in');
        }, delay * 1000);
    }

    /**
     * Setup counter animations for statistics
     */
    setupCounterAnimations() {
        const counterElements = document.querySelectorAll('#patents, #projects, #researchers, #investment');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedCounters.has(entry.target)) {
                    this.animateCounter(entry.target);
                    this.animatedCounters.add(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counterElements.forEach(element => {
            observer.observe(element);
        });
    }

    /**
     * Animate counter numbers
     */
    animateCounter(element) {
        const targetValue = parseInt(element.textContent);
        const duration = this.isReducedMotion ? 100 : 2000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(targetValue * easeOutQuart);
            
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = targetValue;
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Setup parallax effects
     */
    setupParallaxEffects() {
        if (this.isReducedMotion) return;

        const heroSection = document.querySelector('.hero-component');
        const particles = document.querySelectorAll('.particle');

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;

            // Hero parallax
            if (heroSection) {
                heroSection.style.transform = `translateY(${rate}px)`;
            }

            // Particle parallax
            particles.forEach((particle, index) => {
                const speed = (index + 1) * 0.1;
                const yPos = scrolled * speed;
                particle.style.transform = `translateY(${yPos}px)`;
            });
        }, { passive: true });
    }

    /**
     * Setup hover effects and interactions
     */
    setupHoverEffects() {
        // Card hover effects
        const cards = document.querySelectorAll('.card-component, .product-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (!this.isReducedMotion) {
                    card.style.transform = 'translateY(-10px)';
                    card.style.boxShadow = 'var(--shadow-heavy)';
                }
            });

            card.addEventListener('mouseleave', () => {
                if (!this.isReducedMotion) {
                    card.style.transform = 'translateY(0)';
                    card.style.boxShadow = '';
                }
            });
        });

        // Button hover effects
        const buttons = document.querySelectorAll('.btn-component');
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                if (!this.isReducedMotion) {
                    button.style.transform = 'translateY(-3px)';
                }
            });

            button.addEventListener('mouseleave', () => {
                if (!this.isReducedMotion) {
                    button.style.transform = 'translateY(0)';
                }
            });
        });
    }

    /**
     * Setup floating elements animation
     */
    setupFloatingElements() {
        if (this.isReducedMotion) return;

        const floatingElements = document.querySelectorAll('.logo-icon, .card-icon');
        
        floatingElements.forEach((element, index) => {
            const delay = index * 0.5;
            const duration = 3 + (index * 0.5);
            
            element.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
        });
    }

    /**
     * Setup mouse follower effects
     */
    setupMouseEffects() {
        if (this.isReducedMotion || window.AppState?.isMobile) return;

        const hero = document.querySelector('.hero-component');
        
        if (hero) {
            hero.addEventListener('mousemove', (e) => {
                const { clientX, clientY } = e;
                const { innerWidth, innerHeight } = window;
                
                const xPercent = (clientX / innerWidth - 0.5) * 100;
                const yPercent = (clientY / innerHeight - 0.5) * 100;
                
                // Apply subtle parallax to hero elements
                const heroContent = hero.querySelector('.hero-content');
                if (heroContent) {
                    heroContent.style.transform = `translate(${xPercent * 0.02}px, ${yPercent * 0.02}px)`;
                }
            });
        }
    }

    /**
     * Animate page transitions
     */
    animatePageTransition(direction = 'in') {
        if (this.isReducedMotion) return;

        const app = document.getElementById('app');
        
        if (direction === 'out') {
            app.style.opacity = '0';
            app.style.transform = 'scale(0.95)';
        } else {
            app.style.opacity = '1';
            app.style.transform = 'scale(1)';
        }
    }

    /**
     * Setup tab switching animations
     */
    setupTabAnimations() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (this.isReducedMotion) return;

                // Animate button selection
                button.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    button.style.transform = 'scale(1)';
                }, 150);
            });
        });

        // Observe tab content changes
        const tabObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    
                    if (target.classList.contains('active') && target.classList.contains('tab-content')) {
                        this.animateTabContent(target);
                    }
                }
            });
        });

        tabContents.forEach(content => {
            tabObserver.observe(content, { attributes: true });
        });
    }

    /**
     * Animate tab content appearance
     */
    animateTabContent(content) {
        if (this.isReducedMotion) return;

        const items = content.querySelectorAll('.product-card, .card-component');
        
        items.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    /**
     * Setup loading animations
     */
    setupLoadingAnimations() {
        const loadingSpinner = document.querySelector('.loading-spinner');
        
        if (loadingSpinner && !this.isReducedMotion) {
            loadingSpinner.style.animation = 'spin 1s linear infinite';
        }
    }

    /**
     * Create custom animation
     */
    createCustomAnimation(element, keyframes, options = {}) {
        if (this.isReducedMotion) return;

        const defaultOptions = {
            duration: 1000,
            easing: 'ease',
            fill: 'forwards'
        };

        const animationOptions = { ...defaultOptions, ...options };
        
        return element.animate(keyframes, animationOptions);
    }

    /**
     * Pulse animation for call-to-action elements
     */
    addPulseAnimation(element) {
        if (this.isReducedMotion) return;

        element.style.animation = 'pulse 2s infinite';
    }

    /**
     * Remove pulse animation
     */
    removePulseAnimation(element) {
        element.style.animation = '';
    }

    /**
     * Setup scroll progress indicator
     */
    setupScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: var(--gradient-primary);
            z-index: 9999;
            transition: width 0.3s ease;
        `;
        
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const maxScroll = document.body.scrollHeight - window.innerHeight;
            const progress = (scrolled / maxScroll) * 100;
            
            progressBar.style.width = `${Math.min(progress, 100)}%`;
        }, { passive: true });
    }

    /**
     * Cleanup animations and observers
     */
    destroy() {
        this.observedElements.clear();
        this.animatedCounters.clear();
        
        // Remove event listeners
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('mousemove', this.handleMouseMove);
        
        console.log('Animation manager destroyed');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.AnimationManager = new AnimationManager();
});

// Setup additional animations when app is loaded
window.addEventListener('appLoaded', () => {
    if (window.AnimationManager) {
        window.AnimationManager.setupFloatingElements();
        window.AnimationManager.setupMouseEffects();
        window.AnimationManager.setupTabAnimations();
        window.AnimationManager.setupScrollProgress();
    }
});

// Handle reduced motion changes
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    if (window.AnimationManager) {
        window.AnimationManager.isReducedMotion = e.matches;
        
        if (e.matches) {
            console.log('Reduced motion enabled - simplifying animations');
        }
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationManager;
}