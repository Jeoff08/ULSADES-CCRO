import React from 'react'
import LcrCertificationRequestPartyInline from './LcrCertificationRequestPartyInline'

/** Standard LCR footer certification sentence with CCR-FILE / PSA / receipt requester. */
export default function LcrCertificationRequestLine({
  data,
  variant = '1a',
  copyKind,
  onPartyChange,
  className = '',
  style,
}) {
  const mergedClassName = [
    'lcr-cert-request-line court-decree-lcr-cert-after-table court-decree-lcr-body mb-2',
    className,
  ]
    .join(' ')
    .trim()

  return (
    <p className={mergedClassName} style={style}>
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
