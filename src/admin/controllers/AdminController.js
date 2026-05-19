/**
 * @file AdminController.js
 * @description Controller do painel admin — orquestra autenticação e CRUD de JSON.
 */

import { AuthService } from '../services/AuthService.js';
import { API_PATHS } from '../config/constants.js';
import { exportJSON } from '../utils/exportJson.js';
import { showNotification } from '../utils/notifications.js';

export class AdminController {
  constructor() {
    this.auth = new AuthService();
    this.projetosData = [];
    this.personalInfoData = {};
    this.contactData = {};
    this.currentEditingIndex = null;
  }

  init() {
    this.#checkAuth();
    this.#setupLogin();
    this.auth.setupSequenceDetection();
    this.#bindModalClose();
    this.#exposeGlobals();
  }

  /** Expõe funções para onclick no HTML legado */
  #exposeGlobals() {
    const g = {
      logout: () => this.logout(),
      savePersonalInfo: () => this.savePersonalInfo(),
      saveContactInfo: () => this.saveContactInfo(),
      loadProjectsFromFolders: () => this.loadProjectsFromFolders(),
      exportProjectsJSON: () => this.exportProjectsJSON(),
      editProject: (i) => this.editProject(i),
      closeProjectModal: () => this.closeProjectModal(),
      saveProject: () => this.saveProject(),
    };
    Object.assign(window, g);
  }

  #checkAuth() {
    if (this.auth.isAuthenticated()) this.#showAdmin();
    else this.#showLogin();
  }

  #showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminContent').style.display = 'none';
    this.auth.resetSequence();
  }

  #showAdmin() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminContent').style.display = 'block';
    this.loadAllData();
    this.#setupNavigation();
  }

  #setupLogin() {
    document.getElementById('loginForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const password = document.getElementById('password').value;

      if (!this.auth.login(password)) {
        this.auth.showError(
          !password
            ? 'Digite a senha.'
            : 'Senha incorreta ou sequência especial incompleta (2 cliques esq → 2 dir → A → Z).'
        );
        this.auth.resetSequence();
        return;
      }
      this.#showAdmin();
    });
  }

  logout() {
    this.auth.logout();
    this.#showLogin();
  }

  #setupNavigation() {
    document.querySelectorAll('.nav-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        document.querySelectorAll('.admin-section').forEach((s) => s.classList.remove('active'));
        document.getElementById(`${section}-section`)?.classList.add('active');
        document.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active'));
        item.classList.add('active');
      });
    });
  }

  async loadAllData() {
    await Promise.all([
      this.#loadPersonalInfo(),
      this.#loadContactInfo(),
      this.loadProjectsFromFolders(),
      this.#loadPersonalPhoto(),
    ]);
  }

  async #loadPersonalInfo() {
    try {
      const res = await fetch(API_PATHS.personalInfo);
      if (!res.ok) return;
      this.personalInfoData = await res.json();
      document.getElementById('aboutText').value = this.personalInfoData.about || '';
      document.getElementById('heroTitle').value = this.personalInfoData.heroTitle || '';
      document.getElementById('heroSubtitle').value = this.personalInfoData.heroSubtitle || '';
    } catch (e) {
      console.error(e);
    }
  }

  async #loadContactInfo() {
    try {
      const res = await fetch(API_PATHS.contact);
      if (!res.ok) return;
      this.contactData = await res.json();
      document.getElementById('email').value = this.contactData.email || '';
      document.getElementById('phone').value = this.contactData.phone || '';
      document.getElementById('linkedin').value = this.contactData.linkedin || '';
      document.getElementById('github').value = this.contactData.github || '';
      document.getElementById('website').value = this.contactData.website || '';
    } catch (e) {
      console.error(e);
    }
  }

  async #loadPersonalPhoto() {
    const preview = document.getElementById('personalPhotoPreview');
    if (!preview) return;

    const tryPath = async (path, label) => {
      try {
        const res = await fetch(path);
        if (res.ok) {
          preview.innerHTML = `<img src="${path}" alt="Foto" style="max-width:200px;border-radius:8px"><p style="color:var(--text-secondary);font-size:0.85rem;margin-top:0.5rem">${label}</p>`;
          return true;
        }
      } catch { /* next */ }
      return false;
    };

    if (this.personalInfoData.foto) {
      if (await tryPath(`${API_PATHS.photoFolder}${this.personalInfoData.foto}`, this.personalInfoData.foto)) return;
    }

    for (const name of ['foto.jpg', 'foto.png', 'brayan.jpg']) {
      if (await tryPath(`${API_PATHS.photoFolder}${name}`, name)) return;
    }

    preview.innerHTML = '<p style="color:var(--text-secondary)">Nenhuma foto em upload/foto-pessoal/</p>';
  }

  async loadProjectsFromFolders() {
    try {
      const res = await fetch(API_PATHS.projects);
      if (!res.ok) throw new Error('projetos.json não encontrado');

      const data = await res.json();
      this.projetosData = data.projetos || [];

      for (const projeto of this.projetosData) {
        projeto.loadedImages = [];
        for (const imgName of projeto.imagens || []) {
          if (imgName.startsWith('http')) {
            projeto.loadedImages.push(imgName);
          } else {
            const path = `upload/${projeto.pasta}/${imgName}`;
            try {
              const imgRes = await fetch(path);
              if (imgRes.ok) projeto.loadedImages.push(path);
            } catch { /* skip */ }
          }
        }
      }

      this.#displayProjects();
      showNotification('Projetos carregados com sucesso!');
    } catch (e) {
      showNotification('Erro ao carregar projetos.', 'error');
    }
  }

  #displayProjects() {
    const list = document.getElementById('projectsList');
    if (!this.projetosData.length) {
      list.innerHTML = '<p style="text-align:center;padding:2rem;color:var(--text-secondary)">Nenhum projeto</p>';
      return;
    }

    list.innerHTML = this.projetosData.map((p, i) => {
      const img = p.loadedImages?.[0];
      return `
        <div class="project-item">
          ${img ? `<img src="${img}" class="project-item-image" alt="">` : '<div class="project-item-image" style="display:flex;align-items:center;justify-content:center;font-size:3rem">📁</div>'}
          <div class="project-item-content">
            <h3>${p.titulo || 'Sem título'}</h3>
            <p>${p.descricao || ''}</p>
            <p style="font-size:0.85rem;color:var(--text-secondary)">Pasta: ${p.pasta} | Imagens: ${p.loadedImages?.length || 0}</p>
            <button class="btn-edit" onclick="editProject(${i})">Editar</button>
          </div>
        </div>`;
    }).join('');
  }

  savePersonalInfo() {
    this.personalInfoData = {
      ...this.personalInfoData,
      about: document.getElementById('aboutText').value,
      heroTitle: document.getElementById('heroTitle').value,
      heroSubtitle: document.getElementById('heroSubtitle').value,
    };
    exportJSON('info-pessoal.json', this.personalInfoData);
    showNotification('Baixe o arquivo e substitua upload/info-pessoal.json');
  }

  saveContactInfo() {
    this.contactData = {
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      linkedin: document.getElementById('linkedin').value,
      github: document.getElementById('github').value,
      website: document.getElementById('website').value,
    };
    exportJSON('contato.json', this.contactData);
    showNotification('Baixe o arquivo e substitua upload/contato.json');
  }

  editProject(index) {
    const p = this.projetosData[index];
    if (!p) return;
    this.currentEditingIndex = index;

    document.getElementById('projectTitle').value = p.titulo || '';
    document.getElementById('projectDescription').value = p.descricao || '';
    document.getElementById('projectTech').value = p.tecnologias || '';
    document.getElementById('projectLink').value = p.link || '';
    document.getElementById('projectGithub').value = p.github || '';

    const uploaded = document.getElementById('uploadedImages');
    uploaded.innerHTML = (p.loadedImages || []).length
      ? p.loadedImages.map((img) => `<div class="uploaded-file"><img src="${img}" alt=""></div>`).join('')
      : '<p style="color:var(--text-secondary)">Nenhuma imagem na pasta</p>';

    document.getElementById('projectModal').classList.add('active');
  }

  closeProjectModal() {
    document.getElementById('projectModal').classList.remove('active');
    this.currentEditingIndex = null;
  }

  saveProject() {
    if (this.currentEditingIndex === null) return;
    const p = this.projetosData[this.currentEditingIndex];
    p.titulo = document.getElementById('projectTitle').value.trim();
    p.descricao = document.getElementById('projectDescription').value.trim();
    p.tecnologias = document.getElementById('projectTech').value.trim();
    p.link = document.getElementById('projectLink').value.trim();
    p.github = document.getElementById('projectGithub').value.trim();

    if (!p.titulo) {
      alert('Preencha o título.');
      return;
    }

    this.#displayProjects();
    this.exportProjectsJSON();
    showNotification('Projeto atualizado! Substitua upload/projetos.json');
    this.closeProjectModal();
  }

  exportProjectsJSON() {
    exportJSON('projetos.json', { projetos: this.projetosData });
  }

  #bindModalClose() {
    document.getElementById('projectModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'projectModal') this.closeProjectModal();
    });
  }
}
