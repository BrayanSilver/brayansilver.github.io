/**
 * @file I18nService.js
 * @description Toggle EN / PT-BR e aplicação de textos estáticos.
 */

import { TRANSLATIONS } from './translations.js';

const STORAGE_KEY = 'portfolio-lang';
const DEFAULT_LOCALE = 'en';

/** @type {I18nService|null} */
let sharedInstance = null;

/** @returns {I18nService} */
export function getI18n() {
  if (!sharedInstance) {
    sharedInstance = new I18nService();
    sharedInstance.init();
  }
  return sharedInstance;
}

export class I18nService {
  /** @type {'en'|'pt'} */
  #locale = DEFAULT_LOCALE;

  /** @returns {'en'|'pt'} */
  getLocale() {
    return this.#locale;
  }

  init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'pt' || saved === 'en') this.#locale = saved;
    document.documentElement.lang = this.#locale === 'pt' ? 'pt-BR' : 'en';
    this.#applyDom();
    this.#bindToggle();
  }

  /**
   * @param {string} key
   * @returns {string}
   */
  t(key) {
    return TRANSLATIONS[this.#locale][key] ?? TRANSLATIONS.en[key] ?? key;
  }

  /**
   * @param {string} categoryId
   * @returns {string}
   */
  categoryLabel(categoryId) {
    return this.t(`categories.${categoryId}`);
  }

  onChange(callback) {
    window.addEventListener('portfolio:langchange', callback);
  }

  #bindToggle() {
    document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => this.#toggle());
    });
    this.#updateToggleButtons();
  }

  #toggle() {
    this.#locale = this.#locale === 'en' ? 'pt' : 'en';
    localStorage.setItem(STORAGE_KEY, this.#locale);
    document.documentElement.lang = this.#locale === 'pt' ? 'pt-BR' : 'en';
    this.#applyDom();
    this.#updateToggleButtons();
    window.dispatchEvent(new CustomEvent('portfolio:langchange', { detail: { locale: this.#locale } }));
  }

  #updateToggleButtons() {
    document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
      btn.textContent = this.t('lang.switch');
      btn.setAttribute('aria-label', this.t('lang.aria'));
    });
  }

  #applyDom() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      el.textContent = this.t(key);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) el.setAttribute('placeholder', this.t(key));
    });
  }
}
