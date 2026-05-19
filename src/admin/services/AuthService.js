/**
 * @file AuthService.js
 * @description Autenticação do admin — senha + sequência especial (2L, 2R, A, Z)
 */

import { ADMIN_PASSWORD, SESSION_KEY } from '../config/constants.js';

export class AuthService {
  constructor() {
    this.sequenceState = {
      leftClicks: 0,
      rightClicks: 0,
      keyA: false,
      keyZ: false,
      isComplete: false,
      isProtected: false,
    };
  }

  /** @returns {boolean} */
  isAuthenticated() {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  }

  /**
   * Valida senha e sequência.
   * @param {string} password
   * @returns {boolean}
   */
  login(password) {
    if (password !== ADMIN_PASSWORD) return false;
    if (!this.#checkSequence()) return false;
    sessionStorage.setItem(SESSION_KEY, 'true');
    return true;
  }

  logout() {
    sessionStorage.removeItem(SESSION_KEY);
    this.resetSequence();
  }

  /** Configura listeners da sequência especial na tela de login */
  setupSequenceDetection() {
    let sequenceTimeout = null;

    document.addEventListener('mousedown', (e) => {
      const loginScreen = document.getElementById('loginScreen');
      if (!loginScreen || loginScreen.style.display === 'none') return;

      const target = e.target;
      if (target.type === 'submit' || target.classList.contains('btn-login')) return;
      if (target.tagName === 'INPUT' || target.tagName === 'LABEL' || target.closest('.login-form')) return;

      if (e.button === 0) {
        if (this.sequenceState.rightClicks > 0 || this.sequenceState.keyA) this.resetSequence();
        this.sequenceState.leftClicks++;
        if (this.sequenceState.leftClicks > 2) this.resetSequence();
        this.#updateUI();
      } else if (e.button === 2 && this.sequenceState.leftClicks === 2) {
        this.sequenceState.rightClicks++;
        if (this.sequenceState.rightClicks > 2) this.resetSequence();
        this.#updateUI();
      } else if (e.button === 2) {
        this.resetSequence();
      }

      clearTimeout(sequenceTimeout);
      sequenceTimeout = setTimeout(() => {
        if (!this.#checkSequence()) this.resetSequence();
      }, 10000);
    });

    document.addEventListener('contextmenu', (e) => {
      const loginScreen = document.getElementById('loginScreen');
      if (loginScreen && loginScreen.style.display !== 'none') e.preventDefault();
    });

    document.addEventListener('keydown', (e) => {
      const loginScreen = document.getElementById('loginScreen');
      if (!loginScreen || loginScreen.style.display === 'none') return;
      if (e.key === 'Enter') return;

      const { leftClicks, rightClicks } = this.sequenceState;

      if (leftClicks === 2 && rightClicks === 2) {
        if (e.key.toLowerCase() === 'a' && !this.sequenceState.keyA) {
          e.preventDefault();
          this.sequenceState.keyA = true;
          this.#updateUI();
        } else if (e.key.toLowerCase() === 'z' && this.sequenceState.keyA && !this.sequenceState.keyZ) {
          e.preventDefault();
          this.sequenceState.keyZ = true;
          this.#updateUI();
        }
      }
    });
  }

  resetSequence() {
    if (this.sequenceState.isProtected) return;
    this.sequenceState = {
      leftClicks: 0,
      rightClicks: 0,
      keyA: false,
      keyZ: false,
      isComplete: false,
      isProtected: false,
    };
    this.#updateUI();
  }

  #checkSequence() {
    return (
      this.sequenceState.leftClicks === 2 &&
      this.sequenceState.rightClicks === 2 &&
      this.sequenceState.keyA &&
      this.sequenceState.keyZ
    );
  }

  #updateUI() {
    const hint = document.getElementById('sequenceHint');
    const progressEl = document.getElementById('sequenceProgress');
    if (!hint) return;

    const parts = [];
    if (this.sequenceState.leftClicks >= 2) parts.push('✓ 2 cliques esquerdo');
    if (this.sequenceState.rightClicks >= 2) parts.push('✓ 2 cliques direito');
    if (this.sequenceState.keyA) parts.push('✓ Tecla A');
    if (this.sequenceState.keyZ) parts.push('✓ Tecla Z');

    hint.innerHTML = parts.length
      ? `<p style="color: var(--primary-blue); font-weight: 600;">${parts.join(' → ')}</p>`
      : '<p>💡 Dica: Após digitar a senha, execute a sequência especial</p>';

    if (progressEl && this.#checkSequence()) {
      progressEl.textContent = '✅ Sequência completa! Pode pressionar Enter.';
      progressEl.style.color = '#10b981';
    }
  }

  showError(message) {
    const errorDiv = document.getElementById('loginError');
    if (!errorDiv) return;
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => { errorDiv.style.display = 'none'; }, 5000);
  }
}
