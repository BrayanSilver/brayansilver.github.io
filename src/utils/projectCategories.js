/**
 * @file projectCategories.js
 * @description Agrupa projetos em categorias para carrosséis.
 */

import { isGameProject } from './helpers.js';

/** @typedef {{ id: string, label: string }} ProjectCategory */

/** @type {ProjectCategory[]} */
export const PROJECT_CATEGORIES = [
  { id: 'fullstack' },
  { id: 'websites' },
  { id: 'tools' },
  { id: 'games' },
  { id: 'repos' },
];

/**
 * @param {import('../models/ProjectModel.js').Project} project
 * @returns {string}
 */
export function categorizeProject(project) {
  const title = project.title.toLowerCase();
  const tech = project.tech.toLowerCase();
  const link = (project.link || '').toLowerCase();

  if (
    title.includes('more completed') ||
    title.includes('java projects') ||
    title.includes('python projects')
  ) {
    return 'repos';
  }

  if (isGameProject(project)) return 'games';

  if (
    link.includes('jogo') ||
    link.includes('velha') ||
    link.includes('memoria') ||
    link.includes('mario') ||
    link.includes('shooter') ||
    link.includes('racing') ||
    link.includes('pedra-papel')
  ) {
    return 'games';
  }

  if (
    title.includes('netflix') ||
    title.includes('streaming') ||
    (tech.includes('next.js') &&
      (tech.includes('nestjs') || tech.includes('socket.io')))
  ) {
    return 'fullstack';
  }

  if (tech.includes('vite') && tech.includes('react')) {
    return 'fullstack';
  }

  if (
    title.includes('dashboard') ||
    title.includes('document management') ||
    title.includes('lumisoft') ||
    tech.includes('chart.js')
  ) {
    return 'tools';
  }

  if (
    project.isInteractive &&
    (link.includes('calculadora') ||
      link.includes('conversor') ||
      link.includes('gerador') ||
      link.includes('todo-list') ||
      link.includes('qrcode'))
  ) {
    return 'tools';
  }

  if (
    project.isExternal ||
    tech.includes('wordpress') ||
    tech.includes('e-commerce') ||
    title.includes('e-commerce') ||
    title.includes('store') ||
    title.includes('showcase') ||
    title.includes('landing') ||
    title.includes('linktree') ||
    title.includes('consultoria') ||
    title.includes('bio page')
  ) {
    return 'websites';
  }

  if (project.isInteractive) return 'games';
  if (!project.link && project.github) return 'repos';

  return 'tools';
}

/**
 * @param {import('../models/ProjectModel.js').Project[]} projects
 * @returns {Map<string, import('../models/ProjectModel.js').Project[]>}
 */
export function groupProjectsByCategory(projects) {
  const groups = new Map(PROJECT_CATEGORIES.map((c) => [c.id, []]));

  projects.forEach((project) => {
    const cat = categorizeProject(project);
    groups.get(cat)?.push(project);
  });

  return groups;
}
