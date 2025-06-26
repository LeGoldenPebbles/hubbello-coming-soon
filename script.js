// Configuration
const CONFIG = {
    // For standalone deployment, use relative API path
    API_BASE_URL: window.location.origin,
    ANIMATION_DURATION: 600 // milliseconds
};

// DOM Elements
const elements = {
    heroSignupForm: null,
    heroEmailInput: null,
    heroSubmitBtn: null,
    bottomSignupForm: null,
    bottomEmailInput: null,
    bottomSubmitBtn: null,
    thankYouSection: null,
    backBtn: null,
    featureCards: null,
    thankYouModal: null,
    modalClose: null,
    cookieBanner: null,
    acceptCookies: null,
    declineCookies: null
};

// State
let isSubmitting = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    initializeEmailForm();
    initializeFeatureCards();
    initializeScrollAnimations();
    initializeCookies();
});

// Initialize DOM elements
function initializeElements() {
    elements.heroSignupForm = document.getElementById('heroSignupForm');
    elements.heroEmailInput = document.getElementById('heroEmail');
    elements.heroSubmitBtn = elements.heroSignupForm?.querySelector('.hero-submit-btn');
    elements.bottomSignupForm = document.getElementById('bottomSignupForm');
    elements.bottomEmailInput = document.getElementById('bottomEmail');
    elements.bottomSubmitBtn = elements.bottomSignupForm?.querySelector('.email-submit-btn');
    elements.thankYouSection = document.getElementById('thankYouSection');
    elements.backBtn = document.getElementById('backBtn');
    elements.featureCards = document.querySelectorAll('.feature-card');
    elements.thankYouModal = document.getElementById('thankYouModal');
    elements.modalClose = document.getElementById('modalClose');
    elements.cookieBanner = document.getElementById('cookieBanner');
    elements.acceptCookies = document.getElementById('acceptCookies');
    elements.declineCookies = document.getElementById('declineCookies');
}

// Initialize email form
function initializeEmailForm() {
    if (elements.heroSignupForm) {
        elements.heroSignupForm.addEventListener('submit', (e) => handleEmailSubmission(e, 'hero'));
        elements.heroEmailInput?.addEventListener('input', () => validateEmail('hero'));
        
        // Add single checkbox selection logic
        initializeSingleCheckboxSelection(elements.heroSignupForm);
    }
    
    if (elements.bottomSignupForm) {
        elements.bottomSignupForm.addEventListener('submit', (e) => handleEmailSubmission(e, 'bottom'));
        elements.bottomEmailInput?.addEventListener('input', () => validateEmail('bottom'));
        
        // Add single checkbox selection logic
        initializeSingleCheckboxSelection(elements.bottomSignupForm);
    }
    
    elements.backBtn?.addEventListener('click', showSignupForm);
    elements.modalClose?.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    elements.thankYouModal?.addEventListener('click', (e) => {
        if (e.target === elements.thankYouModal) {
            closeModal();
        }
    });
}

// Initialize single checkbox selection
function initializeSingleCheckboxSelection(form) {
    if (!form) return;
    
    const checkboxes = form.querySelectorAll('input[name="interests"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                // Uncheck all other checkboxes
                checkboxes.forEach(otherCheckbox => {
                    if (otherCheckbox !== this) {
                        otherCheckbox.checked = false;
                    }
                });
            }
        });
    });
}

// Handle email form submission
async function handleEmailSubmission(e, formType) {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    const email = formType === 'hero' 
        ? elements.heroEmailInput?.value?.trim()
        : elements.bottomEmailInput?.value?.trim();
    
    if (!email || !isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    // Collect interest (single selection)
    const form = formType === 'hero' ? elements.heroSignupForm : elements.bottomSignupForm;
    const checkedInterest = form?.querySelector('input[name="interests"]:checked');
    const interests = checkedInterest ? [checkedInterest.value] : [];
    
    try {
        setLoadingState(true, formType);
        await submitEmail(email, interests);
        showModal();
    } catch (error) {
        console.error('Submission error:', error);
        showError('Something went wrong. Please try again.');
    } finally {
        setLoadingState(false, formType);
    }
}

// Submit email to server
async function submitEmail(email, interests = []) {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/coming-soon/subscribe`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, interests })
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
}

// Email validation
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate email input and provide visual feedback
function validateEmail(formType) {
    const emailInput = formType === 'hero' ? elements.heroEmailInput : elements.bottomEmailInput;
    if (!emailInput) return;
    
    const email = emailInput.value.trim();
    const isValid = email === '' || isValidEmail(email);
    
    if (isValid) {
        emailInput.classList.remove('error');
    } else {
        emailInput.classList.add('error');
    }
    
    return isValid;
}

// Set loading state for form submission
function setLoadingState(loading, formType) {
    isSubmitting = loading;
    
    if (formType === 'hero') {
        if (elements.heroSubmitBtn) {
            elements.heroSubmitBtn.disabled = loading;
            const btnText = elements.heroSubmitBtn.querySelector('.btn-text');
            const btnLoading = elements.heroSubmitBtn.querySelector('.btn-loading');
            
            if (btnText && btnLoading) {
                if (loading) {
                    elements.heroSubmitBtn.classList.add('loading');
                } else {
                    elements.heroSubmitBtn.classList.remove('loading');
                }
            } else {
                elements.heroSubmitBtn.textContent = loading ? 'Submitting...' : 'Notify Me';
            }
        }
        
        if (elements.heroEmailInput) {
            elements.heroEmailInput.disabled = loading;
        }
    } else {
        if (elements.bottomSubmitBtn) {
            elements.bottomSubmitBtn.disabled = loading;
            const btnText = elements.bottomSubmitBtn.querySelector('.btn-text');
            const btnLoading = elements.bottomSubmitBtn.querySelector('.btn-loading');
            
            if (btnText && btnLoading) {
                if (loading) {
                    elements.bottomSubmitBtn.classList.add('loading');
                } else {
                    elements.bottomSubmitBtn.classList.remove('loading');
                }
            } else {
                elements.bottomSubmitBtn.textContent = loading ? 'Submitting...' : 'Join Waitlist';
            }
        }
        
        if (elements.bottomEmailInput) {
            elements.bottomEmailInput.disabled = loading;
        }
    }
}

function showThankYou(formType) {
    if (!elements.thankYouSection) return;

    // Hide features section and email signup section and show thank you
    const featuresSection = document.querySelector('.features-section');
    const emailSignupSection = document.querySelector('.email-signup-section');
    
    if (featuresSection) {
        featuresSection.style.opacity = '0';
        featuresSection.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            featuresSection.style.display = 'none';
        }, 300);
    }
    
    if (emailSignupSection) {
        emailSignupSection.style.opacity = '0';
        emailSignupSection.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            emailSignupSection.style.display = 'none';
        }, 300);
    }
    
    setTimeout(() => {
        elements.thankYouSection.classList.remove('hidden');
        elements.thankYouSection.style.opacity = '1';
        elements.thankYouSection.style.transform = 'translateY(0)';
        
        // Scroll to thank you section
        elements.thankYouSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }, 400);
}

function showSignupForm() {
    if (!elements.thankYouSection) return;

    elements.thankYouSection.classList.add('hidden');
    
    // Show features section and email signup section again
    const featuresSection = document.querySelector('.features-section');
    const emailSignupSection = document.querySelector('.email-signup-section');
    
    if (featuresSection) {
        featuresSection.style.display = 'block';
        setTimeout(() => {
            featuresSection.style.opacity = '1';
            featuresSection.style.transform = 'translateY(0)';
        }, 100);
    }
    
    if (emailSignupSection) {
        emailSignupSection.style.display = 'block';
        setTimeout(() => {
            emailSignupSection.style.opacity = '1';
            emailSignupSection.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Reset form values
    if (elements.heroEmailInput) {
        elements.heroEmailInput.value = '';
    }
    if (elements.bottomEmailInput) {
        elements.bottomEmailInput.value = '';
    }
    
    // Focus email input and scroll to hero
    setTimeout(() => {
        elements.heroEmailInput?.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
}

// Show modal
function showModal() {
    if (!elements.thankYouModal) return;
    
    elements.thankYouModal.classList.remove('hidden');
    elements.thankYouModal.style.zIndex = '1002'; // Ensure it's above cookie modal
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

// Close modal
function closeModal() {
    if (!elements.thankYouModal) return;
    
    elements.thankYouModal.classList.add('hidden');
    document.body.style.overflow = ''; // Restore scrolling
    
    // Reset forms
    if (elements.heroEmailInput) {
        elements.heroEmailInput.value = '';
    }
    if (elements.bottomEmailInput) {
        elements.bottomEmailInput.value = '';
    }
    
    // Reset checkboxes
    const allCheckboxes = document.querySelectorAll('input[name="interests"]');
    allCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}

// Initialize feature cards with stagger animation
function initializeFeatureCards() {
    if (!elements.featureCards) return;
    
    // Add stagger animation on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.featureCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });
}

function showError(message) {
    // Create error element if it doesn't exist
    let errorElement = document.getElementById('emailError');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = 'emailError';
        errorElement.className = 'error-message';
        elements.heroSignupForm?.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    errorElement.style.opacity = '1';
    
    // Add error styling to input
    elements.heroEmailInput?.classList.add('error');
    
    // Remove error after 5 seconds
    setTimeout(() => {
        if (errorElement) {
            errorElement.style.opacity = '0';
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 300);
        }
        elements.heroEmailInput?.classList.remove('error');
    }, 5000);
    
    // Focus on email input
    elements.heroEmailInput?.focus();
}

// Scroll animations
function initializeScrollAnimations() {
    // Add scroll-based animations for various elements
    const animateOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -20px 0px'
    });
    
    // Apply to floating elements
    document.querySelectorAll('.floating-element').forEach(el => {
        animateOnScroll.observe(el);
    });
    
    // Apply to footer
    const footer = document.querySelector('footer');
    if (footer) {
        animateOnScroll.observe(footer);
    }
    
    // Apply to floating icons for enhanced animation
    document.querySelectorAll('.floating-icon').forEach(el => {
        animateOnScroll.observe(el);
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Preload critical images
function preloadImages() {
    const images = [
        'logo.png'
    ];
    
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Initialize preloading
preloadImages();

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

// Handle visibility change for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, pause any animations if needed
    } else {
        // Page is visible again
    }
});

// Cookie Management Functions
function initializeCookies() {
    // Check if user has already made a cookie choice
    const cookieConsent = getCookie('cookieConsent');
    
    if (!cookieConsent) {
        // Show cookie banner after a short delay
        setTimeout(() => {
            showCookieBanner();
        }, 2000);
    }
    
    // Set up event listeners
    elements.acceptCookies?.addEventListener('click', acceptCookies);
    elements.declineCookies?.addEventListener('click', declineCookies);
}

function showCookieBanner() {
    if (elements.cookieBanner) {
        elements.cookieBanner.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function hideCookieBanner() {
    if (elements.cookieBanner) {
        elements.cookieBanner.classList.add('hidden');
        document.body.style.overflow = ''; // Restore scrolling
    }
}

function acceptCookies() {
    setCookie('cookieConsent', 'accepted', 365);
    hideCookieBanner();
    
    // Enable analytics or other tracking here
    console.log('Cookies accepted - analytics can be enabled');
}

function declineCookies() {
    setCookie('cookieConsent', 'declined', 365);
    hideCookieBanner();
    
    // Disable any tracking
    console.log('Cookies declined - only essential cookies will be used');
}

// Cookie utility functions
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
} 