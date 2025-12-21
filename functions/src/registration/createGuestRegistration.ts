import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

/**
 * Cria registo de visitante sem necessidade de autenticação
 * Callable function acessível publicamente
 */
export const createGuestRegistration = onCall(async (request) => {
  const { eventId, name, email, phone, customFieldResponses, demographics, source } =
    request.data;

  // Validação básica
  if (!eventId || !name || !email) {
    throw new HttpsError(
      'invalid-argument',
      'Dados obrigatórios faltando: eventId, name, email são obrigatórios'
    );
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new HttpsError('invalid-argument', 'Formato de email inválido');
  }

  try {
    const db = admin.firestore();

    // Verificar se o evento existe
    const eventDoc = await db.collection('events').doc(eventId).get();

    if (!eventDoc.exists) {
      throw new HttpsError('not-found', 'Evento não encontrado');
    }

    const eventData = eventDoc.data();

    // Verificar se o evento está publicado
    if (eventData?.status !== 'published') {
      throw new HttpsError(
        'failed-precondition',
        'Este evento não está disponível para registo'
      );
    }

    // Verificar se registos estão habilitados
    if (!eventData?.registration?.enabled || !eventData?.registration?.guestRegistrationEnabled) {
      throw new HttpsError(
        'failed-precondition',
        'Registos de visitantes não estão habilitados para este evento'
      );
    }

    // Verificar se já existe registo com este email para este evento
    const existingRegistrations = await db
      .collection('guestRegistrations')
      .where('eventId', '==', eventId)
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();

    if (!existingRegistrations.empty) {
      throw new HttpsError(
        'already-exists',
        'Já existe um registo com este email para este evento'
      );
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
  } catch (error: any) {
    console.error('Error creating guest registration:', error);

    // Se já é HttpsError, relan çar
    if (error instanceof HttpsError) {
      throw error;
    }

    // Caso contrário, criar erro genérico
    throw new HttpsError('internal', 'Erro ao criar registo. Tente novamente mais tarde.');
  }
});
