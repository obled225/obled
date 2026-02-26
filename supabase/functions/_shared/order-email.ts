// Email template engine for O'bled order emails
// Simplified version inspired by Lomi email engine

// Base layout template (reusing from contact-email.ts)
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
      margin-bottom: 12px;
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

    .order-number {
      font-size: 14px;
      font-weight: 500;
      color: #6b7280;
      margin: 20px 0 16px 0;
      padding: 0;
    }

    .order-items {
      margin-top: 24px;
    }

    .item-row {
      display: flex;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .item-row:last-child {
      border-bottom: none;
    }

    .item-image {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 6px;
      flex-shrink: 0;
    }

    .item-image-placeholder {
      width: 60px;
      height: 60px;
      background-color: #f3f4f6;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
      font-size: 11px;
      flex-shrink: 0;
    }

    .item-details {
      flex: 1;
      min-width: 0;
    }

    .item-title {
      font-size: 14px;
      font-weight: 500;
      color: #1f2937;
      margin: 0 0 4px 0;
    }

    .item-variant {
      font-size: 12px;
      color: #6b7280;
      margin: 0 0 6px 0;
    }

    .item-quantity {
      font-size: 12px;
      color: #6b7280;
      margin: 0;
    }

    .item-price {
      font-size: 14px;
      font-weight: 500;
      color: #1f2937;
      text-align: right;
      white-space: nowrap;
    }

    .receipt-details {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 2px solid #e5e7eb;
    }

    .receipt-details.no-border-top {
      border-top: none;
      margin-top: 0;
      padding-top: 0;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
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

    .detail-row.total-row {
      padding-top: 16px;
      margin-top: 8px;
    }

    .detail-row.total-row .detail-label,
    .detail-row.total-row .detail-value {
      font-size: 18px;
      font-weight: 700;
      color: #1f2937;
    }

    .shipping-address-box {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 6px;
      margin-top: 24px;
    }

    .shipping-address-box h3 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
    }

    .shipping-address-box p {
      margin: 4px 0;
      font-size: 14px;
      color: #374151;
      line-height: 1.6;
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
      .item-row {
        flex-direction: column;
      }
      .item-price {
        text-align: left;
        margin-top: 8px;
      }
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

// Customer order confirmation email template
export const customerOrderConfirmationTemplate = `<div class="transaction-card">
  <div class="greeting-section">
    <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 16px;">Merci pour votre commande, {{firstName}} !</h1>
    <p class="greeting-text">
      Nous avons bien reçu votre commande et nous la préparons pour l'expédition. Voici un récapitulatif de votre commande :
    </p>
    
    <div class="order-items">
      <!-- Order items will be inserted here -->
    </div>
    
    <div class="receipt-details no-border-top">
      <!-- Shipping address will be inserted here -->
    </div>
    
    <div class="receipt-details">
      <!-- Order summary will be inserted here -->
    </div>
    
    <p class="greeting-text" style="margin-top: 24px;">
      Si vous avez des questions, n'hésitez pas à répondre à cet email ou à nous contacter via WhatsApp au <a href="https://wa.me/22507135164117" class="support-link">+225 07 13 51 64 17</a>.
    </p>
    <p class="greeting-text" style="margin-top: 24px;">
      Cordialement,<br>
      L'équipe O'bled
    </p>
  </div>
</div>`;

// Owner order notification email template
export const ownerOrderNotificationTemplate = `<div class="transaction-card">
  <div class="transaction-header">
    <h3 class="transaction-title">Nouvelle commande</h3>
  </div>

  <div class="greeting-section">
    <div class="receipt-details no-border-top">
      <!-- Order details will be inserted here -->
    </div>
    
    <div class="order-items">
      <!-- Order items will be inserted here -->
    </div>
    
    <div class="receipt-details">
      <!-- Order summary will be inserted here -->
    </div>
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

// Helper function to format currency
export function formatCurrency(amount: number, currency: string): string {
  if (currency === 'XOF') {
    return `${Math.round(amount).toLocaleString('fr-FR')} F CFA`;
  }
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

// Simple template engine using string replacement
export class EmailTemplateEngine {
  static renderCustomerOrderConfirmation(data: {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    items: Array<{
      product_title: string;
      variant_title?: string | null;
      quantity: number;
      total_amount: number;
      product_image_url?: string | null;
    }>;
    subtotal: number;
    shippingFee: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    currencyCode: string;
    shippingAddress?: {
      name?: string;
      address?: string;
      city?: string;
      country?: string;
      postalCode?: string;
      phone?: string;
    } | null;
  }): string {
    const firstName = getFirstName(data.customerName);
    
    // Build order items HTML
    let itemsHtml = '';
    for (const item of data.items) {
      const imageHtml = item.product_image_url
        ? `<img src="${escapeHtml(item.product_image_url)}" alt="${escapeHtml(item.product_title)}" class="item-image" />`
        : '<div class="item-image-placeholder">No Image</div>';
      
      const variantHtml = item.variant_title
        ? `<p class="item-variant">${escapeHtml(item.variant_title)}</p>`
        : '';
      
      itemsHtml += `
      <div class="item-row">
        ${imageHtml}
        <div class="item-details">
          <p class="item-title">${escapeHtml(item.product_title)}</p>
          ${variantHtml}
          <p class="item-quantity">Quantité : ${item.quantity}</p>
        </div>
        <div class="item-price">${formatCurrency(item.total_amount, data.currencyCode)}</div>
      </div>`;
    }
    
    // Build order summary HTML
    let summaryHtml = `
    <div class="detail-row">
      <span class="detail-label">Sous-total</span>
      <span class="detail-value">${formatCurrency(data.subtotal, data.currencyCode)}</span>
    </div>`;
    
    if (data.shippingFee > 0) {
      summaryHtml += `
    <div class="detail-row">
      <span class="detail-label">Livraison</span>
      <span class="detail-value">${formatCurrency(data.shippingFee, data.currencyCode)}</span>
    </div>`;
    }
    
    if (data.taxAmount > 0) {
      summaryHtml += `
    <div class="detail-row">
      <span class="detail-label">Taxe</span>
      <span class="detail-value">${formatCurrency(data.taxAmount, data.currencyCode)}</span>
    </div>`;
    }
    
    if (data.discountAmount > 0) {
      summaryHtml += `
    <div class="detail-row">
      <span class="detail-label">Réduction</span>
      <span class="detail-value">-${formatCurrency(data.discountAmount, data.currencyCode)}</span>
    </div>`;
    }
    
    summaryHtml += `
    <div class="detail-row total-row">
      <span class="detail-label">Total</span>
      <span class="detail-value">${formatCurrency(data.totalAmount, data.currencyCode)}</span>
    </div>`;
    
    // Build shipping address HTML as detail rows (like owner notification)
    // Add order number first
    let shippingAddressHtml = `
    <div class="detail-row">
      <span class="detail-label">Numéro de commande</span>
      <span class="detail-value">${escapeHtml(data.orderNumber)}</span>
    </div>`;
    
    if (data.shippingAddress) {
      const addr = data.shippingAddress;
      // Show "Adresse de livraison" label only if there's any address data
      if (addr.address || addr.city || addr.country || addr.postalCode) {
        shippingAddressHtml += `
    <div class="detail-row">
      <span class="detail-label">Adresse de livraison</span>
      <span class="detail-value"></span>
    </div>`;
      }
      if (addr.address) {
        shippingAddressHtml += `
    <div class="detail-row">
      <span class="detail-label"></span>
      <span class="detail-value">${escapeHtml(addr.address)}</span>
    </div>`;
      }
      if (addr.city || addr.country) {
        const cityCountry = [addr.city, addr.country].filter(Boolean).join(', ');
        shippingAddressHtml += `
    <div class="detail-row">
      <span class="detail-label"></span>
      <span class="detail-value">${escapeHtml(cityCountry)}</span>
    </div>`;
      }
      if (addr.postalCode) {
        shippingAddressHtml += `
    <div class="detail-row">
      <span class="detail-label"></span>
      <span class="detail-value">${escapeHtml(addr.postalCode)}</span>
    </div>`;
      }
    }
    
    // Replace template placeholders
    const body = customerOrderConfirmationTemplate
      .replace(/\{\{firstName\}\}/g, escapeHtml(firstName))
      .replace(/\{\{orderNumber\}\}/g, escapeHtml(data.orderNumber))
      .replace(/<!-- Shipping address will be inserted here -->/g, shippingAddressHtml)
      .replace(/<!-- Order items will be inserted here -->/g, itemsHtml)
      .replace(/<!-- Order summary will be inserted here -->/g, summaryHtml);
    
    return baseLayout
      .replace(/\{\{title\}\}/g, `Confirmation de commande - ${escapeHtml(data.orderNumber)}`)
      .replace(/\{\{\{body\}\}\}/g, body);
  }

  static renderOwnerOrderNotification(data: {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    items: Array<{
      product_title: string;
      variant_title?: string | null;
      quantity: number;
      total_amount: number;
      product_image_url?: string | null;
    }>;
    subtotal: number;
    shippingFee: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    currencyCode: string;
    shippingAddress?: {
      name?: string;
      address?: string;
      city?: string;
      country?: string;
      postalCode?: string;
      phone?: string;
    } | null;
    createdAt?: string | Date;
  }): string {
    const formattedDate = data.createdAt ? formatDateFrench(data.createdAt) : formatDateFrench(new Date());
    
    // Build order details (customer info)
    let detailsHtml = `
    <div class="detail-row">
      <span class="detail-label">Client</span>
      <span class="detail-value">${escapeHtml(data.customerName)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Email</span>
      <span class="detail-value"><a href="mailto:${escapeHtml(data.customerEmail)}" class="support-link">${escapeHtml(data.customerEmail)}</a></span>
    </div>`;
    
    // Add phone number right after email if available
    if (data.shippingAddress?.phone) {
      detailsHtml += `
    <div class="detail-row">
      <span class="detail-label">Téléphone</span>
      <span class="detail-value">${escapeHtml(data.shippingAddress.phone)}</span>
    </div>`;
    }
    
    detailsHtml += `
    <div class="detail-row">
      <span class="detail-label">Date de commande</span>
      <span class="detail-value">${escapeHtml(formattedDate)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Numéro de commande</span>
      <span class="detail-value">${escapeHtml(data.orderNumber)}</span>
    </div>`;
    
    // Add shipping address as detail rows if available
    if (data.shippingAddress) {
      const addr = data.shippingAddress;
      // Show "Adresse de livraison" label only if there's any address data (excluding phone)
      if (addr.address || addr.city || addr.country || addr.postalCode) {
        detailsHtml += `
    <div class="detail-row">
      <span class="detail-label">Adresse de livraison</span>
      <span class="detail-value"></span>
    </div>`;
      }
      if (addr.address) {
        detailsHtml += `
    <div class="detail-row">
      <span class="detail-label"></span>
      <span class="detail-value">${escapeHtml(addr.address)}</span>
    </div>`;
      }
      if (addr.city || addr.country) {
        const cityCountry = [addr.city, addr.country].filter(Boolean).join(', ');
        detailsHtml += `
    <div class="detail-row">
      <span class="detail-label"></span>
      <span class="detail-value">${escapeHtml(cityCountry)}</span>
    </div>`;
      }
      if (addr.postalCode) {
        detailsHtml += `
    <div class="detail-row">
      <span class="detail-label"></span>
      <span class="detail-value">${escapeHtml(addr.postalCode)}</span>
    </div>`;
      }
    }
    
    // Build order items HTML
    let itemsHtml = '';
    for (const item of data.items) {
      const imageHtml = item.product_image_url
        ? `<img src="${escapeHtml(item.product_image_url)}" alt="${escapeHtml(item.product_title)}" class="item-image" />`
        : '<div class="item-image-placeholder">No Image</div>';
      
      const variantHtml = item.variant_title
        ? `<p class="item-variant">${escapeHtml(item.variant_title)}</p>`
        : '';
      
      itemsHtml += `
      <div class="item-row">
        ${imageHtml}
        <div class="item-details">
          <p class="item-title">${escapeHtml(item.product_title)}</p>
          ${variantHtml}
          <p class="item-quantity">Quantité : ${item.quantity}</p>
        </div>
        <div class="item-price">${formatCurrency(item.total_amount, data.currencyCode)}</div>
      </div>`;
    }
    
    // Build order summary HTML
    let summaryHtml = `
    <div class="detail-row">
      <span class="detail-label">Sous-total</span>
      <span class="detail-value">${formatCurrency(data.subtotal, data.currencyCode)}</span>
    </div>`;
    
    if (data.shippingFee > 0) {
      summaryHtml += `
    <div class="detail-row">
      <span class="detail-label">Livraison</span>
      <span class="detail-value">${formatCurrency(data.shippingFee, data.currencyCode)}</span>
    </div>`;
    }
    
    if (data.taxAmount > 0) {
      summaryHtml += `
    <div class="detail-row">
      <span class="detail-label">Taxe</span>
      <span class="detail-value">${formatCurrency(data.taxAmount, data.currencyCode)}</span>
    </div>`;
    }
    
    if (data.discountAmount > 0) {
      summaryHtml += `
    <div class="detail-row">
      <span class="detail-label">Réduction</span>
      <span class="detail-value">-${formatCurrency(data.discountAmount, data.currencyCode)}</span>
    </div>`;
    }
    
    summaryHtml += `
    <div class="detail-row total-row">
      <span class="detail-label">Total</span>
      <span class="detail-value">${formatCurrency(data.totalAmount, data.currencyCode)}</span>
    </div>`;
    
    // Replace template placeholders
    const body = ownerOrderNotificationTemplate
      .replace(/\{\{orderNumber\}\}/g, escapeHtml(data.orderNumber))
      .replace(/<!-- Order details will be inserted here -->/g, detailsHtml)
      .replace(/<!-- Order items will be inserted here -->/g, itemsHtml)
      .replace(/<!-- Order summary will be inserted here -->/g, summaryHtml);
    
    return baseLayout
      .replace(/\{\{title\}\}/g, `Nouvelle commande - ${escapeHtml(data.orderNumber)}`)
      .replace(/\{\{\{body\}\}\}/g, body);
  }
}
