/**
 * Script para popular o Firestore com dados de exemplo
 * Execute com: node scripts/seed-firestore.js
 *
 * Para usar com credenciais:
 * GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json node scripts/seed-firestore.js
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Verificar se existe ficheiro de credenciais
const possiblePaths = [
  './serviceAccountKey.json',
  './firebase-credentials.json',
  './eventscv-platform-firebase-adminsdk.json',
];

let credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!credentialPath) {
  for (const p of possiblePaths) {
    const fullPath = path.resolve(__dirname, '..', p);
    if (fs.existsSync(fullPath)) {
      credentialPath = fullPath;
      break;
    }
  }
}

// Inicializar Firebase Admin
try {
  if (credentialPath && fs.existsSync(credentialPath)) {
    const serviceAccount = require(credentialPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'eventscv-platform',
    });
    console.log('Autenticado com Service Account');
  } else {
    // Tentar com Application Default Credentials
    admin.initializeApp({
      projectId: 'eventscv-platform',
      credential: admin.credential.applicationDefault(),
    });
    console.log('Autenticado com Application Default Credentials');
  }
} catch (error) {
  if (!error.message?.includes('already exists')) {
    console.error('Erro ao inicializar Firebase Admin:', error.message);
    console.log('\nPara autenticar, crie uma Service Account:');
    console.log('1. Vai a: https://console.firebase.google.com/project/eventscv-platform/settings/serviceaccounts/adminsdk');
    console.log('2. Clica em "Generate new private key"');
    console.log('3. Guarda o ficheiro como serviceAccountKey.json na raiz do projeto');
    console.log('4. Executa: node scripts/seed-firestore.js');
    process.exit(1);
  }
}

const db = admin.firestore();

// ============================================
// DADOS DE EXEMPLO
// ============================================

// Organizacoes
const organizations = [
  {
    id: 'org-eventscv',
    name: 'EventsCV Official',
    slug: 'eventscv',
    description: 'Plataforma oficial de eventos em Cabo Verde',
    logo: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&h=400&fit=crop',
    email: 'info@eventscv.cv',
    phone: '+238 999 0000',
    address: 'Praia, Santiago, Cabo Verde',
    website: 'https://eventscv.cv',
    socialLinks: {
      facebook: 'https://facebook.com/eventscv',
      instagram: 'https://instagram.com/eventscv',
    },
    status: 'active',
    subscriptionTier: 'enterprise',
    settings: {
      defaultCurrency: 'CVE',
      defaultLanguage: 'pt',
      timezone: 'Atlantic/Cape_Verde',
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'org-baia-gatas',
    name: 'Festival Baia das Gatas',
    slug: 'baia-gatas',
    description: 'Organizadores do maior festival de musica de Cabo Verde',
    logo: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&h=400&fit=crop',
    email: 'contact@baiagatas.cv',
    phone: '+238 999 1111',
    address: 'Mindelo, Sao Vicente, Cabo Verde',
    status: 'active',
    subscriptionTier: 'professional',
    settings: {
      defaultCurrency: 'CVE',
      defaultLanguage: 'pt',
      timezone: 'Atlantic/Cape_Verde',
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
];

// Eventos
const events = [
  {
    id: 'evt-baia-gatas-2024',
    organizationId: 'org-baia-gatas',
    title: 'Festival Baia das Gatas 2024',
    slug: 'festival-baia-das-gatas-2024',
    description: 'O maior festival de musica de Cabo Verde esta de volta! Tres dias de musica, cultura e celebracao na praia da Baia das Gatas.',
    shortDescription: 'Tres dias de musica e cultura em Sao Vicente',
    category: 'Musica',
    tags: ['festival', 'musica', 'praia', 'verao'],
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=500&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&h=600&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop',
    ],
    venue: {
      name: 'Praia de Baia das Gatas',
      address: 'Baia das Gatas, Sao Vicente',
      city: 'Mindelo',
      island: 'Sao Vicente',
      coordinates: { lat: 16.8801, lng: -24.9898 },
    },
    startDate: new Date('2024-12-15T18:00:00'),
    endDate: new Date('2024-12-17T04:00:00'),
    doors: '18:00',
    ageRestriction: 16,
    status: 'published',
    visibility: 'public',
    isFeatured: true,
    isHot: true,
    capacity: 5000,
    soldCount: 1250,
    settings: {
      allowRefunds: true,
      refundDeadlineHours: 48,
      maxTicketsPerOrder: 10,
      requireIdVerification: false,
      enableWaitlist: true,
      enableCashlessPayments: true,
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    publishedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'evt-noite-jazz',
    organizationId: 'org-eventscv',
    title: 'Noite de Jazz no Quintal',
    slug: 'noite-jazz-quintal',
    description: 'Uma noite intima de jazz com os melhores musicos de Cabo Verde. Ambiente acolhedor, boa musica e gastronomia local.',
    shortDescription: 'Jazz ao vivo em ambiente intimo',
    category: 'Musica',
    tags: ['jazz', 'musica', 'noite'],
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=500&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&h=600&fit=crop',
    gallery: [],
    venue: {
      name: 'Quintal da Musica',
      address: 'Rua da Cultura, 25',
      city: 'Praia',
      island: 'Santiago',
      coordinates: { lat: 14.9177, lng: -23.5092 },
    },
    startDate: new Date('2024-12-20T20:00:00'),
    endDate: new Date('2024-12-20T23:59:00'),
    doors: '19:30',
    ageRestriction: 18,
    status: 'published',
    visibility: 'public',
    isFeatured: false,
    isHot: false,
    capacity: 500,
    soldCount: 340,
    settings: {
      allowRefunds: true,
      refundDeadlineHours: 24,
      maxTicketsPerOrder: 6,
      requireIdVerification: false,
      enableWaitlist: false,
      enableCashlessPayments: false,
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    publishedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'evt-beach-party-sal',
    organizationId: 'org-eventscv',
    title: 'Beach Party Sal 2024',
    slug: 'beach-party-sal-2024',
    description: 'A maior festa de praia do Sal! DJs internacionais, bar na areia e a melhor vibe de Cabo Verde.',
    shortDescription: 'Festa de praia em Santa Maria',
    category: 'Festa',
    tags: ['festa', 'praia', 'dj', 'verao'],
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=500&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=600&fit=crop',
    gallery: [],
    venue: {
      name: 'Praia de Santa Maria',
      address: 'Santa Maria Beach',
      city: 'Santa Maria',
      island: 'Sal',
      coordinates: { lat: 16.5986, lng: -22.9057 },
    },
    startDate: new Date('2024-12-28T22:00:00'),
    endDate: new Date('2024-12-29T06:00:00'),
    doors: '21:00',
    ageRestriction: 18,
    status: 'published',
    visibility: 'public',
    isFeatured: true,
    isHot: true,
    capacity: 2000,
    soldCount: 890,
    settings: {
      allowRefunds: true,
      refundDeadlineHours: 72,
      maxTicketsPerOrder: 8,
      requireIdVerification: true,
      enableWaitlist: true,
      enableCashlessPayments: true,
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    publishedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'evt-corrida-cidade-velha',
    organizationId: 'org-eventscv',
    title: 'Corrida da Cidade Velha',
    slug: 'corrida-cidade-velha-2025',
    description: 'Corrida historica pelas ruas da primeira cidade da Africa Subsaariana. 10km de percurso com paisagens deslumbrantes.',
    shortDescription: 'Corrida de 10km na Cidade Velha',
    category: 'Desporto',
    tags: ['corrida', 'desporto', 'historia'],
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=500&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200&h=600&fit=crop',
    gallery: [],
    venue: {
      name: 'Cidade Velha',
      address: 'Cidade Velha',
      city: 'Cidade Velha',
      island: 'Santiago',
      coordinates: { lat: 14.9161, lng: -23.6050 },
    },
    startDate: new Date('2025-01-05T07:00:00'),
    endDate: new Date('2025-01-05T12:00:00'),
    doors: '06:00',
    ageRestriction: 0,
    status: 'published',
    visibility: 'public',
    isFeatured: false,
    isHot: false,
    capacity: 1000,
    soldCount: 520,
    settings: {
      allowRefunds: true,
      refundDeadlineHours: 168,
      maxTicketsPerOrder: 5,
      requireIdVerification: true,
      enableWaitlist: true,
      enableCashlessPayments: false,
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    publishedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'evt-festival-gamboa',
    organizationId: 'org-eventscv',
    title: 'Festival Gamboa 2025',
    slug: 'festival-gamboa-2025',
    description: 'O festival mais esperado de Cabo Verde! Artistas nacionais e internacionais, gastronomia, artesanato e muito mais.',
    shortDescription: 'O maior festival de Cabo Verde',
    category: 'Musica',
    tags: ['festival', 'musica', 'cultura', 'gamboa'],
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=500&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&h=600&fit=crop',
    gallery: [],
    venue: {
      name: 'Praia da Gamboa',
      address: 'Gamboa',
      city: 'Praia',
      island: 'Santiago',
      coordinates: { lat: 14.9225, lng: -23.5087 },
    },
    startDate: new Date('2025-05-01T16:00:00'),
    endDate: new Date('2025-05-04T04:00:00'),
    doors: '15:00',
    ageRestriction: 0,
    status: 'published',
    visibility: 'public',
    isFeatured: true,
    isHot: true,
    capacity: 15000,
    soldCount: 0,
    settings: {
      allowRefunds: true,
      refundDeadlineHours: 168,
      maxTicketsPerOrder: 10,
      requireIdVerification: false,
      enableWaitlist: true,
      enableCashlessPayments: true,
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    publishedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'evt-cooking-cachupa',
    organizationId: 'org-eventscv',
    title: 'Cooking Class - Cachupa',
    slug: 'cooking-class-cachupa',
    description: 'Aprenda a fazer a autentica cachupa cabo-verdiana com chef local. Inclui todos os ingredientes e degustacao.',
    shortDescription: 'Aula de culinaria cabo-verdiana',
    category: 'Gastronomia',
    tags: ['gastronomia', 'cachupa', 'culinaria', 'workshop'],
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=500&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&h=600&fit=crop',
    gallery: [],
    venue: {
      name: 'Casa da Cultura',
      address: 'Rua Lisboa, 10',
      city: 'Mindelo',
      island: 'Sao Vicente',
      coordinates: { lat: 16.8866, lng: -24.9881 },
    },
    startDate: new Date('2024-12-22T10:00:00'),
    endDate: new Date('2024-12-22T14:00:00'),
    doors: '09:30',
    ageRestriction: 0,
    status: 'published',
    visibility: 'public',
    isFeatured: false,
    isHot: false,
    capacity: 20,
    soldCount: 12,
    settings: {
      allowRefunds: true,
      refundDeadlineHours: 48,
      maxTicketsPerOrder: 4,
      requireIdVerification: false,
      enableWaitlist: true,
      enableCashlessPayments: false,
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    publishedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
];

// Tipos de bilhetes para cada evento
const ticketTypes = {
  'evt-baia-gatas-2024': [
    {
      id: 'tt-baia-gatas-vip',
      eventId: 'evt-baia-gatas-2024',
      name: 'VIP Pass',
      description: 'Acesso VIP com area exclusiva, bar aberto e camarim',
      price: 7500,
      currency: 'CVE',
      quantity: 500,
      sold: 320,
      maxPerOrder: 4,
      salesStart: new Date('2024-10-01T00:00:00'),
      salesEnd: new Date('2024-12-14T23:59:00'),
      status: 'on_sale',
      benefits: ['Area VIP exclusiva', 'Bar aberto', 'Acesso ao camarim', 'Estacionamento reservado'],
      sortOrder: 1,
    },
    {
      id: 'tt-baia-gatas-geral',
      eventId: 'evt-baia-gatas-2024',
      name: 'Entrada Geral',
      description: 'Acesso ao festival durante os 3 dias',
      price: 2500,
      currency: 'CVE',
      quantity: 4000,
      sold: 930,
      maxPerOrder: 10,
      salesStart: new Date('2024-10-01T00:00:00'),
      salesEnd: new Date('2024-12-14T23:59:00'),
      status: 'on_sale',
      benefits: ['Acesso aos 3 dias do festival'],
      sortOrder: 2,
    },
    {
      id: 'tt-baia-gatas-dia',
      eventId: 'evt-baia-gatas-2024',
      name: 'Passe Diario',
      description: 'Acesso para um dia do festival',
      price: 1200,
      currency: 'CVE',
      quantity: 500,
      sold: 0,
      maxPerOrder: 5,
      salesStart: new Date('2024-12-10T00:00:00'),
      salesEnd: new Date('2024-12-15T17:00:00'),
      status: 'on_sale',
      benefits: ['Acesso a 1 dia do festival'],
      sortOrder: 3,
    },
  ],
  'evt-noite-jazz': [
    {
      id: 'tt-jazz-normal',
      eventId: 'evt-noite-jazz',
      name: 'Entrada Normal',
      description: 'Entrada para a noite de jazz',
      price: 1500,
      currency: 'CVE',
      quantity: 400,
      sold: 290,
      maxPerOrder: 6,
      salesStart: new Date('2024-11-01T00:00:00'),
      salesEnd: new Date('2024-12-20T19:00:00'),
      status: 'on_sale',
      benefits: ['Acesso ao evento'],
      sortOrder: 1,
    },
    {
      id: 'tt-jazz-mesa',
      eventId: 'evt-noite-jazz',
      name: 'Mesa Reservada (4 pessoas)',
      description: 'Mesa reservada para 4 pessoas com garrafa de vinho',
      price: 8000,
      currency: 'CVE',
      quantity: 25,
      sold: 12,
      maxPerOrder: 2,
      salesStart: new Date('2024-11-01T00:00:00'),
      salesEnd: new Date('2024-12-19T23:59:00'),
      status: 'on_sale',
      benefits: ['Mesa reservada', 'Garrafa de vinho', 'Servico de mesa'],
      sortOrder: 2,
    },
  ],
  'evt-beach-party-sal': [
    {
      id: 'tt-beach-early',
      eventId: 'evt-beach-party-sal',
      name: 'Early Bird',
      description: 'Bilhete antecipado com desconto',
      price: 2000,
      currency: 'CVE',
      quantity: 500,
      sold: 500,
      maxPerOrder: 4,
      salesStart: new Date('2024-11-01T00:00:00'),
      salesEnd: new Date('2024-12-01T23:59:00'),
      status: 'sold_out',
      benefits: ['Acesso ao evento'],
      sortOrder: 1,
    },
    {
      id: 'tt-beach-normal',
      eventId: 'evt-beach-party-sal',
      name: 'Entrada Geral',
      description: 'Entrada para a festa',
      price: 3000,
      currency: 'CVE',
      quantity: 1500,
      sold: 390,
      maxPerOrder: 8,
      salesStart: new Date('2024-12-01T00:00:00'),
      salesEnd: new Date('2024-12-28T20:00:00'),
      status: 'on_sale',
      benefits: ['Acesso ao evento'],
      sortOrder: 2,
    },
  ],
  'evt-corrida-cidade-velha': [
    {
      id: 'tt-corrida-adulto',
      eventId: 'evt-corrida-cidade-velha',
      name: 'Inscricao Adulto',
      description: 'Inscricao para adultos (18+). Inclui t-shirt e medalha',
      price: 500,
      currency: 'CVE',
      quantity: 800,
      sold: 420,
      maxPerOrder: 5,
      salesStart: new Date('2024-11-01T00:00:00'),
      salesEnd: new Date('2025-01-04T23:59:00'),
      status: 'on_sale',
      benefits: ['T-shirt oficial', 'Medalha de participacao', 'Kit do corredor'],
      sortOrder: 1,
    },
    {
      id: 'tt-corrida-jovem',
      eventId: 'evt-corrida-cidade-velha',
      name: 'Inscricao Jovem (12-17)',
      description: 'Inscricao para jovens entre 12 e 17 anos',
      price: 300,
      currency: 'CVE',
      quantity: 200,
      sold: 100,
      maxPerOrder: 5,
      salesStart: new Date('2024-11-01T00:00:00'),
      salesEnd: new Date('2025-01-04T23:59:00'),
      status: 'on_sale',
      benefits: ['T-shirt oficial', 'Medalha de participacao', 'Kit do corredor'],
      sortOrder: 2,
    },
  ],
  'evt-festival-gamboa': [
    {
      id: 'tt-gamboa-super-early',
      eventId: 'evt-festival-gamboa',
      name: 'Super Early Bird',
      description: 'Os primeiros bilhetes com o maior desconto',
      price: 2500,
      currency: 'CVE',
      quantity: 1000,
      sold: 0,
      maxPerOrder: 6,
      salesStart: new Date('2024-12-01T00:00:00'),
      salesEnd: new Date('2025-01-31T23:59:00'),
      status: 'on_sale',
      benefits: ['Acesso aos 4 dias do festival', 'Brinde exclusivo'],
      sortOrder: 1,
    },
    {
      id: 'tt-gamboa-early',
      eventId: 'evt-festival-gamboa',
      name: 'Early Bird',
      description: 'Bilhete antecipado',
      price: 3000,
      currency: 'CVE',
      quantity: 3000,
      sold: 0,
      maxPerOrder: 8,
      salesStart: new Date('2025-02-01T00:00:00'),
      salesEnd: new Date('2025-03-31T23:59:00'),
      status: 'not_on_sale',
      benefits: ['Acesso aos 4 dias do festival'],
      sortOrder: 2,
    },
    {
      id: 'tt-gamboa-vip',
      eventId: 'evt-festival-gamboa',
      name: 'VIP All Access',
      description: 'Acesso total ao festival com beneficios exclusivos',
      price: 10000,
      currency: 'CVE',
      quantity: 500,
      sold: 0,
      maxPerOrder: 4,
      salesStart: new Date('2024-12-01T00:00:00'),
      salesEnd: new Date('2025-04-30T23:59:00'),
      status: 'on_sale',
      benefits: ['Area VIP', 'Bar aberto', 'Meet & Greet', 'Estacionamento VIP', 'Merchandise exclusivo'],
      sortOrder: 3,
    },
  ],
  'evt-cooking-cachupa': [
    {
      id: 'tt-cooking-individual',
      eventId: 'evt-cooking-cachupa',
      name: 'Participacao Individual',
      description: 'Uma vaga na aula de culinaria',
      price: 2000,
      currency: 'CVE',
      quantity: 20,
      sold: 12,
      maxPerOrder: 4,
      salesStart: new Date('2024-11-01T00:00:00'),
      salesEnd: new Date('2024-12-21T23:59:00'),
      status: 'on_sale',
      benefits: ['Ingredientes incluidos', 'Receita impressa', 'Degustacao'],
      sortOrder: 1,
    },
  ],
};

// Usuarios de exemplo
const users = [
  {
    id: 'user-joao-silva',
    email: 'joao.silva@email.com',
    displayName: 'Joao Silva',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    phone: '+238 999 1234',
    dateOfBirth: new Date('1990-05-15'),
    gender: 'male',
    address: {
      street: 'Rua do Plateau, 45',
      city: 'Praia',
      island: 'Santiago',
      country: 'Cabo Verde',
    },
    wallet: {
      balance: 15500,
      pendingBonus: 500,
      loyaltyPoints: 2340,
      tier: 'Gold',
    },
    preferences: {
      language: 'pt',
      currency: 'CVE',
      notifications: {
        email: true,
        push: true,
        sms: true,
      },
      categories: ['Musica', 'Festa'],
    },
    stats: {
      eventsAttended: 12,
      totalSpent: 45000,
      ticketsPurchased: 18,
    },
    referralCode: 'JOAO2024',
    memberSince: new Date('2024-06-15'),
    status: 'active',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'user-maria-santos',
    email: 'maria.santos@email.com',
    displayName: 'Maria Santos',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    phone: '+238 999 5678',
    dateOfBirth: new Date('1995-08-22'),
    gender: 'female',
    address: {
      street: 'Avenida Mindelo, 12',
      city: 'Mindelo',
      island: 'Sao Vicente',
      country: 'Cabo Verde',
    },
    wallet: {
      balance: 8750,
      pendingBonus: 0,
      loyaltyPoints: 1200,
      tier: 'Silver',
    },
    preferences: {
      language: 'pt',
      currency: 'CVE',
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      categories: ['Musica', 'Gastronomia', 'Cultura'],
    },
    stats: {
      eventsAttended: 6,
      totalSpent: 22000,
      ticketsPurchased: 8,
    },
    referralCode: 'MARIA2024',
    memberSince: new Date('2024-08-01'),
    status: 'active',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
];

// Configuracao do sistema
const systemConfig = {
  platform: {
    name: 'EventsCV',
    tagline: 'Eventos em Cabo Verde',
    description: 'Plataforma oficial de eventos em Cabo Verde',
    logo: '/logo.svg',
    supportEmail: 'suporte@eventscv.cv',
    supportPhone: '+238 999 0000',
  },
  fees: {
    platformFeePercent: 5,
    paymentProcessingPercent: 2.5,
    minimumPayout: 5000,
    payoutCurrency: 'CVE',
  },
  categories: [
    { id: 'musica', name: 'Musica', icon: 'music' },
    { id: 'festa', name: 'Festa', icon: 'party' },
    { id: 'desporto', name: 'Desporto', icon: 'trophy' },
    { id: 'gastronomia', name: 'Gastronomia', icon: 'utensils' },
    { id: 'cultura', name: 'Cultura', icon: 'landmark' },
    { id: 'workshop', name: 'Workshop', icon: 'graduation-cap' },
    { id: 'networking', name: 'Networking', icon: 'users' },
    { id: 'outro', name: 'Outro', icon: 'calendar' },
  ],
  islands: [
    { id: 'santiago', name: 'Santiago', capital: 'Praia' },
    { id: 'sao-vicente', name: 'Sao Vicente', capital: 'Mindelo' },
    { id: 'sal', name: 'Sal', capital: 'Espargos' },
    { id: 'boa-vista', name: 'Boa Vista', capital: 'Sal Rei' },
    { id: 'fogo', name: 'Fogo', capital: 'Sao Filipe' },
    { id: 'santo-antao', name: 'Santo Antao', capital: 'Ribeira Grande' },
    { id: 'maio', name: 'Maio', capital: 'Vila do Maio' },
    { id: 'sao-nicolau', name: 'Sao Nicolau', capital: 'Ribeira Brava' },
    { id: 'brava', name: 'Brava', capital: 'Nova Sintra' },
  ],
  paymentMethods: [
    { id: 'wallet', name: 'Carteira EventsCV', enabled: true },
    { id: 'sisp', name: 'Cartao SISP (Vinti4)', enabled: true },
    { id: 'visa', name: 'Visa/Mastercard', enabled: true },
    { id: 'mbway', name: 'MB WAY', enabled: true },
  ],
  loyaltyTiers: [
    { id: 'bronze', name: 'Bronze', minPoints: 0, benefits: ['5% desconto em eventos selecionados'] },
    { id: 'silver', name: 'Silver', minPoints: 1000, benefits: ['10% desconto', 'Acesso antecipado'] },
    { id: 'gold', name: 'Gold', minPoints: 2000, benefits: ['15% desconto', 'Acesso VIP', 'Suporte prioritario'] },
    { id: 'platinum', name: 'Platinum', minPoints: 5000, benefits: ['20% desconto', 'Experiencias exclusivas', 'Convites especiais'] },
  ],
};

// ============================================
// FUNCAO DE SEED
// ============================================

async function seedFirestore() {
  console.log('Iniciando seed do Firestore...\n');

  try {
    // 1. Configuracao do Sistema
    console.log('1. Criando configuracao do sistema...');
    await db.collection('systemConfig').doc('platform').set(systemConfig);
    console.log('   Configuracao criada!\n');

    // 2. Organizacoes
    console.log('2. Criando organizacoes...');
    for (const org of organizations) {
      const { id, ...orgData } = org;
      await db.collection('organizations').doc(id).set(orgData);
      console.log(`   - ${org.name}`);
    }
    console.log('');

    // 3. Eventos
    console.log('3. Criando eventos...');
    for (const event of events) {
      const { id, ...eventData } = event;
      await db.collection('events').doc(id).set(eventData);
      console.log(`   - ${event.title}`);

      // 4. Tipos de bilhetes para cada evento
      if (ticketTypes[id]) {
        for (const ticketType of ticketTypes[id]) {
          const { id: typeId, ...typeData } = ticketType;
          await db.collection('events').doc(id).collection('ticketTypes').doc(typeId).set(typeData);
          console.log(`     + ${ticketType.name}`);
        }
      }
    }
    console.log('');

    // 5. Usuarios
    console.log('4. Criando usuarios de exemplo...');
    for (const user of users) {
      const { id, ...userData } = user;
      await db.collection('users').doc(id).set(userData);
      console.log(`   - ${user.displayName}`);
    }
    console.log('');

    // 6. Estatisticas da plataforma
    console.log('5. Criando estatisticas da plataforma...');
    await db.collection('platformStats').doc('overview').set({
      totalUsers: 2500,
      totalEvents: events.length,
      totalOrganizations: organizations.length,
      totalTicketsSold: 3412,
      totalRevenue: 15750000,
      activeEvents: events.filter(e => e.status === 'published').length,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('   Estatisticas criadas!\n');

    console.log('========================================');
    console.log('Seed concluido com sucesso!');
    console.log('========================================');
    console.log(`- ${organizations.length} organizacoes`);
    console.log(`- ${events.length} eventos`);
    console.log(`- ${Object.values(ticketTypes).flat().length} tipos de bilhetes`);
    console.log(`- ${users.length} usuarios`);
    console.log('========================================\n');

  } catch (error) {
    console.error('Erro durante o seed:', error);
    throw error;
  }
}

// Executar seed
seedFirestore()
  .then(() => {
    console.log('Script finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
