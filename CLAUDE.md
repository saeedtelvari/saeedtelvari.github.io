# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website for Sa'eed Telvari, hosted on GitHub Pages. The site showcases his background as a petroleum engineering graduate student with expertise in machine learning, reservoir simulation, and image processing.

## Architecture

The website is a static Jekyll site with the following structure:
- **Main pages**: `index.html` (homepage with card slider), `cv.html` (curriculum vitae)
- **Styling**: CSS files in `css/` directory, with `master.css` for the main homepage slider interface and `cv.css` for the CV page
- **JavaScript**: Interactive elements in `js/` directory, primarily `home.js` for the card slider functionality
- **Assets**: Images stored in `img/` directory including backgrounds, logos, and project images
- **Configuration**: `_config.yml` for Jekyll configuration (theme: jekyll-theme-cayman)

## Key Components

### Card Slider Interface (index.html)
- Interactive card slider showcasing different aspects (Contact, Programming, ML, Reservoir Engineering, Energy Storage, Image Processing)  
- Uses CSS transforms and JavaScript for smooth animations
- Navigation with prev/next arrows using Ionicons

### CV Page (cv.html)
- Structured academic CV with sections for education, publications, projects, skills
- Accordion-style expandable sections for programming skills
- Glass morphism design aesthetic

### Styling System
- Bootstrap 5.2.0 for responsive layout
- Custom CSS for card animations and glass morphism effects
- Font Awesome icons for social media and UI elements
- Google Fonts integration (Sofia, Montserrat, Open Sans, Arizonia)

## Development Notes

### Jekyll Configuration
- Uses GitHub Pages compatible Jekyll theme (cayman)
- Site title: "Sa'eed Telvari"  
- Description: "My Personal Website"

### No Build System
- This is a static site with no package.json or build process
- Files are served directly as written
- CSS uses some modern features (CSS nesting in master.css)

### Deployment
- Hosted on GitHub Pages
- Automatic deployment from main branch
- Domain: saeedtelvari.github.io