/**
 * @file NavigationController.js
 * @description Controller da navegação — scroll, menu mobile e reveal animations.
 */

import { $, $$ } from '../utils/dom.js';
import { SELECTORS } from '../config/constants.js';

export class NavigationController {
  /** @param {import('../i18n/I18nService.js').I18nService} [i18n] */
  init(i18n) {
    this.i18n = i18n;
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

    let scrollY = 0;

    const closeMenu = () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      mobileMenu.setAttribute('aria-hidden', 'true');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('mobile-menu-open');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };

    const openMenu = () => {
      scrollY = window.scrollY;
      hamburger.classList.add('active');
      mobileMenu.classList.add('active');
      mobileMenu.setAttribute('aria-hidden', 'false');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.classList.add('mobile-menu-open');
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    };

    hamburger.addEventListener('click', () => {
      if (mobileMenu.classList.contains('active')) closeMenu();
      else openMenu();
    });

    $$('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) closeMenu();
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
        alert(this.i18n?.t('newsletter.invalid') ?? 'Please enter a valid email address.');
        return;
      }
      alert(this.i18n?.t('newsletter.thanks') ?? 'Thanks for subscribing!');
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
