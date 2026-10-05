/**
 * @file PortfolioController.js
 * @description Controller principal — orquestra Model, Views e Services.
 */

import { DataService } from '../services/DataService.js';
import { HeroScene3D } from '../services/HeroScene3D.js';
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
    this.heroScene = new HeroScene3D();
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
    this.#initHeroScene();
    await this.loadAndRender();
  }

  #initHeroScene() {
    const mount = document.getElementById('heroScene');
    if (!mount) return;
    try {
      this.heroScene.init(mount);
    } catch (err) {
      console.warn('[App] Hero 3D indisponível:', err);
    }
  }

  /** Carrega dados e renderiza todas as views */
  async loadAndRender() {
    this.model = await this.dataService.loadPortfolio(this.i18n.getLocale());
    const { personalInfo, projects, contact, rawProjects } = this.model;

    this.heroView.render(personalInfo);
    await this.aboutView.render(personalInfo);
    this.skillsView.render(personalInfo.skills, personalInfo.certifications);
    this.experienceView.render(personalInfo.experience);
    this.educationView.render(personalInfo.education);
    this.projectsView.render(projects, (index) => this.openProjectModal(index));
    this.contactView.render(contact);

    // Dispara evento para reveal animations em conteúdo dinâmico
    window.dispatchEvent(new CustomEvent('portfolio:rendered'));

    this.#disposeTilt?.();
    this.#disposeTilt = initCardTilt();

    // Guarda referência para modal
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
