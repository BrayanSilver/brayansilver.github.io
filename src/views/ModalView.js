/**
 * @file ModalView.js
 * @description Modal moderno de projeto — galeria + painel de detalhes.
 */

import { createElement } from '../utils/dom.js';
import { getI18n } from '../i18n/I18nService.js';

export class ModalView {
  /** @type {HTMLElement|null} */
  #modal = null;

  /** @type {number} */
  #currentIndex = 0;

  /** @type {string[]} */
  #images = [];

  /** @type {(e: KeyboardEvent) => void|null} */
  #keyboardHandler = null;

  /**
   * Abre o modal com dados do projeto.
   * @param {Object} projeto - Dados brutos do JSON
   * @param {string[]} images - URLs resolvidas
   */
  open(projeto, images) {
    this.close();
    this.#images = images;
    this.#currentIndex = 0;

    this.#modal = createElement('div', { className: 'modal active', id: 'projectViewModal' });
    this.#modal.setAttribute('role', 'dialog');
    this.#modal.setAttribute('aria-modal', 'true');
    this.#modal.setAttribute('aria-labelledby', 'modalProjectTitle');
    this.#modal.innerHTML = this.#template(projeto, images);
    document.body.appendChild(this.#modal);
    document.body.classList.add('modal-open');

    this.#modal.addEventListener('click', (e) => {
      if (e.target === this.#modal || e.target?.dataset?.overlay !== undefined) this.close();
    });

    this.#bindCarousel();
    this.#keyboardHandler = (e) => this.#onKeydown(e);
    document.addEventListener('keydown', this.#keyboardHandler);
    this.#updateSlide();

    // Foco no fechar para acessibilidade
    this.#modal.querySelector('[data-close]')?.focus();
  }

  close() {
    if (this.#keyboardHandler) {
      document.removeEventListener('keydown', this.#keyboardHandler);
      this.#keyboardHandler = null;
    }
    document.body.classList.remove('modal-open');
    this.#modal?.remove();
    this.#modal = null;
    this.#images = [];
    this.#currentIndex = 0;
  }

  /**
   * @param {Object} projeto
   * @param {string[]} images
   */
  #template(projeto, images) {
    const i18n = getI18n();
    const techList = projeto.tecnologias
      ? projeto.tecnologias.split(',').map((t) => t.trim()).filter(Boolean)
      : [];
    const tech = techList.map((t) => `<span class="tech-tag">${t}</span>`).join('');

    const hasGallery = images.length > 0;
    const counter = images.length > 1
      ? `<span class="modal-media-counter" aria-live="polite">
           <span data-slide-current>1</span> / ${images.length}
         </span>`
      : '';

    const gallery = hasGallery
      ? `
        <div class="modal-media">
          <div class="carousel-container">
            <div class="carousel-wrapper" id="carouselWrapper">
              <div class="carousel-track" id="carouselTrack">
                ${images.map((img, i) => `
                  <div class="carousel-slide ${i === 0 ? 'active' : ''}">
                    <img src="${img}" alt="${projeto.titulo || 'Project'} — ${i + 1}" class="carousel-image" loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async" width="1280" height="720">
                  </div>
                `).join('')}
              </div>
              ${images.length > 1 ? `
                <button type="button" class="carousel-btn carousel-prev" data-dir="-1" aria-label="${i18n.t('modal.prev')}">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <button type="button" class="carousel-btn carousel-next" data-dir="1" aria-label="${i18n.t('modal.next')}">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              ` : ''}
            </div>
            ${images.length > 1 ? `
              <div class="modal-media-footer">
                ${counter}
                <div class="carousel-indicators">
                  ${images.map((_, i) => `<button type="button" class="carousel-indicator ${i === 0 ? 'active' : ''}" data-slide="${i}" aria-label="${i18n.t('modal.next')} ${i + 1}"></button>`).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>`
      : `
        <div class="modal-media modal-media--empty" aria-hidden="true">
          <div class="modal-media-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
        </div>`;

    return `
      <div class="modal-backdrop" data-overlay></div>
      <div class="modal-content modal-project ${hasGallery ? '' : 'modal-project--no-media'}">
        <button type="button" class="modal-close" data-close aria-label="${i18n.t('modal.close')}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        <div class="modal-shell">
          ${gallery}

          <aside class="modal-panel">
            <div class="modal-panel-scroll">
              <p class="modal-kicker">${i18n.t('modal.caseStudy')}</p>
              <h2 id="modalProjectTitle" class="modal-title">${projeto.titulo || 'Projeto'}</h2>
              ${tech ? `
                <div class="modal-stack">
                  <span class="modal-stack-label">${i18n.t('modal.stack')}</span>
                  <div class="tech-tags">${tech}</div>
                </div>
              ` : ''}
              ${projeto.descricao ? `<p class="modal-desc">${projeto.descricao}</p>` : ''}
            </div>

            <div class="modal-actions">
              ${projeto.link ? `<a href="${projeto.link}" target="_blank" rel="noopener" class="btn-primary modal-action-btn">${i18n.t('modal.viewProject')}</a>` : ''}
              ${projeto.github ? `<a href="${projeto.github}" target="_blank" rel="noopener" class="btn-secondary modal-action-btn">${i18n.t('projects.github')}</a>` : ''}
            </div>
          </aside>
        </div>
      </div>
    `;
  }

  #bindCarousel() {
    if (!this.#modal) return;

    this.#modal.querySelector('[data-close]')?.addEventListener('click', () => this.close());

    this.#modal.querySelectorAll('[data-dir]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.#currentIndex += parseInt(btn.dataset.dir, 10);
        this.#wrapIndex();
        this.#updateSlide();
      });
    });

    this.#modal.querySelectorAll('[data-slide]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.#currentIndex = parseInt(btn.dataset.slide, 10);
        this.#updateSlide();
      });
    });

    const wrapper = this.#modal.querySelector('#carouselWrapper');
    if (!wrapper || this.#images.length <= 1) return;

    let startX = 0;
    wrapper.addEventListener('touchstart', (e) => { startX = e.changedTouches[0].screenX; }, { passive: true });
    wrapper.addEventListener('touchend', (e) => {
      const diff = startX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) {
        this.#currentIndex += diff > 0 ? 1 : -1;
        this.#wrapIndex();
        this.#updateSlide();
      }
    }, { passive: true });
  }

  #wrapIndex() {
    const len = this.#images.length;
    if (this.#currentIndex < 0) this.#currentIndex = len - 1;
    if (this.#currentIndex >= len) this.#currentIndex = 0;
  }

  #updateSlide() {
    const track = this.#modal?.querySelector('#carouselTrack');
    if (track) track.style.transform = `translateX(-${this.#currentIndex * 100}%)`;

    this.#modal?.querySelectorAll('.carousel-slide').forEach((s, i) => {
      s.classList.toggle('active', i === this.#currentIndex);
    });
    this.#modal?.querySelectorAll('.carousel-indicator').forEach((ind, i) => {
      ind.classList.toggle('active', i === this.#currentIndex);
    });

    const current = this.#modal?.querySelector('[data-slide-current]');
    if (current) current.textContent = String(this.#currentIndex + 1);
  }

  /**
   * @param {KeyboardEvent} e
   */
  #onKeydown(e) {
    if (e.key === 'Escape') this.close();
    if (e.key === 'ArrowLeft') { this.#currentIndex--; this.#wrapIndex(); this.#updateSlide(); }
    if (e.key === 'ArrowRight') { this.#currentIndex++; this.#wrapIndex(); this.#updateSlide(); }
  }
}
