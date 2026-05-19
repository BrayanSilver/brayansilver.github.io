/**
 * @file dom.js
 * @description Utilitários para manipulação segura do DOM.
 */

/**
 * Seleciona um único elemento no documento.
 * @param {string} selector - Seletor CSS
 * @param {ParentNode} [parent=document] - Elemento pai
 * @returns {Element|null}
 */
export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

/**
 * Seleciona múltiplos elementos no documento.
 * @param {string} selector - Seletor CSS
 * @param {ParentNode} [parent=document] - Elemento pai
 * @returns {NodeListOf<Element>}
 */
export function $$(selector, parent = document) {
  return parent.querySelectorAll(selector);
}

/**
 * Define o innerHTML de um elemento se ele existir.
 * @param {string} selector
 * @param {string} html
 */
export function setHTML(selector, html) {
  const el = $(selector);
  if (el) el.innerHTML = html;
}

/**
 * Adiciona ou remove uma classe em um elemento.
 * @param {Element|null} el
 * @param {string} className
 * @param {boolean} add
 */
export function toggleClass(el, className, add) {
  if (!el) return;
  el.classList.toggle(className, add);
}

/**
 * Cria um elemento HTML com atributos opcionais.
 * @param {string} tag
 * @param {Object} [attrs]
 * @param {string} [innerHTML]
 * @returns {HTMLElement}
 */
export function createElement(tag, attrs = {}, innerHTML = '') {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') el.className = value;
    else if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2).toLowerCase(), value);
    else el.setAttribute(key, value);
  });
  if (innerHTML) el.innerHTML = innerHTML;
  return el;
}
