/**
 * MAIN.JS - Core Application Initialization
 * Handles app initialization, loading states, and core functionality
 */

// Application State
const AppState = {
    isLoaded: false,
    isScrolled: false,
    activeSection: 'hero',
    isMobile: false,
    reducedMotion: false
};

// DOM Elements Cache
const Elements = {
    loading: null,
    header: null,
    navLinks: null,
    sections: null,
    app: null
};

/**
 * Application Initialization
 */
class App {
    constructor() {
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.cacheElements();
        this.detectDevice();
        this.detectReducedMotion();
        this.setupEventListeners();
        this.handleLoading();
        
        console.log('InnovaMak App initialized successfully');
    }

    /**
     * Cache DOM elements for better performance
     */
    cacheElements() {
        Elements.loading = document.getElementById('loading');
        Elements.header = document.getElementById('header');
        Elements.navLinks = document.querySelectorAll('.nav-link');
        Elements.sections = document.querySelectorAll('section[id]');
        Elements.app = document.getElementById('app');
    }

    /**
     * Detect if user is on mobile device
     */
    detectDevice() {
        AppState.isMobile = window.innerWidth <= 768;
        
        // Add mobile class to body if needed
        if (AppState.isMobile) {
            document.body.classList.add('is-mobile');
        }
        
        // Listen for resize events
        window.addEventListener('resize', this.throttle(() => {
            const wasMobile = AppState.isMobile;
            AppState.isMobile = window.innerWidth <= 768;
            
            if (wasMobile !== AppState.isMobile) {
                document.body.classList.toggle('is-mobile', AppState.isMobile);
                this.handleDeviceChange();
            }
        }, 250));
    }

    /**
     * Detect if user prefers reduced motion
     */
    detectReducedMotion() {
        AppState.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (AppState.reducedMotion) {
            document.body.classList.add('reduced-motion');
            console.log('Reduced motion detected - animations simplified');
        }
    }

    /**
     * Setup core event listeners
     */
    setupEventListeners() {
        // Page load event
        window.addEventListener('load', () => {
            this.handlePageLoad();
        });

        // Before unload event
        window.addEventListener('beforeunload', () => {
            this.handlePageUnload();
        });

        // Error handling
        window.addEventListener('error', (event) => {
            this.handleError(event);
        });

        // Keyboard navigation
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardNavigation(event);
        });

        // Focus management
        document.addEventListener('focusin', (event) => {
            this.handleFocusManagement(event);
        });
    }

    /**
     * Handle loading animation and app reveal
     */
    handleLoading() {
        const loadingDuration = AppState.reducedMotion ? 500 : 1500;
        
        setTimeout(() => {
            if (Elements.loading) {
                Elements.loading.style.opacity = '0';
                
                setTimeout(() => {
                    Elements.loading.style.display = 'none';
                    AppState.isLoaded = true;
                    this.onAppLoaded();
                }, 500);
            }
        }, loadingDuration);
    }

    /**
     * Called when app is fully loaded
     */
    onAppLoaded() {
        document.body.classList.add('app-loaded');
        
        // Trigger custom event
        const loadedEvent = new CustomEvent('appLoaded', {
            detail: { timestamp: Date.now() }
        });
        window.dispatchEvent(loadedEvent);
        
        console.log('App fully loaded and ready');
    }

    /**
     * Handle page load event
     */
    handlePageLoad() {
        // Initialize components that need DOM to be ready
        this.initializeComponents();
        
        // Performance measurement
        if (window.performance && window.performance.mark) {
            window.performance.mark('app-loaded');
        }
    }

    /**
     * Handle page unload event
     */
    handlePageUnload() {
        // Clean up resources
        this.cleanup();
    }

    /**
     * Handle device change (mobile/desktop switch)
     */
    handleDeviceChange() {
        // Reload components that are device-dependent
        console.log('Device change detected, adjusting layout');
        
        // Trigger custom event
        const deviceChangeEvent = new CustomEvent('deviceChange', {
            detail: { isMobile: AppState.isMobile }
        });
        window.dispatchEvent(deviceChangeEvent);
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyboardNavigation(event) {
        // ESC key - close modals, reset states
        if (event.key === 'Escape') {
            this.handleEscape();
        }
        
        // Tab navigation enhancement
        if (event.key === 'Tab') {
            document.body.classList.add('keyboard-nav');
        }
        
        // Arrow key navigation for tabs
        if (event.target.classList.contains('tab-button')) {
            this.handleTabNavigation(event);
        }
    }

    /**
     * Handle tab navigation with arrow keys
     */
    handleTabNavigation(event) {
        const tabs = document.querySelectorAll('.tab-button');
        const currentIndex = Array.from(tabs).indexOf(event.target);
        let nextIndex;

        switch (event.key) {
            case 'ArrowLeft':
                nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
                break;
            case 'ArrowRight':
                nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
                break;
            default:
                return;
        }

        event.preventDefault();
        tabs[nextIndex].focus();
        tabs[nextIndex].click();
    }

    /**
     * Handle focus management for accessibility
     */
    handleFocusManagement(event) {
        // Remove keyboard navigation class on mouse interaction
        if (event.detail === 0) { // 0 indicates mouse/touch interaction
            document.body.classList.remove('keyboard-nav');
        }
    }

    /**
     * Handle escape key functionality
     */
    handleEscape() {
        // Close any open modals or overlays
        const openModals = document.querySelectorAll('.modal.open, .overlay.open');
        openModals.forEach(modal => {
            modal.classList.remove('open');
        });
        
        // Reset tab states if needed
        const activeTabs = document.querySelectorAll('.tab-button.active');
        if (activeTabs.length > 1) {
            activeTabs.forEach((tab, index) => {
                if (index > 0) tab.classList.remove('active');
            });
        }
    }

    /**
     * Handle errors gracefully
     */
    handleError(event) {
        console.error('Application error:', event.error);
        
        // Don't show errors to users in production
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.showErrorNotification(event.error.message);
        }
    }

    /**
     * Show error notification (development only)
     */
    showErrorNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4757;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            z-index: 10000;
            max-width: 300px;
            font-size: 0.9rem;
        `;
        notification.textContent = `Error: ${message}`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    /**
     * Initialize components that need DOM to be ready
     */
    initializeComponents() {
        // This will be called by other component files
        console.log('Initializing components...');
    }

    /**
     * Throttle function for performance
     */
    throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;
        
        return function (...args) {
            const currentTime = Date.now();
            
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    }

    /**
     * Debounce function for performance
     */
    debounce(func, delay) {
        let timeoutId;
        
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Clean up resources before page unload
     */
    cleanup() {
        // Remove event listeners
        // Clear timeouts/intervals
        // Clean up any resources
        console.log('Cleaning up application resources');
    }
}

/**
 * Utility Functions
 */
const Utils = {
    /**
     * Check if element is in viewport
     */
    isInViewport(element, threshold = 0.1) {
        const rect = element.getBoundingClientRect();
        const viewHeight = window.innerHeight || document.documentElement.clientHeight;
        const viewWidth = window.innerWidth || document.documentElement.clientWidth;
        
        return (
            rect.bottom > viewHeight * threshold &&
            rect.right > viewWidth * threshold &&
            rect.top < viewHeight * (1 - threshold) &&
            rect.left < viewWidth * (1 - threshold)
        );
    },

    /**
     * Smooth scroll to element
     */
    scrollToElement(element, offset = 0) {
        if (!element) return;
        
        const elementTop = element.offsetTop - offset;
        
        if (AppState.reducedMotion) {
            window.scrollTo(0, elementTop);
        } else {
            window.scrollTo({
                top: elementTop,
                behavior: 'smooth'
            });
        }
    },

    /**
     * Get section offset accounting for fixed header
     */
    getSectionOffset() {
        const header = Elements.header;
        return header ? header.offsetHeight + 20 : 80;
    },

    /**
     * Format number with animation
     */
    animateNumber(element, start, end, duration = 1000) {
        if (AppState.reducedMotion) {
            element.textContent = end;
            return;
        }

        const startTime = performance.now();
        const difference = end - start;

        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(start + (difference * easeOutQuart));
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.textContent = end;
            }
        };
        
        requestAnimationFrame(step);
    }
};

/**
 * Initialize app when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    window.InnovaMakApp = new App();
    window.AppState = AppState;
    window.Utils = Utils;
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { App, AppState, Utils };
}