import React from 'react'
import PrintHeaderRow from './PrintHeaderRow'

export default function DocumentHeader({ registryNo, headerTextSize, juratBlock }) {
  return (
    <header className={`print-doc-header ${juratBlock ? 'mb-0' : 'mb-1'}`}>
      <PrintHeaderRow headerTextSize={headerTextSize} />
      <hr className={`border-black border-t ${juratBlock ? 'my-1' : 'my-2'}`} />
      <div className={`flex ${juratBlock ? 'justify-between mt-2' : 'justify-end'} items-start gap-4 leading-tight`}>
        {juratBlock ? <div className="text-[20px] leading-tight shrink-0">{juratBlock}</div> : null}
        <div className="flex items-baseline gap-1 shrink-0 text-[21px]">
          <span>Registry Number:</span>
          <span className="font-bold underline inline-block text-center min-w-[3rem] text-[21px]">{registryNo || '—'}</span>
        </div>
      </div>
    </header>
  )
}
