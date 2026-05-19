/**
 * @file NavigationController.js
 * @description Controller da navegação — scroll, menu mobile e reveal animations.
 */

import { $, $$ } from '../utils/dom.js';
import { SELECTORS } from '../config/constants.js';

export class NavigationController {
  init() {
    this.#initScrollNav();
    this.#initSmoothScroll();
    this.#initMobileMenu();
    this.#initReveal();
    this.#initNewsletter();
  }

  /** Navbar com blur ao rolar + link ativo */
  #initScrollNav() {
    const navbar = $(SELECTORS.navbar);
    const navLinks = $$('.nav-link, .mobile-nav-link');

    window.addEventListener('scroll', () => {
      navbar?.classList.toggle('scrolled', window.scrollY > 50);

      let current = '';
      $$('section[id]').forEach((section) => {
        if (window.scrollY >= section.offsetTop - 120) {
          current = section.id;
        }
      });

      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
      });
    });
  }

  /** Scroll suave para âncoras */
  #initSmoothScroll() {
    $$('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /** Menu hambúrguer mobile */
  #initMobileMenu() {
    const hamburger = $(SELECTORS.hamburger);
    const mobileMenu = $(SELECTORS.mobileMenu);
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    $$('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  /** Intersection Observer para animações de entrada */
  #initReveal() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.delay || 0;
            setTimeout(() => entry.target.classList.add('revealed'), parseInt(delay, 10));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    const observe = () => $$('.reveal:not(.revealed)').forEach((el) => observer.observe(el));
    observe();

    // Re-observar após render dinâmico
    window.addEventListener('portfolio:rendered', observe);
  }

  /** Newsletter no footer */
  #initNewsletter() {
    const input = $('#newsletterEmail');
    const btn = $('.newsletter-btn');

    const submit = () => {
      const email = input?.value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Please enter a valid email address.');
        return;
      }
      alert('Thanks for subscribing! You will receive updates soon.');
      if (input) input.value = '';
    };

    btn?.addEventListener('click', submit);
    input?.addEventListener('keypress', (e) => { if (e.key === 'Enter') submit(); });

    const backToTop = $('.back-to-top');
    backToTop?.addEventListener('click', scrollToTop);
    backToTop?.addEventListener('keypress', (e) => { if (e.key === 'Enter') scrollToTop(); });
  }
}

/** Scroll to top — exposto globalmente para o footer */
export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.scrollToTop = scrollToTop;
