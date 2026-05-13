import { DEFAULT_RECEIVED_BY } from '../../../lib/receivedByOptions'

export const defaultLegitimation = {
  formType: 'joint-affidavit',
  /** When true, print offers Out-of-Town Transmittal only; when false, local Transmittal only. */
  legitimationTransmittalIsOutOfTown: false,
  // Child
  childFirst: '',
  childMiddle: '',
  childLast: '',
  dateOfBirth: '',
  sex: '',
  placeOfBirthStreet: '',
  placeOfBirthCity: '',
  placeOfBirthProvince: '',
  // Parents
  motherFirst: '',
  motherMiddle: '',
  motherLast: '',
  motherCitizenship: '',
  fatherFirst: '',
  fatherMiddle: '',
  fatherLast: '',
  fatherCitizenship: '',
  // Marriage
  marriageRegistryNo: '',
  dateOfMarriage: '',
  placeOfMarriageCity: '',
  placeOfMarriageProvince: '',
  placeOfMarriageCountry: '',
  solemnizingOfficer: '',
  // Affidavit of legitimation
  affidavitLegitRegistryNo: '',
  affidavitLegitDate: '',
  // Affidavit of acknowledgement (Item 8)
  affidavitAckRegistryNo: '',
  affidavitAckDate: '',
  // COLB of child
  colbRegistryNo: '',
  colbRegDate: '',
  colbPageNo: '',
  colbBookNo: '',
  // Questions
  birthRegisteredIligan: 'YES',
  acknowledgedByFatherInColb: 'YES',
  parentsMinorAtBirth: 'NO',
  bothParentsAlive: 'YES',
  // Surviving / deceased parent (when applicable)
  survivingParentFirst: '',
  survivingParentMiddle: '',
  survivingParentLast: '',
  survivingParentCitizenship: '',
  deceasedParentFirst: '',
  deceasedParentMiddle: '',
  deceasedParentLast: '',
  dateOfDeath: '',
  // Print
  verifiedByName: DEFAULT_RECEIVED_BY.name,
  verifiedByTitle: DEFAULT_RECEIVED_BY.title,
  certificateIssuanceDate: '',
  cityCivilRegistrarName: '',
  recipientName: '',
  recipientTitle: '',
  recipientOffice: '',
  recipientAgency: '',
  /** Local transmittal “To PSA” block (4 lines); empty = use print defaults */
  transmittalToPsaLine1: '',
  transmittalToPsaLine2: '',
  transmittalToPsaLine3: '',
  transmittalToPsaLine4: '',
  transmittalDate: '',
  transmittalSalutation: '',
  transmittalSignatoryName: '',
  transmittalSignatoryTitle: '',
  /** Item 12 annotation choice: A (without acknowledgement) or B (with acknowledgement). */
  legitimationAnnotationOption: 'A',
  contactPhone: '',
  contactEmail: '',
}

/** Align out-of-town flag with legacy print formType when loading saved drafts. */
export function syncLegitimationTransmittalFlagWithFormType(data) {
  if (!data || typeof data !== 'object') return data
  if (data.formType === 'out-of-town-transmittal') return { ...data, legitimationTransmittalIsOutOfTown: true }
  if (data.formType === 'transmittal') return { ...data, legitimationTransmittalIsOutOfTown: false }
  return data
}
