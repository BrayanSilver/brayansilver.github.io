/**
 * @file I18nService.js
 * @description Toggle EN / PT-BR e aplicação de textos estáticos.
 */

import { TRANSLATIONS } from './translations.js';
import { LANG_TOGGLE_INNER } from '../utils/langToggleMarkup.js';

const STORAGE_KEY = 'portfolio-lang';
const DEFAULT_LOCALE = 'pt';

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
      if (!btn.querySelector('[data-lang-option]')) {
        btn.innerHTML = LANG_TOGGLE_INNER;
      }
      btn.addEventListener('click', (e) => {
        const option = e.target.closest('[data-lang-option]');
        if (option?.dataset.langOption === 'pt') this.#setLocale('pt');
        else if (option?.dataset.langOption === 'en') this.#setLocale('en');
        else this.#toggle();
      });
    });
    this.#updateToggleButtons();
  }

  /** @param {'en'|'pt'} locale */
  #setLocale(locale) {
    if (this.#locale === locale) return;
    this.#locale = locale;
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale === 'pt' ? 'pt-BR' : 'en';
    this.#applyDom();
    this.#updateToggleButtons();
    window.dispatchEvent(new CustomEvent('portfolio:langchange', { detail: { locale } }));
  }

  #toggle() {
    this.#setLocale(this.#locale === 'en' ? 'pt' : 'en');
  }

  #updateToggleButtons() {
    const isPt = this.#locale === 'pt';
    document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
      btn.setAttribute('aria-label', this.t('lang.aria'));
      btn.querySelector('[data-lang-option="pt"]')?.classList.toggle('is-active', isPt);
      btn.querySelector('[data-lang-option="en"]')?.classList.toggle('is-active', !isPt);
    });
  }

  #applyDom() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      if (el.closest('[data-lang-toggle]')) return;
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
