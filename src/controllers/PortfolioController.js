/**
 * @file PortfolioController.js
 * @description Controller principal — orquestra Model, Views e Services.
 */

import { DataService } from '../services/DataService.js';
import { HeroView } from '../views/HeroView.js';
import { AboutView } from '../views/AboutView.js';
import { SkillsView } from '../views/SkillsView.js';
import { ExperienceView } from '../views/ExperienceView.js';
import { EducationView } from '../views/EducationView.js';
import { ProjectsView } from '../views/ProjectsView.js';
import { ContactView } from '../views/ContactView.js';
import { ModalView } from '../views/ModalView.js';
import { NavigationController } from './NavigationController.js';
import { getI18n } from '../i18n/I18nService.js';
import { initCardTilt } from '../utils/cardTilt.js';

export class PortfolioController {
  /** @type {(() => void)|null} */
  #disposeTilt = null;
  /** @type {{ destroy: () => void }|null} */
  #heroScene = null;

  constructor() {
    this.i18n = getI18n();
    this.dataService = new DataService();
    this.heroView = new HeroView();
    this.aboutView = new AboutView(this.dataService);
    this.skillsView = new SkillsView();
    this.experienceView = new ExperienceView();
    this.educationView = new EducationView();
    this.projectsView = new ProjectsView();
    this.contactView = new ContactView();
    this.modalView = new ModalView();
    this.navController = new NavigationController();
    /** @type {import('../models/PortfolioModel.js').PortfolioModel|null} */
    this.model = null;
  }

  /** Inicializa a aplicação */
  async init() {
    this.i18n.onChange(() => {
      this.modalView.close();
      this.loadAndRender();
    });
    this.navController.init(this.i18n);
    // Conteúdo primeiro; Three.js só depois (e só em desktop)
    await this.loadAndRender();
    this.#scheduleHeroScene();
  }

  /** Three.js é pesado (~1.3 MB) — não carrega no mobile / reduced-motion / Save-Data */
  #shouldLoadHero3D() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    if (navigator.connection?.saveData) return false;
    // Lighthouse mobile e telefones reais: sem WebGL no hero
    if (window.matchMedia('(max-width: 900px), (pointer: coarse)').matches) return false;
    return true;
  }

  #scheduleHeroScene() {
    if (!this.#shouldLoadHero3D()) return;

    const start = () => {
      void this.#initHeroScene();
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(start, { timeout: 2500 });
    } else {
      setTimeout(start, 1200);
    }
  }

  async #initHeroScene() {
    const mount = document.getElementById('heroScene');
    if (!mount || this.#heroScene) return;

    try {
      const { HeroScene3D } = await import('../services/HeroScene3D.js');
      this.#heroScene = new HeroScene3D();
      this.#heroScene.init(mount);
    } catch (err) {
      console.warn('[App] Hero 3D indisponível:', err);
    }
  }

  /** Carrega dados e renderiza todas as views */
  async loadAndRender() {
    this.model = await this.dataService.loadPortfolio(this.i18n.getLocale());
    const { personalInfo, projects, contact, rawProjects } = this.model;

    this.heroView.render(personalInfo);
    // About (foto) em paralelo com o resto — não bloqueia projetos
    const aboutPromise = this.aboutView.render(personalInfo);
    this.skillsView.render(personalInfo.skills, personalInfo.certifications);
    this.experienceView.render(personalInfo.experience);
    this.educationView.render(personalInfo.education);
    this.projectsView.render(projects, (index) => this.openProjectModal(index));
    this.contactView.render(contact);
    await aboutPromise;

    window.dispatchEvent(new CustomEvent('portfolio:rendered'));

    this.#disposeTilt?.();
    this.#disposeTilt = initCardTilt();

    this.rawProjects = rawProjects;
  }

  /**
   * Abre modal do projeto pelo índice.
   * @param {number} index
   */
  openProjectModal(index) {
    const projeto = this.rawProjects?.projetos?.[index];
    const project = this.model?.projects[index];
    if (!projeto) return;

    const images = project?.images?.length
      ? project.images
      : (projeto.imagens || []).map((img) =>
          img.startsWith('http') ? img : `upload/${projeto.pasta}/${img}`
        );

    this.modalView.open(projeto, images);
  }
}
