// Tab functionality
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Product Detail Navigation
function goToProductDetail(productId) {
    // Product page mappings
    const productPages = {
        'cnc-oz5000': 'product-detail.html',
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
        // Fallback to product detail with product ID
        window.location.href = `product-detail.html?product=${productId}`;
    }
}

// Smooth scrolling for navigation links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = targetSection.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Update active nav link
            document.querySelectorAll('.nav-link').forEach(navLink => {
                navLink.classList.remove('active');
            });
            this.classList.add('active');
        }
    });
});

// Active section detection on scroll
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const headerHeight = document.querySelector('.header').offsetHeight;
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - headerHeight - 100;
        const sectionHeight = section.offsetHeight;
        
        if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active');
        }
    });
});

// Hero buttons smooth scroll
document.querySelectorAll('.btn[href^="#"]').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = targetSection.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===========================
// IMAGE MODAL SYSTEM
// ===========================

let currentImageIndex = 0;
let imageData = [];

function initializeImageModal() {
    const productCards = document.querySelectorAll('.product-card[data-image]');
    imageData = Array.from(productCards).map(card => ({
        image: card.dataset.image
       
    }));
}

function openImageModal(element) {    
    const modal = document.getElementById('imageModal');
    if (modal.classList.contains('show')) {
        closeImageModal();
        
        setTimeout(() => {
            actuallyOpenModal(element);
        }, 200);
    } else {
        actuallyOpenModal(element);
    }
}
function actuallyOpenModal(element) {
    // Initialize if not done already
    if (imageData.length === 0) {
        initializeImageModal();
    }

    // Find current image index
    const clickedImage = element.dataset.image;
    currentImageIndex = imageData.findIndex(item => item.image === clickedImage);
    
    if (currentImageIndex === -1) currentImageIndex = 0;

    // Show modal
    const modal = document.getElementById('imageModal');
    const loading = document.getElementById('modalLoading');
    
    modal.classList.add('show');
    modal.style.display = 'flex';
    loading.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Load image
    loadModalImage();
}

function closeImageModal() {
    
    const modal = document.getElementById('imageModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function navigateImage(direction) {
    currentImageIndex += direction;
    
    if (currentImageIndex >= imageData.length) {
        currentImageIndex = 0;
    } else if (currentImageIndex < 0) {
        currentImageIndex = imageData.length - 1;
    }
    
    loadModalImage();
}

// Load modal image
function loadModalImage() {
    const loading = document.getElementById('modalLoading');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const imageCounter = document.getElementById('imageCounter');
    
    loading.style.display = 'block';
    modalImage.style.opacity = '0';

    const currentImage = imageData[currentImageIndex];
    
    // Create new image to preload
    const img = new Image();
    img.onload = function() {
        modalImage.src = currentImage.image;
        modalTitle.textContent = currentImage.title;
        modalDescription.textContent = currentImage.description;
        imageCounter.textContent = `${currentImageIndex + 1} / ${imageData.length}`;
        
        loading.style.display = 'none';
        modalImage.style.opacity = '1';
    };
    
    img.onerror = function() {
        loading.style.display = 'none';
        modalTitle.textContent = 'Resim yüklenemedi';
        modalDescription.textContent = 'Resim dosyasına erişilemiyor.';
    };
    
    img.src = currentImage.image;
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    const modal = document.getElementById('imageModal');
    if (modal.classList.contains('show')) {
        if (e.key === 'Escape') {
            closeImageModal();
        } else if (e.key === 'ArrowLeft') {
            navigateImage(-1);
        } else if (e.key === 'ArrowRight') {
            navigateImage(1);
        }
    }
});

// Close modal when clicking outside
document.getElementById('imageModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeImageModal();
    }
});

// Touch/Swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.getElementById('imageModal').addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
});

document.getElementById('imageModal').addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const swipeDistance = touchEndX - touchStartX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
            navigateImage(-1); // Swipe right - previous image
        } else {
            navigateImage(1); // Swipe left - next image
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Delay initialization to ensure all elements are loaded
    setTimeout(initializeImageModal, 500);
});