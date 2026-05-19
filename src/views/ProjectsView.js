/**
 * @file ProjectsView.js
 * @description View do grid de projetos com cards interativos.
 */

import { setHTML } from '../utils/dom.js';
import { SELECTORS, PROJECT_OVERLAY_CLASSES } from '../config/constants.js';
import { isGameProject, isExternalUrl } from '../utils/helpers.js';

export class ProjectsView {
  /**
   * @param {import('../models/ProjectModel.js').Project[]} projects
   * @param {(index: number) => void} onOpenModal
   */
  render(projects, onOpenModal) {
    if (!projects.length) {
      setHTML(SELECTORS.projectsGrid, `
        <div class="empty-state reveal">
          <p>No projects available at the moment.</p>
        </div>
      `);
      return;
    }

    setHTML(
      SELECTORS.projectsGrid,
      projects.map((project, index) => this.#cardHTML(project, index, onOpenModal)).join('')
    );

    this.#bindCardEvents(projects, onOpenModal);
  }

  /**
   * @param {import('../models/ProjectModel.js').Project} project
   * @param {number} index
   * @param {(index: number) => void} onOpenModal
   */
  #cardHTML(project, index, onOpenModal) {
    const overlay = PROJECT_OVERLAY_CLASSES[index % PROJECT_OVERLAY_CLASSES.length];
    const featured = index < 2 ? 'project-card--featured' : '';
    const firstImage = project.images[0];
    const isGame = isGameProject(project);
    const openDirect = project.isInteractive || project.isExternal;

    const media = firstImage
      ? `<div class="project-image">
          <img src="${firstImage}" alt="${project.title}" loading="lazy">
          <div class="project-overlay ${overlay}"></div>
          <div class="project-number">${String(index + 1).padStart(2, '0')}</div>
        </div>`
      : `<div class="project-image project-image--empty">
          <span>📁</span>
          <div class="project-overlay ${overlay}"></div>
          <div class="project-number">${String(index + 1).padStart(2, '0')}</div>
        </div>`;

    const techHTML = project.techList
      .map((t) => `<span class="tech-tag">${t}</span>`)
      .join('');

    let linkText = '';
    if (project.link) {
      if (isGame) linkText = '🎮 Play';
      else if (isExternalUrl(project.link)) linkText = 'View project';
      else linkText = 'Open demo';
    } else if (project.hasImages) linkText = '📷 View gallery';

    const dataAction = openDirect
      ? `data-link="${project.link}"`
      : project.hasImages
        ? `data-modal="${index}"`
        : '';

    return `
      <article class="project-card reveal ${featured}" ${dataAction} data-delay="${index * 80}">
        ${media}
        <div class="project-content">
          <h3 class="project-title">${project.title}</h3>
          <p class="project-description">${project.description}</p>
          ${techHTML ? `<div class="tech-tags">${techHTML}</div>` : ''}
          <div class="project-links">
            ${project.link ? `
              <a href="${project.link}" target="_blank" rel="noopener" class="project-link">
                ${linkText}
                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 17L17 7M17 7H7M17 7V17"/></svg>
              </a>` : project.hasImages ? `
              <button type="button" class="project-link project-link--btn" data-modal-btn="${index}">
                ${linkText}
                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </button>` : ''}
            ${project.github ? `
              <a href="${project.github}" target="_blank" rel="noopener" class="project-link project-link--ghost">
                GitHub
              </a>` : ''}
          </div>
        </div>
      </article>
    `;
  }

  /**
   * @param {import('../models/ProjectModel.js').Project[]} projects
   * @param {(index: number) => void} onOpenModal
   */
  #bindCardEvents(projects, onOpenModal) {
    document.querySelectorAll('.project-card[data-link]').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        window.open(card.dataset.link, '_blank');
      });
    });

    document.querySelectorAll('.project-card[data-modal]').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('a, button')) return;
        onOpenModal(parseInt(card.dataset.modal, 10));
      });
    });

    document.querySelectorAll('[data-modal-btn]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        onOpenModal(parseInt(btn.dataset.modalBtn, 10));
      });
    });
  }
}
