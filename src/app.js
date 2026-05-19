/**
 * @file app.js
 * @description Ponto de entrada da aplicação — bootstrap MVC.
 */

import { PortfolioController } from './controllers/PortfolioController.js';

/**
 * Inicializa o portfólio quando o DOM estiver pronto.
 */
document.addEventListener('DOMContentLoaded', () => {
  const app = new PortfolioController();
  app.init().catch((err) => {
    console.error('[App] Falha ao inicializar:', err);
  });
});
