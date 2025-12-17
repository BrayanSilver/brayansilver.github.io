// Carregar dados do portfólio dos arquivos JSON
async function loadPortfolio() {
    try {
        // Carregar todos os JSONs em paralelo para melhor performance
        const [personalInfoResponse, projetosResponse, contactResponse] = await Promise.all([
            fetch('upload/info-pessoal.json'),
            fetch('upload/projetos.json'),
            fetch('upload/contato.json')
        ]);
        
        // Carregar informações pessoais
        const personalInfo = personalInfoResponse.ok ? await personalInfoResponse.json() : {
            about: "Adicione informações sobre você editando upload/info-pessoal.json",
            heroTitle: "Desenvolvedor",
            heroSubtitle: "Transformando ideias em realidade digital"
        };
        
        // Carregar projetos do arquivo JSON
        const projetosData = projetosResponse.ok ? await projetosResponse.json() : { projetos: [] };
        
        // Armazenar dados dos projetos globalmente para uso no modal
        globalProjectsData = projetosData;
        
        // Carregar imagens de cada projeto
        const projects = [];
        for (let projeto of projetosData.projetos || []) {
            const images = [];
            for (let imgName of projeto.imagens || []) {
                // Verificar se é URL (começa com http)
                if (imgName.startsWith('http://') || imgName.startsWith('https://')) {
                    images.push(imgName);
                } else {
                    // Tentar carregar imagem local
                    const imgPath = `upload/${projeto.pasta}/${imgName}`;
                    try {
                        const imgResponse = await fetch(imgPath);
                        if (imgResponse.ok) {
                            images.push(imgPath);
                        }
                    } catch (e) {
                        // Imagem não encontrada
                    }
                }
            }
            
            projects.push({
                title: projeto.titulo,
                description: projeto.descricao,
                tech: projeto.tecnologias,
                link: projeto.link,
                github: projeto.github,
                images: images
            });
        }
        
        // Carregar contato (já carregado em paralelo acima)
        const contact = contactResponse.ok ? await contactResponse.json() : {
            email: "",
            phone: "",
            whatsapp: "",
            linkedin: "",
            github: "",
            website: ""
        };
        
        // Combinar dados
        const data = {
            personalInfo: personalInfo,
            projects: projects,
            contact: contact
        };
        
        displayPortfolio(data);
    } catch (error) {
        console.error('Erro ao carregar portfólio:', error);
        // Dados padrão em caso de erro
        const defaultData = {
            personalInfo: {
                about: "Adicione informações sobre você editando upload/info-pessoal.json",
                heroTitle: "Desenvolvedor",
                heroSubtitle: "Transformando ideias em realidade digital"
            },
            projects: [],
            contact: {
                email: "",
                phone: "",
                whatsapp: "",
                linkedin: "",
                github: "",
                website: ""
            }
        };
        displayPortfolio(defaultData);
    }
}

// Exibir portfólio na página
function displayPortfolio(data) {
    // Atualizar hero
    if (data.personalInfo) {
        const heroTitle = document.getElementById('heroTitle');
        const heroDescription = document.getElementById('heroDescription');
        
        if (data.personalInfo.heroTitle) {
            heroTitle.innerHTML = `
                <span class="glow-text">${data.personalInfo.heroTitle}</span><br>
                <span class="gradient-text">Full Stack</span>
            `;
        }
        
        if (data.personalInfo.heroSubtitle) {
            heroDescription.textContent = data.personalInfo.heroSubtitle;
        }
    }

    // Atualizar seção sobre
    if (data.personalInfo && data.personalInfo.about) {
        const aboutContent = document.getElementById('aboutContent');
        const paragraphs = data.personalInfo.about.split('\n').filter(p => p.trim());
        aboutContent.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
    }

    // Exibir foto pessoal
    displayPersonalPhoto(data.personalInfo?.foto);

    // Exibir projetos
    displayProjects(data.projects || []);

    // Exibir contato
    displayContact(data.contact || {});
    
    // Exibir links sociais
    displaySocialLinks(data.contact || {});
}

// Exibir foto pessoal
function displayPersonalPhoto(photoName) {
    const aboutImage = document.querySelector('.about-image');
    if (!aboutImage) return;
    
    // Se há nome da foto no JSON, usar ele
    if (photoName) {
        const photoPath = `upload/foto-pessoal/${photoName}`;
        aboutImage.innerHTML = `<img src="${photoPath}" alt="Brayan Rosa da Silveira - Dev Brayan, Desenvolvedor Web Full Stack" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;">`;
        return;
    }
    
    // Tentar carregar foto da pasta (fallback)
    const photoPaths = [
        'upload/foto-pessoal/foto.jpg',
        'upload/foto-pessoal/foto.png',
        'upload/foto-pessoal/foto.jpeg',
        'upload/foto-pessoal/image.jpg',
        'upload/foto-pessoal/image.png',
        'upload/foto-pessoal/image.jpeg'
    ];
    
    const img = new Image();
    let currentIndex = 0;
    
    function tryNextPhoto() {
        if (currentIndex >= photoPaths.length) {
            aboutImage.innerHTML = `<div style="width: 100%; height: 100%; background: linear-gradient(to bottom right, rgb(255 255 255 / 5%), rgb(255 255 255 / 10%)); display: flex; align-items: center; justify-content: center; color: var(--zinc-400); font-size: 3rem;">👨‍💻</div>`;
            return;
        }
        
        img.onload = () => {
            aboutImage.innerHTML = `<img src="${photoPaths[currentIndex]}" alt="Brayan Rosa da Silveira - Dev Brayan, Desenvolvedor Web Full Stack" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;">`;
        };
        
        img.onerror = () => {
            currentIndex++;
            tryNextPhoto();
        };
        
        img.src = photoPaths[currentIndex];
    }
    
    tryNextPhoto();
}

// Exibir projetos
function displayProjects(projects) {
    const projectsGrid = document.getElementById('projectsGrid');
    
    if (projects.length === 0) {
        projectsGrid.innerHTML = `
            <div class="empty-state">
                <p>Nenhum projeto disponível no momento.</p>
            </div>
        `;
        return;
    }

    const overlayClasses = ['overlay-emerald', 'overlay-blue', 'overlay-purple'];
    
    projectsGrid.innerHTML = projects.map((project, index) => {
        const firstImage = project.images && project.images.length > 0 ? project.images[0] : null;
        const overlayClass = overlayClasses[index % overlayClasses.length];
        
        let mediaHTML = '';
        
        if (firstImage) {
            mediaHTML = `
                <div class="project-image">
                    <img src="${firstImage}" alt="${project.title} - Projeto desenvolvido por Dev Brayan, Desenvolvedor Web Full Stack" loading="lazy">
                    <div class="project-overlay ${overlayClass}"></div>
                </div>
            `;
        } else {
            mediaHTML = `
                <div class="project-image">
                    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--zinc-400); font-size: 3rem; background: var(--zinc-800);">📁</div>
                    <div class="project-overlay ${overlayClass}"></div>
                </div>
            `;
        }

        const techTags = project.tech ? project.tech.split(',').map(t => t.trim()).filter(t => t) : [];
        const techHTML = techTags.map(tech => `<span class="tech-tag">${tech}</span>`).join('');
        
        // Verificar se é um jogo (arquivos HTML que contêm palavras-chave de jogos)
        const isGame = project.link && project.link.endsWith('.html') && (
            project.link.toLowerCase().includes('jogo') ||
            project.link.toLowerCase().includes('game') ||
            project.link.toLowerCase().includes('shooter') ||
            project.link.toLowerCase().includes('velha') ||
            project.link.toLowerCase().includes('memoria') ||
            project.link.toLowerCase().includes('pedra') ||
            project.link.toLowerCase().includes('space-shooter')
        );
        
        // Verificar se o link é um arquivo HTML local ou link externo
        const isInteractiveProject = project.link && project.link.endsWith('.html');
        const isExternalLink = project.link && (project.link.startsWith('http://') || project.link.startsWith('https://'));
        const hasImages = project.images && project.images.length > 0;
        
        // Determinar o handler do card
        const cardClickHandler = (isInteractiveProject || isExternalLink)
            ? `onclick="window.open('${project.link}', '_blank')"`
            : hasImages
            ? `onclick="openProjectModal(${index})"`
            : '';

        // Determinar o texto do botão
        let linkText = '';
        if (project.link) {
            if (isGame) {
                linkText = '🎮 Jogar';
            } else if (isExternalLink) {
                linkText = '🔗 Ver repositório';
            } else {
                linkText = 'Ver projeto';
            }
        } else if (hasImages) {
            linkText = '📷 Ver fotos';
        }

        return `
            <div class="project-card" ${cardClickHandler}>
                ${mediaHTML}
                <div class="project-content">
                    <h3 class="project-title">${project.title || 'Sem título'}</h3>
                    <p class="project-description">${project.description || 'Sem descrição'}</p>
                    ${techHTML ? `<div class="tech-tags">${techHTML}</div>` : ''}
                    <div class="project-links">
                        ${project.link ? `<a href="${project.link}" target="_blank" class="project-link" onclick="event.stopPropagation()">
                            ${linkText}
                            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 17L17 7M17 7H7M17 7V17"/></svg>
                        </a>` : hasImages ? `<a href="#" class="project-link" onclick="event.stopPropagation(); openProjectModal(${index}); return false;">
                            ${linkText}
                            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        </a>` : ''}
                        ${project.github ? `<a href="${project.github}" target="_blank" class="project-link" onclick="event.stopPropagation()">
                            GitHub
                            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 17L17 7M17 7H7M17 7V17"/></svg>
                        </a>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Exibir informações de contato
function displayContact(contact) {
    const contactContent = document.getElementById('contactContent');
    
    if (!contact || Object.keys(contact).length === 0 || !Object.values(contact).some(v => v)) {
        contactContent.innerHTML = '<p>Adicione suas informações de contato editando upload/contato.json</p>';
        return;
    }

    const contactItems = [];
    
    if (contact.email) {
        contactItems.push(`
            <a href="mailto:${contact.email}" class="contact-item primary">
                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                ${contact.email}
            </a>
        `);
    }
    
    if (contact.github) {
        contactItems.push(`
            <a href="${contact.github}" target="_blank" rel="noopener noreferrer" class="contact-item">
                <svg class="icon" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                GitHub
            </a>
        `);
    }
    
    if (contact.linkedin) {
        contactItems.push(`
            <a href="${contact.linkedin}" target="_blank" rel="noopener noreferrer" class="contact-item">
                <svg class="icon" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                LinkedIn
            </a>
        `);
    }
    
    if (contact.website) {
        contactItems.push(`
            <a href="${contact.website}" target="_blank" rel="noopener noreferrer" class="contact-item">
                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                Website
            </a>
        `);
    }
    
    if (contact.phone) {
        contactItems.push(`
            <a href="tel:${contact.phone}" class="contact-item">
                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                ${contact.phone}
            </a>
        `);
    }
    
    if (contact.whatsapp) {
        contactItems.push(`
            <a href="https://wa.me/${contact.whatsapp}" target="_blank" rel="noopener noreferrer" class="contact-item">
                <svg class="icon" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                WhatsApp
            </a>
        `);
    }

    contactContent.innerHTML = contactItems.length > 0 
        ? contactItems.join('')
        : '<p>Adicione suas informações de contato editando upload/contato.json</p>';
}

// Exibir links sociais na navbar
function displaySocialLinks(contact) {
    const socialLinks = document.getElementById('socialLinks');
    const mobileSocialLinks = document.getElementById('mobileSocialLinks');
    const links = [];
    
    if (contact.github) {
        links.push(`
            <a href="${contact.github}" target="_blank" rel="noopener noreferrer" class="social-link">
                <svg class="icon" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
        `);
    }
    
    if (contact.email) {
        links.push(`
            <a href="mailto:${contact.email}" target="_blank" rel="noopener noreferrer" class="social-link" title="Enviar email">
                <svg class="icon" fill="currentColor" viewBox="0 0 24 24"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg>
            </a>
        `);
    }
    
    if (contact.whatsapp) {
        links.push(`
            <a href="https://wa.me/${contact.whatsapp}" target="_blank" rel="noopener noreferrer" class="social-link" title="WhatsApp">
                <svg class="icon" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            </a>
        `);
    }
    
    if (contact.linkedin) {
        links.push(`
            <a href="${contact.linkedin}" target="_blank" rel="noopener noreferrer" class="social-link">
                <svg class="icon" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
        `);
    }
    
    if (socialLinks) {
        socialLinks.innerHTML = links.join('');
    }
    
    if (mobileSocialLinks) {
        mobileSocialLinks.innerHTML = links.join('');
    }
}

// Variável global para controlar o carrossel
let currentCarouselIndex = 0;
let carouselImages = [];
let globalProjectsData = null; // Armazenar dados dos projetos carregados

// Modal de projeto (visualização completa com carrossel)
function openProjectModal(index) {
    // Usar dados já carregados ou carregar do JSON
    const loadProjectData = () => {
        if (globalProjectsData) {
            return Promise.resolve(globalProjectsData);
        }
        return fetch('upload/projetos.json').then(response => response.json());
    };
    
    loadProjectData().then(projetosData => {
        const projeto = projetosData.projetos[index];
        if (!projeto) {
            console.error('Projeto não encontrado no índice:', index);
            return;
        }
        
        // Carregar imagens do projeto
        carouselImages = [];
        projeto.imagens.forEach(imgName => {
            // Verificar se é URL (começa com http)
            if (imgName.startsWith('http://') || imgName.startsWith('https://')) {
                carouselImages.push(imgName);
            } else {
                // Usar caminho local
                const imgPath = `upload/${projeto.pasta}/${imgName}`;
                carouselImages.push(imgPath);
            }
        });
        
        currentCarouselIndex = 0;
        
        // Criar modal dinamicamente
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'projectViewModal';
        modal.innerHTML = `
            <div class="modal-content modal-project">
                <div class="modal-header">
                    <h2>${projeto.titulo || 'Projeto'}</h2>
                    <button class="modal-close" onclick="closeProjectViewModal()">&times;</button>
                </div>
                <div class="modal-body">
                    ${projeto.descricao ? `<p style="margin-bottom: 1.5rem; color: var(--zinc-400); line-height: 1.8;">${projeto.descricao}</p>` : ''}
                    
                    ${projeto.tecnologias ? `
                        <div class="tech-tags" style="margin-bottom: 1.5rem;">
                            ${projeto.tecnologias.split(',').map(t => `<span class="tech-tag">${t.trim()}</span>`).join('')}
                        </div>
                    ` : ''}

                    ${carouselImages.length > 0 ? `
                        <div class="carousel-container">
                            <div class="carousel-wrapper">
                                <div class="carousel-track" id="carouselTrack">
                                    ${carouselImages.map((img, i) => `
                                        <div class="carousel-slide ${i === 0 ? 'active' : ''}">
                                            <img src="${img}" alt="${projeto.titulo} - Imagem ${i + 1} do projeto desenvolvido por Dev Brayan" class="carousel-image" loading="lazy">
                                        </div>
                                    `).join('')}
                                </div>
                                ${carouselImages.length > 1 ? `
                                    <button class="carousel-btn carousel-prev" onclick="changeCarouselSlide(-1)" aria-label="Anterior">
                                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                                        </svg>
                                    </button>
                                    <button class="carousel-btn carousel-next" onclick="changeCarouselSlide(1)" aria-label="Próximo">
                                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                        </svg>
                                    </button>
                                    <div class="carousel-indicators">
                                        ${carouselImages.map((_, i) => `
                                            <button class="carousel-indicator ${i === 0 ? 'active' : ''}" onclick="goToCarouselSlide(${i})" aria-label="Slide ${i + 1}"></button>
                                        `).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}

                    <div class="project-links" style="margin-top: 2rem;">
                        ${projeto.link ? `<a href="${projeto.link}" target="_blank" class="btn-primary">Ver Projeto</a>` : ''}
                        ${projeto.github ? `<a href="${projeto.github}" target="_blank" class="btn-secondary">Ver no GitHub</a>` : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeProjectViewModal();
            }
        });
        
        // Adicionar suporte a teclado
        document.addEventListener('keydown', handleCarouselKeyboard);
        
        // Adicionar suporte a touch/swipe
        let touchStartX = 0;
        let touchEndX = 0;
        
        const carouselWrapper = modal.querySelector('.carousel-wrapper');
        if (carouselWrapper) {
            carouselWrapper.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            });
            
            carouselWrapper.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            });
        }
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swipe left - próximo
                    changeCarouselSlide(1);
                } else {
                    // Swipe right - anterior
                    changeCarouselSlide(-1);
                }
            }
        }
        
        // Inicializar carrossel
        updateCarousel();
    })
    .catch(error => {
        console.error('Erro ao carregar projeto:', error);
    });
}

// Mudar slide do carrossel
function changeCarouselSlide(direction) {
    if (carouselImages.length === 0) return;
    
    currentCarouselIndex += direction;
    
    if (currentCarouselIndex < 0) {
        currentCarouselIndex = carouselImages.length - 1;
    } else if (currentCarouselIndex >= carouselImages.length) {
        currentCarouselIndex = 0;
    }
    
    updateCarousel();
}

// Ir para slide específico
function goToCarouselSlide(index) {
    currentCarouselIndex = index;
    updateCarousel();
}

// Atualizar carrossel
function updateCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.carousel-indicator');
    const track = document.getElementById('carouselTrack');
    
    if (!track || slides.length === 0) return;
    
    // Atualizar slides
    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (i === currentCarouselIndex) {
            slide.classList.add('active');
        }
    });
    
    // Atualizar indicadores
    indicators.forEach((indicator, i) => {
        indicator.classList.remove('active');
        if (i === currentCarouselIndex) {
            indicator.classList.add('active');
        }
    });
    
    // Transição suave usando transform
    track.style.transform = `translateX(-${currentCarouselIndex * 100}%)`;
}

// Suporte a teclado
function handleCarouselKeyboard(e) {
    const modal = document.getElementById('projectViewModal');
    if (!modal || !modal.classList.contains('active')) return;
    
    if (e.key === 'ArrowLeft') {
        changeCarouselSlide(-1);
    } else if (e.key === 'ArrowRight') {
        changeCarouselSlide(1);
    } else if (e.key === 'Escape') {
        closeProjectViewModal();
    }
}

function closeProjectViewModal() {
    const modal = document.getElementById('projectViewModal');
    if (modal) {
        document.removeEventListener('keydown', handleCarouselKeyboard);
        modal.remove();
    }
    currentCarouselIndex = 0;
    carouselImages = [];
}

// Navigation scroll effect
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Update active nav link based on scroll position
    let current = '';
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });

    // Atualizar links do menu mobile também
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    mobileNavLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Menu Hambúrguer
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });
}

// Fechar menu ao clicar em um link
mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Fechar menu ao clicar fora
mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
});



// Carregar portfólio ao carregar a página
document.addEventListener('DOMContentLoaded', loadPortfolio);
