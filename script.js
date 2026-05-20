// ===== GALLERY FILTERING & LIGHTBOX =====
const galleryItems = document.querySelectorAll('.gallery-item');
const galleryFilters = document.querySelectorAll('.gallery-filter');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.querySelector('.lightbox-image');
const lightboxCaption = document.querySelector('.lightbox-caption');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxPrev = document.querySelector('.lightbox-prev');
const lightboxNext = document.querySelector('.lightbox-next');

let currentImageIndex = 0;
let filteredImages = [];

// Gallery Filter Functionality
galleryFilters.forEach(filter => {
    filter.addEventListener('click', () => {
        galleryFilters.forEach(f => f.classList.remove('active'));
        filter.classList.add('active');

        const filterValue = filter.getAttribute('data-filter');

        galleryItems.forEach(item => {
            if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                item.classList.remove('hidden');
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.animation = 'fadeInUp 0.6s ease forwards';
                }, 10);
            } else {
                item.classList.add('hidden');
                item.style.display = 'none';
            }
        });
    });
});

// Lightbox functionality
galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        if (!item.classList.contains('hidden')) {
            const img = item.querySelector('.gallery-image img');
            const title = item.querySelector('h3').textContent;

            lightboxImage.src = img.src;
            lightboxCaption.textContent = title;
            lightbox.classList.add('active');

            filteredImages = Array.from(document.querySelectorAll('.gallery-item:not(.hidden)'));
            currentImageIndex = filteredImages.indexOf(item);
        }
    });
});

lightboxClose.addEventListener('click', () => {
    lightbox.classList.remove('active');
});

lightboxPrev.addEventListener('click', () => {
    if (filteredImages.length > 0) {
        currentImageIndex = (currentImageIndex - 1 + filteredImages.length) % filteredImages.length;
        updateLightboxImage();
    }
});

lightboxNext.addEventListener('click', () => {
    if (filteredImages.length > 0) {
        currentImageIndex = (currentImageIndex + 1) % filteredImages.length;
        updateLightboxImage();
    }
});

function updateLightboxImage() {
    const item = filteredImages[currentImageIndex];
    const img = item.querySelector('.gallery-image img');
    const title = item.querySelector('h3').textContent;

    lightboxImage.src = img.src;
    lightboxCaption.textContent = title;
}

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        lightbox.classList.remove('active');
    }
});

document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('active')) {
        if (e.key === 'ArrowLeft') lightboxPrev.click();
        if (e.key === 'ArrowRight') lightboxNext.click();
        if (e.key === 'Escape') lightboxClose.click();
    }
});

// ===== FORM VALIDATION & BOT PROTECTION =====
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            showSuccessMessage();
            contactForm.reset();
            
            console.log('Form submitted successfully!');
        }
    });

    document.getElementById('phone').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value.length <= 3) {
                e.target.value = value;
            } else if (value.length <= 6) {
                e.target.value = '(' + value.slice(0, 3) + ') ' + value.slice(3);
            } else {
                e.target.value = '(' + value.slice(0, 3) + ') ' + value.slice(3, 6) + '-' + value.slice(6, 10);
            }
        }
    });
}

function validateForm() {
    let isValid = true;
    clearAllErrors();

    const name = document.getElementById('name').value.trim();
    if (!name || name.length < 2 || detectSpam(name)) {
        showError('nameError', 'Valid name required');
        isValid = false;
    }

    const email = document.getElementById('email').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || detectSpamEmail(email)) {
        showError('emailError', 'Valid email required');
        isValid = false;
    }

    const phone = document.getElementById('phone').value.trim();
    const phoneRegex = /^[\(\)\d\s\-\+]{10,}$/;
    if (!phone || !phoneRegex.test(phone)) {
        showError('phoneError', 'Valid phone required');
        isValid = false;
    }

    const subject = document.getElementById('subject').value.trim();
    if (!subject || subject.length < 3 || detectSpam(subject)) {
        showError('subjectError', 'Valid subject required');
        isValid = false;
    }

    const message = document.getElementById('message').value.trim();
    if (!message || message.length < 10 || detectSpam(message)) {
        showError('messageError', 'Valid message required');
        isValid = false;
    }

    const captcha = document.getElementById('captcha').value.trim();
    if (captcha !== '4') {
        showError('captchaError', 'Incorrect answer');
        isValid = false;
    }

    const agreeTerms = document.getElementById('agreeTerms').checked;
    if (!agreeTerms) {
        showError('agreeError', 'You must agree');
        isValid = false;
    }

    return isValid;
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    const inputId = elementId.replace('Error', '');
    const inputElement = document.getElementById(inputId);
    
    errorElement.textContent = message;
    if (inputElement) {
        inputElement.classList.add('error');
    }
}

function clearAllErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('input, textarea').forEach(el => el.classList.remove('error'));
}

function showSuccessMessage() {
    const successElement = document.getElementById('formSuccess');
    successElement.textContent = '✓ Thank you! Your message has been received.';
    successElement.classList.add('show');
    
    setTimeout(() => {
        successElement.classList.remove('show');
    }, 5000);
}

function detectSpam(text) {
    const spamPatterns = [
        /viagra|cialis|casino|lottery|winner/gi,
        /http|www|bitcoin/gi,
        /href=|onclick|javascript:/gi
    ];

    for (let pattern of spamPatterns) {
        if (pattern.test(text)) return true;
    }
    return false;
}

function detectSpamEmail(email) {
    const spamDomains = ['tempmail', 'throwaway', '10minutemail'];
    return spamDomains.some(domain => email.toLowerCase().includes(domain));
}

// ===== NAVIGATION & SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ===== HAMBURGER MENU =====
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.style.display = 'none';
        });
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
        }
    });
}, observerOptions);

document.querySelectorAll('.service-card, .stat, .gallery-item, .video-item').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});