# Zahthic Healthcare Solutions Website

Premium healthcare, rehabilitation, wellness, prevention, and community impact website for Zahthic Healthcare Solutions in Imo State, Nigeria.

Production domain: `https://zahthic.com`

## Local Development

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`.

## Production Build

```bash
npm run build
```

The static production build is generated in `dist/`.

## Deployment

This project is built with Vite and React. On Vercel, use:

- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`
- Primary domain: `zahthic.com`

## Resend Email Setup

Set these environment variables in Vercel:

- `RESEND_API_KEY`: Resend API key for sending website and admin emails.
- `ADMIN_EMAIL_SECRET`: private key admins enter in the dashboard Email tab before sending email.

Verify `zahthic.com` in Resend before sending from `admin@zahthic.com`, `info@zahthic.com`, or `support@zahthic.com`.

## Launch Notes

The site includes route-aware metadata, responsive pages, dark/light mode, WhatsApp handoff, local CRM-ready capture, newsletter capture, chat widget, CMS schema preview, and launch handover documentation.
