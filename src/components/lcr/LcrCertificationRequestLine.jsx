import React from 'react'
import LcrCertificationRequestPartyInline from './LcrCertificationRequestPartyInline'

/** Standard LCR footer certification sentence with CCR-FILE / PSA / receipt requester. */
export default function LcrCertificationRequestLine({
  data,
  variant = '1a',
  copyKind,
  onPartyChange,
  className = 'mb-2 court-decree-lcr-body court-decree-lcr-cert-after-table',
  style,
}) {
  return (
    <p className={className} style={style}>
      This certification is issued upon the request of{' '}
      <LcrCertificationRequestPartyInline
        data={data}
        variant={variant}
        copyKind={copyKind}
        onPartyChange={onPartyChange}
      />{' '}
      for any legal purposes.
    </p>
  )
}
