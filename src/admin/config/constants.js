/**
 * @file constants.js — Configurações do painel administrativo
 */

/** Altere esta senha antes de publicar em produção */
export const ADMIN_PASSWORD = 'admin123';

export const SESSION_KEY = 'admin_authenticated';

export const API_PATHS = {
  personalInfo: 'upload/info-pessoal.json',
  projects: 'upload/projetos.json',
  contact: 'upload/contato.json',
  photoFolder: 'upload/foto-pessoal/',
};
