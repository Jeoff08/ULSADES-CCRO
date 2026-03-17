import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import FormSection from '../../components/FormSection'
import { FormInput, FormSelect, FormRadioGroup } from '../../components/FormField'
import { defaultAUSF } from './lib/ausfDefaults'
import { saveAUSFDraft, getAUSFDraft, clearAUSFDraft, addSavedAUSF, updateSavedAUSF } from './lib/ausfStorage'

const RELATIONSHIP_OPTIONS = [
  { value: '', label: '—' },
  { value: 'SON', label: 'SON' },
  { value: 'DAUGHTER', label: 'DAUGHTER' },
  { value: 'FATHER', label: 'FATHER' },
  { value: 'MOTHER', label: 'MOTHER' },
  { value: 'GUARDIAN', label: 'GUARDIAN' },
  { value: 'OTHER', label: 'OTHER' },
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
  const showItems4to7 = form.childAlreadyAcknowledged === 'NO' || form.childAlreadyAcknowledged === 'YES' || form.formType === 'child-not-ack-transmittal' || form.formType === 'out-of-town' || form.formType === 'child-ack-annotation'
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
      { key: 'ausfRegistryNo', label: 'AUSF Registry No. (Item 6)' },
      { key: 'ausfDateOfRegistration', label: 'AUSF Date of Registration (Item 6)' }
    )
    if (form.childAlreadyAcknowledged === 'NO') {
      required.push(
        { key: 'ackRegistryNo', label: 'Acknowledgement Registry No.' },
        { key: 'ackDateOfRegistration', label: 'Acknowledgement Date of Registration' }
      )
    }
  }
  return required
}

function getMissingFields(form) {
  return getRequiredFields(form).filter(({ key }) => isEmpty(form[key]))
}

export default function AUSFForm() {
  const [searchParams] = useSearchParams()
  const typeFromUrl = searchParams.get('type') || 'ausf'
  const navigate = useNavigate()

  const [form, setForm] = useState(() => {
    const base = { ...defaultAUSF }
    if (typeFromUrl === 'ausf') base.formType = 'ausf-0-6'
    if (typeFromUrl === 'ausf-07-17') base.formType = 'ausf-07-17'
    if (typeFromUrl === 'reg-ausf') base.formType = 'reg-ausf'
    if (typeFromUrl === 'reg-ack') base.formType = 'reg-ack'
    if (typeFromUrl === 'child-ack') base.formType = 'child-ack'
    if (typeFromUrl === 'child-ack-lcr') base.formType = 'child-ack-lcr'
    if (typeFromUrl === 'child-ack-annotation') base.formType = 'child-ack-annotation'
    if (typeFromUrl === 'child-not-ack') base.formType = 'child-not-ack'
    if (typeFromUrl === 'child-not-ack-lcr') base.formType = 'child-not-ack-lcr'
    if (typeFromUrl === 'child-not-ack-annotation') base.formType = 'child-not-ack-annotation'
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
      if (draft) setForm(draft)
    } else {
      clearAUSFDraft()
      const formTypeMap = {
        'ausf': 'ausf-0-6',
        'ausf-07-17': 'ausf-07-17',
        'reg-ausf': 'reg-ausf',
        'reg-ack': 'reg-ack',
        'child-ack': 'child-ack',
        'child-ack-lcr': 'child-ack-lcr',
        'child-ack-annotation': 'child-ack-annotation',
        'child-not-ack': 'child-not-ack',
        'child-not-ack-lcr': 'child-not-ack-lcr',
        'child-not-ack-annotation': 'child-not-ack-annotation',
        'child-not-ack-transmittal': 'child-not-ack-transmittal',
        'out-of-town': 'out-of-town',
      }
      if (formTypeMap[type]) setForm((prev) => ({ ...prev, formType: formTypeMap[type] }))
    }
  }, [searchParams])

  const showItems4to7 = form.childAlreadyAcknowledged === 'NO' || form.childAlreadyAcknowledged === 'YES' || form.formType === 'child-not-ack-transmittal' || form.formType === 'out-of-town' || form.formType === 'child-ack-annotation'
  const isAUSF06 = form.formType === 'ausf-0-6' || form.formType === 'ausf-07-17'

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
  const handleConfirmDone = () => {
    const editId = searchParams.get('id')
    const isEdit = searchParams.get('edit') === '1'
    saveAUSFDraft(form)
    if (isEdit && editId) {
      updateSavedAUSF(editId, form)
    } else {
      addSavedAUSF(form)
    }
    setShowConfirmModal(false)
    navigate('/ausf/print')
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

        <div className="ausf-form-page__body">
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
            <FormInput label="AUSF DATE OF REGISTRATION" id="ausfDateOfRegistration" type="date" value={form.ausfDateOfRegistration} onChange={(v) => update('ausfDateOfRegistration', v)} />
            <FormInput label="CERTIFICATE ISSUANCE DATE" id="certificateIssuanceDate" type="date" value={form.certificateIssuanceDate} onChange={(v) => update('certificateIssuanceDate', v)} />
          </div>
        </FormSection>
        </div>
      )}

      {(form.formType === 'child-not-ack-transmittal' || form.formType === 'out-of-town') && (
        <div className="ausf-form-page__section" style={sectionDelay(sectionIndex++)}>
        <FormSection noNumber title="TRANSMITTAL DETAILS">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput label="TRANSMITTAL DATE" id="transmittalDate" type="date" value={form.transmittalDate} onChange={(v) => update('transmittalDate', v)} />
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
        <FormRadioGroup
          name="birthIligan"
          value={form.birthRegisteredInIligan}
          onChange={(v) => update('birthRegisteredInIligan', v)}
          options={[{ value: 'YES', label: 'YES' }, { value: 'NO', label: 'NO' }]}
        />
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
                <FormInput label="DATE OF BIRTH" id="dob" type="date" value={form.dateOfBirth} onChange={(v) => update('dateOfBirth', v)} />
                <div>
                  <FormInput label="AGE" id="age" type="number" value={form.age} onChange={(v) => update('age', v)} />
                  {isAUSF06 && (
                    <p className="ausf-form-page__note text-sm text-gray-600 mt-1">NOTE: USE AUSF 0-6</p>
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
                <FormInput label="DATE OF REGISTRATION" id="colbDate" type="date" value={form.colbDateOfRegistration} onChange={(v) => update('colbDateOfRegistration', v)} />
              </div>
              <div className="ausf-form-page__colb-row ausf-form-page__colb-row--second grid gap-4 sm:grid-cols-2">
                <FormInput label="PAGE NUMBER" id="colbPage" value={form.colbPageNumber} onChange={(v) => update('colbPageNumber', v)} />
                <FormInput label="BOOK NUMBER" id="colbBook" value={form.colbBookNumber} onChange={(v) => update('colbBookNumber', v)} />
              </div>
            </div>
          </FormSection>
          </div>

          <div className="ausf-form-page__section" style={sectionDelay(sectionIndex++)}>
          <FormSection number={6} title="DETAILS OF AFFIDAVIT TO USE THE SURNAME OF FATHER">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput label="REGISTRY NO." id="ausfRegistry" value={form.ausfRegistryNo} onChange={(v) => update('ausfRegistryNo', v)} />
              <FormInput label="DATE OF REGISTRATION" id="ausfDate" type="date" value={form.ausfDateOfRegistration} onChange={(v) => update('ausfDateOfRegistration', v)} />
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
                <FormInput label="DATE OF REGISTRATION" id="ackDate" type="date" value={form.ackDateOfRegistration} onChange={(v) => update('ackDateOfRegistration', v)} />
              </div>
            )}
          </FormSection>
          </div>
        </>
      )}

      {form.formType === 'child-ack-annotation' && (
        <div className="ausf-form-page__section" style={sectionDelay(sectionIndex++)}>
        <FormSection noNumber title="ANNOTATION (CHILD ACKNOWLEDGED) — ATTACH SCAN &amp; EDIT">
          <p className="text-sm text-gray-600 mb-3">Attach a scan copy of the COLB office file. The white REMARKS/ANNOTATION section will show this annotation when the child is acknowledged.</p>
          <div className="space-y-4">
            <div>
              <label htmlFor="colb-scan" className="block text-sm font-medium text-gray-700 mb-1">Scan copy of COLB office file</label>
              <input
                id="colb-scan"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = () => update('colbScanDataUrl', reader.result)
                  reader.readAsDataURL(file)
                }}
                className="ausf-form-page__file-input block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-800 file:border file:border-gray-300 file:font-medium"
              />
              {form.colbScanDataUrl && (
                <p className="mt-1 text-xs text-green-600">File attached. Preview will appear in print view.</p>
              )}
            </div>
            <div>
              <label htmlFor="annotation-text" className="block text-sm font-medium text-gray-700 mb-1">Edit annotation</label>
              <textarea
                id="annotation-text"
                value={form.annotationChildAckText}
                onChange={(e) => update('annotationChildAckText', e.target.value)}
                placeholder='"The child shall be known as [FULL NAME] pursuant to R.A. 9255"'
                rows={4}
                className="form-field__input w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-gray-50 transition-colors duration-150"
              />
            </div>
          </div>
        </FormSection>
        </div>
      )}

      <div className="ausf-form-page__actions no-print">
        <button
          type="button"
          onClick={handleDoneClick}
          className="ausf-form-page__btn ausf-form-page__btn--primary"
        >
          Done
        </button>
        <a
          href="/ausf"
          className="ausf-form-page__btn ausf-form-page__btn--secondary no-underline"
        >
          Clear / New
        </a>
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
        </div>
      </div>
    </div>
  )
}
