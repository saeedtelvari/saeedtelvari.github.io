$(document).ready(function() {
    $(window).on('scroll', function() {
        if (Math.round($(window).scrollTop()) > 100) {
            $('.navbar').addClass('scrolled');
        } else {
            $('.navbar').removeClass('scrolled');
        }
    });
});

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.navtop');
    const overlay = document.querySelector('.mobile-nav-overlay');
    const navLinks = document.querySelectorAll('.navtop .item a');
    
    // Toggle mobile menu
    function toggleMenu() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    }
    
    // Close menu when clicking hamburger
    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
    }
    
    // Close menu when clicking overlay
    if (overlay) {
        overlay.addEventListener('click', toggleMenu);
    }
    
    // Close menu when clicking a nav link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    });
    
    // Close menu on window resize (if going to desktop)
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
            toggleMenu();
        }
    });
    
    // Handle escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            toggleMenu();
        }
    });
});