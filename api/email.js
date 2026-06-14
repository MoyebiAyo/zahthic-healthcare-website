import { Resend } from "resend";

const ADMIN_RECIPIENT = "admin@zahthic.com";
const ALLOWED_SENDERS = new Set(["admin@zahthic.com", "info@zahthic.com", "support@zahthic.com"]);
const FALLBACK_ADMIN_KEY = "LeaveZahthic360";

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
        <td style="padding:8px 12px;border:1px solid #d9e2d5;font-weight:700;text-transform:capitalize;">${escapeHtml(key.replace(/([A-Z])/g, " $1"))}</td>
        <td style="padding:8px 12px;border:1px solid #d9e2d5;">${escapeHtml(value)}</td>
      </tr>
    `)
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;color:#0c1f1d;line-height:1.55;">
      <h2 style="margin:0 0 12px;">Zahthic ${escapeHtml(kind)} submission</h2>
      <p>Reference: <strong>${escapeHtml(submissionId)}</strong></p>
      <p>Source: ${escapeHtml(sourceRoute || "Website")}</p>
      <table style="border-collapse:collapse;width:100%;max-width:720px;">${rows}</table>
    </div>
  `;
}

function renderFillerHtml({ data, kind, submissionId }) {
  const name = data?.name || "there";
  return `
    <div style="font-family:Arial,sans-serif;color:#0c1f1d;line-height:1.65;">
      <h2 style="margin:0 0 12px;">Thank you for contacting Zahthic</h2>
      <p>Hello ${escapeHtml(name)},</p>
      <p>We received your ${escapeHtml(kind)} submission. The Zahthic team will review it and follow up soon.</p>
      <p>Your reference is <strong>${escapeHtml(submissionId)}</strong>.</p>
      <p style="margin-top:24px;">Zahthic Healthcare Solutions<br />Transforming Health. Empowering Lives.</p>
    </div>
  `;
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
  const expectedKey = process.env.ADMIN_EMAIL_SECRET || process.env.ZAHTHIC_ADMIN_EMAIL_SECRET || process.env.ADMIN_PASSWORD || FALLBACK_ADMIN_KEY;
  const fromAddress = normalizeEmail(payload.from);
  const toAddress = normalizeEmail(payload.to);

  if (!adminKey || adminKey !== expectedKey) {
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
    html: `
      <div style="font-family:Arial,sans-serif;color:#0c1f1d;line-height:1.65;white-space:pre-wrap;">
        ${escapeHtml(payload.message)}
      </div>
    `,
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
