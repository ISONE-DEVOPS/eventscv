"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGuestRegistration = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
/**
 * Cria registo de visitante sem necessidade de autenticação
 * Callable function acessível publicamente
 */
exports.createGuestRegistration = (0, https_1.onCall)(async (request) => {
    const { eventId, name, email, phone, customFieldResponses, demographics, source } = request.data;
    // Validação básica
    if (!eventId || !name || !email) {
        throw new https_1.HttpsError('invalid-argument', 'Dados obrigatórios faltando: eventId, name, email são obrigatórios');
    }
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new https_1.HttpsError('invalid-argument', 'Formato de email inválido');
    }
    try {
        const db = admin.firestore();
        // Verificar se o evento existe
        const eventDoc = await db.collection('events').doc(eventId).get();
        if (!eventDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Evento não encontrado');
        }
        const eventData = eventDoc.data();
        // Verificar se o evento está publicado
        if (eventData?.status !== 'published') {
            throw new https_1.HttpsError('failed-precondition', 'Este evento não está disponível para registo');
        }
        // Verificar se registos estão habilitados
        if (!eventData?.registration?.enabled || !eventData?.registration?.guestRegistrationEnabled) {
            throw new https_1.HttpsError('failed-precondition', 'Registos de visitantes não estão habilitados para este evento');
        }
        // Verificar se já existe registo com este email para este evento
        const existingRegistrations = await db
            .collection('guestRegistrations')
            .where('eventId', '==', eventId)
            .where('email', '==', email.toLowerCase())
            .limit(1)
            .get();
        if (!existingRegistrations.empty) {
            throw new https_1.HttpsError('already-exists', 'Já existe um registo com este email para este evento');
        }
        // Criar registo
        const registrationRef = db.collection('guestRegistrations').doc();
        const registrationData = {
            id: registrationRef.id,
            eventId,
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone?.trim() || '',
            customFieldResponses: customFieldResponses || {},
            demographics: demographics || null,
            source: source || 'web',
            registeredAt: admin.firestore.FieldValue.serverTimestamp(),
            convertedToOrder: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        await registrationRef.set(registrationData);
        // Incrementar contador de QR scans se source = 'qr'
        if (source === 'qr') {
            await db
                .collection('events')
                .doc(eventId)
                .update({
                qrScans: admin.firestore.FieldValue.increment(1),
            });
        }
        console.log(`Guest registration created: ${registrationRef.id} for event ${eventId}`);
        return {
            success: true,
            registrationId: registrationRef.id,
            message: 'Registo realizado com sucesso!',
        };
    }
    catch (error) {
        console.error('Error creating guest registration:', error);
        // Se já é HttpsError, relan çar
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        // Caso contrário, criar erro genérico
        throw new https_1.HttpsError('internal', 'Erro ao criar registo. Tente novamente mais tarde.');
    }
});
//# sourceMappingURL=createGuestRegistration.js.map