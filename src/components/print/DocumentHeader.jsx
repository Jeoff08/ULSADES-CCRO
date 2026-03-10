import React from 'react'
import PrintHeaderRow from './PrintHeaderRow'

export default function DocumentHeader({ registryNo }) {
  return (
    <header className="print-doc-header mb-4">
      <PrintHeaderRow />
      <hr className="border-black border-t my-2" />
      <div className="flex justify-between items-baseline gap-4 text-sm leading-tight">
        <div>
          <p>Republic of the Philippines)</p>
          <p>City of Iligan)S.S</p>
        </div>
        <div className="flex items-baseline gap-1 shrink-0">
          <span>Registry Number:</span>
          <span className="font-bold underline inline-block text-center min-w-[3rem]">{registryNo || '—'}</span>
        </div>
      </div>
    </header>
  )
}
