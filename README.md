# Portfólio Administrativo

Um portfólio elegante e moderno com área administrativa completa, desenvolvido em HTML, CSS e JavaScript puro. Todos os dados são salvos em arquivos JSON, sem uso de LocalStorage.

## 🎨 Características

- **Design Elegante**: Tema preto e azul moderno e clean
- **Área Administrativa**: Gerencie suas informações pessoais e contatos
- **Sistema de Pastas**: 10 pastas de projetos com até 5 imagens cada
- **Carrossel de Imagens**: Navegação elegante entre fotos dos projetos
- **Sem Backend**: Funciona completamente no frontend, ideal para GitHub Pages
- **Sem LocalStorage**: Tudo salvo em arquivos JSON
- **Responsivo**: Adaptado para todos os dispositivos

## 📁 Estrutura do Projeto

```
portfoliomaster/
├── index.html              # Página principal do portfólio
├── admin.html              # Página administrativa
├── styles.css              # Estilos principais
├── admin.css               # Estilos da área admin
├── script.js               # JavaScript do portfólio
├── admin.js                # JavaScript da área admin
├── upload/                 # Pasta de projetos e imagens
│   ├── projetos.json       # Configuração dos projetos
│   ├── info-pessoal.json  # Informações pessoais
│   ├── contato.json        # Informações de contato
│   ├── foto-pessoal/       # Pasta para foto pessoal
│   │   └── foto.jpg        # Sua foto (opcional)
│   ├── projeto1/           # Pasta do projeto 1
│   │   ├── image1.png
│   │   ├── image2.png
│   │   └── ...
│   ├── projeto2/           # Pasta do projeto 2
│   └── ...                 # projeto3 a projeto10
└── README.md               # Este arquivo
```

## 🚀 Como Usar

### 1. Configurar Projetos

1. **Adicione imagens nas pastas**
   - Vá para a pasta `upload/`
   - Em cada pasta (projeto1 a projeto10), coloque até 5 imagens
   - Formatos aceitos: JPG, PNG, GIF, WebP

2. **Configure os projetos**
   - Edite o arquivo `upload/projetos.json`
   - Configure título, descrição, tecnologias, links para cada projeto
   - Ajuste os nomes das imagens se necessário

3. **Adicione sua foto pessoal (opcional)**
   - Coloque uma imagem na pasta `upload/foto-pessoal/`
   - Nomes aceitos: foto.jpg, foto.png, foto.jpeg, image.jpg, image.png, image.jpeg

4. **Configure informações pessoais**
   - Edite o arquivo `upload/info-pessoal.json`
   - Configure sobre mim, título e subtítulo

5. **Configure contato**
   - Edite o arquivo `upload/contato.json`
   - Adicione email, telefone, LinkedIn, GitHub, website

### 2. Acessar a Área Administrativa

1. Abra `admin.html` no navegador
2. Clique em "🔄 Atualizar" para carregar as imagens das pastas
3. Edite as informações conforme necessário
4. Ao salvar, o sistema baixará arquivos JSON atualizados
5. Substitua os arquivos na pasta `upload/` pelos arquivos baixados

### 3. Visualizar seu Portfólio

- Abra `index.html` para ver seu portfólio
- Os projetos serão exibidos automaticamente
- Clique em um projeto para ver o carrossel de imagens

## 📝 Arquivos JSON

### upload/projetos.json
Contém a configuração de todos os projetos:
```json
{
  "projetos": [
    {
      "id": 1,
      "pasta": "projeto1",
      "titulo": "Nome do Projeto",
      "descricao": "Descrição do projeto",
      "tecnologias": "HTML, CSS, JavaScript",
      "link": "https://projeto.com",
      "github": "https://github.com/usuario/projeto",
      "imagens": ["image1.png", "image2.png", ...]
    }
  ]
}
```

### upload/info-pessoal.json
Informações pessoais:
```json
{
  "about": "Texto sobre você",
  "heroTitle": "Desenvolvedor",
  "heroSubtitle": "Transformando ideias em realidade"
}
```

### upload/contato.json
Informações de contato:
```json
{
  "email": "seu@email.com",
  "phone": "(00) 00000-0000",
  "linkedin": "https://linkedin.com/in/seu-perfil",
  "github": "https://github.com/seu-usuario",
  "website": "https://seusite.com"
}
```

## 📤 Publicando no GitHub Pages

1. Faça upload de todos os arquivos para um repositório GitHub
2. **IMPORTANTE**: Certifique-se de incluir a pasta `upload/` com todas as imagens e arquivos JSON
3. Vá em Settings > Pages
4. Selecione a branch principal
5. Seu portfólio estará disponível em `https://seu-usuario.github.io/nome-do-repo/`

## 🎯 Funcionalidades

### Área Administrativa
- ✅ Gerenciar informações pessoais
- ✅ Editar detalhes dos projetos
- ✅ Carregar projetos automaticamente das pastas
- ✅ Gerenciar informações de contato
- ✅ Exportar arquivos JSON atualizados
- ✅ Interface intuitiva e fácil de usar

### Portfólio
- ✅ Visualização elegante dos projetos
- ✅ Carrossel de imagens com transições suaves
- ✅ Navegação por botões, indicadores, teclado e swipe
- ✅ Links para projetos e GitHub
- ✅ Tags de tecnologias
- ✅ Design responsivo
- ✅ Navegação suave

## 🛠️ Tecnologias Utilizadas

- HTML5
- CSS3 (com variáveis CSS e gradientes)
- JavaScript (ES6+)
- Fetch API

## 📝 Notas Importantes

- **Nenhum dado é salvo no LocalStorage** - tudo vem dos arquivos JSON
- As imagens são carregadas diretamente das pastas
- Cada projeto pode ter até 5 imagens
- Para atualizar informações, edite os arquivos JSON ou use o admin e substitua os arquivos
- A foto pessoal deve estar na pasta `upload/foto-pessoal/`
- Todos os arquivos JSON devem estar na pasta `upload/`

## 🎨 Personalização

Você pode personalizar as cores editando as variáveis CSS em `styles.css`:

```css
:root {
    --cyan-400: #22d3ee;
    --cyan-500: #06b6d4;
    /* ... */
}
```

## 📄 Licença

Este projeto é de código aberto e está disponível para uso livre.
