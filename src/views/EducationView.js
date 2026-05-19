/**
 * @file EducationView.js
 * @description Renders academic background timeline.
 */

import { $, setHTML } from '../utils/dom.js';
import { SELECTORS } from '../config/constants.js';

export class EducationView {
  /**
   * @param {Array<{degree: string, school: string, period: string, description: string}>} education
   */
  render(education) {
    const section = $('#education');
    if (!education?.length) {
      if (section) section.style.display = 'none';
      return;
    }

    if (section) section.style.display = '';

    setHTML(
      SELECTORS.educationTimeline,
      education
        .map(
          (edu, i) => `
        <article class="timeline-item reveal" data-delay="${i * 120}">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <span class="timeline-period">${edu.period}</span>
            <h3 class="timeline-role">${edu.degree}</h3>
            <p class="timeline-company">${edu.school}</p>
            <p class="timeline-desc">${edu.description}</p>
          </div>
        </article>
      `
        )
        .join('')
    );
  }
}
