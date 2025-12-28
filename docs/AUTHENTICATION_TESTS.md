# Guia de Testes - Sistema de Autenticação

**Data:** 28 de Dezembro de 2025
**Versão:** 1.0.0
**Deployment:** https://eventscv-web.web.app

---

## 📋 Checklist de Testes Completo

### ✅ Teste 1: Registo de Novo Utilizador (Email/Password)

**Objetivo:** Verificar criação de conta com email e password

**URL:** https://eventscv-web.web.app/auth/register

**Passos:**
1. [ ] Abrir browser em modo privado/incógnito
2. [ ] Aceder à URL de registo
3. [ ] Preencher formulário:
   - Nome: `Teste EventsCV`
   - Email: `teste.eventscv@gmail.com` (usar email real)
   - Telefone: `+238 9991234`
   - Password: `EventsCV2025!`
   - Confirmar password: `EventsCV2025!`
4. [ ] Verificar feedback visual dos requisitos de password (todos verdes)
5. [ ] Marcar checkbox "Aceito os Termos de Serviço e Política de Privacidade"
6. [ ] Clicar em "Criar conta"

**Resultados Esperados:**
- ✅ Botão mostra loading spinner
- ✅ Redirect para `/profile?newUser=true`
- ✅ Perfil exibe:
  - Nome: Teste EventsCV
  - Email: teste.eventscv@gmail.com
  - Saldo wallet: 0$00
  - Pontos loyalty: 0

**Verificações no Firebase Console:**
1. [ ] **Authentication:**
   - Aceder: https://console.firebase.google.com/project/eventscv-platform/authentication/users
   - Verificar se utilizador existe
   - Email verificado: No (ainda não verificou)

2. [ ] **Firestore:**
   - Aceder: https://console.firebase.google.com/project/eventscv-platform/firestore/data
   - Collection: `users`
   - Documento com UID do utilizador criado
   - Campos verificar:
     ```json
     {
       "email": "teste.eventscv@gmail.com",
       "name": "Teste EventsCV",
       "phone": "+238 9991234",
       "wallet": {
         "balance": 0,
         "bonusBalance": 0,
         "currency": "CVE"
       },
       "loyalty": {
         "points": 0,
         "tier": "bronze"
       },
       "createdAt": [Timestamp],
       "lastLoginAt": [Timestamp]
     }
     ```

3. [ ] **Email de Verificação:**
   - Verificar inbox do email usado
   - Email recebido de: `noreply@eventscv-platform.firebaseapp.com`
   - Assunto: "Verifica o teu email - EventsCV" (pode estar em inglês)
   - Tem link de verificação

**Tempo estimado:** 3-5 minutos

---

### ✅ Teste 2: Verificação de Email

**Objetivo:** Confirmar que o processo de verificação de email funciona

**Pré-requisito:** Teste 1 concluído

**Passos:**
1. [ ] Abrir email recebido (verificar spam se não aparecer)
2. [ ] Clicar no link de verificação
3. [ ] Página do Firebase abre confirmando verificação
4. [ ] Voltar à aplicação e fazer refresh

**Resultados Esperados:**
- ✅ Mensagem de sucesso no Firebase
- ✅ Email verificado

**Verificação no Firebase Console:**
1. [ ] Authentication → Users
2. [ ] Utilizador `teste.eventscv@gmail.com`
3. [ ] Campo "Email verified": Yes ✓

**Tempo estimado:** 1-2 minutos

---

### ✅ Teste 3: Login com Email/Password (Sem Remember Me)

**Objetivo:** Testar login básico e sessão temporária

**URL:** https://eventscv-web.web.app/auth/login

**Passos:**
1. [ ] Fazer logout se estiver logado
2. [ ] Aceder à página de login
3. [ ] Preencher:
   - Email: `teste.eventscv@gmail.com`
   - Password: `EventsCV2025!`
   - **NÃO** marcar "Lembrar-me"
4. [ ] Clicar "Entrar"

**Resultados Esperados:**
- ✅ Loading spinner aparece
- ✅ Redirect para homepage `/`
- ✅ Utilizador autenticado (ver nome no canto superior direito)

**Verificação de Sessão Temporária:**
1. [ ] Fechar aba/janela do browser
2. [ ] Abrir nova aba/janela
3. [ ] Aceder: https://eventscv-web.web.app
4. [ ] **Resultado esperado:** Utilizador NÃO está logado (sessão não persistiu)

**Verificação no Firestore:**
1. [ ] Collection `users` → documento do utilizador
2. [ ] Campo `lastLoginAt` foi atualizado para agora

**Tempo estimado:** 2-3 minutos

---

### ✅ Teste 4: Login com Remember Me (Sessão Persistente)

**Objetivo:** Verificar que "Lembrar-me" mantém sessão ativa

**Passos:**
1. [ ] Aceder à página de login
2. [ ] Preencher credenciais:
   - Email: `teste.eventscv@gmail.com`
   - Password: `EventsCV2025!`
   - ✅ **Marcar** "Lembrar-me"
3. [ ] Clicar "Entrar"

**Resultados Esperados:**
- ✅ Login bem-sucedido
- ✅ Redirect para homepage

**Verificação de Sessão Persistente:**
1. [ ] Fechar completamente o browser
2. [ ] Abrir browser novamente
3. [ ] Aceder: https://eventscv-web.web.app
4. [ ] **Resultado esperado:** Utilizador ESTÁ logado (sessão persistiu)

**Tempo estimado:** 2-3 minutos

---

### ✅ Teste 5: Login com Google

**Objetivo:** Testar autenticação via Google OAuth

**URL:** https://eventscv-web.web.app/auth/login

**Passos:**
1. [ ] Fazer logout
2. [ ] Aceder à página de login
3. [ ] Clicar no botão "Google"
4. [ ] Popup do Google abre
5. [ ] Selecionar conta Google (usar conta diferente da anterior)
6. [ ] Autorizar EventsCV

**Resultados Esperados:**
- ✅ Popup do Google abre corretamente
- ✅ Após autorização, popup fecha
- ✅ Redirect para homepage
- ✅ Utilizador logado
- ✅ Nome e foto do Google aparecem no perfil

**Verificação no Firebase:**
1. [ ] Authentication → Users
2. [ ] Novo utilizador criado
3. [ ] Provider: Google
4. [ ] Email verificado: Yes (automático com Google)

**Verificação no Firestore:**
1. [ ] Collection `users` → novo documento criado
2. [ ] Campos:
   - `email`: email do Google
   - `name`: nome do Google
   - `wallet` e `loyalty` inicializados

**Tempo estimado:** 2-3 minutos

---

### ✅ Teste 6: Rate Limiting (Proteção contra Brute Force)

**Objetivo:** Verificar bloqueio após 5 tentativas falhadas

**URL:** https://eventscv-web.web.app/auth/login

**Passos:**
1. [ ] Fazer logout
2. [ ] Aceder à página de login
3. [ ] Tentar login com password ERRADA 5 vezes:
   - Email: `teste.eventscv@gmail.com`
   - Password: `SenhaErrada123` ← errada de propósito
4. [ ] Repetir 5 vezes

**Resultados Esperados após 5 tentativas:**
- ✅ Mensagem de erro: "Demasiadas tentativas falhadas. Aguarda 5 minutos."
- ✅ Timer aparece: "Aguarda 300 segundos antes de tentar novamente."
- ✅ Timer decrementa em tempo real (299, 298, 297...)
- ✅ Botão "Entrar" desabilitado
- ✅ Se tentar clicar: mensagem "Aguarda X segundos..."

**Verificação de Desbloqueio:**
1. [ ] Aguardar 5 minutos (ou limpar localStorage manualmente)
2. [ ] Timer chega a 0
3. [ ] Bloqueio é removido automaticamente
4. [ ] Tentar login com password CORRETA
5. [ ] **Resultado esperado:** Login bem-sucedido e contador resetado

**Atalho para testes (não usar em produção):**
```javascript
// Abrir DevTools Console e executar:
localStorage.removeItem('loginBlockExpiry');
localStorage.removeItem('loginAttempts');
// Refresh página
```

**Tempo estimado:** 2 minutos (ou 7 minutos se aguardar desbloqueio completo)

---

### ✅ Teste 7: Recuperação de Password

**Objetivo:** Testar fluxo completo de reset de password

**URL:** https://eventscv-web.web.app/auth/forgot-password

**Passos:**
1. [ ] Fazer logout
2. [ ] Aceder à página de login
3. [ ] Clicar em "Esqueci a password"
4. [ ] Página `/auth/forgot-password` abre
5. [ ] Inserir email: `teste.eventscv@gmail.com`
6. [ ] Clicar "Enviar link de recuperação"

**Resultados Esperados:**
- ✅ Página de sucesso exibida
- ✅ Mensagem: "Se existe uma conta associada a teste.eventscv@gmail.com, receberás um email..."
- ✅ Botões "Voltar ao Login" e "Tentar outro email"

**Verificação de Email:**
1. [ ] Verificar inbox (e spam)
2. [ ] Email recebido de: `noreply@eventscv-platform.firebaseapp.com`
3. [ ] Assunto contém "password" ou "reset"
4. [ ] Email contém link de reset

**Reset de Password:**
1. [ ] Clicar no link do email
2. [ ] Página do Firebase abre
3. [ ] Inserir nova password: `NovaPassword2025!`
4. [ ] Confirmar nova password
5. [ ] Clicar "Guardar"

**Teste de Login com Nova Password:**
1. [ ] Voltar ao login
2. [ ] Tentar login com:
   - Email: `teste.eventscv@gmail.com`
   - Password: `NovaPassword2025!` ← nova password
3. [ ] **Resultado esperado:** Login bem-sucedido

**Tempo estimado:** 5-7 minutos

---

### ✅ Teste 8: Validações de Registo

**Objetivo:** Verificar que validações client-side funcionam

**URL:** https://eventscv-web.web.app/auth/register

**Teste 8.1: Nome Inválido**
- [ ] Nome: `123` (números)
- [ ] Resultado: "Nome inválido. Usa apenas letras e espaços (mínimo 2 caracteres)."

**Teste 8.2: Email Inválido**
- [ ] Email: `teste@` (incompleto)
- [ ] Resultado: "Formato de email inválido."

**Teste 8.3: Telefone Inválido**
- [ ] Telefone: `999` (muito curto)
- [ ] Resultado: "Número de telefone inválido. Usa o formato: +238 999 9999 ou 9999999"

**Teste 8.4: Password Fraca**
- [ ] Password: `abc123` (sem maiúscula)
- [ ] Resultado: Requisito "Uma letra maiúscula" fica vermelho
- [ ] Mensagem: "A password não cumpre os requisitos mínimos."

**Teste 8.5: Passwords Não Coincidem**
- [ ] Password: `EventsCV2025!`
- [ ] Confirmar: `EventsCV2024!` (diferente)
- [ ] Resultado: "As passwords não coincidem."

**Teste 8.6: Termos Não Aceites**
- [ ] Preencher tudo corretamente
- [ ] NÃO marcar checkbox de termos
- [ ] Resultado: "Tens de aceitar os termos e condições."

**Tempo estimado:** 5 minutos

---

### ✅ Teste 9: Email Já Registado

**Objetivo:** Verificar tratamento de email duplicado

**Passos:**
1. [ ] Tentar registar com email já usado: `teste.eventscv@gmail.com`
2. [ ] Preencher todos os campos corretamente
3. [ ] Clicar "Criar conta"

**Resultado Esperado:**
- ✅ Erro: "Este email já está registado. Tenta fazer login."
- ✅ Não cria conta duplicada
- ✅ Sugestão clara para fazer login

**Tempo estimado:** 1 minuto

---

### ✅ Teste 10: Redirect após Login

**Objetivo:** Verificar que redirect URL funciona

**Passos:**
1. [ ] Fazer logout
2. [ ] Tentar aceder página protegida (ex: `/wallet`)
3. [ ] Deve redirecionar para: `/auth/login?redirect=/wallet`
4. [ ] Fazer login
5. [ ] **Resultado esperado:** Redirect para `/wallet` (não para `/`)

**Tempo estimado:** 2 minutos

---

### ✅ Teste 11: Session Timeout

**Objetivo:** Verificar comportamento de sessão expirada

**Passos:**
1. [ ] Login sem "Remember Me"
2. [ ] Aguardar 1 hora (ou ajustar Firebase session timeout)
3. [ ] Tentar aceder página protegida
4. [ ] **Resultado esperado:** Redirect para login

**Nota:** Sessão do Firebase Auth dura bastante tempo por padrão. Este teste é mais relevante em produção.

**Tempo estimado:** Longo (pode pular em desenvolvimento)

---

## 🔍 Verificações Adicionais

### Firebase Authentication Console

**URL:** https://console.firebase.google.com/project/eventscv-platform/authentication/users

**Verificar:**
- [ ] Lista de utilizadores criados
- [ ] Emails verificados
- [ ] Providers usados (Email/Password, Google)
- [ ] Última vez que fizeram login
- [ ] UIDs únicos

### Firestore Database

**URL:** https://console.firebase.google.com/project/eventscv-platform/firestore/data

**Collection: `users`**

**Verificar:**
- [ ] Documento criado para cada utilizador
- [ ] Estrutura correta:
  ```
  users/{uid}
  ├── email
  ├── name
  ├── phone
  ├── wallet
  │   ├── balance: 0
  │   ├── bonusBalance: 0
  │   └── currency: "CVE"
  ├── loyalty
  │   ├── points: 0
  │   └── tier: "bronze"
  ├── createdAt
  ├── updatedAt
  └── lastLoginAt
  ```

---

## 🐛 Testes de Cenários de Erro

### Erro 1: Popup Bloqueado (Google Login)

**Como simular:**
1. Bloquear popups no browser
2. Tentar login com Google

**Resultado esperado:**
- Mensagem: "Popup bloqueado pelo navegador. Permite popups para este site."

---

### Erro 2: Sem Conexão Internet

**Como simular:**
1. Desligar WiFi/dados
2. Tentar login

**Resultado esperado:**
- Mensagem de erro de rede
- Não trava a aplicação

---

### Erro 3: Firebase Down (raro)

**Resultado esperado:**
- Erro genérico mas não crash
- Mensagem user-friendly

---

## 📊 Checklist Resumo

**Autenticação Básica:**
- [ ] Registo Email/Password
- [ ] Verificação de Email
- [ ] Login Email/Password
- [ ] Login Google
- [ ] Logout

**Segurança:**
- [ ] Rate Limiting (5 tentativas)
- [ ] Timer de bloqueio (5 min)
- [ ] Remember Me funciona
- [ ] Sessão temporária expira

**Recuperação:**
- [ ] Esqueci password
- [ ] Email de reset recebido
- [ ] Reset bem-sucedido
- [ ] Login com nova password

**Validações:**
- [ ] Nome (letras apenas)
- [ ] Email (formato)
- [ ] Telefone (CV format)
- [ ] Password (4 requisitos)
- [ ] Passwords coincidem
- [ ] Termos aceites

**Firebase Integration:**
- [ ] User criado em Authentication
- [ ] Documento criado em Firestore
- [ ] Wallet inicializada
- [ ] Loyalty inicializada
- [ ] Email verificado

**UX/UI:**
- [ ] Loading states
- [ ] Mensagens de erro claras
- [ ] Feedback visual (password requirements)
- [ ] Redirect correto
- [ ] Mobile responsive

---

## 📝 Relatório de Testes

**Preencher após testes:**

| # | Teste | Status | Notas |
|---|-------|--------|-------|
| 1 | Registo Email/Password | ⬜ | |
| 2 | Verificação Email | ⬜ | |
| 3 | Login sem Remember Me | ⬜ | |
| 4 | Login com Remember Me | ⬜ | |
| 5 | Login Google | ⬜ | |
| 6 | Rate Limiting | ⬜ | |
| 7 | Recuperação Password | ⬜ | |
| 8 | Validações | ⬜ | |
| 9 | Email Duplicado | ⬜ | |
| 10 | Redirect URL | ⬜ | |

**Legenda:**
- ✅ Passou
- ❌ Falhou
- ⚠️ Passou com observações
- ⬜ Não testado

---

## 🚨 Bugs Encontrados

**Registar aqui qualquer problema:**

1. **Bug #1:** [Descrição]
   - **Severidade:** Alta/Média/Baixa
   - **Passos para reproduzir:**
   - **Resultado esperado:**
   - **Resultado atual:**
   - **Screenshot/Log:**

---

## ✅ Aprovação Final

**Testes concluídos por:** _________________
**Data:** _________________
**Status:** ⬜ Aprovado | ⬜ Aprovado com ressalvas | ⬜ Rejeitado

**Observações:**
```
[Espaço para comentários gerais]
```

---

**Versão:** 1.0.0
**Última atualização:** 28 de Dezembro de 2025

*Made with ❤️ for EventsCV*
