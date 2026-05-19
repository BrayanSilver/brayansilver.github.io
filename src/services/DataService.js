/**
 * @file DataService.js
 * @description Camada de serviço — responsável por buscar e transformar dados JSON.
 */

import { API_PATHS, DEFAULTS } from '../config/constants.js';
import { PortfolioModel, Project } from '../models/PortfolioModel.js';

/**
 * Serviço de acesso a dados do portfólio (simula uma API REST via fetch).
 */
export class DataService {
  /**
   * Carrega todos os dados do portfólio em paralelo.
   * @returns {Promise<PortfolioModel>}
   */
  async loadPortfolio() {
    try {
      const [personalInfo, rawProjects, contact] = await Promise.all([
        this.#fetchJson(API_PATHS.personalInfo, DEFAULTS.personalInfo),
        this.#fetchJson(API_PATHS.projects, { projetos: [] }),
        this.#fetchJson(API_PATHS.contact, DEFAULTS.contact),
      ]);

      const projects = await this.#resolveProjects(rawProjects.projetos || []);

      return PortfolioModel.create(personalInfo, rawProjects, contact, projects);
    } catch (error) {
      console.error('[DataService] Erro ao carregar portfólio:', error);
      return PortfolioModel.empty();
    }
  }

  /**
   * Busca um arquivo JSON com fallback.
   * @param {string} path
   * @param {Object} fallback
   * @returns {Promise<Object>}
   */
  async #fetchJson(path, fallback) {
    const response = await fetch(path);
    if (!response.ok) return fallback;
    return response.json();
  }

  /**
   * Resolve URLs de imagens para cada projeto.
   * @param {import('../models/ProjectModel.js').ProjectRaw[]} rawList
   * @returns {Promise<Project[]>}
   */
  async #resolveProjects(rawList) {
    const projects = [];

    for (let i = 0; i < rawList.length; i++) {
      const raw = rawList[i];
      const images = await this.#resolveImages(raw);
      projects.push(Project.fromRaw(raw, images, i));
    }

    return projects;
  }

  /**
   * @param {Object} projeto
   * @returns {Promise<string[]>}
   */
  async #resolveImages(projeto) {
    const images = [];

    for (const imgName of projeto.imagens || []) {
      if (imgName.startsWith('http://') || imgName.startsWith('https://')) {
        images.push(imgName);
        continue;
      }

      const imgPath = `upload/${projeto.pasta}/${imgName}`;
      try {
        const res = await fetch(imgPath, { method: 'HEAD' });
        if (res.ok) images.push(imgPath);
      } catch {
        /* imagem não encontrada — ignorar */
      }
    }

    return images;
  }

  /**
   * Carrega foto pessoal — retorna o caminho válido ou null.
   * @param {string} [photoName]
   * @returns {Promise<string|null>}
   */
  async resolveProfilePhoto(photoName) {
    if (photoName) {
      const path = `${API_PATHS.photoFolder}${photoName}`;
      try {
        const res = await fetch(path, { method: 'HEAD' });
        if (res.ok) return path;
      } catch { /* fallback */ }
    }

    const fallbacks = [
      'foto.jpg', 'foto.png', 'foto.jpeg',
      'image.jpg', 'image.png', 'image.jpeg',
      'brayan.jpg',
    ];

    for (const name of fallbacks) {
      const path = `${API_PATHS.photoFolder}${name}`;
      try {
        const res = await fetch(path, { method: 'HEAD' });
        if (res.ok) return path;
      } catch { /* próximo */ }
    }

    return null;
  }
}
