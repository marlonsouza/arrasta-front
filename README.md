# 🚀 Arrasta.click - Frontend

[![Vue.js](https://img.shields.io/badge/Vue.js-3.2.13-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vue Router](https://img.shields.io/badge/Vue%20Router-4.5.1-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://router.vuejs.org/)
[![Netlify](https://img.shields.io/badge/Netlify-Ready-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://netlify.com/)

🎉 **Bem-vindo(a) ao repositório frontend do Arrasta.click!** O encurtador de URLs mais maneiro da internet, com design moderno e funcionalidades incríveis! 

Transforme links longos em URLs elegantes e compartilháveis, com QR codes automáticos, analytics em tempo real e uma interface que vai te impressionar! ✨

## ⚡ Funcionalidades Principais

### 🔗 **Encurtamento Inteligente**
- **Encurtamento rápido** com validação em tempo real
- **Aliases personalizados** para URLs mais memoráveis
- **Data de expiração configurável** para controle de acesso
- **Geração automática de QR codes** para cada link

### 📊 **Analytics Avançados** 
- **Consulta detalhada de links** com estatísticas completas
- **Contador de acessos em tempo real**
- **Histórico completo** com datas de criação e expiração
- **Informações do usuário** e metadata dos links

### 🎨 **Design Profissional**
- **Interface moderna** com gradientes e animações suaves
- **Responsive design** otimizado para todos os dispositivos
- **Dark/Light theme** com transições elegantes
- **Micro-interactions** que encantam o usuário
- **Páginas de erro personalizadas** com navegação intuitiva

### 🚀 **Experiência do Usuário**
- **Navegação por rotas** com Vue Router 4
- **Single Page Application (SPA)** para performance máxima
- **Loading states** e feedback visual constante
- **Componentes reutilizáveis** e arquitetura modular

## 🛠️ Stack Técnico

### **Frontend Framework**
- **Vue.js 3.2.13** - Framework progressivo com Composition API
- **Vue Router 4.5.1** - Roteamento SPA com suporte a rotas dinâmicas
- **Vue CLI 5.0** - Tooling moderno para desenvolvimento e build

### **Design & Styling**
- **CSS3** com gradientes avançados e animações
- **Responsive Design** com media queries otimizadas
- **Custom SVG Icons** com animações CSS
- **Google Fonts (Oswald)** para tipografia elegante

### **Arquitetura**
- **Component-based architecture** com separação clara de responsabilidades
- **Route-based code splitting** para performance otimizada
- **API integration** com fetch moderna e error handling
- **PWA-ready** com service workers e cache strategies

### **Deploy & Hosting**
- **Netlify** com continuous deployment
- **SPA routing** configurado com _redirects
- **CDN global** para performance mundial

## 🚀 Configuração do Projeto

### **Pré-requisitos**
- Node.js 16+ e npm 8+
- Git para clonagem do repositório

### **Instalação Rápida**

```bash
# Clone o repositório
git clone https://github.com/marlonsouza/arrasta-frontend.git

# Entre na pasta do projeto
cd arrasta-frontend

# Instale as dependências
npm install

# Rode o servidor de desenvolvimento
npm run serve

# Acesse o projeto em http://localhost:8080
```

### **Scripts Disponíveis**

```bash
npm run serve      # Servidor de desenvolvimento com hot-reload
npm run build      # Build para produção otimizado
npm run lint       # Linting com ESLint e correções automáticas
```

## 🌐 Estrutura de Rotas

```
/@/                    # Página principal (encurtador)
/@/lookup             # Consulta de links e analytics  
/@/info/:shortCode    # Informações detalhadas do link
/:shortCode          # Redirecionamento automático
```

## 📁 Arquitetura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── UrlShortener.vue    # Formulário de encurtamento
│   ├── UrlLookup.vue       # Consulta e analytics
│   └── ShortUrlRedirect.vue # Redirecionamento e 404
├── router/             # Configuração de rotas
│   └── index.js           # Definição das rotas SPA
├── assets/            # Recursos estáticos
│   └── style.css         # Estilos globais e temas
└── main.js           # Entry point da aplicação

public/
├── index.html        # Template HTML principal  
├── icon.svg         # Favicon customizado
├── favicon.ico      # Fallback para browsers antigos
└── _redirects       # Configuração Netlify SPA
```

## 🎯 Recursos Especiais

### **🔥 Performance**
- **Lazy loading** de componentes para carregamento otimizado
- **Cache inteligente** de favicons e recursos estáticos  
- **Minificação automática** do CSS e JavaScript
- **Bundle splitting** para chunks otimizados

### **📱 Mobile-First**
- **Progressive Web App (PWA)** ready
- **Touch-friendly** interface com gestos intuitivos
- **Viewport otimizado** para todas as telas
- **Theme-color** configurado para navegadores móveis

### **🔐 Segurança & SEO**
- **Meta tags completas** para SEO e social sharing
- **Open Graph** e Twitter Cards configurados
- **Content Security Policy** headers
- **HTTPS-ready** com redirects automáticos

## 🚀 Deploy

### **Netlify (Recomendado)**
1. Fork este repositório
2. Conecte sua conta Netlify ao GitHub
3. Configure o build: `npm run build`
4. Pasta de publicação: `dist`
5. Deploy automático a cada push! 🎉

### **Outros Serviços**
- **Vercel**: Suporte nativo para Vue.js SPA
- **GitHub Pages**: Com configuração manual de rotas
- **Firebase Hosting**: Com regras de rewrite configuradas

## 🤝 Contribuindo

Adoramos contribuições! 🌟 Aqui está como você pode ajudar:

### **🐛 Reportando Bugs**
- Use as [issues](https://github.com/marlonsouza/arrasta-frontend/issues) do GitHub
- Descreva o problema detalhadamente
- Inclua screenshots se possível

### **💡 Sugerindo Features**
- Abra uma issue com sua ideia
- Explique como ela melhoraria a experiência
- Discuta a implementação com a comunidade

### **🔧 Contribuindo Código**
```bash
# Fork o repositório
# Clone seu fork
git clone https://github.com/SEU-USUARIO/arrasta-frontend.git

# Crie uma branch para sua feature
git checkout -b feature/minha-feature

# Faça suas alterações
# Teste localmente
npm run serve

# Commit suas mudanças
git commit -m "✨ Adiciona minha feature incrível"

# Push para sua branch
git push origin feature/minha-feature

# Abra um Pull Request! 🚀
```

## 📊 Roadmap

- [ ] **Dashboard de Analytics** com gráficos interativos
- [ ] **API de integração** para desenvolvedores
- [ ] **Temas customizáveis** e modo escuro
- [ ] **Bulk URL shortening** para múltiplos links
- [ ] **Integration** com redes sociais
- [ ] **Mobile app** nativo (React Native)

## 📞 Contato & Suporte

- **🐛 Bugs**: [GitHub Issues](https://github.com/marlonsouza/arrasta-frontend/issues)
- **💬 Discussões**: [GitHub Discussions](https://github.com/marlonsouza/arrasta-frontend/discussions)
- **📧 Email**: contato@arrasta.click

## 📜 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">
  
**🚀 Feito com ❤️ e muito ☕ por [Marlon Souza](https://github.com/marlonsouza)**

*Transformando links longos em experiências curtas desde 2024!* ✨

[🌐 Site](https://arrasta.click) • [📱 Demo](https://arrasta.click/@/) • [🐛 Issues](https://github.com/marlonsouza/arrasta-frontend/issues)

</div>