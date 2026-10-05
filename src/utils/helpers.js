/**
 * @file helpers.js
 * @description Funções utilitárias compartilhadas entre models e views.
 */

import { GAME_KEYWORDS } from '../config/constants.js';

/**
 * Verifica se uma URL é externa (http/https).
 * @param {string} url
 * @returns {boolean}
 */
export function isExternalUrl(url) {
  return Boolean(url && (url.startsWith('http://') || url.startsWith('https://')));
}

/**
 * Verifica se o link aponta para um arquivo HTML local.
 * @param {string} link
 * @returns {boolean}
 */
export function isHtmlProject(link) {
  return Boolean(link && link.endsWith('.html'));
}

/**
 * True when the card is a company/client collaboration (not personal ownership).
 * @param {{ title?: string, link?: string }} project
 * @returns {boolean}
 */
export function isCollaborationProject(project) {
  const title = (project.title || '').toLowerCase();
  const link = (project.link || '').toLowerCase();
  return (
    title.includes('lumisoft') ||
    title.includes('lumicenter') ||
    title.includes('e-book') ||
    title.includes('ebook') ||
    title.includes('rf consultoria') ||
    title.includes("l'essentiel") ||
    title.includes('slipper') ||
    link.includes('lumisoft.lumicenter') ||
    link.includes('lojaonline.lumicenter') ||
    link.includes('iluminacaopratica.lumicenter') ||
    link.includes('rfconsultoriaalimentos') ||
    link.includes('slipper-world') ||
    link.includes('beauty-afinity')
  );
}

/**
 * Detecta se o projeto é um jogo interativo.
 * @param {import('../models/ProjectModel.js').Project} project
 * @returns {boolean}
 */
export function isGameProject(project) {
  if (!project.link || !isHtmlProject(project.link)) return false;
  const lower = project.link.toLowerCase();
  return GAME_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Anima contagem numérica de um elemento.
 * @param {HTMLElement} el
 * @param {number} target
 * @param {number} [duration=1500]
 */
export function animateCounter(el, target, duration = 1500) {
  const start = 0;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(start + (target - start) * eased);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }

  requestAnimationFrame(update);
}

/**
 * Escapa caracteres HTML para prevenir XSS em textos dinâmicos.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Divide texto em parágrafos (quebras de linha).
 * @param {string} text
 * @returns {string[]}
 */
export function splitParagraphs(text) {
  return (text || '').split('\n').map((p) => p.trim()).filter(Boolean);
}
