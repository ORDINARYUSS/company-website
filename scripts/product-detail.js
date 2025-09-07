// Product Detail Page JavaScript

// Image Gallery Functions
function changeImage(imageSrc) {
    const mainImage = document.getElementById('mainImage');
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    // Update main image
    mainImage.src = imageSrc;
    
    // Update active thumbnail
    thumbnails.forEach(thumb => {
        thumb.classList.remove('active');
        if (thumb.src === imageSrc) {
            thumb.classList.add('active');
        }
    });
}

// Product Actions
function requestQuote() {
    // Get product information
    const productTitle = document.querySelector('.product-title').textContent;
    const productCode = document.querySelector('.product-code').textContent;
    
    // Create quote request
    const subject = `Teklif Talebi: ${productTitle}`;
    const body = `Merhaba,

${productTitle} (${productCode}) için teklif talep ediyorum.

Lütfen aşağıdaki bilgileri de ekleyerek teklifinizi iletiniz:
- Fiyat bilgisi
- Teslimat süresi
- Garanti koşulları
- Ödeme şartları

Teşekkür ederim.`;
    
    // Open email client
    const mailtoLink = `mailto:info@ozikiler.com.tr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
}

function downloadCatalog() {
    // Create download link for catalog
    const productTitle = document.querySelector('.product-title').textContent;
    
    // You can replace this with actual catalog PDF path
    const catalogPath = 'documents/katalog-cnc-oz5000.pdf';
    
    // Create temporary download link
    const link = document.createElement('a');
    link.href = catalogPath;
    link.download = `${productTitle.replace(/\s+/g, '-')}-Katalog.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show download message
    showNotification('Katalog indiriliyor...', 'success');
}

function contactUs() {
    // Scroll to contact section or show contact modal
    const phone = '+90 352 321 45 67';
    const email = 'info@ozikiler.com.tr';
    
    const message = `İletişim Bilgileri:
    
📞 Telefon: ${phone}
📧 E-posta: ${email}
🏢 Adres: Organize Sanayi Bölgesi, Makine Sanayi Sitesi
15. Blok No: 7-9, Melikgazi / Kayseri

Teknik destek için direkt arayabilir veya e-posta gönderebilirsiniz.`;
    
    alert(message);
}

// Related Products Navigation
function goToProduct(productId) {
    // Product routing
    const productPages = {
        'torna-oz3000': 'torna-oz3000.html',
        'grinding-oz1800': 'grinding-oz1800.html',
        'welding-ozws500': 'welding-ozws500.html',
        'plc-oz400': 'plc-oz400.html',
        'sensor-oz300': 'sensor-oz300.html',
        'servo-oz800': 'servo-oz800.html',
        'power-oz600': 'power-oz600.html'
    };
    
    if (productPages[productId]) {
        window.location.href = productPages[productId];
    } else {
        // If page doesn't exist, go to products section
        window.location.href = 'index.html#products';
    }
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    // Add animation
    if (!document.querySelector('style[data-notification]')) {
        const style = document.createElement('style');
        style.setAttribute('data-notification', 'true');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Image Zoom Functionality
document.addEventListener('DOMContentLoaded', function() {
    const imageZoom = document.querySelector('.image-zoom');
    const mainImage = document.querySelector('.main-image img');
    
    if (imageZoom && mainImage) {
        imageZoom.addEventListener('click', function() {
            // Create modal for zoomed image
            const modal = document.createElement('div');
            modal.className = 'image-modal';
            modal.innerHTML = `
                <div class="modal-backdrop" onclick="this.parentElement.remove()">
                    <div class="modal-content" onclick="event.stopPropagation()">
                        <img src="${mainImage.src}" alt="${mainImage.alt}">
                        <button class="modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
                    </div>
                </div>
            `;
            
            // Add modal styles
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
            `;
            
            // Add modal CSS if not exists
            if (!document.querySelector('style[data-modal]')) {
                const style = document.createElement('style');
                style.setAttribute('data-modal', 'true');
                style.textContent = `
                    .modal-backdrop {
                        width: 100%;
                        height: 100%;
                        background: rgba(0,0,0,0.9);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 2rem;
                    }
                    .modal-content {
                        position: relative;
                        max-width: 90vw;
                        max-height: 90vh;
                    }
                    .modal-content img {
                        max-width: 100%;
                        max-height: 100%;
                        object-fit: contain;
                        border-radius: 8px;
                    }
                    .modal-close {
                        position: absolute;
                        top: -40px;
                        right: 0;
                        background: rgba(255,255,255,0.9);
                        border: none;
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        font-size: 18px;
                        cursor: pointer;
                        font-weight: bold;
                    }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(modal);
        });
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Back to top functionality
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '↑';
    backToTop.className = 'back-to-top';
    backToTop.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--accent-blue);
        color: white;
        border: none;
        font-size: 20px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    document.body.appendChild(backToTop);
    
    // Show/hide back to top button
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTop.style.opacity = '1';
        } else {
            backToTop.style.opacity = '0';
        }
    });
});