export const defaultAUSF = {
  formType: 'ausf-0-6',
  applicantName: '',
  civilStatus: 'single',
  relationshipToChild: '',
  birthRegisteredInIligan: 'YES',
  childAlreadyAcknowledged: 'NO',
  motherFirst: '',
  motherMiddle: '',
  motherLast: '',
  motherCitizenship: 'Filipino',
  fatherFirst: '',
  fatherMiddle: '',
  fatherLast: '',
  fatherCitizenship: 'Filipino',
  childFirst: '',
  childMiddle: '',
  childLast: '',
  dateOfBirth: '',
  age: '',
  sex: 'MALE',
  placeOfBirthAddress: '',
  placeOfBirthCity: 'ILIGAN CITY',
  placeOfBirthProvince: 'LANAO DEL NORTE',
  colbRegistryNo: '',
  colbDateOfRegistration: '',
  colbPageNumber: '',
  colbBookNumber: '',
  ausfRegistryNo: '',
  ausfDateOfRegistration: '',
  ackRegistryNo: '',
  ackDateOfRegistration: '',
  publicDocRegistryNo: '',
  publicDocDate: '',
  publicDocOffice: '',
  filingLocation: 'ILIGAN CITY',
  affidavitExecutionDate: '',
  cityCivilRegistrarName: 'Atty. Yussif Don Justin F. Martil',
  certificateSignatoryName: 'LORELIE L. CANTO',
  certificateSignatoryTitle: '',
  regAusfSignatoryName: '',
  regAusfSignatoryTitle: '',
  regAckSignatoryName: '',
  regAckSignatoryTitle: '',
  transmittalLocalSignatoryName: '',
  transmittalLocalSignatoryTitle: '',
  transmittalOotSignatoryName: '',
  transmittalOotSignatoryTitle: '',
  lcrAckSignatoryName: '',
  lcrAckSignatoryTitle: '',
  lcrNotAckSignatoryName: '',
  lcrNotAckSignatoryTitle: '',
  certificateIssuanceDate: '',
  contactPhone: '228-1311',
  contactEmail: 'civilregistrar.iligan@gmail.com',
  /** Bold phrase in LCR 1A/A1 line “issued upon the request of …”. */
  lcrCertificationRequestParty: 'OCRG/OWNER/PARENTS/GUARDIAN',
  /** Printed font size (pt) for LCR / annotation remarks body text. */
  lcrRemarksFontSizePt: '12',
  // Certificate of Live Birth (Annotation / Municipal Form 102)
  motherReligion: '',
  motherOccupation: '',
  motherAge: '',
  motherResidence: '',
  motherTotalChildrenAlive: '',
  motherChildrenLiving: '',
  motherChildrenDead: '',
  fatherReligion: '',
  fatherOccupation: '',
  fatherAge: '',
  fatherResidence: '',
  typeOfBirth: 'SINGLE',
  birthOrder: '',
  birthWeight: '',
  colbRegistryNoForm102: '',
  attendantName: '',
  attendantTitle: '',
  attendantAddress: '',
  attendantDate: '',
  informantName: '',
  informantRelationship: '',
  informantAddress: '',
  informantDate: '',
  preparedByName: '',
  preparedByTitle: '',
  preparedByDate: '',
  receivedByName: '',
  receivedByTitle: '',
  receivedByDate: '',
  registeredByName: '',
  registeredByTitle: '',
  registeredByDate: '',
  /** When true (child not acknowledged), print view offers Out-of-Town Transmittal only; when false, local Transmittal only. */
  ausfTransmittalIsOutOfTown: false,
  // Transmittal (5.2, 6) — addressee lines empty until user fills (example text is UI placeholder only)
  transmittalDate: '',
  recipientName: '',
  recipientTitle: '',
  recipientOffice: '',
  transmittalOotLine4: '',
  transmittalOotLine5: '',
  transmittalOotLine6: '',
  transmittalAttnPrefix: '',
  transmittalAttnLine1: '',
  transmittalAttnLine2: '',
  transmittalAttnLine3: '',
  transmittalSignatoryName: '',
  transmittalSignatoryTitle: '',
  // Annotation (Child Ack): COLB scan and annotation text
  colbScanDataUrl: '',
  annotationChildAckText: '',
  annotationChildNotAckText: '',
  // Separate COLB scan per view so upload in one does not show in the other
  colbScanDataUrlAck: '',
  colbScanDataUrlNotAck: '',
}

/** Shown in AUSF transmittal inputs as placeholder only — not saved or printed unless user types. */
export const AUSF_TRANSMITTAL_ADDRESSEE_EXAMPLE_LINES = [
  'Minerva Eloisa P. Esquivas',
  'Assistant Secretary',
  'Deputy National Statistician',
  'Civil Registration and Central Support Office',
  'CRS Building, Philippines Statistics Authority Complex East Avenue Diliman',
  'Quezon City, 1101',
]

const AUSF_TRANSMITTAL_ADDRESSEE_KEYS = [
  'recipientName',
  'recipientTitle',
  'recipientOffice',
  'transmittalOotLine4',
  'transmittalOotLine5',
  'transmittalOotLine6',
]

/** True when draft still has the old placeholder addressee (e.g. KANYE WEST / ILIGAN). */
export function isLegacyAusfTransmittalRecipient(data) {
  if (!data || typeof data !== 'object') return false
  const blob = AUSF_TRANSMITTAL_ADDRESSEE_KEYS.map((k) => String(data[k] ?? '').trim().toUpperCase()).join(' ')
  if (!blob) return false
  return (
    blob.includes('KANYE')
    || blob.includes('LAAGAN')
    || blob.includes('ILIGAN CITY, ILIGAN')
    || (blob.includes('WEST') && blob.includes('ILIGAN'))
  )
}

/** Clear legacy transmittal addressee so UI shows example placeholders only. */
export function applyAusfTransmittalAddresseeDefaults(data) {
  if (!data || typeof data !== 'object' || !isLegacyAusfTransmittalRecipient(data)) return data
  const patch = {}
  for (const k of AUSF_TRANSMITTAL_ADDRESSEE_KEYS) {
    patch[k] = ''
  }
  return { ...data, ...patch }
}

export function mergeAUSFDraftData(partial) {
  return applyAusfTransmittalAddresseeDefaults(
    syncAusfTransmittalFlagWithFormType({ ...defaultAUSF, ...(partial || {}) }),
  )
}

/** Align out-of-town toggle with saved transmittal form type (legacy rows may omit the flag). */
export function syncAusfTransmittalFlagWithFormType(data) {
  if (!data || typeof data !== 'object') return data
  if (data.formType === 'out-of-town') return { ...data, ausfTransmittalIsOutOfTown: true }
  if (data.formType === 'child-not-ack-transmittal') return { ...data, ausfTransmittalIsOutOfTown: false }
  return data
}

function filledPair(registryNo, dateOfRegistration) {
  return String(registryNo ?? '').trim() !== '' && String(dateOfRegistration ?? '').trim() !== ''
}

/** Item 6 — Affidavit to Use Surname of the Father (both fields required to include in print). */
export function hasAusfAffidavitRegistrationDetails(data) {
  if (!data || typeof data !== 'object') return false
  return filledPair(data.ausfRegistryNo, data.ausfDateOfRegistration)
}

/** Item 7 — Affidavit of Acknowledgement (both fields required to include in print). */
export function hasAcknowledgementAffidavitRegistrationDetails(data) {
  if (!data || typeof data !== 'object') return false
  return filledPair(data.ackRegistryNo, data.ackDateOfRegistration)
}
