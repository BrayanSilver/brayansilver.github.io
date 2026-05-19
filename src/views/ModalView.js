/**
 * @file ModalView.js
 * @description View do modal de projeto com carrossel de imagens.
 */

import { createElement } from '../utils/dom.js';

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
    this.#modal.innerHTML = this.#template(projeto, images);
    document.body.appendChild(this.#modal);

    this.#modal.addEventListener('click', (e) => {
      if (e.target === this.#modal) this.close();
    });

    this.#bindCarousel();
    this.#keyboardHandler = (e) => this.#onKeydown(e);
    document.addEventListener('keydown', this.#keyboardHandler);
    this.#updateSlide();
  }

  close() {
    if (this.#keyboardHandler) {
      document.removeEventListener('keydown', this.#keyboardHandler);
      this.#keyboardHandler = null;
    }
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
    const tech = projeto.tecnologias
      ? projeto.tecnologias.split(',').map((t) => `<span class="tech-tag">${t.trim()}</span>`).join('')
      : '';

    const carousel = images.length
      ? `
        <div class="carousel-container">
          <div class="carousel-wrapper" id="carouselWrapper">
            <div class="carousel-track" id="carouselTrack">
              ${images.map((img, i) => `
                <div class="carousel-slide ${i === 0 ? 'active' : ''}">
                  <img src="${img}" alt="${projeto.titulo} — ${i + 1}" class="carousel-image" loading="lazy">
                </div>
              `).join('')}
            </div>
            ${images.length > 1 ? `
              <button class="carousel-btn carousel-prev" data-dir="-1" aria-label="Anterior">‹</button>
              <button class="carousel-btn carousel-next" data-dir="1" aria-label="Próximo">›</button>
              <div class="carousel-indicators">
                ${images.map((_, i) => `<button class="carousel-indicator ${i === 0 ? 'active' : ''}" data-slide="${i}"></button>`).join('')}
              </div>
            ` : ''}
          </div>
        </div>`
      : '';

    return `
      <div class="modal-content modal-project">
        <div class="modal-header">
          <h2>${projeto.titulo || 'Projeto'}</h2>
          <button class="modal-close" data-close aria-label="Fechar">&times;</button>
        </div>
        <div class="modal-body">
          ${projeto.descricao ? `<p class="modal-desc">${projeto.descricao}</p>` : ''}
          ${tech ? `<div class="tech-tags">${tech}</div>` : ''}
          ${carousel}
          <div class="modal-actions">
            ${projeto.link ? `<a href="${projeto.link}" target="_blank" rel="noopener" class="btn-primary">View Project</a>` : ''}
            ${projeto.github ? `<a href="${projeto.github}" target="_blank" rel="noopener" class="btn-secondary">GitHub</a>` : ''}
          </div>
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
    wrapper.addEventListener('touchstart', (e) => { startX = e.changedTouches[0].screenX; });
    wrapper.addEventListener('touchend', (e) => {
      const diff = startX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) {
        this.#currentIndex += diff > 0 ? 1 : -1;
        this.#wrapIndex();
        this.#updateSlide();
      }
    });
  }

  #wrapIndex() {
    const len = this.#images.length;
    if (this.#currentIndex < 0) this.#currentIndex = len - 1;
    if (this.#currentIndex >= len) this.#currentIndex = 0;
  }

  #updateSlide() {
    const track = document.getElementById('carouselTrack');
    if (track) track.style.transform = `translateX(-${this.#currentIndex * 100}%)`;

    this.#modal?.querySelectorAll('.carousel-slide').forEach((s, i) => {
      s.classList.toggle('active', i === this.#currentIndex);
    });
    this.#modal?.querySelectorAll('.carousel-indicator').forEach((ind, i) => {
      ind.classList.toggle('active', i === this.#currentIndex);
    });
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
