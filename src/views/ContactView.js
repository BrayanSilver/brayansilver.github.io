/**
 * @file ContactView.js
 * @description View da seção de contato e links sociais na navbar.
 */

import { setHTML } from '../utils/dom.js';
import { SELECTORS } from '../config/constants.js';
import { getI18n } from '../i18n/I18nService.js';

/** Ícones SVG reutilizáveis */
const ICONS = {
  email: `<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`,
  github: `<svg class="icon" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`,
  linkedin: `<svg class="icon" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`,
  gmail: `<svg class="icon" fill="currentColor" viewBox="0 0 24 24"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 10.454l8.073-6.961C21.69 2.28 24 3.434 24 5.457z"/></svg>`,
  whatsapp: `<svg class="icon" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>`,
  phone: `<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>`,
  website: `<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>`,
};

export class ContactView {
  /**
   * @param {Object} contact
   */
  render(contact) {
    const hasData = contact && Object.values(contact).some(Boolean);

    if (!hasData) {
      setHTML(SELECTORS.contactContent, `<p class="contact-empty">${getI18n().t('contact.empty')}</p>`);
      return;
    }

    const items = [];

    if (contact.email) {
      items.push(`<a href="mailto:${contact.email}" class="contact-item contact-item--primary">${ICONS.email}<span>${contact.email}</span></a>`);
    }
    if (contact.github) {
      items.push(`<a href="${contact.github}" target="_blank" rel="noopener" class="contact-item">${ICONS.github}<span>GitHub</span></a>`);
    }
    if (contact.linkedin) {
      items.push(`<a href="${contact.linkedin}" target="_blank" rel="noopener" class="contact-item">${ICONS.linkedin}<span>LinkedIn</span></a>`);
    }
    if (contact.whatsapp) {
      items.push(`<a href="https://wa.me/${contact.whatsapp}" target="_blank" rel="noopener" class="contact-item">${ICONS.whatsapp}<span>WhatsApp</span></a>`);
    }
    if (contact.phone) {
      items.push(`<a href="tel:${contact.phone}" class="contact-item">${ICONS.phone}<span>${contact.phone}</span></a>`);
    }
    if (contact.website) {
      items.push(`<a href="${contact.website}" target="_blank" rel="noopener" class="contact-item">${ICONS.website}<span>Website</span></a>`);
    }

    setHTML(SELECTORS.contactContent, items.join(''));
    this.#renderSocialNav(contact);
  }

  /**
   * @param {Object} contact
   */
  #renderSocialNav(contact) {
    const links = [];

    if (contact.github) {
      links.push(`<a href="${contact.github}" target="_blank" rel="noopener" class="social-link" aria-label="GitHub">${ICONS.github}</a>`);
    }
    if (contact.linkedin) {
      links.push(`<a href="${contact.linkedin}" target="_blank" rel="noopener" class="social-link" aria-label="LinkedIn">${ICONS.linkedin}</a>`);
    }
    if (contact.email) {
      links.push(`<a href="mailto:${contact.email}" class="social-link" aria-label="Gmail">${ICONS.gmail}</a>`);
    }
    if (contact.whatsapp) {
      links.push(`<a href="https://wa.me/${contact.whatsapp}" target="_blank" rel="noopener" class="social-link" aria-label="WhatsApp">${ICONS.whatsapp}</a>`);
    }

    const html = links.join('');
    setHTML(SELECTORS.socialLinks, html);
    setHTML(SELECTORS.mobileSocialLinks, html);
  }
}
