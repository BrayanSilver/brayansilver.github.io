/**
 * @file AboutView.js
 * @description View da seção Sobre — bio e foto de perfil.
 */

import { $, setHTML } from '../utils/dom.js';
import { SELECTORS } from '../config/constants.js';
import { splitParagraphs } from '../utils/helpers.js';
import { getI18n } from '../i18n/I18nService.js';

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
    this.#renderPhoto(personalInfo.foto);
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
  #renderPhoto(photoName) {
    const wrapper = $(SELECTORS.aboutImage);
    if (!wrapper) return;

    const photoPath = this.dataService.resolveProfilePhoto(photoName);

    wrapper.innerHTML = `
      <img src="${photoPath}" alt="${getI18n().t('about.photoAlt')}" loading="lazy" decoding="async" fetchpriority="low" width="640" height="800" class="about-photo">
    `;

    const img = wrapper.querySelector('.about-photo');
    img?.addEventListener('error', () => {
      if (photoPath.endsWith('.webp')) {
        img.src = photoPath.replace(/\.webp$/i, '.jpg');
        return;
      }
      img.remove();
    });
  }
}
