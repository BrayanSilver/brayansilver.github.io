/**
 * @file constants.js
 * @description Constantes globais da aplicação — URLs de API, seletores DOM e valores padrão.
 */

/** Caminhos base para os arquivos JSON de conteúdo */
export const API_PATHS = {
  personalInfo: 'upload/info-pessoal.json',
  personalInfoPt: 'upload/info-pessoal.pt.json',
  projects: 'upload/projetos.json',
  contact: 'upload/contato.json',
  photoFolder: 'upload/foto-pessoal/',
};

/** @param {'en'|'pt'} locale */
export function personalInfoPath(locale) {
  return locale === 'pt' ? API_PATHS.personalInfoPt : API_PATHS.personalInfo;
}

/** Seletores dos elementos principais do DOM */
export const SELECTORS = {
  navbar: '#navbar',
  heroTitle: '#heroTitle',
  heroDescription: '#heroDescription',
  heroTyping: '#heroTyping',
  aboutContent: '#aboutContent',
  aboutImage: '.about-image',
  projectsGrid: '#projectsGrid',
  contactContent: '#contactContent',
  socialLinks: '#socialLinks',
  mobileSocialLinks: '#mobileSocialLinks',
  statsGrid: '#statsGrid',
  skillsHard: '#skillsHard',
  skillsSoft: '#skillsSoft',
  experienceTimeline: '#experienceTimeline',
  educationTimeline: '#educationTimeline',
  certificationsList: '#certificationsList',
  hamburger: '#hamburger',
  mobileMenu: '#mobileMenu',
};

/** Dados padrão quando o fetch falha */
export const DEFAULTS = {
  personalInfo: {
    about: 'Add your bio in upload/info-pessoal.json',
    heroTitle: 'Developer',
    heroSubtitle: 'Building scalable digital products',
    heroRoles: ['Full Stack', 'Frontend', 'Backend'],
    stats: [
      { label: 'Projects', value: 0, suffix: '+' },
      { label: 'Technologies', value: 12, suffix: '+' },
      { label: 'Years coding', value: 4, suffix: '+' },
    ],
    skills: {
      hard: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'HTML', 'CSS', 'Git'],
      soft: ['Communication', 'Teamwork', 'Continuous learning', 'Problem solving'],
    },
    certifications: [],
    experience: [],
    education: [],
  },
  contact: {
    email: '',
    phone: '',
    whatsapp: '',
    linkedin: '',
    github: '',
    website: '',
  },
  projects: [],
};

/** Classes de overlay para cards de projeto (rotação cíclica) */
export const PROJECT_OVERLAY_CLASSES = [
  'overlay-emerald',
  'overlay-violet',
  'overlay-amber',
  'overlay-rose',
];

/** Palavras-chave que identificam projetos interativos (jogos) */
export const GAME_KEYWORDS = [
  'jogo', 'game', 'shooter', 'velha', 'memoria', 'pedra', 'racing', 'mario',
];
