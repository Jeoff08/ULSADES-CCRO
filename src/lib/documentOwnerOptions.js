import { getSavedLegitimationList } from '../pages/legitimation/lib/legitimationStorage'
import { getDocumentOwnerLabelFromLegitimationData } from '../pages/legitimation/lib/legitimationStorage'
import { getSavedCourtDecreeList } from '../pages/courtDecree/lib/courtDecreeStorage'

const LCR_DOCUMENT_TYPES = ['BIRTH_CERTIFICATE', 'DEATH_CERTIFICATE', 'MARRIAGE_CERTIFICATE']

/**
 * Returns document owner options grouped by source (Legitimation vs Court Decree).
 * - LCR Form 1A (BIRTH_CERTIFICATE): Legitimation only.
 * - LCR Form 2A / 3A (DEATH_CERTIFICATE, MARRIAGE_CERTIFICATE): Legitimation + Court Decree.
 * @param {string} affectedDocument - One of BIRTH_CERTIFICATE, DEATH_CERTIFICATE, MARRIAGE_CERTIFICATE
 * @returns {{ legitimation: { value: string, label: string }[], courtDecree: { value: string, label: string }[] }}
 */
export function getDocumentOwnerOptions(affectedDocument) {
  const empty = { legitimation: [], courtDecree: [] }
  if (!affectedDocument || !LCR_DOCUMENT_TYPES.includes(affectedDocument)) {
    return empty
  }
  const legitimation = []
  const legitimationSeen = new Set()

  const legitimationList = getSavedLegitimationList()
  for (const item of legitimationList) {
    if (!item.data) continue
    const name = getDocumentOwnerLabelFromLegitimationData(item.data, affectedDocument)
    if (name && !legitimationSeen.has(name)) {
      legitimationSeen.add(name)
      legitimation.push({ value: name, label: name })
    }
  }

  const courtDecree = []
  const courtDecreeSeen = new Set()
  if (affectedDocument !== 'BIRTH_CERTIFICATE') {
    const courtDecreeList = getSavedCourtDecreeList()
    for (const item of courtDecreeList) {
      const name = (item.data?.documentOwnerName || '').trim()
      if (name && !courtDecreeSeen.has(name)) {
        courtDecreeSeen.add(name)
        courtDecree.push({ value: name, label: name })
      }
    }
  }

  return { legitimation, courtDecree }
}

export { LCR_DOCUMENT_TYPES }
