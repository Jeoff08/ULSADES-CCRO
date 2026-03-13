# ULSADES — Unified Legal Status Automated Data Entry System

System for the **City Civil Registrar Office, Iligan City** to fill out and print **Affidavit to Use the Surname of Father (AUSF)** and related forms under RA 9255.

## Features

- **Admin auth**: Login required (demo credentials below).
- **Dashboard**: Choose transaction type (AUSF 0-6, AUSF 07-17, Registration of AUSF, Registration of Acknowledgement, Child Acknowledge, Child Not Acknowledged, Out of Town Transmittal).
- **RA 9255 data entry form**: All 7 sections from the official form (applicant, birth in Iligan, child acknowledged, child details, COLB, AUSF details, affidavit of acknowledgement). Sections 4–7 show only when “Child already acknowledged?” is **NO**.
- **View & Print**: Filled data is shown in a print-ready layout; use the browser Print button or **Print** on the page.
- **COLB image analysis and auto-remarks**: When you upload a scan of a Certificate of Live Birth (COLB) as an **image** (PNG/JPG) in the Annotation (Child Ack) or Annotation (Child Not Ack) views, the app runs client-side OCR (Option C: Tesseract.js) to extract text and suggests REMARKS/ANNOTATION text. No API keys; no data leaves the app. You can always edit the suggested text before print or save. PDF uploads are attached but not analyzed; enter annotation manually for PDFs.

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

## COLB image analysis and auto-remarks

**Option used:** Option C — client-side OCR (Tesseract.js). No backend or API keys required; processing stays in the browser.

**How to configure:** No environment variables are needed. Install and run as above; the analyzer runs automatically when you attach an image in the Annotation views.

**Behavior:**

- **Trigger:** After you upload a COLB **image** (not PDF) and click “Attach file”, the app shows “Analyzing document…” then pre-fills the REMARKS/ANNOTATION field from the detected text.
- **Rules:** If the document shows father UNKNOWN/N/A and marriage NOT APPLICABLE (or blank), the suggested text is the RA 9255 style: *“The child shall be known as [CHILD FULL NAME] pursuant to R.A. 9255”*. If father and mother names and marriage date/place are present, the suggested text is legitimation style: *“Legitimated by the subsequent marriage of parents [FATHER] and [MOTHER] on [DATE] at [PLACE] under registry number [REG_NO]. The child shall be known as [CHILD FULL NAME].”*
- **Edit:** The suggested text appears in the existing “Edit annotation” control; you can change it before print or save.
- **Failure:** If analysis fails, you see “Could not read document; please enter annotation manually.” The scan is still attached; you can type the annotation yourself. Print/save is not blocked.

**Manual test steps**

1. **RA 9255 style:** Use a COLB image where the child is e.g. SAMANTHA PACA-ONCIS, mother IRENE LOMENTE PACA-ONCIS, father UNKNOWN, marriage NOT APPLICABLE. Upload the image in Annotation (Child Ack) or (Child Not Ack), click Attach file. After “Analyzing document…”, the REMARKS/ANNOTATIONS field should be auto-filled with the RA 9255 sentence including the child’s name. Edit if needed, then print or save.
2. **Legitimation style (if supported):** Use a COLB image with father and mother names and marriage date/place filled. Upload and attach; the suggested text should be the legitimation sentence. Edit and print/save as needed.
3. **No regression:** Open Annotation (Child Ack) or (Child Not Ack), do **not** upload a file. Confirm the form and default annotation still work and you can print/save without analysis.
