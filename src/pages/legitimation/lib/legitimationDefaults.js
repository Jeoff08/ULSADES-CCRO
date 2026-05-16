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
  // Print — shared LCRO/CCR (LCR 1A, registration, annotation, transmittal)
  certificateIssuanceDate: '',
  cityCivilRegistrarName: '',
  cityCivilRegistrarTitle: '',
  /** Joint affidavit “Received by” only; empty = follow cityCivilRegistrar* (shared) for display. */
  legitimationJointAffidavitReceivedByName: '',
  legitimationJointAffidavitReceivedByTitle: '',
  /** Sole affidavit “Received by” only; empty = follow cityCivilRegistrar* for display. */
  legitimationSoleAffidavitReceivedByName: '',
  legitimationSoleAffidavitReceivedByTitle: '',
  certificateSignatoryName: '',
  certificateSignatoryTitle: '',
  recipientName: '',
  recipientTitle: '',
  recipientOffice: '',
  recipientAgency: '',
  /** Local transmittal “To PSA” block (6 lines for legitimation); empty = use print defaults */
  transmittalToPsaLine1: '',
  transmittalToPsaLine2: '',
  transmittalToPsaLine3: '',
  transmittalToPsaLine4: '',
  transmittalToPsaLine5: '',
  transmittalToPsaLine6: '',
  /** Out-of-town transmittal addressee lines 4–6 (lines 1–3 use recipientName / Title / Office) */
  transmittalOotLine4: '',
  transmittalOotLine5: '',
  transmittalOotLine6: '',
  /** Legitimation transmittal ATTN label (e.g. ATTN:); empty = print default */
  transmittalAttnPrefix: '',
  /** Legitimation transmittal ATTN lines: name, title, office (prefix is separate); empty = print defaults */
  transmittalAttnLine1: '',
  transmittalAttnLine2: '',
  transmittalAttnLine3: '',
  transmittalDate: '',
  transmittalSalutation: '',
  transmittalSignatoryName: '',
  transmittalSignatoryTitle: '',
  /** Item 12 annotation choice: A (without acknowledgement) or B (with acknowledgement). */
  legitimationAnnotationOption: 'A',
  /** Bold phrase in LCR 1A line “issued upon the request of …”. */
  lcrCertificationRequestParty: 'OCRG/OWNER/PARENTS/GUARDIAN',
  /** Printed font size (pt) for LCR Form 1A remarks body. */
  lcrRemarksFontSizePt: '12',
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
