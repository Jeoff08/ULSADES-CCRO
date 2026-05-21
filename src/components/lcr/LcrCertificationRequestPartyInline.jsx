import React from 'react'
import { lcrCertificationRequestPartyForCopy } from '../../lib/lcrCertificationRequest'

/**
 * Bold phrase after “issued upon the request of …” on LCR forms (CCR-FILE, PSA, or receipt name).
 */
export default function LcrCertificationRequestPartyInline({
  data,
  variant = '1a',
  copyKind,
  onPartyChange: _onPartyChange,
  inputClassName: _inputClassName,
}) {
  const kind = copyKind || data?.lcrCertificationCopy || 'ccr-file'
  const party = lcrCertificationRequestPartyForCopy(data, kind, variant)
  return <span className="font-bold">{party}</span>
}
