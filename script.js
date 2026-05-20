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
        // Update active filter
        galleryFilters.forEach(f => f.classList.remove('active'));
        filter.classList.add('active');

        const filterValue = filter.getAttribute('data-filter');

        // Filter gallery items
        galleryItems.forEach(item => {
            if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                item.classList.remove('hidden');
                item.style.animation = 'fadeInUp 0.6s ease forwards';
            } else {
                item.classList.add('hidden');
            }
        });
    });
});

// Lightbox functionality
galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        const img = item.querySelector('.gallery-image img');
        const title = item.querySelector('h3').textContent;

        lightboxImage.src = img.src;
        lightboxCaption.textContent = title;
        lightbox.classList.add('active');

        // Store filtered images for navigation
        filteredImages = Array.from(document.querySelectorAll('.gallery-item:not(.hidden)'));
        currentImageIndex = filteredImages.indexOf(item);
    });
});

lightboxClose.addEventListener('click', () => {
    lightbox.classList.remove('active');
});

lightboxPrev.addEventListener('click', () => {
    currentImageIndex = (currentImageIndex - 1 + filteredImages.length) % filteredImages.length;
    updateLightboxImage();
});

lightboxNext.addEventListener('click', () => {
    currentImageIndex = (currentImageIndex + 1) % filteredImages.length;
    updateLightboxImage();
});

function updateLightboxImage() {
    const item = filteredImages[currentImageIndex];
    const img = item.querySelector('.gallery-image img');
    const title = item.querySelector('h3').textContent;

    lightboxImage.src = img.src;
    lightboxCaption.textContent = title;
}

// Close lightbox when clicking outside image
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        lightbox.classList.remove('active');
    }
});

// Keyboard navigation for lightbox
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
            // Form is valid - in production, you would send this to a backend
            showSuccessMessage();
            contactForm.reset();
            
            // Simulate form submission
            console.log('Form submitted successfully!');
            console.log({
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            });
        }
    });

    // Auto-format phone number
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

    // Name validation
    const name = document.getElementById('name').value.trim();
    if (!name) {
        showError('nameError', 'Name is required');
        isValid = false;
    } else if (name.length < 2) {
        showError('nameError', 'Name must be at least 2 characters');
        isValid = false;
    } else if (detectSpam(name)) {
        showError('nameError', 'Name contains invalid content');
        isValid = false;
    }

    // Email validation
    const email = document.getElementById('email').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        showError('emailError', 'Email is required');
        isValid = false;
    } else if (!emailRegex.test(email)) {
        showError('emailError', 'Please enter a valid email address');
        isValid = false;
    } else if (detectSpamEmail(email)) {
        showError('emailError', 'Email appears to be spam');
        isValid = false;
    }

    // Phone validation
    const phone = document.getElementById('phone').value.trim();
    const phoneRegex = /^[\(\)\d\s\-\+]{10,}$/;
    if (!phone) {
        showError('phoneError', 'Phone number is required');
        isValid = false;
    } else if (!phoneRegex.test(phone)) {
        showError('phoneError', 'Please enter a valid phone number');
        isValid = false;
    }

    // Subject validation
    const subject = document.getElementById('subject').value.trim();
    if (!subject) {
        showError('subjectError', 'Subject is required');
        isValid = false;
    } else if (subject.length < 3) {
        showError('subjectError', 'Subject must be at least 3 characters');
        isValid = false;
    } else if (detectSpam(subject)) {
        showError('subjectError', 'Subject contains invalid content');
        isValid = false;
    }

    // Message validation
    const message = document.getElementById('message').value.trim();
    if (!message) {
        showError('messageError', 'Message is required');
        isValid = false;
    } else if (message.length < 10) {
        showError('messageError', 'Message must be at least 10 characters');
        isValid = false;
    } else if (detectSpam(message)) {
        showError('messageError', 'Message contains suspicious content');
        isValid = false;
    }

    // CAPTCHA validation
    const captcha = document.getElementById('captcha').value.trim();
    if (!captcha) {
        showError('captchaError', 'Security check required');
        isValid = false;
    } else if (captcha !== '4') {
        showError('captchaError', 'Incorrect answer. Please try again.');
        isValid = false;
    }

    // Agreement validation
    const agreeTerms = document.getElementById('agreeTerms').checked;
    if (!agreeTerms) {
        showError('agreeError', 'You must agree to be contacted');
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
    const errorElements = document.querySelectorAll('.error-message');
    const inputElements = document.querySelectorAll('input, textarea');
    
    errorElements.forEach(el => el.textContent = '');
    inputElements.forEach(el => el.classList.remove('error'));
}

function showSuccessMessage() {
    const successElement = document.getElementById('formSuccess');
    successElement.textContent = '✓ Thank you! Your message has been received. We will contact you soon!';
    successElement.classList.add('show');
    
    setTimeout(() => {
        successElement.classList.remove('show');
    }, 5000);
}

// ===== SPAM DETECTION =====
function detectSpam(text) {
    // Common spam patterns
    const spamPatterns = [
        /viagra|cialis|casino|lottery|winner|congratulations|claim.*prize/gi,
        /click.*here|buy.*now|limited.*time|act.*now/gi,
        /http|www|\.com|\.net|\.org/gi,
        /\$\d+|bitcoin|crypto/gi,
        /href=|onclick|javascript:/gi
    ];

    // Check for excessive special characters
    const specialCharCount = (text.match(/[!@#$%^&*()_\-+=\[\]{}';:"<>,.?/\\|`~]/g) || []).length;
    if (specialCharCount > text.length * 0.3) {
        return true;
    }

    // Check against spam patterns
    for (let pattern of spamPatterns) {
        if (pattern.test(text)) {
            return true;
        }
    }

    return false;
}

function detectSpamEmail(email) {
    // Common spam email domains
    const spamDomains = ['tempmail', 'throwaway', '10minutemail', 'guerrillamail', 'mailinator'];
    
    for (let domain of spamDomains) {
        if (email.toLowerCase().includes(domain)) {
            return true;
        }
    }

    return false;
}

// ===== NAVIGATION & SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// Active nav link on scroll
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section[id]');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ===== RESPONSIVE HAMBURGER MENU =====
const hamburger = document.querySelector('.hamburger');
const navLinksMenu = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinksMenu.style.display = navLinksMenu.style.display === 'flex' ? 'none' : 'flex';
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinksMenu.style.display = 'none';
        });
    });
}

// Intersection Observer for fade-in animations
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
    
