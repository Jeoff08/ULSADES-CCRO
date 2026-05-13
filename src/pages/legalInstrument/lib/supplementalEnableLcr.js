import { defaultLegitimation } from '../../legitimation/lib/legitimationDefaults'
import { defaultCourtDecree } from '../../courtDecree/lib/courtDecreeDefaults'
import { getSavedAUSFList, getAUSFDraft } from '../../ausf/lib/ausfStorage'
import { getSavedCourtDecreeList, getCourtDecreeDraft } from '../../courtDecree/lib/courtDecreeStorage'
import { getSavedLegitimationList, getLegitimationDraft } from '../../legitimation/lib/legitimationStorage'
import { mapSourceToSupplementalLcrData } from './supplementalLcrPrefill'

function hasValue(v) {
  return String(v ?? '').trim().length > 0
}

export function recordHasLcrType(data, lcrType) {
  if (!data || typeof data !== 'object') return false

  if (lcrType === '1A') {
    return (
      hasValue(data.lcr1aNameOfChild) ||
      hasValue(data.lcr1aRegistryNumber) ||
      hasValue(data.colbRegistryNo) ||
      hasValue(data.childFirst) ||
      hasValue(data.childLast)
    )
  }

  if (lcrType === '2A') {
    return (
      hasValue(data.lcr2aNameDeceased) ||
      hasValue(data.lcr2aRegistryNumber) ||
      hasValue(data.lcr2aDateDeath)
    )
  }

  if (lcrType === '3A') {
    return (
      hasValue(data.lcr3aHusbandName) ||
      hasValue(data.lcr3aWifeName) ||
      hasValue(data.lcr3aRegistryNumber) ||
      hasValue(data.marriageRegistryNo)
    )
  }

  return true
}

/**
 * Next supplemental draft when user picks or switches LCR type (1A / 2A / 3A).
 */
export function applyEnableLcrType(prev, type) {
  let lcrData = type === '1A' ? { ...defaultLegitimation } : { ...defaultCourtDecree }
  if (prev.lcrSourceId && prev.lcrSource) {
    const sources = {
      ausf: { list: getSavedAUSFList(), draft: getAUSFDraft() },
      courtDecree: { list: getSavedCourtDecreeList(), draft: getCourtDecreeDraft() },
      legitimation: { list: getSavedLegitimationList(), draft: getLegitimationDraft() },
    }
    const key = prev.lcrSource === 'ausf' || prev.lcrSource === 'legitimation' ? prev.lcrSource : 'courtDecree'
    const { list, draft } = sources[key]
    const rows = []
    if (draft && typeof draft === 'object' && recordHasLcrType(draft, type)) {
      rows.push({ id: '__draft__', label: '[Current draft]', data: draft })
    }
    list.forEach((r) => {
      if (r?.data && recordHasLcrType(r.data, type)) rows.push({ id: r.id, label: r.label || r.id, data: r.data })
    })
    const rec = rows.find((r) => r.id === prev.lcrSourceId)
    if (rec) lcrData = mapSourceToSupplementalLcrData(prev.lcrSource, rec.data, type)
  }
  return {
    ...prev,
    includeForm1a: true,
    lcrType: type,
    lcrData,
    ...(prev.lcrSourceId ? {} : { lcrSourceId: '', lcrPrefillLabel: '' }),
  }
}
