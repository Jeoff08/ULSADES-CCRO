import React from 'react'

const CCRO_LOGO = encodeURI('/ChatGPT Image Feb 11, 2026, 03_26_31 PM.png')

export function MockAppFrame({ title, children, badge }) {
  return (
    <div className="w-full max-w-lg mx-auto rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden text-left">
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border-b border-slate-200">
        <span className="w-2 h-2 rounded-full bg-red-400" />
        <span className="w-2 h-2 rounded-full bg-amber-400" />
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="ml-1 text-[9px] font-medium text-slate-500 truncate flex-1">{title}</span>
        {badge ? (
          <span className="text-[7px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">{badge}</span>
        ) : null}
      </div>
      {children}
    </div>
  )
}

export function PrintHeaderMock({ registryNo = '2024-00123' }) {
  return (
    <div className="border-b border-black/20 pb-1 mb-1">
      <div className="flex items-center justify-between gap-1">
        <img src={CCRO_LOGO} alt="" className="w-8 h-8 object-contain" />
        <div className="flex-1 text-center leading-tight">
          <p className="text-[6px] font-bold uppercase">City Civil Registrar&apos;s Office</p>
          <p className="text-[5px]">Iligan City</p>
        </div>
        <img src={CCRO_LOGO} alt="" className="w-8 h-8 object-contain opacity-80" />
      </div>
      <hr className="border-black my-0.5" />
      <div className="flex justify-between text-[5px] leading-tight gap-1">
        <span className="max-w-[55%]">Republic of the Philippines) City of Iligan) S.S</span>
        {registryNo ? (
          <span className="shrink-0">
            Registry No: <strong className="underline">{registryNo}</strong>
          </span>
        ) : null}
      </div>
    </div>
  )
}

export function FormSectionMock({ items, title, doneLabel = 'Done' }) {
  return (
    <div className="p-3 bg-slate-50 min-h-[160px]">
      <p className="text-[10px] font-bold text-slate-800 mb-2">{title}</p>
      <div className="space-y-2 bg-white rounded-lg border border-slate-200 p-2">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-[7px] font-semibold text-slate-600">{item.label}</p>
            {item.type === 'radio' ? (
              <div className="flex gap-2 mt-0.5">
                <span className="text-[7px] text-slate-500">○ YES</span>
                <span className="text-[7px] text-slate-800 font-medium">● {item.value || 'NO'}</span>
              </div>
            ) : (
              <div className="h-4 mt-0.5 rounded border border-slate-300 bg-white text-[7px] px-1 flex items-center text-slate-700 truncate">
                {item.value || ' '}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-2">
        <span className="px-3 py-1 rounded-md bg-emerald-600 text-[8px] font-bold text-white shadow-sm">{doneLabel}</span>
      </div>
    </div>
  )
}

export function PrintSidebarMock({ docs, activeIdx = 0, paper = 'Long bond' }) {
  return (
    <div className="w-[32%] border-r border-slate-200 bg-slate-100 p-1.5 text-[6px] space-y-0.5 shrink-0">
      <p className="font-bold text-slate-700 mb-1">Documents</p>
      {docs.map((d, i) => (
        <p
          key={d}
          className={`px-1 py-0.5 rounded truncate ${i === activeIdx ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600'}`}
        >
          {d}
        </p>
      ))}
      <p className="pt-1 text-slate-500 border-t border-slate-200 mt-1">Paper: {paper}</p>
      <p className="text-emerald-700 font-bold">▶ Save PDF</p>
      <p className="text-blue-700">🖨 Print</p>
    </div>
  )
}

export function PrintPageMock({ sidebar, children, label = 'System print output' }) {
  return (
    <MockAppFrame title={label} badge="Print preview">
      <div className="flex min-h-[200px] bg-slate-200/50">
        {sidebar}
        <div className="flex-1 p-1.5 overflow-hidden min-w-0">
          <div className="bg-white shadow-sm h-full p-2 text-black leading-snug overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </MockAppFrame>
  )
}
