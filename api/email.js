import { Resend } from "resend";

const ADMIN_RECIPIENT = "admin@zahthic.com";
const ALLOWED_SENDERS = new Set(["admin@zahthic.com", "info@zahthic.com", "support@zahthic.com"]);
const FALLBACK_ADMIN_KEY = "LeaveZahthic360";
const SITE_URL = "https://zahthic.com";
const LOGO_URL = `${SITE_URL}/zahthic-logo.svg`;
const BRAND = {
  black: "#0c0e0d",
  lime: "#98bf2e",
  teal: "#0c1f1d",
  white: "#ffffff",
  yellow: "#efc652",
};

function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeEmail(value = "") {
  return String(value).trim().toLowerCase();
}

function isEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function formatLabel(value = "") {
  return escapeHtml(value.replace(/([A-Z])/g, " $1").replace(/[_-]+/g, " ").trim());
}

function renderEmailShell({ children, eyebrow = "Zahthic Healthcare Solutions", preview = "" }) {
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(eyebrow)}</title>
      </head>
      <body style="margin:0;background:#f4f8ef;font-family:Arial,Helvetica,sans-serif;color:${BRAND.teal};">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preview)}</div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f8ef;margin:0;padding:0;">
          <tr>
            <td align="center" style="padding:28px 14px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:${BRAND.white};border:1px solid #dbe7cf;border-radius:18px;overflow:hidden;box-shadow:0 18px 48px rgba(12,31,29,0.10);">
                <tr>
                  <td style="background:${BRAND.teal};padding:26px 28px 24px;">
                    <img src="${LOGO_URL}" width="190" alt="Zahthic Healthcare Solutions" style="display:block;max-width:190px;height:auto;margin:0 0 20px;" />
                    <div style="height:4px;width:96px;background:${BRAND.lime};border-radius:999px;margin-bottom:14px;"></div>
                    <p style="color:${BRAND.yellow};font-size:12px;font-weight:700;letter-spacing:.08em;line-height:1.4;margin:0;text-transform:uppercase;">${escapeHtml(eyebrow)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:30px 28px 32px;">
                    ${children}
                  </td>
                </tr>
                <tr>
                  <td style="background:${BRAND.teal};padding:22px 28px;">
                    <p style="color:${BRAND.white};font-size:15px;font-weight:700;line-height:1.5;margin:0;">Transforming Health. Empowering Lives.</p>
                    <p style="color:rgba(255,255,255,.72);font-size:13px;line-height:1.6;margin:8px 0 0;">
                      Zahthic Healthcare Solutions<br />
                      <a href="${SITE_URL}" style="color:${BRAND.yellow};text-decoration:none;">zahthic.com</a>
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
}

function renderButton(href, label) {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px 0 0;">
      <tr>
        <td style="background:${BRAND.lime};border-radius:999px;">
          <a href="${escapeHtml(href)}" style="color:${BRAND.black};display:inline-block;font-size:14px;font-weight:800;line-height:1;padding:13px 20px;text-decoration:none;">${escapeHtml(label)}</a>
        </td>
      </tr>
    </table>
  `;
}

async function readPayload(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function renderFormHtml({ data, kind, sourceRoute, submissionId }) {
  const rows = Object.entries(data || {})
    .filter(([, value]) => String(value || "").trim())
    .map(([key, value]) => `
      <tr>
        <td style="background:#f4f8ef;border:1px solid #dbe7cf;color:${BRAND.teal};font-size:13px;font-weight:800;padding:10px 12px;text-transform:capitalize;width:34%;">${formatLabel(key)}</td>
        <td style="border:1px solid #dbe7cf;color:${BRAND.teal};font-size:14px;line-height:1.55;padding:10px 12px;">${escapeHtml(value)}</td>
      </tr>
    `)
    .join("");

  return renderEmailShell({
    children: `
      <h1 style="color:${BRAND.teal};font-size:26px;line-height:1.25;margin:0 0 12px;">New ${escapeHtml(kind)} submission</h1>
      <p style="color:#48615d;font-size:15px;line-height:1.7;margin:0 0 22px;">A new website request has been submitted and is ready for follow-up.</p>
      <div style="background:#f4f8ef;border-left:5px solid ${BRAND.lime};border-radius:12px;padding:16px 18px;margin-bottom:22px;">
        <p style="color:${BRAND.teal};font-size:14px;line-height:1.6;margin:0;"><strong>Reference:</strong> ${escapeHtml(submissionId)}</p>
        <p style="color:${BRAND.teal};font-size:14px;line-height:1.6;margin:6px 0 0;"><strong>Source:</strong> ${escapeHtml(sourceRoute || "Website")}</p>
      </div>
      <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="border-collapse:collapse;">${rows}</table>
      ${renderButton(`${SITE_URL}/admin`, "Open Admin Dashboard")}
    `,
    eyebrow: "Website Form Alert",
    preview: `New Zahthic ${kind} submission ${submissionId}`,
  });
}

function renderFillerHtml({ data, kind, submissionId }) {
  const name = data?.name || "there";
  return renderEmailShell({
    children: `
      <h1 style="color:${BRAND.teal};font-size:28px;line-height:1.25;margin:0 0 12px;">Thank you for contacting Zahthic</h1>
      <p style="color:${BRAND.teal};font-size:16px;line-height:1.7;margin:0 0 16px;">Hello ${escapeHtml(name)},</p>
      <p style="color:#48615d;font-size:15px;line-height:1.8;margin:0;">We received your ${escapeHtml(kind)} submission. The Zahthic team will review it and follow up soon.</p>
      <div style="background:#f4f8ef;border:1px solid #dbe7cf;border-radius:12px;margin:24px 0 0;padding:18px;">
        <p style="color:${BRAND.teal};font-size:14px;line-height:1.6;margin:0;">Your reference</p>
        <p style="color:${BRAND.teal};font-size:22px;font-weight:800;letter-spacing:.02em;margin:4px 0 0;">${escapeHtml(submissionId)}</p>
      </div>
      ${renderButton(SITE_URL, "Visit Zahthic Website")}
    `,
    eyebrow: "Request Received",
    preview: `We received your Zahthic ${kind} request.`,
  });
}

function renderAdminHtml({ message }) {
  return renderEmailShell({
    children: `
      <h1 style="color:${BRAND.teal};font-size:28px;line-height:1.25;margin:0 0 12px;">Message from Zahthic</h1>
      <div style="background:#f9fbf5;border:1px solid #dbe7cf;border-radius:14px;color:${BRAND.teal};font-size:15px;line-height:1.8;padding:20px;white-space:pre-wrap;">${escapeHtml(message)}</div>
      ${renderButton(SITE_URL, "Visit Zahthic Website")}
    `,
    eyebrow: "Official Zahthic Email",
    preview: "A message from Zahthic Healthcare Solutions.",
  });
}

async function sendFormEmails(payload) {
  const resend = getResendClient();
  const data = payload.data || {};
  const fillerEmail = normalizeEmail(data.email);

  if (!isEmail(fillerEmail)) {
    return { status: 400, body: { error: "A valid filler email address is required." } };
  }

  const kind = payload.kind || "website";
  const submissionId = payload.submissionId || `ZHS-${Date.now().toString(36).toUpperCase()}`;
  const subject = `Zahthic ${kind} submission ${submissionId}`;

  const { data: sent, error } = await resend.batch.send([
    {
      from: "Zahthic Healthcare Solutions <admin@zahthic.com>",
      to: [ADMIN_RECIPIENT],
      replyTo: fillerEmail,
      subject,
      html: renderFormHtml({ data, kind, sourceRoute: payload.sourceRoute, submissionId }),
    },
    {
      from: "Zahthic Healthcare Solutions <admin@zahthic.com>",
      to: [fillerEmail],
      subject: `We received your Zahthic ${kind} request`,
      html: renderFillerHtml({ data, kind, submissionId }),
    },
  ]);

  if (error) return { status: 400, body: { error } };
  return { status: 200, body: { sent } };
}

async function sendAdminEmail(payload) {
  const resend = getResendClient();
  const adminKey = String(payload.adminKey || "");
  const allowedAdminKeys = new Set([
    process.env.ADMIN_EMAIL_SECRET,
    process.env.ZAHTHIC_ADMIN_EMAIL_SECRET,
    process.env.ADMIN_PASSWORD,
    FALLBACK_ADMIN_KEY,
  ].filter(Boolean));
  const fromAddress = normalizeEmail(payload.from);
  const toAddress = normalizeEmail(payload.to);

  if (!adminKey || !allowedAdminKeys.has(adminKey)) {
    return { status: 401, body: { error: "Invalid admin email key." } };
  }
  if (!ALLOWED_SENDERS.has(fromAddress)) {
    return { status: 400, body: { error: "Sender is not allowed." } };
  }
  if (!isEmail(toAddress)) {
    return { status: 400, body: { error: "A valid recipient email is required." } };
  }
  if (!String(payload.subject || "").trim() || !String(payload.message || "").trim()) {
    return { status: 400, body: { error: "Subject and message are required." } };
  }

  const { data, error } = await resend.emails.send({
    from: `Zahthic Healthcare Solutions <${fromAddress}>`,
    to: [toAddress],
    replyTo: fromAddress,
    subject: String(payload.subject).trim(),
    html: renderAdminHtml({ message: payload.message }),
  });

  if (error) return { status: 400, body: { error } };
  return { status: 200, body: { id: data?.id } };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }
  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: "RESEND_API_KEY is not configured." });
  }

  try {
    const payload = await readPayload(req);
    const result = payload.mode === "admin" ? await sendAdminEmail(payload) : await sendFormEmails(payload);
    return res.status(result.status).json(result.body);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Email request failed." });
  }
}
