# ULSADES — Unified Legal Status Automated Data Entry System

System for the **City Civil Registrar Office, Iligan City** to fill out and print **Affidavit to Use the Surname of Father (AUSF)** and related forms under RA 9255.

## Features

- **Admin auth**: Login required (demo credentials below).
- **Dashboard**: Choose transaction type (AUSF 0-6, AUSF 07-17, Registration of AUSF, Registration of Acknowledgement, Child Acknowledge, Child Not Acknowledged, Out of Town Transmittal).
- **RA 9255 data entry form**: All 7 sections from the official form (applicant, birth in Iligan, child acknowledged, child details, COLB, AUSF details, affidavit of acknowledgement). Sections 4–7 show only when “Child already acknowledged?” is **NO**.
- **View & Print**: Filled data is shown in a print-ready layout; use the browser Print button or **Print** on the page.

## Tech

- **React** (JSX), **Vite**, **React Router**
- **Tailwind CSS** (`tailwindcss` + `@tailwindcss/vite`)
- Auth via `AuthContext` (session in `localStorage`)

## Run

```bash
npm install
npm run dev
```

Open **http://localhost:5173**. You will be redirected to **/login** if not logged in.

### Demo login

- **Username:** `admin`
- **Password:** `admin123`

## Build

```bash
npm run build
```

Output is in `dist/`.
