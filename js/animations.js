// Simplified animations without conflicts

document.addEventListener('DOMContentLoaded', function() {
    
    // Basic scroll animations
    function handleScrollAnimations() {
        const elements = document.querySelectorAll('.scroll-fade');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        elements.forEach(el => observer.observe(el));
    }
    
    // Enhanced card hover effects - disabled to avoid conflicts with slider
    function enhanceCards() {
        // Disabled - CSS handles card hover effects
        return;
    }
    
    // Smooth scrolling for anchor links
    function addSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', function(e) {
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
    }
    
    // Add entrance animation to page content (disabled for CV page)
    function addPageAnimation() {
        // Skip animation on CV page
        if (document.querySelector('.glass-morphism-page')) return;
        
        const main = document.querySelector('main');
        if (main) {
            main.style.opacity = '0';
            main.style.transform = 'translateY(20px)';
            main.style.transition = 'all 0.6s ease-out';
            
            setTimeout(() => {
                main.style.opacity = '1';
                main.style.transform = 'translateY(0)';
            }, 100);
        }
    }
    
    // Add CSS for scroll animations
    const style = document.createElement('style');
    style.textContent = `
        .scroll-fade {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease-out;
        }
        
        .scroll-fade.visible {
            opacity: 1;
            transform: translateY(0);
        }
        
        .card {
            transition: all 0.3s ease !important;
        }
        
        .card:hover {
            box-shadow: 0 10px 30px rgba(0,0,0,0.3) !important;
        }
        
        button:hover {
            transform: translateY(-2px);
            transition: all 0.3s ease;
        }
        
        .nav .btn:hover {
            background-color: rgba(255,255,255,0.8) !important;
            transform: scale(1.1);
        }
    `;
    document.head.appendChild(style);
    
    // Initialize functions
    handleScrollAnimations();
    enhanceCards();
    addSmoothScrolling();
    addPageAnimation();
    
    // Add scroll-fade class to sections that need it
    const sections = document.querySelectorAll('.divider + div, .glass-morphism-RI, .projects, .honors');
    sections.forEach(section => {
        section.classList.add('scroll-fade');
    });
});

// Simple loading overlay (disabled to prevent issues)
window.addEventListener('load', function() {
    // Page load animation disabled
});