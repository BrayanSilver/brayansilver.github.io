/**
 * @file HeroView.js
 * @description View da seção Hero — título, subtítulo e efeito de digitação.
 */

import { $, setHTML } from '../utils/dom.js';
import { SELECTORS } from '../config/constants.js';

export class HeroView {
  /** @type {number|null} */
  #typingInterval = null;

  /**
   * Renderiza o hero com dados do modelo.
   * @param {Object} personalInfo
   */
  render(personalInfo) {
    const titleEl = $(SELECTORS.heroTitle);
    const descEl = $(SELECTORS.heroDescription);

    if (titleEl && personalInfo.heroTitle) {
      titleEl.innerHTML = `
        <span class="hero-line">
          <span class="glow-text">${personalInfo.heroTitle}</span>
        </span>
        <span class="hero-line hero-line--accent">
          <span class="gradient-text" id="heroTyping"></span>
          <span class="cursor-blink">|</span>
        </span>
      `;
    }

    if (descEl && personalInfo.heroSubtitle) {
      descEl.textContent = personalInfo.heroSubtitle;
    }

    const roles = personalInfo.heroRoles || ['Full Stack', 'Frontend', 'Backend'];
    this.#startTyping(roles);
  }

  /**
   * Efeito typewriter nas roles do desenvolvedor.
   * @param {string[]} roles
   */
  #startTyping(roles) {
    const el = $('#heroTyping');
    if (!el || roles.length === 0) return;

    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const tick = () => {
      const current = roles[roleIndex];
      el.textContent = deleting
        ? current.substring(0, charIndex - 1)
        : current.substring(0, charIndex + 1);

      if (!deleting) charIndex++;
      else charIndex--;

      if (!deleting && charIndex === current.length + 1) {
        deleting = true;
        setTimeout(tick, 2000);
        return;
      }

      if (deleting && charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
      }

      const speed = deleting ? 50 : 100;
      this.#typingInterval = setTimeout(tick, speed);
    };

    if (this.#typingInterval) clearTimeout(this.#typingInterval);
    tick();
  }

  destroy() {
    if (this.#typingInterval) clearTimeout(this.#typingInterval);
  }
}
