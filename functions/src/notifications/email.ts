/**
 * Email Notification Service
 *
 * Handles all email notifications using cPanel SMTP (Nodemailer)
 */

import nodemailer from 'nodemailer';
import * as admin from 'firebase-admin';

// cPanel SMTP Configuration
const SMTP_HOST = process.env.SMTP_HOST || 'mail.events.cv';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
const SMTP_USER = process.env.SMTP_USER || 'noreply@events.cv';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@events.cv';
const FROM_NAME = process.env.FROM_NAME || 'EventsCV';

// Create SMTP transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

interface TicketInfo {
  ticketTypeName: string;
  quantity: number;
  price: number;
}

interface OrderDetails {
  orderId: string;
  eventTitle: string;
  eventDate: Date;
  eventLocation: string;
  buyerName: string;
  buyerEmail: string;
  tickets: TicketInfo[];
  total: number;
  currency: string;
}

/**
 * Send purchase confirmation email
 */
export async function sendPurchaseConfirmation(orderDetails: OrderDetails): Promise<void> {
  if (!SMTP_PASS) {
    console.warn('SMTP password not configured. Email not sent.');
    return;
  }

  const {
    orderId,
    eventTitle,
    eventDate,
    eventLocation,
    buyerName,
    buyerEmail,
    tickets,
    total,
  } = orderDetails;

  const ticketsList = tickets
    .map(
      (t) =>
        `<tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            <strong>${t.ticketTypeName}</strong><br>
            <span style="color: #666; font-size: 14px;">Quantidade: ${t.quantity}</span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
            ${(t.price * t.quantity).toLocaleString('pt-CV')}$00
          </td>
        </tr>`
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação de Compra - EventsCV</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                ✓ Pagamento Confirmado!
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                Os teus bilhetes estão prontos
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 30px 20px;">
              <p style="margin: 0; font-size: 16px; color: #333;">
                Olá <strong>${buyerName}</strong>,
              </p>
              <p style="margin: 15px 0 0; font-size: 16px; color: #666; line-height: 1.6;">
                O teu pagamento foi processado com sucesso! Os bilhetes para <strong>${eventTitle}</strong> estão disponíveis na tua conta.
              </p>
            </td>
          </tr>

          <!-- Event Info -->
          <tr>
            <td style="padding: 0 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; padding: 20px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 15px; font-size: 20px; color: #333;">
                      ${eventTitle}
                    </h2>
                    <p style="margin: 0; font-size: 14px; color: #666;">
                      📅 ${eventDate.toLocaleDateString('pt-PT', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p style="margin: 8px 0 0; font-size: 14px; color: #666;">
                      📍 ${eventLocation}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Tickets -->
          <tr>
            <td style="padding: 30px;">
              <h3 style="margin: 0 0 15px; font-size: 18px; color: #333;">Bilhetes</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                ${ticketsList}
                <tr style="background-color: #f8f9fa;">
                  <td style="padding: 16px; font-weight: 700; font-size: 16px; color: #333;">
                    Total Pago
                  </td>
                  <td style="padding: 16px; text-align: right; font-weight: 700; font-size: 18px; color: #667eea;">
                    ${total.toLocaleString('pt-CV')}$00
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order ID -->
          <tr>
            <td style="padding: 0 30px;">
              <p style="margin: 0; font-size: 13px; color: #999;">
                ID do Pedido: <span style="font-family: monospace; color: #666;">${orderId}</span>
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 30px;" align="center">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 14px 32px;">
                    <a href="https://eventscv-web.web.app/tickets" style="color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; display: block;">
                      Ver Meus Bilhetes
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Instructions -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #e8f4ff; border-left: 4px solid #667eea; padding: 15px; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #333; font-weight: 600;">
                  ℹ️ Como usar os bilhetes
                </p>
                <p style="margin: 10px 0 0; font-size: 14px; color: #666; line-height: 1.6;">
                  1. Acede a "Meus Bilhetes" na tua conta<br>
                  2. Apresenta o código QR na entrada do evento<br>
                  3. Guarda este email para referência futura
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0; font-size: 14px; color: #666;">
                Tens alguma dúvida? Contacta-nos:
              </p>
              <p style="margin: 10px 0 0;">
                <a href="mailto:support@eventscv.com" style="color: #667eea; text-decoration: none; font-weight: 600;">
                  support@eventscv.com
                </a>
              </p>
              <p style="margin: 20px 0 0; font-size: 13px; color: #999;">
                © ${new Date().getFullYear()} EventsCV. Todos os direitos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const mailOptions = {
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: buyerEmail,
    subject: `✓ Bilhetes confirmados - ${eventTitle}`,
    html,
    text: `
Olá ${buyerName},

O teu pagamento foi processado com sucesso!

Evento: ${eventTitle}
Data: ${eventDate.toLocaleDateString('pt-PT')}
Local: ${eventLocation}
Total pago: ${total.toLocaleString('pt-CV')}$00

ID do Pedido: ${orderId}

Acede aos teus bilhetes em: https://eventscv-web.web.app/tickets

Obrigado por usar EventsCV!
    `.trim(),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Purchase confirmation email sent to ${buyerEmail} for order ${orderId}`);

    // Log email sent
    await admin.firestore().collection('email-logs').add({
      type: 'purchase_confirmation',
      to: buyerEmail,
      orderId,
      status: 'sent',
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error sending purchase confirmation email:', error);

    // Log email error
    await admin.firestore().collection('email-logs').add({
      type: 'purchase_confirmation',
      to: buyerEmail,
      orderId,
      status: 'failed',
      error: error.message,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Don't throw - email failure shouldn't break the payment flow
  }
}

/**
 * Send payment failure notification
 */
export async function sendPaymentFailure(
  buyerName: string,
  buyerEmail: string,
  eventTitle: string,
  orderId: string
): Promise<void> {
  if (!SMTP_PASS) {
    console.warn('SMTP password not configured. Email not sent.');
    return;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Falha no Pagamento - EventsCV</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                ⚠️ Pagamento Não Processado
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0; font-size: 16px; color: #333;">
                Olá <strong>${buyerName}</strong>,
              </p>
              <p style="margin: 15px 0 0; font-size: 16px; color: #666; line-height: 1.6;">
                Infelizmente, não conseguimos processar o teu pagamento para <strong>${eventTitle}</strong>.
              </p>
              <p style="margin: 15px 0 0; font-size: 16px; color: #666; line-height: 1.6;">
                Isto pode acontecer por vários motivos:
              </p>
              <ul style="margin: 15px 0; padding-left: 20px; color: #666; line-height: 1.8;">
                <li>Saldo insuficiente no cartão</li>
                <li>Dados do cartão incorretos</li>
                <li>Limite de transações atingido</li>
                <li>Cancelamento durante o processo</li>
              </ul>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 30px 30px;" align="center">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 14px 32px;">
                    <a href="https://eventscv-web.web.app/events" style="color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; display: block;">
                      Tentar Novamente
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Info -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #333; font-weight: 600;">
                  💡 Precisa de ajuda?
                </p>
                <p style="margin: 10px 0 0; font-size: 14px; color: #666; line-height: 1.6;">
                  Se continuas a ter problemas, contacta o teu banco ou a nossa equipa de suporte.
                </p>
              </div>
            </td>
          </tr>

          <!-- Order ID -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <p style="margin: 0; font-size: 13px; color: #999;">
                ID do Pedido: <span style="font-family: monospace; color: #666;">${orderId}</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0; font-size: 14px; color: #666;">
                Tens alguma dúvida? Contacta-nos:
              </p>
              <p style="margin: 10px 0 0;">
                <a href="mailto:support@eventscv.com" style="color: #667eea; text-decoration: none; font-weight: 600;">
                  support@eventscv.com
                </a>
              </p>
              <p style="margin: 20px 0 0; font-size: 13px; color: #999;">
                © ${new Date().getFullYear()} EventsCV. Todos os direitos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const mailOptions = {
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: buyerEmail,
    subject: `⚠️ Pagamento não processado - ${eventTitle}`,
    html,
    text: `
Olá ${buyerName},

Infelizmente, não conseguimos processar o teu pagamento para ${eventTitle}.

ID do Pedido: ${orderId}

Por favor, verifica os dados do teu cartão e tenta novamente.

Se precisares de ajuda, contacta-nos em support@events.cv

Obrigado,
EventsCV
    `.trim(),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Payment failure email sent to ${buyerEmail} for order ${orderId}`);

    // Log email sent
    await admin.firestore().collection('email-logs').add({
      type: 'payment_failure',
      to: buyerEmail,
      orderId,
      status: 'sent',
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error sending payment failure email:', error);

    // Log email error
    await admin.firestore().collection('email-logs').add({
      type: 'payment_failure',
      to: buyerEmail,
      orderId,
      status: 'failed',
      error: error.message,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}
