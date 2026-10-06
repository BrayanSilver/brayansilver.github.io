/**
 * @file DataService.js
 * @description Camada de serviço — responsável por buscar e transformar dados JSON.
 */

import { API_PATHS, DEFAULTS, personalInfoPath, projectsPath } from '../config/constants.js';
import { PortfolioModel, Project } from '../models/PortfolioModel.js';

/** Bump when JSON/assets change to bust CDN/browser cache without Date.now() */
const DATA_VERSION = '20261005f';

/**
 * Serviço de acesso a dados do portfólio (simula uma API REST via fetch).
 */
export class DataService {
  /**
   * @param {'en'|'pt'} [locale]
   */
  async loadPortfolio(locale = 'en') {
    try {
      const [personalInfo, rawProjects, contact] = await Promise.all([
        this.#fetchJson(personalInfoPath(locale), DEFAULTS.personalInfo),
        this.#fetchJson(projectsPath(locale), { projetos: [] }),
        this.#fetchJson(API_PATHS.contact, DEFAULTS.contact),
      ]);

      const projects = this.#resolveProjects(rawProjects.projetos || []);

      return PortfolioModel.create(personalInfo, rawProjects, contact, projects);
    } catch (error) {
      console.error('[DataService] Erro ao carregar portfólio:', error);
      return PortfolioModel.empty();
    }
  }

  /**
   * @param {string} path
   * @param {Object} fallback
   * @returns {Promise<Object>}
   */
  async #fetchJson(path, fallback) {
    const response = await fetch(`${path}?v=${DATA_VERSION}`, {
      cache: 'force-cache',
    });
    if (!response.ok) return fallback;
    return response.json();
  }

  /**
   * Resolve paths de imagem sem HEAD (assets pré-processados / confiáveis).
   * @param {import('../models/ProjectModel.js').ProjectRaw[]} rawList
   * @returns {Project[]}
   */
  #resolveProjects(rawList) {
    return rawList.map((raw, i) => Project.fromRaw(raw, this.#resolveImages(raw), i));
  }

  /**
   * @param {Object} projeto
   * @returns {string[]}
   */
  #resolveImages(projeto) {
    const images = [];

    for (const imgName of projeto.imagens || []) {
      if (!imgName) continue;
      if (imgName.startsWith('http://') || imgName.startsWith('https://')) {
        images.push(imgName);
        continue;
      }
      // Prefer explicit name; normalize legacy png/jpg → webp if listed as such already in JSON
      images.push(`upload/${projeto.pasta}/${imgName}`);
    }

    return images;
  }

  /**
   * Foto de perfil — path síncrono (sem HEAD waterfall).
   * @param {string} [photoName]
   * @returns {string}
   */
  resolveProfilePhoto(photoName) {
    if (photoName) {
      const name = /\.(jpe?g|png)$/i.test(photoName)
        ? photoName.replace(/\.(jpe?g|png)$/i, '.webp')
        : photoName;
      return `${API_PATHS.photoFolder}${name}`;
    }
    return `${API_PATHS.photoFolder}brayan.webp`;
  }
}
