/**
 * @file StatsView.js
 * @description View dos contadores animados (estilo portfólios premium).
 */

import { $, setHTML } from '../utils/dom.js';
import { SELECTORS } from '../config/constants.js';
import { animateCounter } from '../utils/helpers.js';

export class StatsView {
  /**
   * @param {Object} personalInfo
   * @param {number} projectCount
   */
  render(personalInfo, projectCount) {
    const stats = [...(personalInfo.stats || [])];

    // Atualiza contagem de projetos dinamicamente (PT ou EN)
    const projectStat = stats.find((s) => {
      const label = s.label.toLowerCase();
      return label.includes('projeto') || label.includes('project');
    });
    if (projectStat) projectStat.value = projectCount;
    else if (projectCount > 0) {
      stats.unshift({ label: 'Projects', value: projectCount, suffix: '+' });
    }

    if (stats.length === 0) {
      setHTML(SELECTORS.statsGrid, '');
      return;
    }

    setHTML(
      SELECTORS.statsGrid,
      stats
        .map(
          (s, i) => `
        <div class="stat-card reveal" data-delay="${i * 100}">
          <div class="stat-number">
            <span class="stat-value" data-target="${s.value}">0</span><span class="stat-suffix">${s.suffix || ''}</span>
          </div>
          <span class="stat-label">${s.label}</span>
        </div>
      `
        )
        .join('')
    );

    this.#observeAndAnimate();
  }

  /** Anima contadores quando entram na viewport */
  #observeAndAnimate() {
    const cards = document.querySelectorAll('.stat-card .stat-value[data-target]');
    if (!cards.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.dataset.target, 10) || 0;
          animateCounter(el, target);
          observer.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    cards.forEach((el) => observer.observe(el));
  }
}
