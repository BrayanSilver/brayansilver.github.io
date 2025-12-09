let currentEditingIndex = null;
let projetosData = [];
let personalInfoData = {};
let contactData = {};

// Carregar dados ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadAllData();
    setupNavigation();
});

// Navegação entre seções
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            showSection(section);
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function showSection(section) {
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(`${section}-section`).classList.add('active');
}

// Carregar todos os dados dos arquivos JSON
async function loadAllData() {
    await loadPersonalInfo();
    await loadContactInfo();
    await loadProjectsFromFolders();
    await loadPersonalPhoto();
}

// Carregar informações pessoais
async function loadPersonalInfo() {
    try {
        const response = await fetch('upload/info-pessoal.json');
        if (response.ok) {
            personalInfoData = await response.json();
            document.getElementById('aboutText').value = personalInfoData.about || '';
            document.getElementById('heroTitle').value = personalInfoData.heroTitle || '';
            document.getElementById('heroSubtitle').value = personalInfoData.heroSubtitle || '';
        }
    } catch (error) {
        console.error('Erro ao carregar informações pessoais:', error);
    }
}

// Carregar informações de contato
async function loadContactInfo() {
    try {
        const response = await fetch('upload/contato.json');
        if (response.ok) {
            contactData = await response.json();
            document.getElementById('email').value = contactData.email || '';
            document.getElementById('phone').value = contactData.phone || '';
            document.getElementById('linkedin').value = contactData.linkedin || '';
            document.getElementById('github').value = contactData.github || '';
            document.getElementById('website').value = contactData.website || '';
        }
    } catch (error) {
        console.error('Erro ao carregar contato:', error);
    }
}

// Carregar foto pessoal
async function loadPersonalPhoto() {
    const preview = document.getElementById('personalPhotoPreview');
    
    // Primeiro tentar carregar do JSON
    if (personalInfoData.foto) {
        const photoPath = `upload/foto-pessoal/${personalInfoData.foto}`;
        try {
            const response = await fetch(photoPath);
            if (response.ok) {
                preview.innerHTML = `
                    <img src="${photoPath}" alt="Foto pessoal" style="max-width: 200px; border-radius: 8px; border: 1px solid var(--border-color);">
                    <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.5rem;">Foto: ${personalInfoData.foto}</p>
                `;
                return;
            }
        } catch (e) {
            // Continuar para fallback
        }
    }
    
    // Fallback: tentar nomes padrão
    const photoPaths = [
        'upload/foto-pessoal/foto.jpg',
        'upload/foto-pessoal/foto.png',
        'upload/foto-pessoal/foto.jpeg',
        'upload/foto-pessoal/image.jpg',
        'upload/foto-pessoal/image.png',
        'upload/foto-pessoal/image.jpeg'
    ];
    
    for (let path of photoPaths) {
        try {
            const response = await fetch(path);
            if (response.ok) {
                preview.innerHTML = `
                    <img src="${path}" alt="Foto pessoal" style="max-width: 200px; border-radius: 8px; border: 1px solid var(--border-color);">
                    <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.5rem;">Foto encontrada: ${path.split('/').pop()}</p>
                `;
                return;
            }
        } catch (e) {
            // Continuar tentando
        }
    }
    
    preview.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem;">Nenhuma foto encontrada. Coloque uma imagem na pasta upload/foto-pessoal/ e configure no info-pessoal.json</p>';
}

// Carregar projetos das pastas
async function loadProjectsFromFolders() {
    try {
        const response = await fetch('upload/projetos.json');
        if (!response.ok) {
            throw new Error('Arquivo projetos.json não encontrado');
        }
        
        const data = await response.json();
        projetosData = data.projetos || [];
        
        // Carregar imagens de cada projeto
        for (let projeto of projetosData) {
            projeto.loadedImages = [];
            
            for (let imgName of projeto.imagens || []) {
                // Verificar se é URL (começa com http)
                if (imgName.startsWith('http://') || imgName.startsWith('https://')) {
                    projeto.loadedImages.push(imgName);
                } else {
                    // Tentar carregar imagem local
                    const imgPath = `upload/${projeto.pasta}/${imgName}`;
                    try {
                        const imgResponse = await fetch(imgPath);
                        if (imgResponse.ok) {
                            projeto.loadedImages.push(imgPath);
                        }
                    } catch (e) {
                        // Imagem não encontrada
                    }
                }
            }
        }
        
        displayProjects(projetosData);
        showNotification('Projetos carregados com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao carregar projetos:', error);
        showNotification('Erro ao carregar projetos. Verifique se o arquivo upload/projetos.json existe.', 'error');
    }
}

// Salvar informações pessoais (exportar JSON)
function savePersonalInfo() {
    personalInfoData = {
        about: document.getElementById('aboutText').value,
        heroTitle: document.getElementById('heroTitle').value,
        heroSubtitle: document.getElementById('heroSubtitle').value,
        foto: personalInfoData.foto || '' // Manter foto existente
    };
    
    exportJSON('info-pessoal.json', personalInfoData);
    showNotification('Informações pessoais atualizadas! Baixe o arquivo e substitua upload/info-pessoal.json', 'success');
}

// Salvar informações de contato (exportar JSON)
function saveContactInfo() {
    contactData = {
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        linkedin: document.getElementById('linkedin').value,
        github: document.getElementById('github').value,
        website: document.getElementById('website').value
    };
    
    exportJSON('contato.json', contactData);
    showNotification('Informações de contato atualizadas! Baixe o arquivo e substitua upload/contato.json', 'success');
}

// Exportar JSON genérico
function exportJSON(filename, data) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Exibir projetos na lista
function displayProjects(projetos) {
    const projectsList = document.getElementById('projectsList');
    
    if (projetos.length === 0) {
        projectsList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Nenhum projeto encontrado. Verifique o arquivo upload/projetos.json</p>';
        return;
    }
    
    projectsList.innerHTML = projetos.map((projeto, index) => {
        const firstImage = projeto.loadedImages && projeto.loadedImages.length > 0 ? projeto.loadedImages[0] : null;
        const imageHTML = firstImage 
            ? `<img src="${firstImage}" alt="${projeto.titulo}" class="project-item-image">`
            : `<div class="project-item-image" style="display: flex; align-items: center; justify-content: center; color: var(--text-secondary); font-size: 3rem;">📁</div>`;
        
        return `
            <div class="project-item">
                ${imageHTML}
                <div class="project-item-content">
                    <h3 class="project-item-title">${projeto.titulo || 'Sem título'}</h3>
                    <p class="project-item-description">${projeto.descricao || 'Sem descrição'}</p>
                    <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1rem;">
                        <strong>Pasta:</strong> ${projeto.pasta} | 
                        <strong>Imagens:</strong> ${projeto.loadedImages.length}/${projeto.imagens.length}
                    </p>
                    <div class="project-item-actions">
                        <button class="btn-edit" onclick="editProject(${index})">Editar</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Editar projeto
function editProject(index) {
    const projeto = projetosData[index];
    
    if (!projeto) return;
    
    currentEditingIndex = index;
    
    document.getElementById('modalTitle').textContent = 'Editar Projeto';
    document.getElementById('projectTitle').value = projeto.titulo || '';
    document.getElementById('projectDescription').value = projeto.descricao || '';
    document.getElementById('projectTech').value = projeto.tecnologias || '';
    document.getElementById('projectLink').value = projeto.link || '';
    document.getElementById('projectGithub').value = projeto.github || '';
    
    // Exibir imagens carregadas
    const uploadedImages = document.getElementById('uploadedImages');
    if (projeto.loadedImages.length > 0) {
        uploadedImages.innerHTML = projeto.loadedImages.map((img, i) => `
            <div class="uploaded-file">
                <img src="${img}" alt="Imagem ${i + 1}">
            </div>
        `).join('');
    } else {
        uploadedImages.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9rem;">Nenhuma imagem encontrada na pasta. Verifique se as imagens estão na pasta correta.</p>';
    }
    
    document.getElementById('projectModal').classList.add('active');
}

// Fechar modal
function closeProjectModal() {
    document.getElementById('projectModal').classList.remove('active');
    currentEditingIndex = null;
}

// Salvar projeto
function saveProject() {
    if (currentEditingIndex === null) return;
    
    const projeto = projetosData[currentEditingIndex];
    
    projeto.titulo = document.getElementById('projectTitle').value.trim();
    projeto.descricao = document.getElementById('projectDescription').value.trim();
    projeto.tecnologias = document.getElementById('projectTech').value.trim();
    projeto.link = document.getElementById('projectLink').value.trim();
    projeto.github = document.getElementById('projectGithub').value.trim();
    
    if (!projeto.titulo) {
        alert('Por favor, preencha o título do projeto.');
        return;
    }
    
    // Atualizar exibição
    displayProjects(projetosData);
    
    // Exportar JSON atualizado
    exportProjectsJSON();
    
    showNotification('Projeto atualizado! Baixe o arquivo e substitua upload/projetos.json', 'success');
    closeProjectModal();
}

// Exportar projetos.json atualizado
function exportProjectsJSON() {
    const data = {
        projetos: projetosData
    };
    
    exportJSON('projetos.json', data);
}

// Notificação
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    
    let bgColor = 'linear-gradient(135deg, var(--cyan-500), #2563eb)';
    if (type === 'error') {
        bgColor = 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)';
    } else if (type === 'warning') {
        bgColor = 'linear-gradient(135deg, #ffaa00 0%, #ff8800 100%)';
    } else if (type === 'info') {
        bgColor = 'linear-gradient(135deg, #3399ff 0%, #0066ff 100%)';
    }
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        word-wrap: break-word;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    const duration = type === 'error' ? 5000 : 3000;
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// Adicionar animações CSS dinamicamente
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Fechar modal ao clicar fora
document.getElementById('projectModal').addEventListener('click', (e) => {
    if (e.target.id === 'projectModal') {
        closeProjectModal();
    }
});
