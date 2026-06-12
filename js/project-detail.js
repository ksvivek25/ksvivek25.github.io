// Project Detail Page Manager
class ProjectDetailPage {
    constructor() {
        this.themeSwitch = null;
        this.root = document.documentElement;
    }

    init() {
        // Retrieve elements
        this.themeSwitch = document.querySelector('.theme-switch');

        // Apply saved theme immediately
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.root.setAttribute('data-theme', savedTheme);

        // Bind theme switch button handler
        if (this.themeSwitch) {
            this.themeSwitch.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Add visual load in delay for content
        this.revealContent();
    }

    toggleTheme() {
        const currentTheme = this.root.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        this.root.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    revealContent() {
        const elementsToFade = document.querySelectorAll('.doc-section, .media-card, .project-hero');
        elementsToFade.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(15px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 100 + 100);
        });
    }
}

// Instantiate on DOM load
document.addEventListener('DOMContentLoaded', () => {
    const page = new ProjectDetailPage();
    page.init();
});
