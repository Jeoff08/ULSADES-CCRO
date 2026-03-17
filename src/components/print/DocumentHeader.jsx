import React from 'react'
import PrintHeaderRow from './PrintHeaderRow'

export default function DocumentHeader({ registryNo }) {
  return (
    <header className="print-doc-header mb-1">
      <PrintHeaderRow />
      <hr className="border-black border-t my-2" />
      <div className="flex justify-end items-baseline gap-4 text-[21px] leading-tight">
        <div className="flex items-baseline gap-1 shrink-0">
          <span>Registry Number:</span>
          <span className="font-bold underline inline-block text-center min-w-[3rem] text-[21px]">{registryNo || '—'}</span>
        </div>
      </div>
    </header>
  )
}
