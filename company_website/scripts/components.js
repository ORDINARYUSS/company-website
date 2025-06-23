/**
 * COMPONENTS.JS - Interactive Component Controllers
 * Handles tabs, modals, forms, and other interactive elements
 */

class ComponentManager {
    constructor() {
        this.activeTab = 'machines';
        this.modals = new Map();
        this.forms = new Map();
        
        this.init();
    }

    /**
     * Initialize all components
     */
    init() {
        this.setupTabSystem();
        this.setupModalSystem();
        this.setupFormHandlers();
        this.setupTooltips();
        this.setupAccordions();
        
        console.log('Component manager initialized');
    }

    /**
     * Setup tab switching system
     */
    setupTabSystem() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        // Make showTab function globally available for onclick handlers
        window.showTab = (tabName) => {
            this.switchTab(tabName);
        };

        // Also setup modern event listeners
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.target.textContent.includes('Makineler') ? 'machines' : 'automation';
                this.switchTab(tabName);
            });

            // Keyboard navigation for tabs
            button.addEventListener('keydown', (e) => {
                this.handleTabKeyNavigation(e, button);
            });
        });

        // Set initial tab state
        this.switchTab(this.activeTab);
    }

    /**
     * Switch between tabs
     */
    switchTab(tabName) {
        const tabContents = document.querySelectorAll('.tab-content');
        const tabButtons = document.querySelectorAll('.tab-button');

        // Hide all tab contents
        tabContents.forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
        });

        // Remove active class from all buttons
        tabButtons.forEach(button => {
            button.classList.remove('active');
            button.setAttribute('aria-selected', 'false');
        });

        // Show selected tab content
        const selectedContent = document.getElementById(tabName);
        if (selectedContent) {
            selectedContent.classList.add('active');
            selectedContent.style.display = 'block';
            
            // Trigger animation for tab content
            if (window.AnimationManager) {
                window.AnimationManager.animateTabContent(selectedContent);
            }
        }

        // Set active button
        tabButtons.forEach(button => {
            const isTargetButton = (tabName === 'machines' && button.textContent.includes('Makineler')) ||
                                 (tabName === 'automation' && button.textContent.includes('Otomasyon'));
            
            if (isTargetButton) {
                button.classList.add('active');
                button.setAttribute('aria-selected', 'true');
                button.focus();
            }
        });

        this.activeTab = tabName;

        // Trigger custom event
        const tabChangeEvent = new CustomEvent('tabChange', {
            detail: { activeTab: tabName }
        });
        window.dispatchEvent(tabChangeEvent);
    }

    /**
     * Handle keyboard navigation for tabs
     */
    handleTabKeyNavigation(event, currentButton) {
        const tabButtons = Array.from(document.querySelectorAll('.tab-button'));
        const currentIndex = tabButtons.indexOf(currentButton);

        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabButtons.length - 1;
                tabButtons[prevIndex].focus();
                tabButtons[prevIndex].click();
                break;

            case 'ArrowRight':
                event.preventDefault();
                const nextIndex = currentIndex < tabButtons.length - 1 ? currentIndex + 1 : 0;
                tabButtons[nextIndex].focus();
                tabButtons[nextIndex].click();
                break;

            case 'Home':
                event.preventDefault();
                tabButtons[0].focus();
                tabButtons[0].click();
                break;

            case 'End':
                event.preventDefault();
                tabButtons[tabButtons.length - 1].focus();
                tabButtons[tabButtons.length - 1].click();
                break;
        }
    }

    /**
     * Setup modal system
     */
    setupModalSystem() {
        // Create modal overlay if it doesn't exist
        if (!document.querySelector('.modal-overlay')) {
            this.createModalOverlay();
        }

        // Setup close handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') || 
                e.target.classList.contains('modal-close')) {
                this.closeAllModals();
            }
        });

        // ESC key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    /**
     * Create modal overlay
     */
    createModalOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(5px);
            z-index: 10000;
            display: none;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(overlay);
    }

    /**
     * Open modal
     */
    openModal(modalId, content = null) {
        const overlay = document.querySelector('.modal-overlay');
        
        if (!overlay) return;

        // Create modal content if provided
        if (content) {
            this.createModalContent(modalId, content);
        }

        // Show overlay
        overlay.style.display = 'flex';
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 10);

        // Prevent body scrolling
        document.body.style.overflow = 'hidden';

        // Store active modal
        this.modals.set(modalId, true);

        // Focus management
        const modal = overlay.querySelector('.modal-content');
        if (modal) {
            modal.focus();
        }
    }

    /**
     * Create modal content
     */
    createModalContent(modalId, content) {
        const overlay = document.querySelector('.modal-overlay');
        
        const modal = document.createElement('div');
        modal.className = 'modal-content';
        modal.id = modalId;
        modal.style.cssText = `
            background: white;
            border-radius: var(--radius-lg);
            padding: 2rem;
            max-width: 90vw;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            box-shadow: var(--shadow-heavy);
            transform: scale(0.9);
            transition: transform 0.3s ease;
        `;

        // Add close button
        const closeButton = document.createElement('button');
        closeButton.className = 'modal-close';
        closeButton.innerHTML = '×';
        closeButton.style.cssText = `
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: none;
            border: none;
            font-size: 2rem;
            cursor: pointer;
            color: #666;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.3s ease;
        `;

        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.background = '#f0f0f0';
        });

        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.background = 'none';
        });

        modal.appendChild(closeButton);
        modal.innerHTML += content;
        
        // Clear previous content and add new
        overlay.innerHTML = '';
        overlay.appendChild(modal);

        // Animate in
        setTimeout(() => {
            modal.style.transform = 'scale(1)';
        }, 10);
    }

    /**
     * Close all modals
     */
    closeAllModals() {
        const overlay = document.querySelector('.modal-overlay');
        
        if (overlay && overlay.style.opacity === '1') {
            overlay.style.opacity = '0';
            
            setTimeout(() => {
                overlay.style.display = 'none';
                overlay.innerHTML = '';
            }, 300);

            // Restore body scrolling
            document.body.style.overflow = '';

            // Clear modal storage
            this.modals.clear();
        }
    }

    /**
     * Setup form handlers
     */
    setupFormHandlers() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                this.handleFormSubmit(e, form);
            });

            // Setup real-time validation
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });

                input.addEventListener('input', () => {
                    this.clearFieldError(input);
                });
            });
        });
    }

    /**
     * Handle form submission
     */
    handleFormSubmit(event, form) {
        event.preventDefault();
        
        const formData = new FormData(form);
        const formId = form.id || 'unknown-form';
        
        // Validate form
        if (!this.validateForm(form)) {
            return;
        }

        // Show loading state
        this.setFormLoading(form, true);
        
        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            this.setFormLoading(form, false);
            this.showFormSuccess(form);
            
            // Clear form
            form.reset();
            
            console.log('Form submitted:', Object.fromEntries(formData));
        }, 2000);
    }

    /**
     * Validate entire form
     */
    validateForm(form) {
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    /**
     * Validate individual field
     */
    validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        let isValid = true;
        let errorMessage = '';

        // Required validation
        if (field.required && !value) {
            isValid = false;
            errorMessage = 'Bu alan zorunludur';
        }
        // Email validation
        else if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Geçerli bir email adresi giriniz';
            }
        }
        // Phone validation
        else if (type === 'tel' && value) {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(value)) {
                isValid = false;
                errorMessage = 'Geçerli bir telefon numarası giriniz';
            }
        }

        // Show/hide error
        if (isValid) {
            this.clearFieldError(field);
        } else {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    /**
     * Show field error
     */
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.style.borderColor = 'var(--primary-color)';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.cssText = `
            color: var(--primary-color);
            font-size: 0.875rem;
            margin-top: 0.25rem;
        `;
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    }

    /**
     * Clear field error
     */
    clearFieldError(field) {
        field.style.borderColor = '';
        
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    /**
     * Set form loading state
     */
    setFormLoading(form, isLoading) {
        const submitButton = form.querySelector('[type="submit"]');
        
        if (submitButton) {
            if (isLoading) {
                submitButton.disabled = true;
                submitButton.textContent = 'Gönderiliyor...';
            } else {
                submitButton.disabled = false;
                submitButton.textContent = submitButton.dataset.originalText || 'Gönder';
            }
        }
    }

    /**
     * Show form success message
     */
    showFormSuccess(form) {
        const successDiv = document.createElement('div');
        successDiv.className = 'form-success';
        successDiv.style.cssText = `
            background: rgba(26, 153, 136, 0.1);
            color: var(--accent-color);
            padding: 1rem;
            border-radius: var(--radius-md);
            margin-top: 1rem;
            text-align: center;
        `;
        successDiv.textContent = 'Mesajınız başarıyla gönderildi!';
        
        form.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }

    /**
     * Setup tooltips
     */
    setupTooltips() {
        const elementsWithTooltips = document.querySelectorAll('[data-tooltip]');
        
        elementsWithTooltips.forEach(element => {
            this.createTooltip(element);
        });
    }

    /**
     * Create tooltip for element
     */
    createTooltip(element) {
        const tooltipText = element.dataset.tooltip;
        
        element.addEventListener('mouseenter', () => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.style.cssText = `
                position: absolute;
                background: var(--neutral-dark);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: var(--radius-md);
                font-size: 0.875rem;
                white-space: nowrap;
                z-index: 1000;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            tooltip.textContent = tooltipText;
            
            document.body.appendChild(tooltip);
            
            // Position tooltip
            const rect = element.getBoundingClientRect();
            tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
            tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
            
            // Show tooltip
            setTimeout(() => {
                tooltip.style.opacity = '1';
            }, 10);
            
            element.addEventListener('mouseleave', () => {
                tooltip.remove();
            }, { once: true });
        });
    }

    /**
     * Setup accordion components
     */
    setupAccordions() {
        const accordionHeaders = document.querySelectorAll('.accordion-header');
        
        accordionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                this.toggleAccordion(header);
            });

            // Keyboard support
            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleAccordion(header);
                }
            });
        });
    }

    /**
     * Toggle accordion state
     */
    toggleAccordion(header) {
        const content = header.nextElementSibling;
        const isOpen = header.classList.contains('active');
        
        if (isOpen) {
            header.classList.remove('active');
            content.style.maxHeight = null;
            header.setAttribute('aria-expanded', 'false');
        } else {
            header.classList.add('active');
            content.style.maxHeight = content.scrollHeight + 'px';
            header.setAttribute('aria-expanded', 'true');
        }
    }

    /**
     * Create notification
     */
    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-left: 4px solid var(--primary-color);
            border-radius: var(--radius-md);
            padding: 1rem 1.5rem;
            box-shadow: var(--shadow-medium);
            z-index: 10000;
            max-width: 400px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        if (type === 'success') {
            notification.style.borderLeftColor = 'var(--accent-color)';
        } else if (type === 'error') {
            notification.style.borderLeftColor = 'var(--primary-color)';
        }
        
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
    }

    /**
     * Get current active tab
     */
    getActiveTab() {
        return this.activeTab;
    }

    /**
     * Check if modal is open
     */
    isModalOpen(modalId = null) {
        if (modalId) {
            return this.modals.has(modalId);
        }
        return this.modals.size > 0;
    }

    /**
     * Destroy component manager
     */
    destroy() {
        this.closeAllModals();
        this.modals.clear();
        this.forms.clear();
        
        console.log('Component manager destroyed');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.ComponentManager = new ComponentManager();
});

// Setup additional features when app is loaded
window.addEventListener('appLoaded', () => {
    if (window.ComponentManager) {
        console.log('Components ready for interaction');
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComponentManager;
}