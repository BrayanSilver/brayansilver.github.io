/**
 * @file ProjectModel.js
 * @description Modelo de dados para um projeto do portfólio.
 */

import { isExternalUrl } from '../utils/helpers.js';

/**
 * @typedef {Object} ProjectRaw
 * @property {number} id
 * @property {string} pasta
 * @property {string} titulo
 * @property {string} descricao
 * @property {string} tecnologias
 * @property {string} link
 * @property {string} github
 * @property {string[]} imagens
 */

/**
 * Representa um projeto normalizado para a View.
 */
export class Project {
  /**
   * @param {Object} data
   * @param {string} data.title
   * @param {string} data.description
   * @param {string} data.tech
   * @param {string} data.link
   * @param {string} data.github
   * @param {string[]} data.images
   * @param {number} data.index - Índice no array original
   * @param {string} data.folder - Pasta upload/projetoN
   */
  constructor({ title, description, tech, link, github, images, index, folder }) {
    this.title = title || 'Untitled';
    this.description = description || '';
    this.tech = tech || '';
    this.link = link || '';
    this.github = github || '';
    this.images = images || [];
    this.index = index;
    this.folder = folder;
  }

  /** @returns {string[]} Lista de tecnologias parseada */
  get techList() {
    return this.tech
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }

  /** @returns {boolean} */
  get hasImages() {
    return this.images.length > 0;
  }

  /** @returns {boolean} */
  get isExternal() {
    return isExternalUrl(this.link);
  }

  /** @returns {boolean} */
  get isInteractive() {
    return Boolean(this.link && this.link.endsWith('.html'));
  }

  /**
   * Cria instância a partir do JSON bruto + imagens resolvidas.
   * @param {ProjectRaw} raw
   * @param {string[]} resolvedImages
   * @param {number} index
   * @returns {Project}
   */
  static fromRaw(raw, resolvedImages, index) {
    return new Project({
      title: raw.titulo,
      description: raw.descricao,
      tech: raw.tecnologias,
      link: raw.link,
      github: raw.github,
      images: resolvedImages,
      index,
      folder: raw.pasta,
    });
  }
}
