/**
 * @file ProjectsView.js
 * @description View de projetos — 2 destaques no topo + carrosséis por categoria.
 */

import { setHTML } from '../utils/dom.js';
import { SELECTORS, PROJECT_OVERLAY_CLASSES } from '../config/constants.js';
import { isGameProject, isExternalUrl } from '../utils/helpers.js';
import { PROJECT_CATEGORIES, groupProjectsByCategory } from '../utils/projectCategories.js';
import { getI18n } from '../i18n/I18nService.js';

const FEATURED_COUNT = 2;

export class ProjectsView {
  /**
   * @param {import('../models/ProjectModel.js').Project[]} projects
   * @param {(index: number) => void} onOpenModal
   */
  render(projects, onOpenModal) {
    const i18n = getI18n();
    if (!projects.length) {
      setHTML(SELECTORS.projectsGrid, `
        <div class="empty-state reveal">
          <p>${i18n.t('projects.empty')}</p>
        </div>
      `);
      return;
    }

    const featured = projects.slice(0, FEATURED_COUNT);
    const rest = projects.slice(FEATURED_COUNT);
    const grouped = groupProjectsByCategory(rest);

    const categoriesHTML = PROJECT_CATEGORIES.map((cat) => {
      const items = grouped.get(cat.id) || [];
      if (!items.length) return '';
      return this.#carouselSection(i18n.categoryLabel(cat.id), items, onOpenModal);
    }).join('');

    setHTML(
      SELECTORS.projectsGrid,
      `
      <div class="projects-layout">
        <div class="projects-featured">
          ${featured.map((p) => this.#cardHTML(p, onOpenModal, 'featured')).join('')}
        </div>
        <div class="projects-categories">
          ${categoriesHTML}
        </div>
      </div>
    `
    );

    this.#bindCardEvents(projects, onOpenModal);
    this.#initCarousels();
    window.dispatchEvent(new CustomEvent('portfolio:rendered'));
  }

  /**
   * @param {string} label
   * @param {import('../models/ProjectModel.js').Project[]} items
   * @param {(index: number) => void} onOpenModal
   */
  #carouselSection(label, items, onOpenModal) {
    const i18n = getI18n();
    const cards = items
      .map((p) => this.#cardHTML(p, onOpenModal, 'carousel'))
      .join('');

    return `
      <section class="project-category reveal">
        <div class="carousel-header">
          <h3 class="project-category-title">${label}</h3>
        </div>
        <div class="project-carousel" data-carousel>
          <div class="carousel-viewport">
            <div class="carousel-track">${cards}</div>
          </div>
          <button type="button" class="carousel-btn carousel-btn--prev" data-carousel-prev aria-label="${i18n.t('projects.prev')}">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <button type="button" class="carousel-btn carousel-btn--next" data-carousel-next aria-label="${i18n.t('projects.next')}">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </section>
    `;
  }

  /**
   * @param {import('../models/ProjectModel.js').Project} project
   * @param {(index: number) => void} onOpenModal
   * @param {'featured'|'carousel'} variant
   */
  #cardHTML(project, onOpenModal, variant) {
    const i18n = getI18n();
    const index = project.index;
    const overlay = PROJECT_OVERLAY_CLASSES[index % PROJECT_OVERLAY_CLASSES.length];
    const featuredClass = variant === 'featured' ? 'project-card--featured' : 'project-card--carousel';
    const firstImage = project.images[0];
    const isGame = isGameProject(project);
    const openDirect = project.isInteractive || project.isExternal;

    const media = firstImage
      ? `<div class="project-image">
          <img src="${firstImage}" alt="${project.title}" loading="lazy" decoding="async">
          <div class="project-overlay ${overlay}"></div>
          <div class="project-number">${String(index + 1).padStart(2, '0')}</div>
        </div>`
      : `<div class="project-image project-image--empty">
          <span>📁</span>
          <div class="project-overlay ${overlay}"></div>
          <div class="project-number">${String(index + 1).padStart(2, '0')}</div>
        </div>`;

    const techHTML = project.techList
      .slice(0, variant === 'carousel' ? 4 : undefined)
      .map((t) => `<span class="tech-tag">${t}</span>`)
      .join('');

    const moreTech =
      variant === 'carousel' && project.techList.length > 4
        ? `<span class="tech-tag tech-tag--more">+${project.techList.length - 4}</span>`
        : '';

    let linkText = '';
    if (project.link) {
      if (isGame) linkText = '🎮 Play';
      else if (isExternalUrl(project.link)) linkText = 'View project';
      else linkText = i18n.t('projects.openDemo');
    } else if (project.hasImages) linkText = `📷 ${i18n.t('projects.gallery')}`;

    const dataAction = openDirect
      ? `data-link="${project.link}"`
      : project.hasImages
        ? `data-modal="${index}"`
        : '';

    const descClass =
      variant === 'carousel' ? 'project-description project-description--compact' : 'project-description';

    return `
      <article class="project-card reveal ${featuredClass}" ${dataAction} data-delay="${(index % 6) * 60}">
        ${media}
        <div class="project-content">
          <h3 class="project-title">${project.title}</h3>
          <p class="${descClass}">${project.description}</p>
          ${techHTML ? `<div class="tech-tags">${techHTML}${moreTech}</div>` : ''}
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
                ${i18n.t('projects.github')}
              </a>` : ''}
          </div>
        </div>
      </article>
    `;
  }

  #initCarousels() {
    document.querySelectorAll('[data-carousel]').forEach((carousel) => {
      const viewport = carousel.querySelector('.carousel-viewport');
      const track = carousel.querySelector('.carousel-track');
      const prev = carousel.querySelector('[data-carousel-prev]');
      const next = carousel.querySelector('[data-carousel-next]');
      if (!viewport || !track || !prev || !next) return;

      const scrollStep = () => {
        const card = track.querySelector('.project-card--carousel');
        const gap = parseFloat(getComputedStyle(track).gap) || 16;
        return (card?.offsetWidth || 300) + gap;
      };

      const maxScrollLeft = () =>
        Math.max(0, viewport.scrollWidth - viewport.clientWidth);

      const updateButtons = () => {
        const max = maxScrollLeft();
        const canScroll = max > 1;
        const atStart = viewport.scrollLeft <= 1;
        const atEnd = viewport.scrollLeft >= max - 1;

        prev.toggleAttribute('disabled', canScroll && atStart);
        next.toggleAttribute('disabled', canScroll && atEnd);
        prev.classList.toggle('carousel-btn--inactive', canScroll && atStart);
        next.classList.toggle('carousel-btn--inactive', canScroll && atEnd);
      };

      prev.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        viewport.scrollBy({ left: -scrollStep(), behavior: 'smooth' });
      });

      next.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        viewport.scrollBy({ left: scrollStep(), behavior: 'smooth' });
      });

      viewport.addEventListener('scroll', updateButtons, { passive: true });
      window.addEventListener('resize', updateButtons, { passive: true });

      requestAnimationFrame(() => {
        updateButtons();
        setTimeout(updateButtons, 150);
      });
    });
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
