---
title: Portfolio Website
date: January 2026
category: Front-End Engineering
status: Active Development
tags:
  - Vanilla JavaScript
  - CSS3 Custom Variables
  - JSON Config Loader
  - GitHub REST API
video: example-video.mp4
video_description: Showcase demonstrating the dynamic theme loader and configuration reloading.
image: ../assets/projects/Placeholder.png
image_description: Mobile Responsive Layout Mockup
specs:
  - Load Time (FCP)|~150ms
  - CSS Architecture|Vanilla CSS Variable Modules
  - Routing Protocol|Static Relational Subpages
  - SEO Rating|100/100 (Google Lighthouse)
---

## Project Overview
This project was initiated to build a modular portfolio generator that separates content from layout. Traditional static portfolios require modifying core HTML/CSS structures to add projects or modify details. This engine utilizes a centralized configuration file allowing users to update their profile by editing simple data blocks.

> **Key Insight:** Separating database-like configuration from view controllers makes portfolios highly portable, maintainable, and prevents merge conflicts during rapid updates.

## System Architecture
The application follows a simple Model-View-Controller style structure entirely implemented in client-side modules:

* **Configuration Loader:** Fetches and parses `config.json` asynchronously.
* **Section Controller:** Dynamically generates DOM blocks for project, experience, and skill nodes.
* **SEO Engine:** Dynamically rewrites title and meta properties, injects Schema.org compliant JSON-LD markup on load.
* **GitHub Connector:** Connects to the GitHub REST API to fetch and render projects with the `featured` topic tag.

## Code Implementation
Below is a snippet demonstrating how theme switching is managed globally and synced with the user's system preferences:

```javascript
// Dynamic Theme Manager implementation snippet
toggleTheme() {
    const currentTheme = this.root.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    this.root.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}
```

## Future Enhancements
Currently, plans are underway to include:

1. Integrations with CI/CD GitHub Actions for automated bundle validation.
2. Interactive timeline controls for professional experience animations.
3. Automated visual regression tests in headless environments.
