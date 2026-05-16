import React from 'react'
import { lcrCertificationRequestParty } from '../../lib/lcrCertificationRequest'

const DEFAULT_INPUT_CLASS =
  'no-print inline-block min-w-[10rem] max-w-[32rem] border-0 border-b border-dashed border-gray-500 bg-transparent font-bold text-left px-0.5 align-baseline'

/**
 * Bold phrase after “issued upon the request of …” on LCR forms.
 * When `onPartyChange` is set (print preview), shows an inline input on screen and resolved text when printing.
 */
export default function LcrCertificationRequestPartyInline({
  data,
  variant,
  onPartyChange,
  inputClassName = DEFAULT_INPUT_CLASS,
}) {
  const certReqPartyPrint = lcrCertificationRequestParty(data, variant)
  const placeholder = lcrCertificationRequestParty({}, variant)

  if (!onPartyChange) {
    return <span className="font-bold">{certReqPartyPrint}</span>
  }

  return (
    <>
      <input
        type="text"
        className={inputClassName}
        value={String(data?.lcrCertificationRequestParty ?? '')}
        onChange={(e) => onPartyChange({ lcrCertificationRequestParty: e.target.value })}
        placeholder={placeholder}
        aria-label="Party requesting certification"
      />
      <span className="hidden print:inline font-bold">{certReqPartyPrint}</span>
    </>
  )
}
