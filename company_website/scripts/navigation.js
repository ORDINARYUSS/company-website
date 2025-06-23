/**
 * NAVIGATION.JS - Navigation and Scroll Management
 * Handles smooth scrolling, active section detection, and header behavior
 */

class NavigationManager {
    constructor() {
        this.navLinks = document.querySelectorAll('.nav-link');
        this.header = document.getElementById('header');
        this.sections = document.querySelectorAll('section[id]');
        this.isScrolling = false;
        this.scrollOffset = 80;
        
        this.init();
    }

    /**
     * Initialize navigation functionality
     */
    init() {
        this.setupSmoothScrolling();
        this.setupScrollDetection();
        this.setupHeaderScrollEffect();
        this.setupActiveSection();
        
        console.log('Navigation manager initialized');
    }

    /**
     * Setup smooth scrolling for navigation links
     */
    setupSmoothScrolling() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    this.scrollToSection(targetSection);
                    
                    // Update active state immediately for better UX
                    this.updateActiveNavLink(link);
                }
            });
        });

        // Also handle hero button clicks
        const heroButtons = document.querySelectorAll('.btn-component[href^="#"]');
        heroButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = button.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    this.scrollToSection(targetSection);
                }
            });
        });
    }

    /**
     * Smooth scroll to a specific section
     */
    scrollToSection(targetSection) {
        if (this.isScrolling) return;
        
        this.isScrolling = true;
        
        const targetTop = targetSection.offsetTop - this.scrollOffset;
        
        if (window.AppState && window.AppState.reducedMotion) {
            // Instant scroll for reduced motion preference
            window.scrollTo(0, targetTop);
            this.isScrolling = false;
        } else {
            // Smooth scroll with custom easing
            this.smoothScrollTo(targetTop, 800);
        }
    }

    /**
     * Custom smooth scroll implementation with easing
     */
    smoothScrollTo(targetY, duration) {
        const startY = window.pageYOffset;
        const distance = targetY - startY;
        const startTime = performance.now();

        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

        const animateScroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easedProgress = easeOutCubic(progress);
            const currentY = startY + (distance * easedProgress);
            
            window.scrollTo(0, currentY);
            
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            } else {
                this.isScrolling = false;
            }
        };

        requestAnimationFrame(animateScroll);
    }

    /**
     * Setup scroll detection for various effects
     */
    setupScrollDetection() {
        let ticking = false;
        
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.onScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    /**
     * Handle scroll events
     */
    onScroll() {
        const scrollY = window.pageYOffset;
        
        // Update app state
        if (window.AppState) {
            window.AppState.isScrolled = scrollY > 100;
        }
        
        // Update active section if not currently scrolling programmatically
        if (!this.isScrolling) {
            this.updateActiveSection();
        }
        
        // Trigger custom scroll event for other components
        const scrollEvent = new CustomEvent('appScroll', {
            detail: { scrollY }
        });
        window.dispatchEvent(scrollEvent);
    }

    /**
     * Setup header scroll effects
     */
    setupHeaderScrollEffect() {
        window.addEventListener('appScroll', (event) => {
            const { scrollY } = event.detail;
            
            if (this.header) {
                if (scrollY > 100) {
                    this.header.classList.add('header-scrolled');
                } else {
                    this.header.classList.remove('header-scrolled');
                }
            }
        });
    }

    /**
     * Setup active section detection
     */
    setupActiveSection() {
        const observerOptions = {
            threshold: 0.3,
            rootMargin: '-100px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isScrolling) {
                    const sectionId = entry.target.id;
                    this.setActiveSection(sectionId);
                }
            });
        }, observerOptions);

        this.sections.forEach(section => {
            observer.observe(section);
        });
    }

    /**
     * Update active section based on scroll position
     */
    updateActiveSection() {
        const scrollY = window.pageYOffset + this.scrollOffset + 50;
        
        let activeSection = 'hero';
        
        this.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                activeSection = section.id;
            }
        });

        this.setActiveSection(activeSection);
    }

    /**
     * Set active section and update navigation
     */
    setActiveSection(sectionId) {
        if (window.AppState) {
            window.AppState.activeSection = sectionId;
        }

        // Update navigation active state
        this.navLinks.forEach(link => {
            const linkTarget = link.getAttribute('href').substring(1);
            
            if (linkTarget === sectionId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Trigger custom event
        const sectionChangeEvent = new CustomEvent('activeSectionChange', {
            detail: { sectionId }
        });
        window.dispatchEvent(sectionChangeEvent);
    }

    /**
     * Update active nav link immediately (for better UX)
     */
    updateActiveNavLink(clickedLink) {
        this.navLinks.forEach(link => {
            link.classList.remove('active');
        });
        clickedLink.classList.add('active');
    }

    /**
     * Get current active section
     */
    getActiveSection() {
        return window.AppState ? window.AppState.activeSection : 'hero';
    }

    /**
     * Navigate to specific section programmatically
     */
    navigateToSection(sectionId) {
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            this.scrollToSection(targetSection);
            this.setActiveSection(sectionId);
        }
    }

    /**
     * Get next section
     */
    getNextSection() {
        const sectionIds = Array.from(this.sections).map(section => section.id);
        const currentIndex = sectionIds.indexOf(this.getActiveSection());
        
        if (currentIndex < sectionIds.length - 1) {
            return sectionIds[currentIndex + 1];
        }
        
        return null;
    }

    /**
     * Get previous section
     */
    getPreviousSection() {
        const sectionIds = Array.from(this.sections).map(section => section.id);
        const currentIndex = sectionIds.indexOf(this.getActiveSection());
        
        if (currentIndex > 0) {
            return sectionIds[currentIndex - 1];
        }
        
        return null;
    }

    /**
     * Navigate to next section
     */
    goToNextSection() {
        const nextSection = this.getNextSection();
        if (nextSection) {
            this.navigateToSection(nextSection);
        }
    }

    /**
     * Navigate to previous section
     */
    goToPreviousSection() {
        const previousSection = this.getPreviousSection();
        if (previousSection) {
            this.navigateToSection(previousSection);
        }
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (event) => {
            // Only handle if no input is focused
            if (document.activeElement.tagName === 'INPUT' || 
                document.activeElement.tagName === 'TEXTAREA') {
                return;
            }

            switch (event.key) {
                case 'ArrowDown':
                case 'PageDown':
                    event.preventDefault();
                    this.goToNextSection();
                    break;
                    
                case 'ArrowUp':
                case 'PageUp':
                    event.preventDefault();
                    this.goToPreviousSection();
                    break;
                    
                case 'Home':
                    event.preventDefault();
                    this.navigateToSection('hero');
                    break;
                    
                case 'End':
                    event.preventDefault();
                    this.navigateToSection('contact');
                    break;
            }
        });
    }

    /**
     * Update scroll offset (useful for dynamic header heights)
     */
    updateScrollOffset() {
        if (this.header) {
            this.scrollOffset = this.header.offsetHeight + 20;
        }
    }

    /**
     * Destroy navigation manager and clean up
     */
    destroy() {
        // Remove event listeners
        this.navLinks.forEach(link => {
            link.removeEventListener('click', this.handleNavClick);
        });
        
        window.removeEventListener('scroll', this.handleScroll);
        
        console.log('Navigation manager destroyed');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.NavigationManager = new NavigationManager();
});

// Initialize keyboard navigation when app is loaded
window.addEventListener('appLoaded', () => {
    if (window.NavigationManager) {
        window.NavigationManager.setupKeyboardNavigation();
    }
});

// Update scroll offset on resize
window.addEventListener('resize', () => {
    if (window.NavigationManager) {
        window.NavigationManager.updateScrollOffset();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationManager;
}