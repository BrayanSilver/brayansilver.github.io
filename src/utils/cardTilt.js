/**
 * @file cardTilt.js
 * @description Tilt 3D discreto + highlight acompanhando o mouse nos cards.
 */

const DEFAULT_SELECTOR = '.project-card, .stat-card, .about-image, .contact-item, .skill-pill';
const MAX_TILT = 10;

/**
 * @param {HTMLElement} el
 * @param {PointerEvent} e
 */
function applyTilt(el, e) {
  const rect = el.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;
  const rotateY = (x - 0.5) * (MAX_TILT * 2);
  const rotateX = (0.5 - y) * (MAX_TILT * 2);

  el.classList.add('is-tilting');
  el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-3px) translateZ(8px)`;
  el.style.setProperty('--tilt-x', `${(x * 100).toFixed(1)}%`);
  el.style.setProperty('--tilt-y', `${(y * 100).toFixed(1)}%`);
}

/**
 * @param {HTMLElement} el
 */
function resetTilt(el) {
  el.classList.remove('is-tilting');
  el.style.transform = '';
  el.style.removeProperty('--tilt-x');
  el.style.removeProperty('--tilt-y');
}

/**
 * Ativa tilt nos elementos correspondentes.
 * @param {string} [selector]
 * @returns {() => void} cleanup
 */
export function initCardTilt(selector = DEFAULT_SELECTOR) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return () => {};
  }
  if (window.matchMedia('(pointer: coarse)').matches) {
    return () => {};
  }

  /** @type {Map<HTMLElement, {enter: Function, move: Function, leave: Function}>} */
  const handlers = new Map();

  document.querySelectorAll(selector).forEach((node) => {
    const el = /** @type {HTMLElement} */ (node);
    if (el.dataset.tiltBound === '1') return;
    el.dataset.tiltBound = '1';
    el.classList.add('tilt-ready');

    const onEnter = () => el.classList.add('is-tilting');
    const onMove = (e) => applyTilt(el, e);
    const onLeave = () => resetTilt(el);

    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    handlers.set(el, { enter: onEnter, move: onMove, leave: onLeave });
  });

  return () => {
    handlers.forEach(({ enter, move, leave }, el) => {
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      resetTilt(el);
      delete el.dataset.tiltBound;
      el.classList.remove('tilt-ready');
    });
    handlers.clear();
  };
}
