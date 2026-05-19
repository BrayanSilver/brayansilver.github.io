/**
 * @file app.js — Bootstrap do painel administrativo (MVC)
 */

import { AdminController } from './controllers/AdminController.js';

document.addEventListener('DOMContentLoaded', () => {
  const admin = new AdminController();
  admin.init();
});
