/**
 * @file PortfolioController.js
 * @description Controller principal — orquestra Model, Views e Services.
 */

import { DataService } from '../services/DataService.js';
import { HeroView } from '../views/HeroView.js';
import { AboutView } from '../views/AboutView.js';
import { StatsView } from '../views/StatsView.js';
import { SkillsView } from '../views/SkillsView.js';
import { ExperienceView } from '../views/ExperienceView.js';
import { EducationView } from '../views/EducationView.js';
import { ProjectsView } from '../views/ProjectsView.js';
import { ContactView } from '../views/ContactView.js';
import { ModalView } from '../views/ModalView.js';
import { NavigationController } from './NavigationController.js';

export class PortfolioController {
  constructor() {
    this.dataService = new DataService();
    this.heroView = new HeroView();
    this.aboutView = new AboutView(this.dataService);
    this.statsView = new StatsView();
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
    this.navController.init();
    await this.loadAndRender();
  }

  /** Carrega dados e renderiza todas as views */
  async loadAndRender() {
    this.model = await this.dataService.loadPortfolio();
    const { personalInfo, projects, contact, rawProjects } = this.model;

    this.heroView.render(personalInfo);
    await this.aboutView.render(personalInfo);
    this.statsView.render(personalInfo, projects.length);
    this.skillsView.render(personalInfo.skills, personalInfo.certifications);
    this.experienceView.render(personalInfo.experience);
    this.educationView.render(personalInfo.education);
    this.projectsView.render(projects, (index) => this.openProjectModal(index));
    this.contactView.render(contact);

    // Dispara evento para reveal animations em conteúdo dinâmico
    window.dispatchEvent(new CustomEvent('portfolio:rendered'));

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
