// Email template engine for KYS Factory contact emails
// Simplified version inspired by Lomi email engine

// Base layout template
export const baseLayout = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>{{title}}</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    body {
      font-family: "Inter", Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 20px;
      line-height: 1.5;
      color: #333333;
      background-color: #fafafa;
    }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }

    .email-container {
      max-width: 600px;
      margin: 40px auto;
    }

    .email-header {
      padding: 20px;
      text-align: center;
      background-color: #ffffff;
      border-radius: 8px 8px 0 0;
    }

    .email-header img {
      width: 100px;
      height: auto;
      border-radius: 6px;
      object-fit: contain;
    }

    .email-body {
      max-width: 600px;
      margin: 0 auto;
      padding: 0;
    }

    .email-footer {
      margin-top: 20px;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
      text-align: center;
    }

    .footer-text {
      font-size: 12px;
      color: #6b7280;
      line-height: 1.4;
      margin: 0;
    }

    /* Modern card design */
    .transaction-card {
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 32px;
      margin: 20px 0;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    }

    .transaction-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e5e7eb;
    }

    .transaction-header.no-border {
      border-bottom: none;
      margin-bottom: 4px;
    }

    .transaction-title {
      font-size: 16px;
      font-weight: 500;
      color: #6b7280;
      margin: 0;
    }

    .greeting-text {
      margin-bottom: 12px;
      font-size: 16px;
      color: #374151;
    }

    .greeting-text:last-child {
      margin-bottom: 0;
    }

    .greeting-section {
      margin-bottom: 0;
    }

    .receipt-details {
      margin-top: 12px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .detail-label {
      color: #6b7280;
      font-weight: 500;
      font-size: 14px;
    }

    .detail-value {
      color: #1f2937;
      font-weight: 500;
      font-size: 14px;
      text-align: right;
      word-break: break-word;
    }

    .message-box {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      margin-top: 20px;
    }

    .message-box p {
      margin: 0;
      font-size: 14px;
      color: #374151;
      line-height: 1.6;
    }

    .info-box {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      margin: 10px 0;
    }

    .info-box p {
      margin: 8px 0;
      font-size: 14px;
      color: #374151;
    }

    .support-link {
      color: #0284c7;
      text-decoration: none;
      font-weight: 500;
    }

    .support-link:hover {
      text-decoration: underline;
    }

    @media screen and (max-width: 600px) {
      body { padding: 20px 10px; }
      .email-container {
        width: 100% !important;
        margin: 0;
        border-radius: 0;
      }
      .email-body { padding: 0 !important; }
      .transaction-card { padding: 24px 20px; }
      .detail-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
      .detail-value {
        text-align: left;
      }
    }
  </style>
</head>
<body>
  <div class="email-body">
    {{{body}}}
  </div>
</body>
</html>`;

// Customer confirmation email template
export const customerConfirmationTemplate = `<div class="transaction-card">
  <div class="greeting-section">
    <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 16px;">Merci pour votre message, {{firstName}} !</h1>
    <p class="greeting-text">
      Nous avons bien reçu votre demande de contact et nous vous répondrons dans les plus brefs délais.
    </p>
    
    <div class="message-box">
      <p>
        {{{message}}}
      </p>
    </div>
    
    <p class="greeting-text" style="margin-top: 20px;">
      Si vous avez des questions urgentes, n'hésitez pas à nous contacter directement via WhatsApp au <a href="https://wa.me/22507135164117" class="support-link">+225 07 13 51 64 17</a>.
    </p>
    <p class="greeting-text" style="margin-top: 24px;">
      Cordialement,<br>
      L'équipe KYS Factory
    </p>
  </div>
</div>`;

// Owner notification email template
export const ownerNotificationTemplate = `<div class="transaction-card">
  <div class="transaction-header">
    <h3 class="transaction-title">Nouvelle demande de contact</h3>
  </div>

  <div class="receipt-details">
    <!-- Details will be inserted here -->
  </div>

  <div class="message-box" style="margin-top: 24px;">
    <p>
      {{{message}}}
    </p>
  </div>
</div>`;

// Helper function to get first name
export function getFirstName(name: string | undefined): string {
  if (!name) return '';
  const firstName = name.split(' ')[0];
  return firstName || '';
}

// Helper function to format date in French
export function formatDateFrench(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
}

// Helper function to escape HTML
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m] || m);
}

// Helper function to convert newlines to <br>
export function nl2br(text: string): string {
  return escapeHtml(text).replace(/\n/g, '<br>');
}

// Simple template engine using string replacement
export class EmailTemplateEngine {
  static renderCustomerConfirmation(data: {
    name: string;
    email: string;
    message: string;
  }): string {
    const firstName = getFirstName(data.name);
    const messageHtml = nl2br(data.message);
    
    const body = customerConfirmationTemplate
      .replace(/\{\{firstName\}\}/g, escapeHtml(firstName))
      .replace(/\{\{email\}\}/g, escapeHtml(data.email))
      .replace(/\{\{\{message\}\}\}/g, messageHtml);

    return baseLayout
      .replace(/\{\{title\}\}/g, 'Confirmation de réception - KYS Factory')
      .replace(/\{\{\{body\}\}\}/g, body);
  }

  static renderOwnerNotification(data: {
    name: string;
    email: string;
    company?: string | null;
    url?: string | null;
    message: string;
    createdAt: string | Date;
  }): string {
    const messageHtml = nl2br(data.message);
    const formattedDate = formatDateFrench(data.createdAt);
    
    // Build the detail rows
    let detailRows = `    <div class="detail-row">
      <span class="detail-label">Nom</span>
      <span class="detail-value">${escapeHtml(data.name)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Email</span>
      <span class="detail-value"><a href="mailto:${escapeHtml(data.email)}" class="support-link">${escapeHtml(data.email)}</a></span>
    </div>`;

    if (data.company) {
      detailRows += `
    <div class="detail-row">
      <span class="detail-label">Organisation</span>
      <span class="detail-value">${escapeHtml(data.company)}</span>
    </div>`;
    }

    if (data.url) {
      detailRows += `
    <div class="detail-row">
      <span class="detail-label">URL</span>
      <span class="detail-value"><a href="${escapeHtml(data.url)}" target="_blank" class="support-link">${escapeHtml(data.url)}</a></span>
    </div>`;
    }

    detailRows += `
    <div class="detail-row">
      <span class="detail-label">Date</span>
      <span class="detail-value">${escapeHtml(formattedDate)}</span>
    </div>`;

    const body = ownerNotificationTemplate
      .replace(/\{\{\{message\}\}\}/g, messageHtml)
      .replace(/<!-- Details will be inserted here -->/g, detailRows);

    return baseLayout
      .replace(/\{\{title\}\}/g, 'Nouvelle demande de contact - KYS Factory')
      .replace(/\{\{\{body\}\}\}/g, body);
  }
}
