/**
 * Script para popular o Firestore EMULATOR com dados de exemplo
 *
 * COMO USAR:
 * 1. Primeiro inicie o emulador: firebase emulators:start --only firestore
 * 2. Execute: FIRESTORE_EMULATOR_HOST=localhost:8080 node scripts/seed-firestore-emulator.js
 */

const admin = require('firebase-admin');

// Verifica se está usando emulador
if (!process.env.FIRESTORE_EMULATOR_HOST) {
  console.log('\n================================');
  console.log('ATENCAO: Emulador nao detectado!');
  console.log('================================\n');
  console.log('Para usar este script com o emulador:');
  console.log('1. Inicie o emulador: firebase emulators:start --only firestore');
  console.log('2. Execute: FIRESTORE_EMULATOR_HOST=localhost:8080 node scripts/seed-firestore-emulator.js');
  console.log('\nPara usar com Firestore real, use: node scripts/seed-firestore.js');
  console.log('(requer GOOGLE_APPLICATION_CREDENTIALS configurado)\n');
  process.exit(1);
}

console.log('\n===============================');
console.log('MODO: Firestore Emulator');
console.log(`Host: ${process.env.FIRESTORE_EMULATOR_HOST}`);
console.log('===============================\n');

// Inicializar Firebase Admin para emulador
admin.initializeApp({
  projectId: 'eventscv-platform',
});

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
    description: 'Uma noite intima de jazz com os melhores musicos de Cabo Verde.',
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
    description: 'A maior festa de praia do Sal!',
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
    description: 'Corrida historica pelas ruas da primeira cidade da Africa Subsaariana.',
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
    description: 'O festival mais esperado de Cabo Verde!',
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
    description: 'Aprenda a fazer a autentica cachupa cabo-verdiana.',
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
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    publishedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
];

// Tipos de bilhetes
const ticketTypes = {
  'evt-baia-gatas-2024': [
    { id: 'tt-vip', name: 'VIP Pass', price: 7500, quantity: 500, sold: 320 },
    { id: 'tt-geral', name: 'Entrada Geral', price: 2500, quantity: 4000, sold: 930 },
  ],
  'evt-noite-jazz': [
    { id: 'tt-normal', name: 'Entrada Normal', price: 1500, quantity: 400, sold: 290 },
    { id: 'tt-mesa', name: 'Mesa Reservada', price: 8000, quantity: 25, sold: 12 },
  ],
  'evt-beach-party-sal': [
    { id: 'tt-early', name: 'Early Bird', price: 2000, quantity: 500, sold: 500 },
    { id: 'tt-normal', name: 'Entrada Geral', price: 3000, quantity: 1500, sold: 390 },
  ],
  'evt-corrida-cidade-velha': [
    { id: 'tt-adulto', name: 'Inscricao Adulto', price: 500, quantity: 800, sold: 420 },
    { id: 'tt-jovem', name: 'Inscricao Jovem', price: 300, quantity: 200, sold: 100 },
  ],
  'evt-festival-gamboa': [
    { id: 'tt-super-early', name: 'Super Early Bird', price: 2500, quantity: 1000, sold: 0 },
    { id: 'tt-vip', name: 'VIP All Access', price: 10000, quantity: 500, sold: 0 },
  ],
  'evt-cooking-cachupa': [
    { id: 'tt-individual', name: 'Participacao Individual', price: 2000, quantity: 20, sold: 12 },
  ],
};

// Usuarios
const users = [
  {
    id: 'user-joao-silva',
    email: 'joao.silva@email.com',
    displayName: 'Joao Silva',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    phone: '+238 999 1234',
    wallet: { balance: 15500, tier: 'Gold' },
    stats: { eventsAttended: 12, totalSpent: 45000, ticketsPurchased: 18 },
    status: 'active',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'user-maria-santos',
    email: 'maria.santos@email.com',
    displayName: 'Maria Santos',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    phone: '+238 999 5678',
    wallet: { balance: 8750, tier: 'Silver' },
    stats: { eventsAttended: 6, totalSpent: 22000, ticketsPurchased: 8 },
    status: 'active',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
];

// Config do sistema
const systemConfig = {
  platform: {
    name: 'EventsCV',
    tagline: 'Eventos em Cabo Verde',
    supportEmail: 'suporte@eventscv.cv',
  },
  fees: { platformFeePercent: 5, paymentProcessingPercent: 2.5 },
  categories: [
    { id: 'musica', name: 'Musica' },
    { id: 'festa', name: 'Festa' },
    { id: 'desporto', name: 'Desporto' },
    { id: 'gastronomia', name: 'Gastronomia' },
    { id: 'cultura', name: 'Cultura' },
  ],
  islands: [
    { id: 'santiago', name: 'Santiago' },
    { id: 'sao-vicente', name: 'Sao Vicente' },
    { id: 'sal', name: 'Sal' },
    { id: 'boa-vista', name: 'Boa Vista' },
    { id: 'fogo', name: 'Fogo' },
    { id: 'santo-antao', name: 'Santo Antao' },
  ],
};

// ============================================
// FUNCAO DE SEED
// ============================================

async function seedFirestore() {
  console.log('Iniciando seed do Firestore Emulator...\n');

  try {
    // 1. Config
    console.log('1. Criando configuracao do sistema...');
    await db.collection('systemConfig').doc('platform').set(systemConfig);
    console.log('   OK\n');

    // 2. Organizacoes
    console.log('2. Criando organizacoes...');
    for (const org of organizations) {
      const { id, ...orgData } = org;
      await db.collection('organizations').doc(id).set(orgData);
      console.log(`   - ${org.name}`);
    }
    console.log('');

    // 3. Eventos e tickets
    console.log('3. Criando eventos e bilhetes...');
    for (const event of events) {
      const { id, ...eventData } = event;
      await db.collection('events').doc(id).set(eventData);
      console.log(`   - ${event.title}`);

      if (ticketTypes[id]) {
        for (const tt of ticketTypes[id]) {
          const { id: ttId, ...ttData } = tt;
          await db.collection('events').doc(id).collection('ticketTypes').doc(ttId).set({
            ...ttData,
            eventId: id,
            currency: 'CVE',
            status: tt.sold >= tt.quantity ? 'sold_out' : 'on_sale',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`     + ${tt.name}`);
        }
      }
    }
    console.log('');

    // 4. Usuarios
    console.log('4. Criando usuarios...');
    for (const user of users) {
      const { id, ...userData } = user;
      await db.collection('users').doc(id).set(userData);
      console.log(`   - ${user.displayName}`);
    }
    console.log('');

    // 5. Stats
    console.log('5. Criando estatisticas...');
    await db.collection('platformStats').doc('overview').set({
      totalUsers: 2500,
      totalEvents: events.length,
      totalOrganizations: organizations.length,
      totalTicketsSold: 3412,
      totalRevenue: 15750000,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('   OK\n');

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

seedFirestore()
  .then(() => {
    console.log('Script finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
