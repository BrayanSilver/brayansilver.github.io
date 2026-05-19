/**
 * @file ExperienceView.js
 * @description View da timeline de experiência profissional.
 */

import { $, setHTML } from '../utils/dom.js';
import { SELECTORS } from '../config/constants.js';

export class ExperienceView {
  /**
   * @param {Array<{role: string, company: string, period: string, description: string}>} experience
   */
  render(experience) {
    const section = $('#experience');
    if (!experience || experience.length === 0) {
      if (section) section.style.display = 'none';
      return;
    }

    if (section) section.style.display = '';

    setHTML(
      SELECTORS.experienceTimeline,
      experience
        .map(
          (exp, i) => `
        <article class="timeline-item reveal" data-delay="${i * 120}">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <span class="timeline-period">${exp.period}</span>
            <h3 class="timeline-role">${exp.role}</h3>
            <p class="timeline-company">${exp.company}${exp.location ? ` · ${exp.location}` : ''}</p>
            <p class="timeline-desc">${exp.description}</p>
          </div>
        </article>
      `
        )
        .join('')
    );
  }
}
