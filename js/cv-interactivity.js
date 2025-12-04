// Simplified CV interactivity without conflicts

document.addEventListener('DOMContentLoaded', function() {
    
    // Only run if we're on the CV page
    if (!document.querySelector('.glass-morphism-page')) return;
    
    // Ensure CV page is visible
    const main = document.getElementById('main');
    const page = document.querySelector('.glass-morphism-page');
    if (main) {
        main.style.display = 'block';
        main.style.visibility = 'visible';
        main.style.opacity = '1';
    }
    if (page) {
        page.style.display = 'block';
        page.style.visibility = 'visible';
        page.style.opacity = '1';
    }
    
    // Add simple hover effects to education rows
    function enhanceEducationRows() {
        const rows = document.querySelectorAll('.row');
        rows.forEach((row, index) => {
            row.style.transition = 'all 0.3s ease';
            
            row.addEventListener('mouseenter', function() {
                this.style.backgroundColor = 'rgba(0, 123, 255, 0.05)';
                this.style.borderRadius = '8px';
                this.style.padding = '10px';
            });
            
            row.addEventListener('mouseleave', function() {
                this.style.backgroundColor = 'transparent';
                this.style.padding = '0';
            });
        });
    }
    
    // Add hover effects to publications
    function enhancePublications() {
        const publications = document.querySelectorAll('.publications ul');
        publications.forEach(pub => {
            pub.style.transition = 'all 0.3s ease';
            pub.style.padding = '10px';
            pub.style.borderRadius = '8px';
            
            pub.addEventListener('mouseenter', function() {
                this.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
                this.style.transform = 'translateX(10px)';
            });
            
            pub.addEventListener('mouseleave', function() {
                this.style.backgroundColor = 'transparent';
                this.style.transform = 'translateX(0)';
            });
        });
    }
    
    // Skill bars removed per user request
    function addSkillBars() {
        // Progress bars disabled
        return;
    }
    
    // Add click to expand functionality for projects
    function enhanceProjects() {
        const projects = document.querySelectorAll('.projects ul');
        projects.forEach(project => {
            project.style.cursor = 'pointer';
            project.style.transition = 'all 0.3s ease';
            
            project.addEventListener('click', function() {
                const details = this.querySelectorAll('ul li');
                const isExpanded = this.classList.contains('expanded');
                
                if (isExpanded) {
                    this.classList.remove('expanded');
                    details.forEach(detail => {
                        detail.style.opacity = '0.7';
                        detail.style.transform = 'translateX(0)';
                    });
                } else {
                    this.classList.add('expanded');
                    details.forEach((detail, i) => {
                        setTimeout(() => {
                            detail.style.opacity = '1';
                            detail.style.transform = 'translateX(20px)';
                            detail.style.transition = 'all 0.3s ease';
                        }, i * 100);
                    });
                }
            });
        });
    }
    
    // Initialize all enhancements
    try {
        enhanceEducationRows();
        enhancePublications();
        addSkillBars();
        enhanceProjects();
    } catch (error) {
        console.log('CV enhancements partially loaded');
    }
});

// Add simple CSS for CV enhancements
const cvStyle = document.createElement('style');
cvStyle.textContent = `
    .projects ul:hover {
        background: rgba(0, 123, 255, 0.05);
        border-radius: 8px;
        padding: 10px;
    }
    
    .projects ul.expanded {
        background: rgba(0, 123, 255, 0.1);
        border-left: 3px solid #007bff;
    }
    
    .degree:hover {
        color: #007bff;
        transform: scale(1.02);
        transition: all 0.3s ease;
    }
    
    @media (max-width: 768px) {
        .projects ul {
            font-size: 0.9rem;
        }
    }
`;

if (document.head) {
    document.head.appendChild(cvStyle);
}