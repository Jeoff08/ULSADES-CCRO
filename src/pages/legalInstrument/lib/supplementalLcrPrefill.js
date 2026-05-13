import { fullName } from '../../../lib/printUtils'
import { defaultLegitimation } from '../../legitimation/lib/legitimationDefaults'
import { defaultCourtDecree } from '../../courtDecree/lib/courtDecreeDefaults'

/** Shared certificate / header fields copied onto LCR payloads when prefilling. */
function sharedMetaFromSource(data) {
  if (!data || typeof data !== 'object') return {}
  return {
    remarks: data.remarks || '',
    colbPageNumber: data.colbPageNumber ?? data.colbPageNo ?? '',
    colbBookNumber: data.colbBookNumber ?? data.colbBookNo ?? '',
    certificateSignatoryName: data.certificateSignatoryName || '',
    certificateSignatoryTitle: data.certificateSignatoryTitle || '',
    cityCivilRegistrarName: data.cityCivilRegistrarName || '',
    certificateIssuanceDate: data.certificateIssuanceDate || '',
    contactPhone: data.contactPhone || '',
    contactEmail: data.contactEmail || '',
  }
}

/**
 * Map a record from AUSF, Court Decree, or Legitimation into the object shape
 * expected by court decree LCR print components (1A / 2A / 3A). Returns a copy only.
 *
 * @param {'ausf'|'courtDecree'|'legitimation'} sourceModule
 * @param {object} data — raw module record
 * @param {'1A'|'2A'|'3A'} lcrType
 */
export function mapSourceToSupplementalLcrData(sourceModule, data, lcrType) {
  const d = data && typeof data === 'object' ? data : {}
  const meta = sharedMetaFromSource(d)

  if (lcrType === '1A') {
    if (sourceModule === 'courtDecree') {
      return { ...defaultLegitimation, ...meta, ...d }
    }
    if (sourceModule === 'legitimation') {
      return {
        ...defaultLegitimation,
        ...meta,
        colbRegistryNo: d.colbRegistryNo || '',
        colbRegDate: d.colbRegDate || '',
        lcr1aRegistryNumber: d.lcr1aRegistryNumber || d.colbRegistryNo || '',
        lcr1aDateRegistration: d.lcr1aDateRegistration || d.colbRegDate || '',
        lcr1aNameOfChild: fullName(d.childFirst, d.childMiddle, d.childLast),
        lcr1aSex: d.sex || '',
        lcr1aDateOfBirth: d.dateOfBirth || '',
        lcr1aPlaceOfBirth: [d.placeOfBirthAddress, d.placeOfBirthCity, d.placeOfBirthProvince].filter(Boolean).join(', '),
        lcr1aNameOfMother: fullName(d.motherFirst, d.motherMiddle, d.motherLast),
        lcr1aMotherCitizenship: d.motherCitizenship || '',
        lcr1aNameOfFather: fullName(d.fatherFirst, d.fatherMiddle, d.fatherLast),
        lcr1aFatherCitizenship: d.fatherCitizenship || '',
        lcr1aDateMarriageParents: d.dateOfMarriage || '',
        lcr1aPlaceMarriageParents: [d.placeOfMarriageCity, d.placeOfMarriageProvince].filter(Boolean).join(', '),
      }
    }
    if (sourceModule === 'ausf') {
      return {
        ...defaultLegitimation,
        ...meta,
        colbRegistryNo: d.colbRegistryNo || '',
        colbRegDate: d.colbDateOfRegistration || '',
        lcr1aRegistryNumber: d.colbRegistryNo || '',
        lcr1aDateRegistration: d.colbDateOfRegistration || '',
        lcr1aNameOfChild: fullName(d.childFirst, d.childMiddle, d.childLast),
        lcr1aSex: d.sex || '',
        lcr1aDateOfBirth: d.dateOfBirth || '',
        lcr1aPlaceOfBirth: [d.placeOfBirthAddress, d.placeOfBirthCity, d.placeOfBirthProvince].filter(Boolean).join(', '),
        lcr1aNameOfMother: fullName(d.motherFirst, d.motherMiddle, d.motherLast),
        lcr1aMotherCitizenship: d.motherCitizenship || '',
        lcr1aNameOfFather: fullName(d.fatherFirst, d.fatherMiddle, d.fatherLast),
        lcr1aFatherCitizenship: d.fatherCitizenship || '',
      }
    }
  }

  if (lcrType === '2A' || lcrType === '3A') {
    if (sourceModule === 'courtDecree') {
      return { ...defaultCourtDecree, ...meta, ...d }
    }
    return {
      ...defaultCourtDecree,
      ...meta,
    }
  }

  return lcrType === '1A' ? { ...defaultLegitimation, ...meta } : { ...defaultCourtDecree, ...meta }
}
