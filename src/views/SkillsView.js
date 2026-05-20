/**
 * @file SkillsView.js
 * @description View das seções de Hard Skills e Soft Skills.
 */

import { setHTML } from '../utils/dom.js';
import { SELECTORS } from '../config/constants.js';

export class SkillsView {
  /**
   * @param {Object} data - { hard, soft } or skills object
   * @param {string[]} [certifications]
   */
  render(data, certifications = []) {
    const skills = data?.hard ? data : { hard: [], soft: [] };
    const { hard = [], soft = [] } = skills;

    setHTML(
      SELECTORS.skillsHard,
      hard.map((skill, i) => this.#skillPill(skill, i)).join('')
    );

    setHTML(
      SELECTORS.skillsSoft,
      soft.map((skill, i) => this.#skillPill(skill, i, 'soft')).join('')
    );

    const certEl = document.querySelector(SELECTORS.certificationsList);
    if (certEl) {
      certEl.innerHTML = (certifications || [])
        .map(
          (cert, i) => `
        <span class="skill-pill skill-pill--cert reveal" data-delay="${i * 40}" translate="no">${cert}</span>
      `
        )
        .join('');
    }
  }

  /**
   * @param {string} skill
   * @param {number} index
   * @param {'hard'|'soft'} type
   */
  #skillPill(skill, index, type = 'hard') {
    return `
      <span class="skill-pill skill-pill--${type} reveal" data-delay="${index * 40}" translate="no">
        ${skill}
      </span>
    `;
  }
}
