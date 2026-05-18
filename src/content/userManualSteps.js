/** @typedef {{ id: string, title: string, body: string[], image?: string, visual?: string }} UserManualStep */
/** @typedef {{ id: string, title: string, steps: UserManualStep[] }} UserManualSection */

/** @type {UserManualSection[]} */
export const USER_MANUAL_SECTIONS = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to ULSADES',
        image: '/user-manual/welcome-logo.png',
        body: [
          'ULSADES (Unified Legal Status Automated Data Entry System) is the desktop application used by the City Civil Registrar’s Office of Iligan City to encode civil registry cases, generate official forms, and print or save PDFs.',
          'This manual walks through each major module—AUSF, Court Decree, Legitimation, Supplemental, and MC2010-04—with sample screens that match what you will see on screen and in print output.',
          'Use the section list on the left and Previous / Next at the bottom to move through the guide at your own pace.',
        ],
      },
      {
        id: 'login',
        title: 'Sign in to the system',
        visual: 'login',
        body: [
          'When you open ULSADES, the login screen appears first. Enter the username and password assigned to you by your administrator.',
          'Click Log in. If the credentials are correct, you are taken to the Dashboard. If not, an error message appears and you can try again.',
          'Do not share your login details. Log out from the sidebar when you finish your shift on a shared computer.',
        ],
      },
      {
        id: 'dashboard',
        title: 'Dashboard overview',
        visual: 'dashboard',
        body: [
          'The Dashboard is your starting point. Three main categories are shown: AUSF, Court Decree, and Legitimation.',
          'Click a category card to expand it and read a short description of that workflow. Each card lists the document types you can open (for example AUSF 07-17, Certificate of authenticity, Joint Affidavit of Legitimation).',
          'Click a document type to open its data-entry form. You can also reach the same forms from the sidebar under Legal Instrument or Court Decree.',
        ],
      },
      {
        id: 'sidebar',
        title: 'Sidebar navigation',
        visual: 'sidebar',
        body: [
          'The dark blue sidebar is always visible after login. Dashboard returns you to the home screen.',
          'Legal Instrument expands to show Legitimation, Supplemental, MC2010-04, and AUSF. Court Decree opens the court-decree form; its arrow expands Adoption and related workflows.',
          'Files Saved lists all completed cases stored on this computer. User Manual (this guide) and Export / Import are at the bottom. Your username and Log out appear in the footer of the sidebar.',
        ],
      },
    ],
  },
  {
    id: 'ausf',
    title: 'AUSF',
    steps: [
      {
        id: 'ausf-overview',
        title: 'What is AUSF in ULSADES?',
        visual: 'ausf-form',
        body: [
          'AUSF (Affidavit to Use the Surname of the Father) applies when a child born out of wedlock will use the father’s surname under R.A. 9255.',
          'In ULSADES you can prepare AUSF 0-6, AUSF 07-17, Registration of AUSF, Registration of Acknowledgement, LCR forms (1A birth-available, A1 child not acknowledged), annotations, and transmittal letters—all linked to one saved case.',
          'Open AUSF from the Dashboard, or sidebar → Legal Instrument → AUSF.',
        ],
      },
      {
        id: 'ausf-form',
        title: 'AUSF — Filling in the form',
        visual: 'ausf-form',
        body: [
          'The AUSF form is divided into numbered items (child’s name, parents, birth facts, COLB registry details, etc.). Fields marked as required must be completed before you continue.',
          'Choose the correct AUSF variant at the start (for example 07-17 for ages 7–17). Enter names in the format used on the birth record. Dates can be typed in plain language or dd/mm/yyyy depending on the field.',
          'When every required item is filled, click Done at the bottom of the form. The system saves the record and opens the print preview automatically.',
        ],
      },
      {
        id: 'ausf-print',
        title: 'AUSF — Print output (what the system generates)',
        visual: 'ausf-print',
        body: [
          'The print screen shows a preview that matches the official layout: CCRO header with seals, Registry Number, jurat block (Republic of the Philippines / City of Iligan), and the title AFFIDAVIT TO USE THE SURNAME OF THE FATHER (AUSF).',
          'The body includes numbered declarations, the affiant’s signature line, SWORN ATTESTATION (when applicable), SUBSCRIBED AND SWORN, and the City Civil Registrar signature block with contact footer.',
          'Use the left sidebar to switch between related documents in the same case (Registration, LCR 1A, Transmittal, etc.). Select paper size (short, long, or A4 as offered), then Print or Save PDF. You can attach supporting scans from the print sidebar.',
        ],
      },
    ],
  },
  {
    id: 'court-decree',
    title: 'Court Decree',
    steps: [
      {
        id: 'court-decree-overview',
        title: 'What is Court Decree in ULSADES?',
        visual: 'court-decree-form',
        body: [
          'Court Decree covers civil registry work arising from court orders—certificates of authenticity and registration, LCR Forms 1A/2A/3A (birth, death, marriage), transmittals, and annotations.',
          'The system helps you produce a consistent set of documents for one case, such as adoption, annulment, or legal separation, based on the affected certificate type (birth, death, or marriage).',
          'Open Court Decree from the sidebar or Dashboard. Use the dropdown on Files Saved to filter by LCR 1A, 2A, or 3A when reviewing saved work.',
        ],
      },
      {
        id: 'court-decree-form',
        title: 'Court Decree — Filling in the form',
        visual: 'court-decree-form',
        body: [
          'Start with the certificate or document type (for example Certificate of authenticity). Indicate which civil registry document is affected (birth, death, or marriage certificate).',
          'Enter party names, court reference, dates, and annotation or remarks text exactly as they should appear on the LCR output. Some fields drive which LCR forms appear in print (1A vs 2A vs 3A).',
          'Click Done when finished. The saved case opens in print preview where you can review each document before printing.',
        ],
      },
      {
        id: 'court-decree-print',
        title: 'Court Decree — Print output',
        visual: 'court-decree-print',
        body: [
          'Printed documents use the standard CCRO letterhead, registry number, and formatted legal text for certificates, LCR tables, and annotation blocks.',
          'Certificate of authenticity and registration pages certify copies for transmittal. LCR forms show tabular birth, death, or marriage data as required by PSA format.',
          'Switch documents in the sidebar, set paper size, then Print or Save PDF. Attach court orders or supporting papers using the upload controls on the print screen.',
        ],
      },
    ],
  },
  {
    id: 'legitimation',
    title: 'Legitimation',
    steps: [
      {
        id: 'legitimation-overview',
        title: 'What is Legitimation in ULSADES?',
        visual: 'legitimation-form',
        body: [
          'Legitimation is used when parents marry after the birth of a child and the birth record must be updated to reflect legitimation.',
          'ULSADES supports Joint Affidavit of Legitimation (both parents alive), Sole Affidavit (one parent deceased—Item 5 NO), Registration of Legitimation, Registration of Acknowledgement, LCR Form 1A, transmittals, and supplemental affidavit where needed.',
          'On Files Saved, use the Joint only / Sole only filter to list cases by affidavit type; the system uses Item 5 (both parents alive) as well as the saved form type.',
        ],
      },
      {
        id: 'legitimation-form',
        title: 'Legitimation — Filling in the form',
        visual: 'legitimation-form',
        body: [
          'Answer Item 5 carefully: YES means both parents are alive and you will use the Joint Affidavit; NO enables sole-parent fields (surviving and deceased parent, date of death) and the Sole Affidavit in print.',
          'Complete child name, parents, marriage date, COLB book/page/registry, and other required items. Disabled sections are grayed out when they do not apply.',
          'Click Done to save and open print. You can return later via Files Saved → Edit to change data and save again.',
        ],
      },
      {
        id: 'legitimation-print',
        title: 'Legitimation — Print output',
        visual: 'legitimation-print',
        body: [
          'Joint output shows the heading JOINT AFFIDAVIT OF LEGITIMATION with both parents’ declarations and signature lines. Sole output uses the sole affidavit layout for one surviving parent.',
          'Additional pages may include Registration of Legitimation, LCR Form 1A with certification text, and transmittal or out-of-town transmittal as configured in the case.',
          'Preview each page in the sidebar before printing. The City Civil Registrar block and footer match other ULSADES modules for a consistent official appearance.',
        ],
      },
    ],
  },
  {
    id: 'supplemental',
    title: 'Supplemental',
    steps: [
      {
        id: 'supplemental-overview',
        title: 'What is Supplemental in ULSADES?',
        visual: 'supplemental-form',
        body: [
          'Supplemental reports correct or update entries on an existing civil registry record—commonly geographical name, sex, or middle name corrections.',
          'The workflow includes an Affidavit for Supplemental Report, optional LCR Form 1A, and transmittal. You can include more than one LCR form type in a single saved supplemental case when needed.',
          'Open from sidebar → Legal Instrument → Supplemental. Choosing Supplemental from the menu starts a fresh form (draft cleared).',
        ],
      },
      {
        id: 'supplemental-form',
        title: 'Supplemental — Filling in the form',
        visual: 'supplemental-form',
        body: [
          'Select the supplement type (Geographical, Sex, or Middle Name). Enter affiant details and describe the record being corrected and the correction requested.',
          'Use the form sections to add LCR forms and transmittal data. Switch between affidavit and LCR sections using the form’s section controls.',
          'Click Done when complete. The system saves the bundle and opens print preview for the affidavit and any included LCR/transmittal documents.',
        ],
      },
      {
        id: 'supplemental-print',
        title: 'Supplemental — Print output',
        visual: 'supplemental-print',
        body: [
          'The affidavit page states the affiant’s testimony regarding the supplemental correction, with standard jurat and SUBSCRIBED AND SWORN blocks.',
          'LCR Form 1A and transmittal pages follow the same CCRO header and formatting as Legitimation and Court Decree outputs.',
          'If you included multiple LCR types, use the print sidebar to review each before Save PDF. Geographical/sex-only cases may show affidavit alone when no LCR was added.',
        ],
      },
    ],
  },
  {
    id: 'mc2010',
    title: 'MC2010-04',
    steps: [
      {
        id: 'mc2010-overview',
        title: 'What is MC2010-04 in ULSADES?',
        visual: 'mc2010-form',
        body: [
          'MC2010-04 refers to the transmittal / endorsement format used to forward civil registry documents (often with attached LCR forms) to another office such as PSA or another LCRO.',
          'In ULSADES you build a transmittal record, optionally link LCR data from a saved source, and print the endorsement letter and enclosures list.',
          'Open from sidebar → Legal Instrument → MC2010-04. Starting from the menu clears any previous draft so you begin a new transmittal.',
        ],
      },
      {
        id: 'mc2010-form',
        title: 'MC2010-04 — Filling in the form',
        visual: 'mc2010-form',
        body: [
          'Complete transmittal details: recipient, endorsing office, list of documents enclosed, and reference to the underlying case when applicable.',
          'You can pull LCR content from saved Legitimation or Court Decree records using the LCR source tools on the form, then adjust remarks or registry fields as needed.',
          'Click Done to save and proceed to print. The saved record appears under Files Saved → MC2010-04 saved.',
        ],
      },
      {
        id: 'mc2010-print',
        title: 'MC2010-04 — Print output',
        visual: 'mc2010-print',
        body: [
          'The printed transmittal shows the CCRO header, endorsement/transmittal title, body text listing enclosed documents, and registrar signature area.',
          'Attached LCR Form 1A (or other LCR) prints as separate pages in the same preview; use the document list in the sidebar to check each page.',
          'Use long bond or the paper size indicated for transmittal letters in your office. Save PDF for electronic forwarding or print hard copies for physical transmittal.',
        ],
      },
    ],
  },
  {
    id: 'files-saved',
    title: 'Files Saved',
    steps: [
      {
        id: 'saved-list',
        title: 'Opening and switching saved lists',
        visual: 'files-saved',
        body: [
          'Click Files Saved in the sidebar. At the top of the page, buttons link to each module’s saved list: AUSF, Court Decree, Legitimation, Supplemental, and MC2010-04.',
          'Each row shows the case label (usually the child or subject name), document type, and date/time saved. An amber icon means supporting files were attached to that record.',
          'The Total count shows how many records are stored on this device for the current list.',
        ],
      },
      {
        id: 'saved-actions',
        title: 'Edit, View & Print, and Remove',
        visual: 'saved-actions',
        body: [
          'Edit loads the original form with all saved answers so you can correct typos or update facts, then click Done again to update the saved file and refresh print data.',
          'View & Print opens the print preview for that record without changing the form. Use this for reprinting or saving another PDF after a paper size change.',
          'Remove deletes the saved entry from this computer after you confirm. Some lists offer Undo for a few seconds after removal. Removal does not affect backups unless you export again.',
        ],
      },
      {
        id: 'saved-filter',
        title: 'Search, filters, and pages',
        visual: 'saved-filter',
        body: [
          'Type in Search to filter by name, form label, or saved date. Click Clear to reset search and dropdown filters.',
          'Court Decree saved list: filter by All forms, 1A only, 2A only, or 3A only. Legitimation saved list: All forms, Joint only, or Sole only (based on Item 5 and form type).',
          'When more than 15 records match, use the page controls at the bottom (Previous, page numbers, Next) to browse results.',
        ],
      },
    ],
  },
  {
    id: 'export',
    title: 'Export / Import',
    steps: [
      {
        id: 'export-import',
        title: 'Backing up and restoring data',
        visual: 'export',
        body: [
          'Export / Import is used to move saved records between computers or create a backup before maintenance.',
          'Export downloads a file containing saved AUSF, Court Decree, Legitimation, Supplemental, and MC2010 data from this device. Store the file in a secure location.',
          'Import reads a previously exported file and merges or restores records according to the options on that screen. Only import files you trust and that came from your office’s ULSADES export.',
        ],
      },
    ],
  },
]

export function getTotalManualSteps() {
  return USER_MANUAL_SECTIONS.reduce((n, s) => n + s.steps.length, 0)
}

export function flattenManualSteps() {
  return USER_MANUAL_SECTIONS.flatMap((section) =>
    section.steps.map((step) => ({ ...step, sectionId: section.id, sectionTitle: section.title }))
  )
}
