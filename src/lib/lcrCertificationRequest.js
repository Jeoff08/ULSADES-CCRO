/** LCR certification line: “issued upon the request of …” — only these three requesters. */
export const LCR_CERT_REQUEST_CCR_FILE = 'CCR-FILE'
export const LCR_CERT_REQUEST_PSA = 'PSA'

export const LCR_CERTIFICATION_COPIES = [
  { id: 'ccr-file', menuSuffix: 'CCR-FILE', party: LCR_CERT_REQUEST_CCR_FILE },
  { id: 'psa', menuSuffix: 'PSA', party: LCR_CERT_REQUEST_PSA },
  { id: 'receipt', menuSuffix: 'Receipt', partyFromReceipt: true },
]

const LCR_BASE_PRINT_IDS = new Set(['lcr-form-1a', 'lcr-form-2a', 'lcr-form-3a'])

/** @deprecated Use copy-specific defaults; kept for empty placeholder only. */
export const LCR_CERT_REQUEST_PARTY_1A_DEFAULT = LCR_CERT_REQUEST_CCR_FILE
export const LCR_CERT_REQUEST_PARTY_2A_3A_DEFAULT = LCR_CERT_REQUEST_CCR_FILE

/**
 * @param {string} printTypeId
 * @returns {{ baseType: string, copyKind: string }}
 */
export function parseLcrPrintTypeId(printTypeId) {
  const id = String(printTypeId ?? '').trim()
  if (!id) return { baseType: id, copyKind: 'ccr-file' }
  for (const { id: copyId } of LCR_CERTIFICATION_COPIES) {
    const suffix = `-${copyId}`
    if (id.endsWith(suffix)) {
      return { baseType: id.slice(0, -suffix.length), copyKind: copyId }
    }
  }
  return { baseType: id, copyKind: 'ccr-file' }
}

export function isBaseLcrPrintTypeId(printTypeId) {
  return LCR_BASE_PRINT_IDS.has(parseLcrPrintTypeId(printTypeId).baseType)
}

export function expandLcrPrintTypeIds(baseIds) {
  const list = Array.isArray(baseIds) ? baseIds : []
  const out = []
  for (const id of list) {
    if (LCR_BASE_PRINT_IDS.has(id)) {
      for (const copy of LCR_CERTIFICATION_COPIES) {
        out.push(`${id}-${copy.id}`)
      }
    } else {
      out.push(id)
    }
  }
  return out
}

/** Menu entries: each base LCR type becomes three print options. */
export function expandLcrPrintMenuTypes(types) {
  const list = Array.isArray(types) ? types : []
  const out = []
  for (const t of list) {
    if (!LCR_BASE_PRINT_IDS.has(t.id)) {
      out.push(t)
      continue
    }
    const titleBase = String(t.title || t.id).replace(/^\d+\.\s*/, '').trim()
    const num = String(t.title || '').match(/^(\d+)\./)?.[1]
    LCR_CERTIFICATION_COPIES.forEach((copy, idx) => {
      const letter = String.fromCharCode(97 + idx)
      out.push({
        ...t,
        id: `${t.id}-${copy.id}`,
        title: num ? `${num}${letter}. ${titleBase} (${copy.menuSuffix})` : `${titleBase} (${copy.menuSuffix})`,
        desc: t.desc ? `${t.desc} — ${copy.menuSuffix}` : undefined,
      })
    })
  }
  return out
}

function receiptOrApplicantFallback(data) {
  return (
    String(data?.receiptOrFileOwner ?? '').trim() ||
    String(data?.applicantName ?? '').trim() ||
    String(data?.documentOwnerName ?? '').trim() ||
    String(data?.affiantName ?? '').trim() ||
    String(data?.transmittalColbName ?? '').trim() ||
    ''
  )
}

/**
 * @param {Record<string, unknown>} data
 * @param {string} [copyKind] ccr-file | psa | receipt
 * @param {'1a' | '2a3a'} [_variant]
 */
export function lcrCertificationRequestPartyForCopy(data, copyKind, _variant = '1a') {
  const kind = copyKind || data?.lcrCertificationCopy || 'ccr-file'
  if (kind === 'ccr-file') return LCR_CERT_REQUEST_CCR_FILE
  if (kind === 'psa') return LCR_CERT_REQUEST_PSA
  if (kind === 'receipt') {
    const receipt = String(data?.receiptOrFileOwner ?? '').trim()
    if (receipt) return receipt
    const fallback = receiptOrApplicantFallback(data)
    return fallback || '—'
  }
  return LCR_CERT_REQUEST_CCR_FILE
}

/** @deprecated Use lcrCertificationRequestPartyForCopy */
export function lcrCertificationRequestParty(data, variant) {
  return lcrCertificationRequestPartyForCopy(data, data?.lcrCertificationCopy, variant)
}

export function mergeLcrCertificationCopyIntoData(data, copyKind) {
  return { ...(data || {}), lcrCertificationCopy: copyKind || data?.lcrCertificationCopy || 'ccr-file' }
}

const AUSF_LCR_PRINT_BASE_TYPES = new Set(['child-ack-lcr', 'child-not-ack-lcr'])

/** Expand AUSF LCR print sidebar entries into CCR-FILE, PSA, and Receipt variants. */
export function expandAusfLcrPrintOptions(options) {
  const list = Array.isArray(options) ? options : []
  const out = []
  for (const opt of list) {
    if (!AUSF_LCR_PRINT_BASE_TYPES.has(opt.type)) {
      out.push(opt)
      continue
    }
    for (const copy of LCR_CERTIFICATION_COPIES) {
      out.push({
        ...opt,
        type: `${opt.type}-${copy.id}`,
        label: `${opt.label} (${copy.menuSuffix})`,
        labelLine1: opt.labelLine1 ? `${opt.labelLine1} (${copy.menuSuffix})` : undefined,
        labelLine2: opt.labelLine2,
      })
    }
  }
  return out
}

export function isAusfLcrPrintType(type) {
  return AUSF_LCR_PRINT_BASE_TYPES.has(parseLcrPrintTypeId(type).baseType)
}
