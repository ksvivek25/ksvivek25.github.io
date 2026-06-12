// Project Detail Page Manager
class ProjectDetailPage {
    constructor() {
        this.themeSwitch = null;
        this.root = document.documentElement;
    }

    async init() {
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

        // Fetch and render the Markdown content
        await this.loadProjectMarkdown();
    }

    toggleTheme() {
        const currentTheme = this.root.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        this.root.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    async loadProjectMarkdown() {
        try {
            // Determine the markdown filename from the current HTML pathname
            const path = window.location.pathname;
            const fileName = path.substring(path.lastIndexOf('/') + 1);
            let baseName = fileName;
            
            if (baseName.endsWith('.html')) {
                baseName = baseName.replace('.html', '');
            }
            if (!baseName) {
                baseName = 'portfolio-website'; // Fallback
            }
            
            const mdUrl = `./${baseName}.md`;
            
            const response = await fetch(mdUrl);
            if (!response.ok) {
                throw new Error(`Failed to load ${mdUrl} (status: ${response.status})`);
            }
            
            const rawText = await response.text();
            const { metadata, body } = this.parseFrontMatter(rawText);
            
            this.renderPageContent(metadata, body);
        } catch (error) {
            console.error('Error loading project documentation:', error);
            this.renderErrorState(error.message);
        }
    }

    parseFrontMatter(text) {
        const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
        if (!match) return { metadata: {}, body: text };

        const rawYaml = match[1];
        const body = text.substring(match[0].length);
        const metadata = {};
        const lines = rawYaml.split(/\r?\n/);
        
        let currentKey = null;

        for (const line of lines) {
            if (!line.trim()) continue;
            
            // Check if it's a list item (starts with space(s) and -)
            const listItemMatch = line.match(/^\s*-\s*(.*)$/);
            if (listItemMatch && currentKey) {
                if (!Array.isArray(metadata[currentKey])) {
                    metadata[currentKey] = [];
                }
                const itemText = listItemMatch[1].trim();
                if (itemText.includes('|')) {
                    const parts = itemText.split('|');
                    metadata[currentKey].push({
                        name: parts[0].trim(),
                        value: parts[1].trim()
                    });
                } else {
                    metadata[currentKey].push(itemText);
                }
                continue;
            }

            // Check if it's a key-value pair
            const colonIndex = line.indexOf(':');
            if (colonIndex !== -1) {
                const key = line.slice(0, colonIndex).trim();
                const value = line.slice(colonIndex + 1).trim();
                currentKey = key;
                if (value) {
                    if (value.startsWith('"') && value.endsWith('"')) {
                        metadata[key] = value.slice(1, -1);
                    } else if (value.startsWith("'") && value.endsWith("'")) {
                        metadata[key] = value.slice(1, -1);
                    } else {
                        metadata[key] = value;
                    }
                } else {
                    metadata[key] = null;
                }
            }
        }
        
        return { metadata, body };
    }

    renderPageContent(metadata, body) {
        // 1. Title & Head
        if (metadata.title) {
            document.title = `${metadata.title} - Case Study`;
            const titleEl = document.getElementById('project-title');
            if (titleEl) titleEl.textContent = metadata.title;
        }

        // 2. Metadata badges
        const metaEl = document.getElementById('project-meta');
        if (metaEl) {
            let metaHtml = '';
            if (metadata.date) metaHtml += `<span class="project-meta-badge">📅 ${metadata.date}</span>`;
            if (metadata.category) metaHtml += `<span class="project-meta-badge">💻 ${metadata.category}</span>`;
            if (metadata.status) metaHtml += `<span class="project-meta-badge">🛠️ ${metadata.status}</span>`;
            metaEl.innerHTML = metaHtml;
        }

        // 3. Project Summary
        const summaryEl = document.getElementById('project-summary');
        if (summaryEl) {
            summaryEl.textContent = metadata.summary || metadata.description || '';
        }

        // 4. Technology Stack Tags
        const tagsEl = document.getElementById('project-tags');
        if (tagsEl) {
            let tagsHtml = '';
            if (Array.isArray(metadata.tags)) {
                tagsHtml = metadata.tags.map(tag => `<span class="tech-badge">${tag}</span>`).join('');
            } else if (metadata.tags) {
                tagsHtml = metadata.tags.split(',').map(tag => `<span class="tech-badge">${tag.trim()}</span>`).join('');
            }
            tagsEl.innerHTML = tagsHtml;
        }

        // 5. Render Main Body (Markdown -> HTML)
        let htmlContent = '';
        if (window.marked && window.marked.parse) {
            htmlContent = window.marked.parse(body);
        } else {
            // Basic fallback parser if offline / marked is not loaded
            htmlContent = body
                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .split('\n\n')
                .map(p => p.trim().startsWith('<h') || p.trim().startsWith('<block') ? p : `<p>${p}</p>`)
                .join('\n');
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const bodyEl = doc.body;

        // Map blockquotes to highlight-panels
        doc.querySelectorAll('blockquote').forEach(bq => {
            bq.className = 'highlight-panel';
        });

        const projectBody = document.getElementById('project-body');
        if (projectBody) {
            projectBody.innerHTML = ''; // Clear loading
            
            let currentSection = null;
            
            // Group elements dynamically under .doc-section containers
            while (bodyEl.firstChild) {
                const child = bodyEl.firstChild;
                if (child.tagName === 'H2') {
                    currentSection = document.createElement('section');
                    currentSection.className = 'doc-section';
                    currentSection.setAttribute('aria-label', child.textContent);
                    projectBody.appendChild(currentSection);
                }
                
                if (currentSection) {
                    currentSection.appendChild(child);
                } else {
                    // For any elements before the first H2
                    const wrapper = document.createElement('section');
                    wrapper.className = 'doc-section';
                    wrapper.appendChild(child);
                    projectBody.appendChild(wrapper);
                    currentSection = wrapper;
                }
            }
        }

        // 6. Sidebar (Media Showcase)
        const sidebar = document.getElementById('project-sidebar');
        if (sidebar) {
            if (!metadata.video && !metadata.image && (!metadata.specs || metadata.specs.length === 0)) {
                sidebar.style.display = 'none';
                const detailsGrid = document.querySelector('.project-details-grid');
                if (detailsGrid) {
                    detailsGrid.style.gridTemplateColumns = '1fr';
                }
            } else {
                sidebar.innerHTML = ''; // Clear loading

                // Video block
                if (metadata.video) {
                    const videoCard = document.createElement('div');
                    videoCard.className = 'media-card';
                    
                    const isYoutube = metadata.video.includes('youtube.com') || metadata.video.includes('youtu.be');
                    const videoHtml = isYoutube
                        ? `<iframe src="${this.getYouTubeEmbedUrl(metadata.video)}" title="YouTube video player" allowfullscreen></iframe>`
                        : `<video controls poster="${metadata.video_poster || '../assets/projects/Placeholder.png'}">
                               <source src="${metadata.video}" type="video/mp4">
                               Your browser does not support the video tag.
                           </video>`;
                           
                    videoCard.innerHTML = `
                        <h3>${isYoutube ? 'Video Demonstration' : 'Simulation Demo'}</h3>
                        <div class="video-wrapper">
                            ${videoHtml}
                        </div>
                        ${metadata.video_description ? `<p style="margin-top: 0.75rem; font-size: 0.9rem; color: var(--text-muted);"><em>${metadata.video_description}</em></p>` : ''}
                    `;
                    sidebar.appendChild(videoCard);
                }

                // Image Showcase block
                if (metadata.image) {
                    const imageCard = document.createElement('div');
                    imageCard.className = 'media-card';
                    imageCard.innerHTML = `
                        <h3>${metadata.image_title || 'Visual Showcase'}</h3>
                        <div class="media-placeholder image-aspect">
                            <img src="${metadata.image}" alt="${metadata.image_description || 'Project image'}">
                        </div>
                        ${metadata.image_description ? `<p style="margin-top: 0.75rem; font-size: 0.9rem; color: var(--text-muted);"><em>${metadata.image_description}</em></p>` : ''}
                    `;
                    sidebar.appendChild(imageCard);
                }

                // Table Specs block
                if (metadata.specs && metadata.specs.length > 0) {
                    const specsCard = document.createElement('div');
                    specsCard.className = 'media-card';
                    
                    let tableRows = '';
                    metadata.specs.forEach(spec => {
                        if (typeof spec === 'object' && spec.name && spec.value) {
                            tableRows += `
                                <tr>
                                    <td>${spec.name}</td>
                                    <td>${spec.value}</td>
                                </tr>
                            `;
                        }
                    });
                    
                    specsCard.innerHTML = `
                        <h3>${metadata.specs_title || 'Project Specifications'}</h3>
                        <table class="spec-table">
                            <thead>
                                <tr>
                                    <th>Parameter</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRows}
                            </tbody>
                        </table>
                    `;
                    sidebar.appendChild(specsCard);
                }
            }
        }

        // Reveal dynamic elements
        this.revealContent();
    }

    getYouTubeEmbedUrl(url) {
        let videoId = '';
        if (url.includes('youtube.com/watch')) {
            const urlParams = new URLSearchParams(new URL(url).search);
            videoId = urlParams.get('v');
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('youtube.com/embed/')) {
            return url;
        }
        return `https://www.youtube.com/embed/${videoId}`;
    }

    renderErrorState(message) {
        const titleEl = document.getElementById('project-title');
        if (titleEl) titleEl.textContent = 'Failed to Load Project';

        const projectBody = document.getElementById('project-body');
        if (projectBody) {
            projectBody.innerHTML = `
                <section class="doc-section">
                    <h2>Error Occurred</h2>
                    <p>We couldn't load the documentation for this project. This is likely because the Markdown file does not exist or has a formatting issue.</p>
                    <div class="highlight-panel">
                        <p><strong>Technical Error:</strong> ${message}</p>
                    </div>
                </section>
            `;
        }

        const sidebar = document.getElementById('project-sidebar');
        if (sidebar) sidebar.style.display = 'none';
        
        const detailsGrid = document.querySelector('.project-details-grid');
        if (detailsGrid) detailsGrid.style.gridTemplateColumns = '1fr';

        this.revealContent();
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
