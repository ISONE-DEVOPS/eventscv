import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import * as QRCode from 'qrcode';
import * as admin from 'firebase-admin';

/**
 * Gera QR Code automaticamente quando um evento é publicado
 * Triggered on: events/{eventId} write
 */
export const generateEventQRCode = onDocumentWritten(
  'events/{eventId}',
  async (event) => {
    const eventId = event.params.eventId;
    const after = event.data?.after.data();
    const before = event.data?.before.data();

    // Só gerar QR quando evento é publicado pela primeira vez
    if (
      after?.status === 'published' &&
      before?.status !== 'published' &&
      !after?.registration?.qrCodeUrl
    ) {
      try {
        const eventSlug = after.slug;
        const eventUrl = `https://eventscv.cv/events/${eventSlug}?src=qr`;

        console.log(`Generating QR code for event ${eventId} with URL: ${eventUrl}`);

        // Gerar QR code PNG
        const qrBuffer = await QRCode.toBuffer(eventUrl, {
          errorCorrectionLevel: 'H',
          width: 512,
          margin: 2,
        });

        // Upload para Firebase Storage
        const bucket = admin.storage().bucket();
        const fileName = `qrcodes/${eventId}.png`;
        const file = bucket.file(fileName);

        await file.save(qrBuffer, {
          metadata: {
            contentType: 'image/png',
            metadata: {
              eventId,
              eventSlug,
              generatedAt: new Date().toISOString(),
            },
          },
        });

        // Tornar arquivo público
        await file.makePublic();

        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        console.log(`QR code uploaded to: ${publicUrl}`);

        // Atualizar evento com informações do QR code
        if (event.data?.after) {
          await event.data.after.ref.update({
            'registration.enabled': true,
            'registration.guestRegistrationEnabled': true,
            'registration.customFields': [],
            'registration.qrCodeUrl': publicUrl,
            'registration.qrCodeData': eventUrl,
            'registration.qrCodeGeneratedAt': admin.firestore.FieldValue.serverTimestamp(),
            qrScans: 0,
          });
        }

        console.log(`Successfully generated QR code for event ${eventId}`);
      } catch (error) {
        console.error(`Error generating QR code for event ${eventId}:`, error);
        throw error;
      }
    }
  }
);
