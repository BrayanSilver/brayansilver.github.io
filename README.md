# Portfolio Master — Dev Brayan

Portfólio profissional moderno com arquitetura **MVC** (Model-View-Controller), área administrativa e deploy estático no **GitHub Pages**. Sem backend, sem build step — HTML, CSS modular e JavaScript ES Modules.

[![Live Demo](https://img.shields.io/badge/demo-GitHub%20Pages-10b981?style=flat-square)](https://brayansilver.github.io/)
[![License](https://img.shields.io/badge/license-MIT-8b5cf6?style=flat-square)](LICENSE)

## Preview

- Design dark premium com gradientes emerald + violet
- Hero com efeito **typewriter** nas roles
- Contadores animados (stats)
- Grid **bento** de projetos
- Timeline de experiência
- Modal com carrossel de imagens
- 100% responsivo

## Arquitetura MVC

```
portfoliomaster/
├── index.html                 # View principal (HTML estático)
├── src/
│   ├── app.js                 # Bootstrap da aplicação
│   ├── config/
│   │   └── constants.js       # URLs, seletores, defaults
│   ├── models/
│   │   ├── PortfolioModel.js  # Estado agregado do portfólio
│   │   └── ProjectModel.js    # Entidade projeto normalizada
│   ├── services/
│   │   └── DataService.js     # Fetch JSON + resolução de imagens
│   ├── views/
│   │   ├── HeroView.js
│   │   ├── AboutView.js
│   │   ├── StatsView.js
│   │   ├── SkillsView.js
│   │   ├── ExperienceView.js
│   │   ├── ProjectsView.js
│   │   ├── ContactView.js
│   │   └── ModalView.js
│   ├── controllers/
│   │   ├── PortfolioController.js  # Orquestra Model ↔ Views
│   │   └── NavigationController.js # Nav, scroll, reveal, newsletter
│   └── utils/
│       ├── dom.js
│       └── helpers.js
├── assets/css/                # Estilos modulares (BEM-like por componente)
│   ├── main.css               # Entry point CSS
│   ├── variables.css
│   ├── base.css
│   └── components/
├── upload/                    # Dados (JSON) + imagens dos projetos
│   ├── info-pessoal.json
│   ├── projetos.json
│   ├── contato.json
│   └── projeto1..N/
├── admin.html                 # Painel administrativo
├── projetos/                  # Demos interativos (jogos, apps)
└── README.md
```

### Fluxo de dados

```
index.html → app.js → PortfolioController
                          ↓
                    DataService (fetch)
                          ↓
                    PortfolioModel
                          ↓
              Views renderizam o DOM
```

## Início rápido

### 1. Clonar e servir localmente

```bash
git clone https://github.com/BrayanSilver/portfoliomaster.git
cd portfoliomaster

# Servidor local (necessário para ES Modules e fetch)
npx serve .
# ou: python -m http.server 8080
```

Abra `http://localhost:3000` (ou a porta indicada).

### 2. Personalizar conteúdo

| Arquivo | Conteúdo |
|---------|----------|
| `upload/info-pessoal.json` | Bio, hero, skills, stats, experiência |
| `upload/contato.json` | Email, GitHub, LinkedIn, WhatsApp |
| `upload/projetos.json` | Lista de projetos |
| `upload/foto-pessoal/` | Foto de perfil |
| `upload/projetoN/` | Até 5 imagens por projeto |

### 3. Área administrativa

1. Abra `admin.html`
2. Autentique-se (senha configurada em `admin.js`)
3. Edite e **exporte** os JSONs atualizados
4. Substitua os arquivos em `upload/` e faça commit

## Estrutura do `info-pessoal.json`

```json
{
  "about": "Texto sobre você (use \\n para parágrafos)",
  "heroTitle": "Desenvolvedor",
  "heroSubtitle": "Subtítulo do hero",
  "heroRoles": ["Full Stack", "Frontend", "Backend"],
  "foto": "brayan.jpg",
  "stats": [
    { "label": "Projetos", "value": 22, "suffix": "+" }
  ],
  "skills": {
    "hard": ["JavaScript", "React"],
    "soft": ["Comunicação", "Proatividade"]
  },
  "experience": [
    {
      "role": "Desenvolvedor Full Stack",
      "company": "Empresa",
      "period": "2024 — Atual",
      "description": "Descrição da atuação"
    }
  ]
}
```

## Deploy no GitHub Pages

1. Push para o repositório `usuario.github.io` ou ative Pages em **Settings → Pages**
2. Branch: `main`, pasta: `/ (root)`
3. Aguarde alguns minutos — o site estará em `https://usuario.github.io/`

> **Importante:** inclua a pasta `upload/` com todos os JSONs e imagens no repositório.

## Tecnologias

- HTML5 semântico + SEO (meta tags, JSON-LD, sitemap)
- CSS3 modular (custom properties, grid, glassmorphism)
- JavaScript ES6+ (modules, async/await, Intersection Observer)
- Google Analytics 4
- GitHub Pages (hospedagem estática)

## Scripts legados

| Arquivo | Status |
|---------|--------|
| `styles.css` | Reexporta `assets/css/main.css` |
| `script.js` | Depreciado — use `src/app.js` |

## Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/minha-feature`)
3. Commit (`git commit -m 'feat: adiciona X'`)
4. Push e abra um Pull Request

## Licença

MIT — uso livre com atribuição.

---

Desenvolvido com ♥ por **Dev Brayan** — [brayansilver.github.io](https://brayansilver.github.io/)
