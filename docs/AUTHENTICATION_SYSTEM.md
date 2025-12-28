# Sistema de Autenticação - EventsCV

**Data:** 28 de Dezembro de 2025
**Status:** ✅ Completo e Deployado
**Versão:** 1.0.0

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Métodos de Autenticação](#métodos-de-autenticação)
3. [Funcionalidades de Segurança](#funcionalidades-de-segurança)
4. [Páginas Implementadas](#páginas-implementadas)
5. [Fluxos de Autenticação](#fluxos-de-autenticação)
6. [Configuração Firebase](#configuração-firebase)
7. [Validações](#validações)
8. [Rate Limiting](#rate-limiting)
9. [Testes](#testes)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

Sistema de autenticação completo e seguro integrado com Firebase Authentication, oferecendo múltiplos métodos de login, validações robustas, e proteção contra ataques.

### Objetivos

✅ **Segurança**: Proteção contra brute force, validações rigorosas, rate limiting
✅ **Experiência do Utilizador**: Interface intuitiva, mensagens claras, fluxos simplificados
✅ **Flexibilidade**: Múltiplos métodos de autenticação
✅ **Compliance**: Verificação de email, aceitação de termos, RGPD-ready

---

## 🔐 Métodos de Autenticação

### 1. Email/Password

**Status:** ✅ Enabled
**Provider:** Firebase Authentication

**Funcionalidades:**
- Registo com email e password
- Login com credenciais
- Recuperação de password via email
- Verificação de email após registo
- Remember Me (sessão persistente vs temporária)

**Requisitos de Password:**
- Mínimo 8 caracteres
- Pelo menos 1 letra maiúscula
- Pelo menos 1 letra minúscula
- Pelo menos 1 número

**Exemplo de uso:**
```typescript
const userCredential = await signInWithEmailAndPassword(auth, email, password);
```

---

### 2. Google Sign-In

**Status:** ✅ Enabled
**Provider:** Google OAuth 2.0

**Funcionalidades:**
- Login com um clique
- Registo automático de novos utilizadores
- Criação automática de documento Firestore
- Popup de autenticação

**Vantagens:**
- Sem necessidade de password
- Verificação automática de email
- Dados pré-preenchidos (nome, email, foto)

**Exemplo de uso:**
```typescript
const provider = new GoogleAuthProvider();
const result = await signInWithPopup(auth, provider);
```

---

### 3. Phone (SMS)

**Status:** ✅ Enabled (configurado no Firebase)
**Provider:** Firebase Authentication

**Nota:** Interface não implementada ainda. Pronto para implementação futura.

---

## 🛡️ Funcionalidades de Segurança

### 1. Rate Limiting Local

**Proteção contra Brute Force:**
- Máximo 5 tentativas de login falhadas
- Bloqueio automático por 5 minutos após 5 falhas
- Contador visual de tentativas
- Timer de desbloqueio em tempo real

**Implementação:**
```typescript
// Armazenamento no localStorage
const attempts = localStorage.getItem('loginAttempts');
const blockExpiry = localStorage.getItem('loginBlockExpiry');

// Bloqueio após 5 tentativas
if (newAttempts >= 5) {
  const blockExpiry = Date.now() + 5 * 60 * 1000; // 5 minutos
  localStorage.setItem('loginBlockExpiry', blockExpiry.toString());
  setIsBlocked(true);
}
```

**Reset de tentativas:**
- Login bem-sucedido
- Expiração do tempo de bloqueio
- Limpeza manual do localStorage

---

### 2. Session Persistence

**Remember Me:**
```typescript
// Sessão persistente (local storage - mantém após fechar browser)
await setPersistence(auth, browserLocalPersistence);

// Sessão temporária (session storage - apenas durante sessão do browser)
await setPersistence(auth, browserSessionPersistence);
```

**Uso:**
- Checkbox "Lembrar-me" na página de login
- Aplicado tanto para email/password como Google Sign-In

---

### 3. Email Verification

**Processo:**
1. Utilizador cria conta
2. Email de verificação enviado automaticamente
3. Utilizador clica no link do email
4. Email verificado no Firebase

**Implementação:**
```typescript
await sendEmailVerification(userCredential.user, {
  url: `${window.location.origin}/profile`,
  handleCodeInApp: false,
});
```

**Configuração do Email:**
- Template padrão do Firebase
- Link de retorno para /profile
- Idioma: Português

---

### 4. Password Reset

**Fluxo:**
1. Utilizador clica "Esqueci a password"
2. Insere email
3. Recebe email com link de reset
4. Clica no link e define nova password
5. Redirect automático para login

**Segurança:**
- Não revela se o email existe (previne enumeração de utilizadores)
- Link expira após 1 hora
- Apenas 1 reset ativo por vez

**Implementação:**
```typescript
await sendPasswordResetEmail(auth, email, {
  url: `${window.location.origin}/auth/login`,
  handleCodeInApp: false,
});
```

---

## 📄 Páginas Implementadas

### 1. Login Page

**URL:** `/auth/login`
**Deployment:** https://eventscv-web.web.app/auth/login

**Componentes:**
- Input de email com validação
- Input de password com toggle show/hide
- Checkbox "Lembrar-me"
- Link "Esqueci a password"
- Botão de login via Google
- Link para criar conta

**Estados:**
- Loading (spinner durante autenticação)
- Error (mensagens de erro específicas)
- Blocked (durante bloqueio por rate limiting)

**Validações:**
- Email obrigatório
- Password obrigatória
- Formato de email válido

**Mensagens de Erro:**
```typescript
// Específicas por tipo de erro
'auth/user-not-found' → 'Utilizador não encontrado. Verifica o teu email ou cria uma conta.'
'auth/wrong-password' → 'Password incorreta. Tenta novamente.'
'auth/invalid-email' → 'Formato de email inválido.'
'auth/too-many-requests' → 'Demasiadas tentativas. Aguarda alguns minutos.'
'auth/user-disabled' → 'Esta conta foi desativada. Contacta o suporte.'
'auth/invalid-credential' → 'Email ou password incorretos. Tenta novamente.'
```

**Redirect após login:**
- Se URL tem `?redirect=/path` → vai para `/path`
- Caso contrário → vai para `/`

**Exemplo:**
```
/auth/login?redirect=/checkout
→ Após login bem-sucedido → /checkout
```

---

### 2. Register Page

**URL:** `/auth/register`
**Deployment:** https://eventscv-web.web.app/auth/register

**Componentes:**
- Input de nome completo
- Input de email
- Input de telefone
- Input de password com validação visual
- Input de confirmação de password
- Checkbox de aceitação de termos
- Botão de registo via Google

**Validações em Tempo Real:**

**Nome:**
- Mínimo 2 caracteres
- Apenas letras e espaços
- Regex: `/^[a-zA-ZÀ-ÿ\s]+$/`

**Email:**
- Formato válido
- Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

**Telefone (opcional mas validado se preenchido):**
- Formato Cabo Verde: +238 seguido de 7 dígitos
- Aceita: `+238 999 9999`, `238 9999999`, `9999999`
- Regex: `/^(\+238|238)?[0-9]{7}$/`

**Password:**
```typescript
const passwordRequirements = [
  { label: 'Mínimo 8 caracteres', met: password.length >= 8 },
  { label: 'Uma letra maiúscula', met: /[A-Z]/.test(password) },
  { label: 'Uma letra minúscula', met: /[a-z]/.test(password) },
  { label: 'Um número', met: /[0-9]/.test(password) },
];
```

**Visual Feedback:**
- ✅ Verde se requisito cumprido
- ⭕ Cinza se requisito não cumprido
- Atualização em tempo real

**Processo de Registo:**
1. Validação de todos os campos
2. Criação de conta no Firebase Auth
3. Update do displayName
4. Envio de email de verificação
5. Criação de documento no Firestore
6. Redirect para `/profile?newUser=true`

**Documento Firestore Criado:**
```typescript
{
  id: userId,
  email: email,
  name: name,
  phone: phone || '',
  preferredLanguage: 'pt',
  notificationsEnabled: true,
  wallet: {
    balance: 0,
    bonusBalance: 0,
    currency: 'CVE',
  },
  loyalty: {
    points: 0,
    tier: 'bronze',
  },
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  lastLoginAt: serverTimestamp(),
}
```

---

### 3. Forgot Password Page

**URL:** `/auth/forgot-password`
**Deployment:** https://eventscv-web.web.app/auth/forgot-password

**Componentes:**
- Input de email
- Botão "Enviar link de recuperação"
- Link voltar ao login
- Link criar conta

**Fluxo:**
1. Utilizador insere email
2. Click em "Enviar link"
3. Sistema envia email (ou não, mas não revela)
4. Mostra página de sucesso

**Página de Sucesso:**
- Ícone de confirmação
- Mensagem de sucesso
- Instruções para verificar spam
- Botão "Voltar ao Login"
- Botão "Tentar outro email"

**Dicas exibidas:**
- Verifica a pasta de spam
- Aguarda alguns minutos
- Confirma se o email está correto

**Segurança:**
- Sempre mostra mensagem de sucesso (mesmo se email não existe)
- Previne enumeração de utilizadores
- Email só válido por 1 hora

---

## 🔄 Fluxos de Autenticação

### Fluxo 1: Novo Utilizador (Email/Password)

```
1. Acesso à homepage → Click "Criar conta"
   ↓
2. Página de registo (/auth/register)
   ↓
3. Preenche formulário:
   - Nome: João Silva
   - Email: joao@example.com
   - Telefone: +238 999 9999
   - Password: (com requisitos)
   - Confirmar password
   - ☑ Aceito termos e condições
   ↓
4. Click "Criar conta"
   ↓
5. Firebase Authentication:
   - createUserWithEmailAndPassword()
   - updateProfile() com displayName
   - sendEmailVerification()
   ↓
6. Firestore:
   - Cria documento em users/{uid}
   - Inicializa wallet e loyalty
   ↓
7. Redirect → /profile?newUser=true
   ↓
8. Utilizador vê:
   - Perfil criado
   - Aviso para verificar email
   - Saldo wallet = 0
   - Pontos loyalty = 0
```

---

### Fluxo 2: Login Existente

```
1. Acesso à /auth/login
   ↓
2. Preenche credenciais:
   - Email: joao@example.com
   - Password: ••••••••
   - ☑ Lembrar-me
   ↓
3. Click "Entrar"
   ↓
4. Firebase Authentication:
   - setPersistence(browserLocalPersistence)
   - signInWithEmailAndPassword()
   ↓
5. Firestore:
   - Verifica se documento existe
   - Se não existe: cria
   - Se existe: atualiza lastLoginAt
   ↓
6. Rate Limiting:
   - Reset loginAttempts
   - Limpa block
   ↓
7. Redirect → / (ou URL do redirect param)
   ↓
8. Utilizador autenticado:
   - Sessão ativa
   - Acesso a áreas protegidas
```

---

### Fluxo 3: Login com Google

```
1. Acesso à /auth/login ou /auth/register
   ↓
2. Click botão "Google"
   ↓
3. Popup do Google:
   - Seleciona conta Google
   - Autoriza EventsCV
   ↓
4. Firebase Authentication:
   - setPersistence()
   - signInWithPopup(GoogleAuthProvider)
   ↓
5. Firestore:
   - Verifica se documento existe
   - Se novo: cria com dados do Google
   - Se existente: atualiza lastLoginAt
   ↓
6. Redirect → / (ou URL do redirect param)
   ↓
7. Utilizador autenticado:
   - Email já verificado
   - Foto de perfil do Google
   - Nome do Google
```

---

### Fluxo 4: Recuperação de Password

```
1. /auth/login → Click "Esqueci a password"
   ↓
2. /auth/forgot-password
   ↓
3. Insere email: joao@example.com
   ↓
4. Click "Enviar link de recuperação"
   ↓
5. Firebase Authentication:
   - sendPasswordResetEmail()
   ↓
6. Página de sucesso:
   - "Email enviado!"
   - Instruções
   ↓
7. Email recebido:
   - Link de reset válido por 1h
   ↓
8. Click no link do email
   ↓
9. Página do Firebase:
   - Insere nova password
   - Confirma password
   ↓
10. Password alterada
    ↓
11. Redirect → /auth/login
    ↓
12. Login com nova password
```

---

## ⚙️ Configuração Firebase

### Authentication Settings

**Métodos Habilitados:**
- ✅ Email/Password
- ✅ Google
- ✅ Phone (SMS)

**Configuração Email/Password:**
```
Email enumeration protection: Enabled (recomendado)
Email template language: Portuguese
Password reset timeout: 1 hour
```

**Configuração Google:**
```
Client ID: (configurado automaticamente)
Client Secret: (configurado automaticamente)
Authorized domains:
  - eventscv-web.web.app
  - eventscv-platform.web.app
  - localhost
```

**Configuração Phone:**
```
Status: Enabled
SMS Provider: Firebase (padrão)
Test phone numbers: (opcional)
```

---

### Templates de Email

**Email de Verificação:**
- **Assunto:** Verifica o teu email - EventsCV
- **Idioma:** Português
- **Template:** Firebase padrão
- **Link expiration:** 1 hora

**Email de Reset de Password:**
- **Assunto:** Redefinir password - EventsCV
- **Idioma:** Português
- **Template:** Firebase padrão
- **Link expiration:** 1 hora

**Personalização Futura:**
Para personalizar os templates:
1. Firebase Console → Authentication → Templates
2. Editar cada template
3. Usar variáveis: `%LINK%`, `%EMAIL%`, `%APP_NAME%`

---

## ✅ Validações

### Client-Side (Frontend)

**Email:**
```typescript
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

**Telefone (Cabo Verde):**
```typescript
const isValidPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/[\s-]/g, '');
  const phoneRegex = /^(\+238|238)?[0-9]{7}$/;
  return phoneRegex.test(cleanPhone);
};
```

**Nome:**
```typescript
const isValidName = (name: string): boolean => {
  return name.trim().length >= 2 && /^[a-zA-ZÀ-ÿ\s]+$/.test(name);
};
```

**Password:**
```typescript
const passwordRequirements = [
  { label: 'Mínimo 8 caracteres', met: password.length >= 8 },
  { label: 'Uma letra maiúscula', met: /[A-Z]/.test(password) },
  { label: 'Uma letra minúscula', met: /[a-z]/.test(password) },
  { label: 'Um número', met: /[0-9]/.test(password) },
];

const isValid = passwordRequirements.every(req => req.met);
```

---

### Server-Side (Firebase)

**Email/Password:**
- Firebase valida automaticamente formato de email
- Password strength verificada pelo Firebase
- Emails duplicados rejeitados automaticamente

**Rate Limiting do Firebase:**
- Proteção automática contra brute force
- Bloqueio temporário após muitas tentativas
- IP blocking em casos extremos

---

## 🚦 Rate Limiting

### Implementação Local (Frontend)

**Armazenamento:**
```typescript
localStorage.setItem('loginAttempts', attempts.toString());
localStorage.setItem('loginBlockExpiry', timestamp.toString());
```

**Lógica:**
```typescript
const incrementLoginAttempts = () => {
  const newAttempts = loginAttempts + 1;
  setLoginAttempts(newAttempts);
  localStorage.setItem('loginAttempts', newAttempts.toString());

  if (newAttempts >= 5) {
    const blockExpiry = Date.now() + 5 * 60 * 1000; // 5 minutos
    localStorage.setItem('loginBlockExpiry', blockExpiry.toString());
    setIsBlocked(true);
    setBlockTimeRemaining(300);
  }
};
```

**Timer de Desbloqueio:**
```typescript
useEffect(() => {
  const blockExpiry = localStorage.getItem('loginBlockExpiry');
  if (blockExpiry) {
    const interval = setInterval(() => {
      const remaining = Math.ceil((expiryTime - Date.now()) / 1000);
      if (remaining <= 0) {
        setIsBlocked(false);
        localStorage.removeItem('loginBlockExpiry');
        localStorage.removeItem('loginAttempts');
        clearInterval(interval);
      } else {
        setBlockTimeRemaining(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }
}, []);
```

**UI Bloqueada:**
```tsx
{isBlocked && (
  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
    <p className="text-red-400">
      Aguarda {blockTimeRemaining} segundos antes de tentar novamente.
    </p>
  </div>
)}
```

---

### Firebase Rate Limiting (Server)

**Automático:**
- Firebase Auth tem rate limiting integrado
- Protege contra ataques DDoS
- Bloqueio por IP em casos extremos

**Error Code:**
```
'auth/too-many-requests'
```

**Mensagem ao utilizador:**
```
"Demasiadas tentativas. Aguarda alguns minutos."
```

---

## 🧪 Testes

### Testes Manuais

#### 1. Registo de Novo Utilizador

**Setup:**
- Browser limpo (modo privado)
- Email único nunca usado

**Passos:**
1. Aceder https://eventscv-web.web.app/auth/register
2. Preencher todos os campos:
   - Nome: Teste EventsCV
   - Email: teste@example.com
   - Telefone: +238 5551234
   - Password: Teste123
   - Confirmar password: Teste123
   - ☑ Aceitar termos
3. Click "Criar conta"

**Verificações:**
- ✅ Todos os requisitos de password ficam verdes
- ✅ Botão fica em loading
- ✅ Conta criada no Firebase Auth
- ✅ Documento criado no Firestore
- ✅ Email de verificação enviado
- ✅ Redirect para /profile?newUser=true
- ✅ Perfil mostra dados corretos

---

#### 2. Login com Email/Password

**Setup:**
- Utilizador já registado
- Browser limpo

**Passos:**
1. Aceder https://eventscv-web.web.app/auth/login
2. Preencher:
   - Email: teste@example.com
   - Password: Teste123
   - ☑ Lembrar-me
3. Click "Entrar"

**Verificações:**
- ✅ Login bem-sucedido
- ✅ Redirect para homepage
- ✅ Sessão persistente (fechar e abrir browser mantém login)
- ✅ lastLoginAt atualizado no Firestore

---

#### 3. Login com Google

**Passos:**
1. Aceder https://eventscv-web.web.app/auth/login
2. Click botão "Google"
3. Selecionar conta Google
4. Autorizar EventsCV

**Verificações:**
- ✅ Popup do Google abre
- ✅ Login bem-sucedido
- ✅ Redirect para homepage
- ✅ Foto do Google aparece no perfil
- ✅ Se primeiro login: documento criado no Firestore

---

#### 4. Rate Limiting

**Passos:**
1. Aceder /auth/login
2. Tentar login com password errada 5 vezes
3. Observar bloqueio

**Verificações:**
- ✅ Após 5 tentativas: bloqueio ativado
- ✅ Mensagem de erro clara
- ✅ Timer de 5 minutos exibido
- ✅ Timer decrementa a cada segundo
- ✅ Após 5 min: desbloqueio automático
- ✅ Login bem-sucedido reseta tentativas

---

#### 5. Recuperação de Password

**Passos:**
1. /auth/login → "Esqueci a password"
2. Inserir email
3. Click "Enviar link"
4. Verificar email
5. Click no link
6. Definir nova password

**Verificações:**
- ✅ Página de sucesso exibida
- ✅ Email recebido (verificar spam)
- ✅ Link do email funciona
- ✅ Nova password aceite
- ✅ Login com nova password funciona

---

#### 6. Verificação de Email

**Passos:**
1. Criar nova conta
2. Verificar email recebido
3. Click no link de verificação

**Verificações:**
- ✅ Email recebido após registo
- ✅ Link de verificação funciona
- ✅ `emailVerified: true` no Firebase Auth
- ✅ Badge de verificado aparece (se implementado)

---

## 🔧 Troubleshooting

### Problema: Popup do Google bloqueado

**Sintoma:**
```
Error: auth/popup-blocked
```

**Causa:**
- Browser está bloqueando popups
- Extensões de bloqueio ativas

**Solução:**
1. Permitir popups para eventscv-web.web.app
2. Desativar bloqueadores de popup
3. Mensagem clara ao utilizador:
   ```
   "Popup bloqueado pelo navegador. Permite popups para este site."
   ```

---

### Problema: Email de verificação não chega

**Possíveis Causas:**
1. Email na pasta de spam
2. Firewall corporativo bloqueando
3. Email inválido/temporário

**Debug:**
```typescript
try {
  await sendEmailVerification(user);
  console.log('Verification email sent successfully');
} catch (error) {
  console.error('Error sending verification email:', error);
}
```

**Solução:**
1. Verificar spam
2. Aguardar alguns minutos
3. Tentar reenviar email

---

### Problema: Rate Limiting não funciona

**Sintoma:**
- Consegue tentar login infinitas vezes

**Causa:**
- localStorage foi limpo
- Browser em modo privado/incógnito

**Solução:**
- Usar browser normal
- Verificar se localStorage está acessível:
  ```javascript
  console.log(localStorage.getItem('loginAttempts'));
  ```

---

### Problema: Sessão não persiste (Remember Me)

**Sintoma:**
- Após fechar browser, sessão perdida

**Verificação:**
```typescript
// Verificar persistence atual
console.log(auth.currentUser);
```

**Solução:**
1. Confirmar que setPersistence foi chamado
2. Verificar se checkbox está marcada
3. Testar em browser diferente

---

### Problema: Validação de telefone falha

**Sintoma:**
```
"Número de telefone inválido"
```

**Formatos aceites:**
- ✅ `9991234` (7 dígitos)
- ✅ `5551234` (7 dígitos)
- ✅ `238 9991234` (código país + 7 dígitos)
- ✅ `+238 9991234` (+ código país + 7 dígitos)
- ✅ `+238 999 1234` (com espaços)
- ❌ `999 12 34` (menos de 7 dígitos)
- ❌ `+351 999123456` (país errado)

**Debug:**
```typescript
const phone = '+238 9991234';
const cleanPhone = phone.replace(/[\s-]/g, '');
console.log(cleanPhone); // '2389991234'
console.log(/^(\+238|238)?[0-9]{7}$/.test(cleanPhone)); // true
```

---

## 📈 Métricas e Analytics

### KPIs Importantes

**Autenticação:**
- Taxa de registo (novos utilizadores/dia)
- Taxa de login (logins/dia)
- Método preferido (email vs Google)
- Taxa de verificação de email
- Taxa de recuperação de password

**Segurança:**
- Tentativas de login falhadas
- Bloqueios por rate limiting
- Ataques de brute force detectados

---

## 🚀 Melhorias Futuras

### 1. Autenticação por SMS (Phone)

**Implementação:**
```typescript
// Enviar código SMS
const verificationId = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);

// Verificar código
await confirmationResult.confirm(code);
```

**UI necessária:**
- Página de phone login
- Input para número de telefone
- Input para código SMS
- ReCAPTCHA invisível

---

### 2. Multi-Factor Authentication (MFA)

**Configuração:**
- SMS como segundo fator
- TOTP (Google Authenticator)
- Email como segundo fator

**Firebase:**
```
Authentication → Advanced → SMS Multi-factor Authentication: Enable
```

---

### 3. Social Logins Adicionais

**Providers possíveis:**
- Facebook
- Apple
- Microsoft
- Twitter/X

**Implementação similar ao Google:**
```typescript
const provider = new FacebookAuthProvider();
await signInWithPopup(auth, provider);
```

---

### 4. Biometria (Face ID, Touch ID)

**WebAuthn API:**
```typescript
// Registo de credencial
const credential = await navigator.credentials.create({
  publicKey: options
});

// Login com credencial
const assertion = await navigator.credentials.get({
  publicKey: options
});
```

---

### 5. Passwordless (Magic Link)

**Email Magic Link:**
```typescript
await sendSignInLinkToEmail(auth, email, {
  url: window.location.href,
  handleCodeInApp: true,
});
```

**Vantagens:**
- Sem password para lembrar
- Mais seguro que password fraca
- UX simplificada

---

## 📚 Recursos Adicionais

### Documentação Firebase
- Auth: https://firebase.google.com/docs/auth
- Email Verification: https://firebase.google.com/docs/auth/web/manage-users
- Password Reset: https://firebase.google.com/docs/auth/web/manage-users

### Segurança
- OWASP Auth Cheatsheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- Firebase Security Rules: https://firebase.google.com/docs/rules

### Best Practices
- Next.js Authentication: https://nextjs.org/docs/app/building-your-application/authentication
- React Firebase Hooks: https://github.com/CSFrequency/react-firebase-hooks

---

## 📊 Deployment Status

**Web App:** https://eventscv-web.web.app

**Páginas Deployadas:**
- ✅ /auth/login - Login page
- ✅ /auth/register - Registration page
- ✅ /auth/forgot-password - Password reset page

**Firebase Authentication:**
- ✅ Email/Password enabled
- ✅ Google Sign-In enabled
- ✅ Phone enabled (UI pendente)

**Firestore:**
- ✅ User documents criados automaticamente
- ✅ Wallet inicializado
- ✅ Loyalty inicializado

---

**Última Atualização:** 28 de Dezembro de 2025
**Versão:** 1.0.0
**Autor:** EventsCV Development Team

---

*Made with ❤️ for EventsCV*
