# 🎰 Master Bingo - Plataforma de Bingo Digital para Eventos e Lives

O **Master Bingo** é uma plataforma completa e moderna voltada para a gestão de bingos profissionais em tempo real, ideal para eventos presenciais, conferências corporativas e transmissões ao vivo (lives).

## 🚀 Tecnologias Utilizadas

### 💻 Frontend (Interface do Usuário)
*   **Next.js 16 + React 19:** Framework de alta performance para renderização rápida e SEO otimizado.
*   **Tailwind CSS 4 + Bootstrap 5:** Design futurista, responsivo e estilizado para garantir a melhor experiência em dispositivos móveis e desktops.
*   **Socket.io Client:** Sincronização em tempo real entre o organizador (Admin) e os jogadores.
*   **React Hot Toast:** Sistema de notificações dinâmicas para eventos do jogo.
*   **QRCode.react:** Geração instantânea de códigos QR para acesso rápido às cartelas.

### 🧠 Backend (Cérebro do Sistema)
*   **Node.js + Express 5:** Motor de processamento robusto para gestão de salas, cartelas e autenticação.
*   **MongoDB + Mongoose 9:** Banco de dados NoSQL de alta performance para armazenamento persistente de dados.
*   **Socket.io (Server):** Orquestração de eventos em tempo real para múltiplos jogadores simultâneos.
*   **Passport.js + JWT:** Segurança robusta para autenticação local e integração com **Google OAuth**.
*   **Bcrypt:** Criptografia de senhas para máxima segurança dos dados do usuário.
*   **Resend:** Integração premium para envio de e-mails transacionais (convites, recuperação de senha).

### 🏗️ Infraestrutura e DevOps
*   **Docker & Docker Compose:** Containerização de todos os serviços para garantir consistência entre ambientes de dev e produção.
*   **VPS (Hostinger/Linux Ubuntu):** Servidor privado dedicado para alta disponibilidade.
*   **Cloudflare:** Proteção contra ataques DDoS, DNS otimizado e aceleração de conteúdo (CDN).
*   **Nginx Proxy Manager:** Proxy reverso com gestão automatizada de certificados **SSL (Let's Encrypt)**.

## 🛠️ Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js 20+
- Docker & Docker Compose (Opcional, mas recomendado)
- MongoDB (Local ou Atlas)

### 1. Clonar o Repositório
```bash
git clone https://github.com/andrebontempo/masterbingo.git
cd masterbingo
```

### 2. Configurar Variáveis de Ambiente
Crie arquivos `.env` nas pastas `/frontend` e `/backend` baseando-se nos exemplos ou arquivos existentes.

### 3. Instalar Dependências e Rodar
Na raiz do projeto (usando Docker):
```bash
docker-compose up -d
```

Ou sem Docker (separadamente):
```bash
# Terminal 1 - Backend
cd backend && npm install && npm run dev

# Terminal 2 - Frontend
cd frontend && npm install && npm run dev
```

---

## 🌐 Endpoints de Produção
- **Frontend:** [https://masterbingo.com.br](https://masterbingo.com.br)
- **API (Health Check):** [https://api.masterbingo.com.br/api/health](https://api.masterbingo.com.br/api/health)

---
*Este documento é atualizado automaticamente conforme novas funcionalidades são implementadas.*
