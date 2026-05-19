/**
 * @file PortfolioModel.js
 * @description Modelo agregado do portfólio — personalInfo, projects e contact.
 */

import { Project } from './ProjectModel.js';
import { DEFAULTS } from '../config/constants.js';

/**
 * Estado central do portfólio após carregamento dos JSONs.
 */
export class PortfolioModel {
  /**
   * @param {Object} data
   * @param {Object} data.personalInfo
   * @param {Project[]} data.projects
   * @param {Object} data.contact
   * @param {Object} data.rawProjects - JSON bruto dos projetos (para modal)
   */
  constructor({ personalInfo, projects, contact, rawProjects }) {
    this.personalInfo = { ...DEFAULTS.personalInfo, ...personalInfo };
    this.projects = projects;
    this.contact = { ...DEFAULTS.contact, ...contact };
    this.rawProjects = rawProjects;
  }

  /**
   * Factory com dados padrão em caso de erro.
   * @returns {PortfolioModel}
   */
  static empty() {
    return new PortfolioModel({
      personalInfo: DEFAULTS.personalInfo,
      projects: [],
      contact: DEFAULTS.contact,
      rawProjects: { projetos: [] },
    });
  }

  /**
   * Monta o modelo a partir das respostas fetch.
   * @param {Object} personalInfo
   * @param {Object} rawProjects - { projetos: ProjectRaw[] }
   * @param {Object} contact
   * @param {Project[]} projects
   * @returns {PortfolioModel}
   */
  static create(personalInfo, rawProjects, contact, projects) {
    return new PortfolioModel({
      personalInfo,
      projects,
      contact,
      rawProjects,
    });
  }

  /** Número de projetos para estatísticas dinâmicas */
  get projectCount() {
    return this.projects.length;
  }
}

export { Project };
