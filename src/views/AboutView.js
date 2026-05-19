/**
 * @file AboutView.js
 * @description View da seção Sobre — bio e foto de perfil.
 */

import { $, setHTML } from '../utils/dom.js';
import { SELECTORS } from '../config/constants.js';
import { splitParagraphs } from '../utils/helpers.js';

export class AboutView {
  /**
   * @param {DataService} dataService
   */
  constructor(dataService) {
    this.dataService = dataService;
  }

  /**
   * @param {Object} personalInfo
   */
  async render(personalInfo) {
    this.#renderBio(personalInfo.about);
    await this.#renderPhoto(personalInfo.foto);
  }

  /**
   * @param {string} about
   */
  #renderBio(about) {
    const paragraphs = splitParagraphs(about);

    if (paragraphs.length === 0) {
      setHTML(SELECTORS.aboutContent, `
        <div class="loading-spinner-container">
          <div class="loading-spinner"></div>
        </div>
      `);
      return;
    }

    setHTML(
      SELECTORS.aboutContent,
      paragraphs.map((p) => `<p class="about-paragraph">${p}</p>`).join('')
    );
  }

  /**
   * @param {string} [photoName]
   */
  async #renderPhoto(photoName) {
    const wrapper = $(SELECTORS.aboutImage);
    if (!wrapper) return;

    const photoPath = await this.dataService.resolveProfilePhoto(photoName);

    if (photoPath) {
      wrapper.innerHTML = `
        <img src="${photoPath}" alt="Foto de perfil — Dev Brayan" loading="lazy" class="about-photo">
      `;
    } else {
      wrapper.innerHTML = `
        <div class="about-photo-placeholder" aria-hidden="true">
          <span>👨‍💻</span>
        </div>
      `;
    }
  }
}
