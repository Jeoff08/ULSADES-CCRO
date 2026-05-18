import React from 'react'
import {
  FormSectionMock,
  MockAppFrame,
  PrintHeaderMock,
  PrintPageMock,
  PrintSidebarMock,
} from './userManualMockParts'

const SAMPLE = {
  child: 'JUAN DELA CRUZ SANTOS',
  father: 'PEDRO SANTOS',
  mother: 'MARIA DELA CRUZ',
  registry: '2024-00456',
  date: '15 March 2014',
}

function PrintBodyLines({ title, lines }) {
  return (
    <>
      <PrintHeaderMock registryNo={SAMPLE.registry} />
      <p className="text-[7px] font-bold text-center uppercase my-1 leading-tight">{title}</p>
      {lines.map((line) => (
        <p key={line} className="text-[6px] text-justify mb-0.5 leading-snug">
          {line}
        </p>
      ))}
      <div className="mt-2 border-t border-dashed border-slate-300 pt-1 text-[5px] text-slate-500 text-center">
        City Civil Registrar signature · Footer contact line
      </div>
    </>
  )
}

const VISUALS = {
  login: (
    <MockAppFrame title="Login — ULSADES">
      <div className="flex min-h-[130px]">
        <div className="hidden sm:flex w-[42%] bg-[#1e3a5f] items-center justify-center p-2">
          <img src={encodeURI('/user-manual/welcome-logo.png')} alt="" className="w-16 h-16 object-contain" />
        </div>
        <div className="flex-1 p-3 flex flex-col justify-center gap-1.5">
          <p className="text-[9px] font-bold text-slate-700">Welcome back!</p>
          <div className="h-5 rounded border border-slate-200 bg-slate-50 text-[7px] px-2 flex items-center text-slate-400">Username</div>
          <div className="h-5 rounded border border-slate-200 bg-slate-50 text-[7px] px-2 flex items-center text-slate-400">Password</div>
          <div className="h-6 rounded bg-[var(--primary-blue)] text-[8px] text-white font-semibold flex items-center justify-center">Log in</div>
        </div>
      </div>
    </MockAppFrame>
  ),

  dashboard: (
    <MockAppFrame title="Dashboard">
      <div className="p-3 grid grid-cols-3 gap-2 min-h-[120px]">
        {[
          { t: 'AUSF', c: 'teal', n: '8 types' },
          { t: 'Court Decree', c: 'indigo', n: 'Certs & LCR' },
          { t: 'Legitimation', c: 'amber', n: 'Joint / Sole' },
        ].map(({ t, c, n }) => (
          <div key={t} className={`rounded-lg border-2 p-2 ${t === 'AUSF' ? 'border-teal-200 bg-teal-50' : t === 'Court Decree' ? 'border-indigo-200 bg-indigo-50' : 'border-amber-200 bg-amber-50'}`}>
            <p className="text-[8px] font-bold text-slate-800">{t}</p>
            <p className="text-[6px] text-slate-600">{n}</p>
          </div>
        ))}
      </div>
    </MockAppFrame>
  ),

  sidebar: (
    <MockAppFrame title="Sidebar navigation">
      <div className="flex min-h-[130px]">
        <div className="w-[35%] bg-[#1e3a5f] p-2 space-y-0.5 text-[7px]">
          {['Dashboard', 'Legal Instrument ▾', 'Court Decree ▾', 'Files Saved', 'User Manual', 'Export / Import'].map((l, i) => (
            <p key={l} className={`rounded px-1.5 py-0.5 ${i === 3 ? 'bg-white text-slate-800 font-bold' : 'text-white/85'}`}>{l}</p>
          ))}
        </div>
        <div className="flex-1 bg-slate-50 flex items-center justify-center text-[8px] text-slate-500">Main page content</div>
      </div>
    </MockAppFrame>
  ),

  'ausf-form': (
    <MockAppFrame title="AUSF — Data entry form" badge="Form">
      <FormSectionMock
        title="AUSF form (example: AUSF 07-17)"
        items={[
          { label: 'ITEM — Child full name', value: SAMPLE.child },
          { label: 'Father surname sought', value: SAMPLE.father.split(' ').pop() },
          { label: 'Date of birth', value: SAMPLE.date },
          { label: 'Place of birth', value: 'Iligan City' },
          { label: 'COLB registry / date', value: `${SAMPLE.registry} · 20 Jan 2015` },
        ]}
      />
    </MockAppFrame>
  ),

  'ausf-print': (
    <PrintPageMock
      label="AUSF — Print output"
      sidebar={
        <PrintSidebarMock
          paper="Long bond"
          docs={['AUSF 07-17', 'Registration of AUSF', 'LCR Form 1A', 'Transmittal']}
          activeIdx={0}
        />
      }
    >
      <PrintBodyLines
        title="Affidavit to use the surname of the father (AUSF)"
        lines={[
          `I, ${SAMPLE.child}, of legal age… declare THAT:`,
          `1. I am seeking to use the surname ${SAMPLE.father.split(' ').pop()}…`,
          `2. I was born on ${SAMPLE.date} at Iligan City…`,
          '… SWORN ATTESTATION (parent) … SUBSCRIBED AND SWORN …',
        ]}
      />
    </PrintPageMock>
  ),

  'court-decree-form': (
    <MockAppFrame title="Court Decree — Data entry form" badge="Form">
      <FormSectionMock
        title="Court Decree form (example: Certificate of authenticity)"
        items={[
          { label: 'Case / court reference', value: 'SP PROCEDURE NO. 2024-102' },
          { label: 'Affected document (Birth certificate)', type: 'radio', value: 'YES' },
          { label: 'Subject / child name', value: SAMPLE.child },
          { label: 'Petitioner names', value: 'SPS. MARIA & PEDRO SANTOS' },
          { label: 'LCR remarks / annotation text', value: 'Per court order dated…' },
        ]}
      />
    </MockAppFrame>
  ),

  'court-decree-print': (
    <PrintPageMock
      label="Court Decree — Print output"
      sidebar={
        <PrintSidebarMock
          paper="A4"
          docs={['Cert. of authenticity', 'Cert. of registration', 'LCR Form 1A', 'Transmittal', 'Annotation']}
          activeIdx={0}
        />
      }
    >
      <PrintBodyLines
        title="Certificate of authenticity"
        lines={[
          'This is to certify that the attached/document described below is a true and faithful reproduction…',
          `Re: Birth Certificate of ${SAMPLE.child}`,
          'Court: Regional Trial Court · Branch …',
          'Prepared for transmittal to LCRO / PSA as applicable.',
        ]}
      />
    </PrintPageMock>
  ),

  'legitimation-form': (
    <MockAppFrame title="Legitimation — Data entry form" badge="Form">
      <FormSectionMock
        title="Legitimation form"
        items={[
          { label: 'ITEM 5 — Both parents alive?', type: 'radio', value: 'YES' },
          { label: 'Child name', value: SAMPLE.child },
          { label: 'Father / Mother names', value: `${SAMPLE.father} / ${SAMPLE.mother}` },
          { label: 'Date of marriage of parents', value: '10 June 2018' },
          { label: 'COLB details', value: 'Book 12 · Page 45 · Reg. 2014-112' },
        ]}
      />
    </MockAppFrame>
  ),

  'legitimation-print': (
    <PrintPageMock
      label="Legitimation — Print output"
      sidebar={
        <PrintSidebarMock
          paper="A4"
          docs={['Joint Affidavit', 'Reg. of Legitimation', 'LCR Form 1A', 'Transmittal']}
          activeIdx={0}
        />
      }
    >
      <PrintBodyLines
        title="Joint affidavit of legitimation"
        lines={[
          `We, ${SAMPLE.father} and ${SAMPLE.mother}, after having been duly sworn…`,
          `That our minor child ${SAMPLE.child} was born…`,
          'That we subsequently contracted marriage…',
          'IN WITNESS WHEREOF… · City Civil Registrar block',
        ]}
      />
    </PrintPageMock>
  ),

  'supplemental-form': (
    <MockAppFrame title="Supplemental — Data entry form" badge="Form">
      <FormSectionMock
        title="Supplemental report form"
        items={[
          { label: 'Supplement type', value: 'Geographical / Sex / Middle Name' },
          { label: 'Affiant name', value: SAMPLE.mother },
          { label: 'Record to correct', value: `COLB of ${SAMPLE.child}` },
          { label: 'Correction requested', value: 'Barangay name / sex / middle name' },
          { label: 'Include LCR Form 1A?', type: 'radio', value: 'YES' },
        ]}
      />
    </MockAppFrame>
  ),

  'supplemental-print': (
    <PrintPageMock
      label="Supplemental — Print output"
      sidebar={
        <PrintSidebarMock
          paper="Long bond"
          docs={['Affidavit for Supplemental', 'LCR Form 1A', 'Transmittal']}
          activeIdx={0}
        />
      }
    >
      <PrintBodyLines
        title="Affidavit for supplemental report"
        lines={[
          `I, ${SAMPLE.mother}, of legal age… hereby depose and say:`,
          'That the entry in the civil registry concerning… needs correction…',
          'That the true and correct entry should read…',
          'SUBSCRIBED AND SWORN… · Supporting LCR / transmittal may follow.',
        ]}
      />
    </PrintPageMock>
  ),

  'mc2010-form': (
    <MockAppFrame title="MC2010-04 — Data entry form" badge="Form">
      <FormSectionMock
        title="MC2010-04 transmittal form"
        items={[
          { label: 'Transmittal type', value: 'MC2010-04 endorsement' },
          { label: 'Source record', value: 'Legitimation saved file' },
          { label: 'LCR form attached', value: 'LCR Form 1A (Birth)' },
          { label: 'Recipient office', value: 'PSA / LCRO destination' },
          { label: 'Endorsement notes', value: 'For registration and indexing…' },
        ]}
      />
    </MockAppFrame>
  ),

  'mc2010-print': (
    <PrintPageMock
      label="MC2010-04 — Print output"
      sidebar={<PrintSidebarMock paper="Long bond" docs={['MC2010 Transmittal', 'LCR Form 1A']} activeIdx={0} />}
    >
      <PrintBodyLines
        title="Transmittal (MC2010-04)"
        lines={[
          'Republic of the Philippines · City of Iligan',
          'TRANSMITTAL / ENDORSEMENT',
          `Please find enclosed civil registry documents re: ${SAMPLE.child}`,
          'Document list: Affidavit · LCR Form 1A · Supporting papers',
          'Respectfully submitted, City Civil Registrar',
        ]}
      />
    </PrintPageMock>
  ),

  'files-saved': (
    <MockAppFrame title="Files Saved">
      <div className="p-2 min-h-[140px] space-y-1.5">
        <div className="flex gap-1 flex-wrap mb-1">
          {['AUSF', 'Court Decree', 'Legitimation', 'Supplemental', 'MC2010'].map((t, i) => (
            <span key={t} className={`text-[6px] px-1.5 py-0.5 rounded ${i === 0 ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-slate-100 text-slate-600'}`}>{t}</span>
          ))}
        </div>
        {['JUAN DELA CRUZ — AUSF 07-17', 'SPS. SANTOS — Cert. authenticity'].map((row) => (
          <div key={row} className="rounded border border-slate-200 p-1.5 flex justify-between items-center gap-1 bg-white">
            <div>
              <p className="text-[7px] font-semibold text-slate-800">{row}</p>
              <p className="text-[6px] text-slate-500">Saved · Edit · View & Print</p>
            </div>
            <span className="text-[6px] px-1 py-0.5 rounded bg-blue-600 text-white">Print</span>
          </div>
        ))}
      </div>
    </MockAppFrame>
  ),

  'saved-actions': (
    <MockAppFrame title="Saved record actions">
      <div className="p-3 space-y-2 min-h-[120px]">
        {[
          ['Edit', 'Reopens the form with saved data. Click Done again to update the file.'],
          ['View & Print', 'Opens print preview with all documents for that case.'],
          ['Remove', 'Deletes the saved entry from this computer after confirmation.'],
        ].map(([btn, hint]) => (
          <div key={btn} className="flex gap-2 items-start">
            <span className="shrink-0 text-[7px] px-2 py-1 rounded border font-bold text-slate-700 min-w-[54px] text-center">{btn}</span>
            <span className="text-[7px] text-slate-600 leading-snug">{hint}</span>
          </div>
        ))}
      </div>
    </MockAppFrame>
  ),

  'saved-filter': (
    <MockAppFrame title="Search & filters">
      <div className="p-3 space-y-2 min-h-[120px]">
        <div className="flex gap-1">
          <span className="text-[7px] px-2 py-1 border rounded bg-white">Joint only ▾</span>
          <span className="text-[7px] px-2 py-1 border rounded bg-white flex-1">Search name…</span>
        </div>
        <p className="text-[7px] text-slate-500 text-center pt-6">Page 1 · 2 — Showing 1–15 of 28</p>
      </div>
    </MockAppFrame>
  ),

  export: (
    <MockAppFrame title="Export / Import">
      <div className="p-4 flex flex-col gap-2 items-center justify-center min-h-[120px]">
        <span className="text-[9px] px-4 py-2 rounded-lg bg-[var(--primary-blue)] text-white font-bold w-full text-center">Export all saved data</span>
        <span className="text-[9px] px-4 py-2 rounded-lg border-2 border-[var(--primary-blue)] text-[var(--primary-blue)] font-bold w-full text-center">Import from backup file</span>
      </div>
    </MockAppFrame>
  ),
}

export default function UserManualStepVisual({ visualId }) {
  if (!visualId || !VISUALS[visualId]) return null
  return <div className="user-manual-step-visual w-full">{VISUALS[visualId]}</div>
}
