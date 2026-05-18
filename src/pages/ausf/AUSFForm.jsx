import React, { useState, useEffect } from 'react'
import { afterUnsavedAcknowledge, useWarnIfUnsaved } from '../../hooks/useWarnIfUnsaved'
import { useSearchParams, useNavigate } from 'react-router-dom'
import FormSection from '../../components/FormSection'
import { FormInput, FormSelect, FormRadioGroup, FormFlexibleDateInput } from '../../components/FormField'
import { defaultAUSF, mergeAUSFDraftData } from './lib/ausfDefaults'
import {
  saveAUSFDraft,
  getAUSFDraft,
  clearAUSFDraft,
  addSavedAUSF,
  updateSavedAUSF,
  loadAUSFDraftFromApi,
  saveAUSFDraftToApi,
  addSavedAUSFToApi,
  updateSavedAUSFToApi,
} from './lib/ausfStorage'
import { migrateRecordUploads } from '../../lib/uploadedFileStore'
import {
  computeAgeFromIsoDate,
  deriveAusfJuratAffidavitFormType,
  applyDerivedJuratFormTypeIfApplicable,
  AUSF_JURAT_PRINT_TYPES,
} from './lib/ausfJuratRouting'
import ToastHost from '../../components/toast/ToastHost'
import { useToasts } from '../../components/toast/useToasts'
import { useDebouncedSuccessToast } from '../../hooks/useDebouncedSuccessToast'
import LcrRemarksFontSizeSelect from '../../components/lcr/LcrRemarksFontSizeSelect'
import { handleEnterFocusNextField } from '../../lib/formEnterFocusNext'
import { FormBodyFieldShortcuts } from '../../components/forms/FormBodyFieldShortcuts'

const RELATIONSHIP_OPTIONS = [
  { value: '', label: '—' },
  { value: 'MOTHER', label: 'MOTHER' },
  { value: 'GUARDIAN', label: 'GUARDIAN' },
  { value: 'UNCLE', label: 'UNCLE' },
  { value: 'AUNT', label: 'AUNT' },
  { value: 'BROTHER', label: 'BROTHER' },
  { value: 'SISTER', label: 'SISTER' },
  { value: 'NIECE', label: 'NIECE' },
  { value: 'NEPHEW', label: 'NEPHEW' },
  { value: 'SON', label: 'SON' },
  { value: 'DAUGHTER', label: 'DAUGHTER' },
  { value: 'MYSELF', label: 'MYSELF' },
]

const SEX_OPTIONS = [
  { value: 'MALE', label: 'MALE' },
  { value: 'FEMALE', label: 'FEMALE' },
]

function isEmpty(v) {
  return v == null || String(v).trim() === ''
}

function getRequiredFields(form) {
  const required = [
    { key: 'applicantName', label: 'Name (Applicant)' },
    { key: 'relationshipToChild', label: 'Relationship to the child' },
  ]
  if (form.formType === 'reg-ack' || form.formType === 'reg-ausf') {
    required.push(
      { key: 'ausfRegistryNo', label: 'AUSF Registry No.' },
      { key: 'ausfDateOfRegistration', label: 'AUSF Date of Registration' },
      { key: 'certificateIssuanceDate', label: 'Certificate Issuance Date' }
    )
    return required
  }
  if (form.formType === 'child-not-ack-transmittal' || form.formType === 'out-of-town') {
    required.push(
      { key: 'transmittalDate', label: 'Transmittal Date' },
      { key: 'recipientName', label: 'Recipient Name' },
      { key: 'recipientTitle', label: 'Recipient Title' },
      { key: 'recipientOffice', label: 'Recipient Office / Location' }
    )
    return required
  }
  if (form.formType !== 'reg-ack' && form.formType !== 'reg-ausf') {
    required.push(
      { key: 'birthRegisteredInIligan', label: 'Birth registered in Iligan' },
      { key: 'childAlreadyAcknowledged', label: 'Child already acknowledged by the father' }
    )
  }
  const showItems4to7 = form.childAlreadyAcknowledged === 'NO' || form.childAlreadyAcknowledged === 'YES' || form.formType === 'child-not-ack-transmittal' || form.formType === 'out-of-town'
  if (showItems4to7 && form.formType !== 'reg-ack' && form.formType !== 'reg-ausf') {
    required.push(
      { key: 'motherFirst', label: "Mother's first name" },
      { key: 'motherLast', label: "Mother's last name" },
      { key: 'fatherFirst', label: "Father's first name" },
      { key: 'fatherLast', label: "Father's last name" },
      { key: 'childFirst', label: "Child's first name" },
      { key: 'childLast', label: "Child's last name" },
      { key: 'dateOfBirth', label: 'Date of birth' },
      { key: 'sex', label: 'Sex' },
      { key: 'placeOfBirthAddress', label: 'Place of birth (address)' },
      { key: 'placeOfBirthCity', label: 'City/Municipality' },
      { key: 'placeOfBirthProvince', label: 'Province' },
      { key: 'colbRegistryNo', label: 'COLB Registry No.' },
      { key: 'colbDateOfRegistration', label: 'COLB Date of Registration' },
    )
  }
  return required
}

function getMissingFields(form) {
  return getRequiredFields(form).filter(({ key }) => isEmpty(form[key]))
}

const AUSF_TRANSMITTAL_FORM_TYPES = new Set(['child-not-ack-transmittal', 'out-of-town'])

export default function AUSFForm() {
  const [searchParams] = useSearchParams()
  const typeFromUrl = searchParams.get('type') || 'ausf'
  const navigate = useNavigate()
  const { toasts, show, dismiss } = useToasts()
  const notifyLcrCertSaved = useDebouncedSuccessToast(show)

  const [form, setForm] = useState(() => {
    const base = { ...defaultAUSF }
    if (typeFromUrl === 'ausf') base.formType = 'ausf-0-6'
    if (typeFromUrl === 'ausf-07-17') base.formType = 'ausf-07-17'
    if (typeFromUrl === 'reg-ausf') base.formType = 'reg-ausf'
    if (typeFromUrl === 'reg-ack') base.formType = 'reg-ack'
    if (typeFromUrl === 'child-ack') base.formType = 'child-ack'
    if (typeFromUrl === 'child-ack-lcr') base.formType = 'child-ack-lcr'
    if (typeFromUrl === 'child-not-ack') base.formType = 'child-not-ack'
    if (typeFromUrl === 'child-not-ack-lcr') base.formType = 'child-not-ack-lcr'
    if (typeFromUrl === 'child-not-ack-transmittal') base.formType = 'child-not-ack-transmittal'
    if (typeFromUrl === 'out-of-town') base.formType = 'out-of-town'
    return base
  })

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  useEffect(() => {
    const type = searchParams.get('type') || 'ausf'
    const editId = searchParams.get('id')
    const isEdit = searchParams.get('edit') === '1'
    if (isEdit && editId) {
      const draft = getAUSFDraft()
      if (draft) {
        const merged = mergeAUSFDraftData(draft)
        setForm(applyDerivedJuratFormTypeIfApplicable(merged))
      }
    } else {
      clearAUSFDraft()
      const formTypeMap = {
        'ausf': 'ausf-0-6',
        'ausf-07-17': 'ausf-07-17',
        'reg-ausf': 'reg-ausf',
        'reg-ack': 'reg-ack',
        'child-ack': 'child-ack',
        'child-ack-lcr': 'child-ack-lcr',
        'child-not-ack': 'child-not-ack',
        'child-not-ack-lcr': 'child-not-ack-lcr',
        'child-not-ack-transmittal': 'child-not-ack-transmittal',
        'out-of-town': 'out-of-town',
      }
      if (formTypeMap[type]) setForm((prev) => ({ ...prev, formType: formTypeMap[type] }))
    }
  }, [searchParams])

  const [dirtyBaselineTick, setDirtyBaselineTick] = useState(0)
  useEffect(() => {
    const id = setTimeout(() => setDirtyBaselineTick((x) => x + 1), 120)
    return () => clearTimeout(id)
  }, [searchParams])

  useEffect(() => {
    let mounted = true
    loadAUSFDraftFromApi()
      .then((draft) => {
        if (!mounted || !draft) return
        const isEdit = searchParams.get('edit') === '1'
        if (isEdit) {
          setForm((prev) =>
            applyDerivedJuratFormTypeIfApplicable(mergeAUSFDraftData({ ...prev, ...draft }))
          )
        }
      })
      .catch(() => { })
      .finally(() => {
        if (mounted) setTimeout(() => setDirtyBaselineTick((x) => x + 1), 120)
      })
    return () => {
      mounted = false
    }
  }, [searchParams])

  /** Keep jurat print type aligned: acknowledged → AUSF only; else age 0–6 → 0-6, age 7+ → 07-17 */
  useEffect(() => {
    if (!AUSF_JURAT_PRINT_TYPES.has(form.formType)) return
    const want = deriveAusfJuratAffidavitFormType(form)
    if (form.formType === want) return
    setForm((prev) => (AUSF_JURAT_PRINT_TYPES.has(prev.formType) ? { ...prev, formType: want } : prev))
  }, [form.childAlreadyAcknowledged, form.age, form.dateOfBirth, form.formType])

  /** Local transmittal vs out-of-town letter: single output on print when on a transmittal form type */
  useEffect(() => {
    if (form.childAlreadyAcknowledged !== 'NO') return
    if (!AUSF_TRANSMITTAL_FORM_TYPES.has(form.formType)) return
    const want = form.ausfTransmittalIsOutOfTown ? 'out-of-town' : 'child-not-ack-transmittal'
    if (form.formType === want) return
    setForm((prev) =>
      AUSF_TRANSMITTAL_FORM_TYPES.has(prev.formType) ? { ...prev, formType: want } : prev
    )
  }, [form.childAlreadyAcknowledged, form.formType, form.ausfTransmittalIsOutOfTown])

  const showItems4to7 = form.childAlreadyAcknowledged === 'NO' || form.childAlreadyAcknowledged === 'YES' || form.formType === 'child-not-ack-transmittal' || form.formType === 'out-of-town'
  const derivedJuratFormType = deriveAusfJuratAffidavitFormType(form)
  const isEditingSaved = searchParams.get('edit') === '1'

  const acknowledgeSaved = useWarnIfUnsaved(form, [searchParams.toString(), dirtyBaselineTick])

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [missingFields, setMissingFields] = useState([])

  const handleDoneClick = () => {
    const missing = getMissingFields(form)
    if (missing.length > 0) {
      setMissingFields(missing)
      setShowValidationModal(true)
      return
    }
    setShowConfirmModal(true)
  }
  const handleConfirmDone = async () => {
    const editId = String(searchParams.get('id') || '').trim()
    const draftSavedId = String(form?._savedAUSFId || '').trim()
    const isEdit = searchParams.get('edit') === '1'
    const effectiveEditId = editId || draftSavedId
    const draftPayload = { ...form, _savedAUSFId: effectiveEditId || draftSavedId || '' }
    saveAUSFDraft(draftPayload)
    let finalSavedId = effectiveEditId
    try {
      await saveAUSFDraftToApi(draftPayload)
      if (isEdit && effectiveEditId) {
        const nextId = await updateSavedAUSFToApi(effectiveEditId, draftPayload)
        if (nextId) {
          finalSavedId = String(nextId).trim()
        }
      } else {
        const createdId = await addSavedAUSFToApi(draftPayload)
        if (createdId) finalSavedId = String(createdId).trim()
      }
    } catch {
      if (isEdit && effectiveEditId) {
        const updated = updateSavedAUSF(effectiveEditId, draftPayload)
        if (updated) {
          finalSavedId = effectiveEditId
        } else {
          const createdId = addSavedAUSF(draftPayload)
          if (createdId) finalSavedId = String(createdId).trim()
        }
      } else {
        const createdId = addSavedAUSF(draftPayload)
        if (createdId) finalSavedId = String(createdId).trim()
      }
    }
    /** Print uses keys ausf:(record id):(type); uploads before first save use record id "draft". */
    if (finalSavedId) {
      if (!isEdit) {
        migrateRecordUploads('ausf', 'draft', finalSavedId)
      } else if (effectiveEditId && effectiveEditId !== finalSavedId) {
        migrateRecordUploads('ausf', effectiveEditId, finalSavedId)
      }
    }
    setShowConfirmModal(false)
    const printPath = finalSavedId ? `/ausf/print?id=${encodeURIComponent(finalSavedId)}` : '/ausf/print'
    afterUnsavedAcknowledge(acknowledgeSaved, () => navigate(printPath))
  }
  const handleCancelModal = () => setShowConfirmModal(false)

  let sectionIndex = 0
  const sectionDelay = (i) => ({ animationDelay: `${i * 0.06}s` })

  return (
    <div className="ausf-form-page no-print">
      <div className="ausf-form-page__card">
        <header className="ausf-form-page__header no-print">
          <h1>RA 9255 Automated Data Entry Form</h1>
          <p>Unified Legal Status Automated Data Entry System — Iligan City</p>
        </header>

        <FormBodyFieldShortcuts className="ausf-form-page__body" onKeyDown={handleEnterFocusNextField}>
          <div className="ausf-form-page__section" style={sectionDelay(sectionIndex++)}>
            <FormSection number={1} title="DETAILS OF APPLICANT/CLIENT">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput label="NAME" id="applicantName" value={form.applicantName} onChange={(v) => update('applicantName', v)} />
                <FormSelect
                  label="RELATIONSHIP TO THE CHILD"
                  id="relationship"
                  value={form.relationshipToChild}
                  onChange={update.bind(null, 'relationshipToChild')}
                  options={RELATIONSHIP_OPTIONS}
                />
              </div>
            </FormSection>
          </div>

          {(form.formType === 'reg-ack' || form.formType === 'reg-ausf') && (
            <div className="ausf-form-page__section" style={sectionDelay(sectionIndex++)}>
              <FormSection noNumber title="CERTIFICATE OF REGISTRATION DETAILS">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <FormInput label="AUSF REGISTRY NO." id="ausfRegistryNo" value={form.ausfRegistryNo} onChange={(v) => update('ausfRegistryNo', v)} />
                  <FormFlexibleDateInput label="AUSF DATE OF REGISTRATION" id="ausfDateOfRegistration" value={form.ausfDateOfRegistration} onChange={(v) => update('ausfDateOfRegistration', v)} />
                  <FormFlexibleDateInput label="CERTIFICATE ISSUANCE DATE" id="certificateIssuanceDate" value={form.certificateIssuanceDate} onChange={(v) => update('certificateIssuanceDate', v)} />
                </div>
              </FormSection>
            </div>
          )}

          {(form.formType === 'child-not-ack-transmittal' || form.formType === 'out-of-town') && (
            <div className="ausf-form-page__section" style={sectionDelay(sectionIndex++)}>
              <FormSection noNumber title="TRANSMITTAL DETAILS">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormFlexibleDateInput label="TRANSMITTAL DATE" id="transmittalDate" value={form.transmittalDate} onChange={(v) => update('transmittalDate', v)} />
                  <FormInput label="RECIPIENT NAME" id="recipientName" value={form.recipientName} onChange={(v) => update('recipientName', v)} />
                  <FormInput label="RECIPIENT TITLE" id="recipientTitle" value={form.recipientTitle} onChange={(v) => update('recipientTitle', v)} />
                  <FormInput label="RECIPIENT OFFICE / LOCATION" id="recipientOffice" value={form.recipientOffice} onChange={(v) => update('recipientOffice', v)} />
                  <FormInput label="SIGNATORY NAME (optional)" id="transmittalSignatoryName" value={form.transmittalSignatoryName} onChange={(v) => update('transmittalSignatoryName', v)} placeholder="Leave blank for default" />
                </div>
              </FormSection>
            </div>
          )}

          {form.formType !== 'reg-ack' && form.formType !== 'reg-ausf' && (
            <>
              <div className="ausf-form-page__section" style={sectionDelay(sectionIndex++)}>
                <FormSection number={2} title="BIRTH OF CHILD REGISTERED IN ILIGAN">
                  <div className="flex flex-wrap items-start gap-4">
                    <FormRadioGroup
                      name="birthIligan"
                      value={form.birthRegisteredInIligan}
                      onChange={(v) => update('birthRegisteredInIligan', v)}
                      options={[{ value: 'YES', label: 'YES' }, { value: 'NO', label: 'NO' }]}
                    />
                    {form.birthRegisteredInIligan === 'NO' && (
                      <div className="ausf-form-page__instruction ausf-form-page__instruction--muted">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Note: Don&apos;t register AUSF &amp; Acknowledgement and Don&apos;t prepare Form 1A
                      </div>
                    )}
                  </div>
                </FormSection>
              </div>

              <div className="ausf-form-page__section" style={sectionDelay(sectionIndex++)}>
                <FormSection number={3} title="CHILD ALREADY ACKNOWLEDGED BY THE FATHER?">
                  <div className="flex flex-wrap items-start gap-4">
                    <FormRadioGroup
                      name="acknowledged"
                      value={form.childAlreadyAcknowledged}
                      onChange={(v) => update('childAlreadyAcknowledged', v)}
                      options={[{ value: 'YES', label: 'YES' }, { value: 'NO', label: 'NO' }]}
                    />
                    {form.childAlreadyAcknowledged === 'NO' && (
                      <div className="ausf-form-page__instruction ausf-form-page__instruction--muted">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Instruction: Fill-up Items 4–7
                      </div>
                    )}
                  </div>
                </FormSection>
              </div>

              {form.childAlreadyAcknowledged === 'NO' && (
                <div className="ausf-form-page__section" style={sectionDelay(sectionIndex++)}>
                  <FormSection noNumber title="TRANSMITTAL TYPE (LOCAL OR OUT-OF-TOWN)">
                    <p className="text-sm text-gray-600 mb-3 max-w-2xl">
                      Only one transmittal letter appears on the print page: choose local (Iligan) transmittal or the out-of-town transmittal. This does not change LCR views.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => update('ausfTransmittalIsOutOfTown', false)}
                        className={`min-h-[2.75rem] px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-colors ${!form.ausfTransmittalIsOutOfTown
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                          }`}
                      >
                        Local — Transmittal only
                      </button>
                      <button
                        type="button"
                        onClick={() => update('ausfTransmittalIsOutOfTown', true)}
                        className={`min-h-[2.75rem] px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-colors ${form.ausfTransmittalIsOutOfTown
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                          }`}
                      >
                        Out of town — Out-of-Town Transmittal only
                      </button>
                    </div>
                  </FormSection>
                </div>
              )}
            </>
          )}

          {showItems4to7 && form.formType !== 'reg-ack' && form.formType !== 'reg-ausf' && (
            <>
              <div className="ausf-form-page__section" style={sectionDelay(sectionIndex++)}>
                <FormSection number={4} title="DETAILS OF THE CHILD">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">MOTHER&apos;S MAIDEN NAME</p>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <FormInput label="FIRST NAME" labelBelow id="motherFirst" value={form.motherFirst} onChange={(v) => update('motherFirst', v)} />
                        <FormInput label="MIDDLE NAME" labelBelow id="motherMiddle" value={form.motherMiddle} onChange={(v) => update('motherMiddle', v)} />
                        <FormInput label="LAST NAME" labelBelow id="motherLast" value={form.motherLast} onChange={(v) => update('motherLast', v)} />
                      </div>
                      <div className="mt-2 max-w-xs">
                        <FormInput label="CITIZENSHIP" id="motherCitizenship" value={form.motherCitizenship} onChange={(v) => update('motherCitizenship', v)} />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">FATHER&apos;S NAME</p>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <FormInput label="FIRST NAME" labelBelow id="fatherFirst" value={form.fatherFirst} onChange={(v) => update('fatherFirst', v)} />
                        <FormInput label="MIDDLE NAME" labelBelow id="fatherMiddle" value={form.fatherMiddle} onChange={(v) => update('fatherMiddle', v)} />
                        <FormInput label="LAST NAME" labelBelow id="fatherLast" value={form.fatherLast} onChange={(v) => update('fatherLast', v)} />
                      </div>
                      <div className="mt-2 max-w-xs">
                        <FormInput label="CITIZENSHIP" id="fatherCitizenship" value={form.fatherCitizenship} onChange={(v) => update('fatherCitizenship', v)} />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">NAME OF CHILD</p>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <FormInput label="FIRST NAME" labelBelow id="childFirst" value={form.childFirst} onChange={(v) => update('childFirst', v)} />
                        <FormInput label="MIDDLE NAME" labelBelow id="childMiddle" value={form.childMiddle} onChange={(v) => update('childMiddle', v)} />
                        <FormInput label="LAST NAME" labelBelow id="childLast" value={form.childLast} onChange={(v) => update('childLast', v)} />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <FormFlexibleDateInput
                        label="DATE OF BIRTH"
                        id="dob"
                        value={form.dateOfBirth}
                        onChange={(v) => {
                          const nextDob = String(v || '')
                          setForm((prev) => ({
                            ...prev,
                            dateOfBirth: nextDob,
                            age: computeAgeFromIsoDate(nextDob),
                          }))
                        }}
                      />
                      <div>
                        <FormInput label="AGE" id="age" type="number" value={form.age} onChange={(v) => update('age', v)} />
                        {form.childAlreadyAcknowledged === 'NO' &&
                          AUSF_JURAT_PRINT_TYPES.has(form.formType) &&
                          form.formType !== 'ausf-only' && (
                            <p className="ausf-form-page__note text-sm text-gray-600 mt-1">
                              NOTE: USE {derivedJuratFormType === 'ausf-0-6' ? 'AUSF 0-6' : 'AUSF 07-17'}
                            </p>
                          )}
                      </div>
                      <FormSelect label="SEX" id="sex" value={form.sex} onChange={update.bind(null, 'sex')} options={SEX_OPTIONS.map((o) => ({ value: o.value, label: o.label }))} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">PLACE OF BIRTH</p>
                      <FormInput
                        label="HOUSE NO./HOSPITAL/CLINIC/STREET/PUROK/BRGY"
                        id="placeAddress"
                        value={form.placeOfBirthAddress}
                        onChange={(v) => update('placeOfBirthAddress', v)}
                        className="mb-3"
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <FormInput label="CITY/MUNICIPALITY" id="placeCity" value={form.placeOfBirthCity} onChange={(v) => update('placeOfBirthCity', v)} />
                        <FormInput label="PROVINCE" id="placeProvince" value={form.placeOfBirthProvince} onChange={(v) => update('placeOfBirthProvince', v)} />
                      </div>
                    </div>
                  </div>
                </FormSection>
              </div>

              <div className="ausf-form-page__section" style={sectionDelay(sectionIndex++)}>
                <FormSection number={5} title="DETAILS OF REGISTERED COLB">
                  <div className="ausf-form-page__colb-grid">
                    <div className="ausf-form-page__colb-row grid gap-4 sm:grid-cols-2">
                      <FormInput label="REGISTRY NO." id="colbRegistry" value={form.colbRegistryNo} onChange={(v) => update('colbRegistryNo', v)} placeholder="e.g. 2023-2.146" />
                      <FormFlexibleDateInput label="DATE OF REGISTRATION" id="colbDate" value={form.colbDateOfRegistration} onChange={(v) => update('colbDateOfRegistration', v)} />
                    </div>
                    <div className="ausf-form-page__colb-row ausf-form-page__colb-row--second grid gap-4 sm:grid-cols-2">
                      <FormInput label="PAGE NUMBER" id="colbPage" value={form.colbPageNumber} onChange={(v) => update('colbPageNumber', v)} />
                      <FormInput label="BOOK NUMBER" id="colbBook" value={form.colbBookNumber} onChange={(v) => update('colbBookNumber', v)} />
                    </div>
                    <div className="ausf-form-page__colb-row">
                      <FormInput
                        label="LCR FORM — PARTY REQUESTING CERTIFICATION (printed in bold)"
                        id="lcrCertificationRequestParty"
                        value={form.lcrCertificationRequestParty}
                        onChange={(v) => {
                          update('lcrCertificationRequestParty', v)
                          notifyLcrCertSaved()
                        }}
                        placeholder="OCRG/OWNER/PARENTS/GUARDIAN"
                      />
                      <p className="text-xs text-gray-500 mt-1.5">Shown after “This certification is issued upon the request of …” on LCR Form 1A / A1.</p>
                    </div>
                    <div className="ausf-form-page__colb-row sm:col-span-2">
                      <LcrRemarksFontSizeSelect
                        id="ausf-lcr-remarks-font"
                        value={form.lcrRemarksFontSizePt}
                        onChange={(v) => update('lcrRemarksFontSizePt', v)}
                        helpText="Controls how large the REMARKS paragraph prints on LCR 1A and A1."
                      />
                    </div>
                  </div>
                </FormSection>
              </div>

              <div className="ausf-form-page__section" style={sectionDelay(sectionIndex++)}>
                <FormSection number={6} title="DETAILS OF AFFIDAVIT TO USE THE SURNAME OF FATHER">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput label="REGISTRY NO." id="ausfRegistry" value={form.ausfRegistryNo} onChange={(v) => update('ausfRegistryNo', v)} />
                    <FormFlexibleDateInput label="DATE OF REGISTRATION" id="ausfDate" value={form.ausfDateOfRegistration} onChange={(v) => update('ausfDateOfRegistration', v)} />
                  </div>
                </FormSection>
              </div>

              <div className="ausf-form-page__section" style={sectionDelay(sectionIndex++)}>
                <FormSection number={7} title="DETAILS OF AFFIDAVIT OF ACKNOWLEDGEMENT">
                  {form.childAlreadyAcknowledged === 'YES' ? (
                    <div className="p-3 rounded-lg bg-gray-100 border border-gray-200 text-gray-600 text-sm">
                      Not applicable — child is already acknowledged by the father. This section is left blank.
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormInput label="REGISTRY NO." id="ackRegistry" value={form.ackRegistryNo} onChange={(v) => update('ackRegistryNo', v)} />
                      <FormFlexibleDateInput label="DATE OF REGISTRATION" id="ackDate" value={form.ackDateOfRegistration} onChange={(v) => update('ackDateOfRegistration', v)} />
                    </div>
                  )}
                </FormSection>
              </div>
            </>
          )}

          <div className="ausf-form-page__actions no-print">
            <button
              type="button"
              onClick={handleDoneClick}
              className="ausf-form-page__btn ausf-form-page__btn--primary"
            >
              Done
            </button>
            {isEditingSaved ? (
              <button
                type="button"
                onClick={() => navigate('/ausf/saved')}
                className="ausf-form-page__btn ausf-form-page__btn--secondary"
              >
                Back to Files Saved
              </button>
            ) : (
              <a
              >

              </a>
            )}
          </div>

          {showValidationModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 ausf-form-page__modal-backdrop ausf-form-page__validation-backdrop no-print"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="validation-modal-title"
              aria-describedby="validation-modal-desc"
              onClick={() => setShowValidationModal(false)}
            >
              <div
                className="ausf-form-page__validation-modal ausf-form-page__modal-dialog no-print"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="ausf-form-page__validation-modal-strip" aria-hidden />
                <div className="ausf-form-page__validation-modal-body">
                  <div className="ausf-form-page__validation-modal-icon" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      <path d="M12 16h.01" strokeWidth="2.5" />
                    </svg>
                  </div>
                  <div className="ausf-form-page__validation-modal-content">
                    <h2 id="validation-modal-title" className="ausf-form-page__validation-modal-title">
                      All required fields must be filled out
                    </h2>
                    <p id="validation-modal-desc" className="ausf-form-page__validation-modal-desc">
                      You cannot proceed until every required field is completed. Please review and fill in the items below.
                    </p>
                    {missingFields.length > 0 && (
                      <div className="ausf-form-page__validation-modal-list-wrap">
                        <p className="ausf-form-page__validation-modal-list-label">Missing ({missingFields.length}):</p>
                        <ul className="ausf-form-page__validation-modal-list">
                          {missingFields.map(({ label }) => (
                            <li key={label}>{label}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="ausf-form-page__validation-modal-actions">
                      <button
                        type="button"
                        onClick={() => setShowValidationModal(false)}
                        className="ausf-form-page__validation-modal-btn"
                      >
                        Got it
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showConfirmModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 ausf-form-page__modal-backdrop no-print" role="dialog" aria-modal="true" aria-labelledby="confirm-done-title">
              <div className="ausf-form-page__modal-dialog bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 border border-gray-100">
                <h2 id="confirm-done-title" className="text-lg font-semibold text-gray-800 mb-2">Complete form?</h2>
                <p className="text-sm text-gray-600 mb-6">Your entries will be saved and you can view and print the document. Continue?</p>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={handleCancelModal}
                    className="ausf-form-page__btn ausf-form-page__btn--secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDone}
                    className="ausf-form-page__btn ausf-form-page__btn--primary"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

          <p className="ausf-form-page__footer-note no-print">created by: ATTY. YUSSIF DON JUSTINE F. MARTIL</p>
        </FormBodyFieldShortcuts>
      </div>
      <ToastHost toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
