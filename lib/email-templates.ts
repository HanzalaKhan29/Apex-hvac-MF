/**
 * Z.26 — HTML email templates, Apex brand colors (ink #0A1421 / copper
 * #AD5622). Table-based-ish inline styles only — no external stylesheet, no
 * webfont, no tracking pixel — for compatibility across email clients that
 * strip <style> blocks (Gmail, Outlook).
 */

const INK = '#0A1421';
const COPPER = '#AD5622';
const PAPER = '#FAF8F4';
const BORDER = '#E5E1D8';

function shell(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:${PAPER};font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER};padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid ${BORDER};">
          <tr>
            <td style="background:${INK};padding:20px 28px;">
              <span style="color:${PAPER};font-size:18px;font-weight:800;letter-spacing:-0.01em;">APEX</span>
              <span style="color:${COPPER};font-size:11px;font-weight:700;letter-spacing:0.16em;margin-left:8px;">COMFORT SYSTEMS</span>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px;background:#f5f2ec;border-top:1px solid ${BORDER};">
              <p style="margin:0;font-size:12px;color:#6b7280;">Apex Comfort Systems &middot; Phoenix, AZ &middot; (602) 555-0100</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

const esc = (v: string) =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;border-bottom:1px solid ${BORDER};font-size:13px;color:#6b7280;width:140px;vertical-align:top;">${esc(label)}</td>
    <td style="padding:8px 0;border-bottom:1px solid ${BORDER};font-size:14px;color:${INK};font-weight:600;">${esc(value)}</td>
  </tr>`;
}

export interface BusinessNotificationLead {
  formType: 'quote' | 'callback';
  name: string;
  phone: string;
  email?: string;
  service?: string;
  zip?: string;
  outOfArea: boolean;
  bestTime?: string;
  message?: string;
}

/** Internal notification — a new lead landed, call them. */
export function businessNotificationHtml(lead: BusinessNotificationLead): string {
  const rows = [
    row('Name', lead.name),
    row('Phone', lead.phone),
    lead.email ? row('Email', lead.email) : '',
    lead.service ? row('Service', lead.service) : '',
    lead.zip ? row('ZIP', lead.zip) : '',
    lead.bestTime ? row('Best time', lead.bestTime) : '',
    lead.message ? row('Message', lead.message) : '',
  ]
    .filter(Boolean)
    .join('');

  const body = `
    <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${COPPER};">
      ${lead.outOfArea ? 'Out of area. ' : ''}New ${esc(lead.formType)} lead
    </p>
    <h1 style="margin:0 0 20px;font-size:20px;color:${INK};">Call ${esc(lead.name)} back</h1>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
  `;
  return shell(body);
}

export interface CustomerConfirmationLead {
  name: string;
}

/** Customer-facing confirmation — sent only when the customer gave an email. */
export function customerConfirmationHtml(lead: CustomerConfirmationLead): string {
  const body = `
    <h1 style="margin:0 0 12px;font-size:20px;color:${INK};">Thanks, ${esc(lead.name)}.</h1>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#374151;">
      We received your request. A dispatcher will call you within 30 minutes to confirm details and, for repairs, get a technician on the way.
    </p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#374151;">
      Need it faster, or made a mistake on the form? Call us directly. A real person answers 24/7.
    </p>
    <p style="margin:0;">
      <a href="tel:+16025550100" style="display:inline-block;background:${COPPER};color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 20px;border-radius:8px;">Call (602) 555-0100</a>
    </p>
  `;
  return shell(body);
}
