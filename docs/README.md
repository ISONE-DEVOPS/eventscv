# EventsCV - Plataforma de Eventos de Cabo Verde

Plataforma SaaS de gestão de eventos end-to-end para Cabo Verde e mercado global, com sistema de bilhética NFC, wallet digital e pagamentos cashless.

## Stack Tecnológico

- **Frontend Web:** Next.js 14+ (App Router) + Tailwind CSS
- **Mobile:** Flutter 3+
- **Backend:** Firebase (Firestore, Auth, Functions, Storage)
- **Hosting:** Google Cloud Platform / Vercel
- **Pagamentos:** Stripe, Pagali, Vinti4

## Estrutura do Projeto

```
eventscv/
├── apps/
│   ├── web/          # Next.js - Portal público + Marketplace
│   ├── admin/        # Next.js - Dashboard Admin/Organizadores
│   └── mobile/       # Flutter - App mobile
├── packages/
│   ├── shared-types/ # TypeScript types partilhados
│   ├── ui-components/# Componentes React partilhados
│   └── utils/        # Funções utilitárias
├── functions/        # Cloud Functions
├── firebase/         # Configuração Firebase
└── infrastructure/   # Terraform/IaC
```

## Pré-requisitos

- Node.js 18+
- npm 10+
- Firebase CLI (`npm install -g firebase-tools`)
- Flutter 3.16+ (para desenvolvimento mobile)
- Conta Google Cloud Platform

## Setup Inicial

### 1. Clonar e Instalar Dependências

```bash
# Clonar o repositório
git clone https://github.com/your-org/eventscv.git
cd eventscv

# Instalar dependências
npm install
```

### 2. Configurar Firebase

```bash
# Login no Firebase
firebase login

# Selecionar projeto
firebase use eventscv-staging

# Copiar variáveis de ambiente
cp apps/web/.env.example apps/web/.env.local
# Editar .env.local com as suas credenciais Firebase
```

### 3. Executar em Desenvolvimento

```bash
# Iniciar emuladores Firebase (num terminal)
npm run firebase:emulators

# Iniciar app web (noutro terminal)
npm run dev:web

# Ou iniciar admin dashboard
npm run dev:admin
```

A aplicação estará disponível em:
- Web: http://localhost:3000
- Admin: http://localhost:3001
- Firebase Emulator UI: http://localhost:4000

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia todas as apps em dev |
| `npm run dev:web` | Inicia apenas o portal web |
| `npm run dev:admin` | Inicia apenas o admin dashboard |
| `npm run build` | Build de todas as apps |
| `npm run lint` | Lint em todo o código |
| `npm run test` | Executa todos os testes |
| `npm run firebase:emulators` | Inicia emuladores Firebase |
| `npm run deploy:functions` | Deploy das Cloud Functions |

## Deploy

### Cloud Functions

```bash
cd functions
npm run deploy
```

### Web App 

O deploy automático via GitHub Actions quando há push para `main`.

### Admin Dashboard (Firebase Hosting)

```bash
cd apps/admin
npm run build
firebase deploy --only hosting:eventscv-admin
```

## Variáveis de Ambiente

### Web App

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Public Key |

### Cloud Functions

| Variável | Descrição |
|----------|-----------|
| `STRIPE_SECRET_KEY` | Stripe Secret Key |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Secret |
| `SENDGRID_API_KEY` | SendGrid API Key |

## Documentação

- [Plano de Implementação](./PLANO_IMPLEMENTACAO.md)
- [Arquitetura](./docs/architecture/)
- [API Reference](./docs/api/)

## Contribuição

1. Crie uma branch para a sua feature (`git checkout -b feature/nova-feature`)
2. Commit as suas alterações (`git commit -m 'Adiciona nova feature'`)
3. Push para a branch (`git push origin feature/nova-feature`)
4. Abra um Pull Request

## Licença

Proprietary - EventsCV © 2024
