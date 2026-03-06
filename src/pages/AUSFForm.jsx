import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import FormSection from '../components/FormSection'
import { FormInput, FormSelect, FormRadioGroup } from '../components/FormField'
import { defaultAUSF } from '../lib/ausfDefaults'
import { saveAUSFDraft, addSavedAUSF } from '../lib/ausfStorage'

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
  }, [searchParams])

  const showItems4to7 = form.childAlreadyAcknowledged === 'NO' || form.formType === 'child-not-ack-transmittal' || form.formType === 'out-of-town'
  const isAUSF06 = form.formType === 'ausf-0-6' || form.formType === 'ausf-07-17'

  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const handleDoneClick = () => setShowConfirmModal(true)
  const handleConfirmDone = () => {
    saveAUSFDraft(form)
    addSavedAUSF(form)
    setShowConfirmModal(false)
    navigate('/ausf/print')
  }
  const handleCancelModal = () => setShowConfirmModal(false)

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-red-600 text-white text-center py-3 px-4 rounded-t-xl no-print">
        <h1 className="font-bold text-base uppercase">RA 9255 AUTOMATED DATA ENTRY FORM</h1>
        <p className="text-sm text-white/80 mt-0.5">Unified Legal Status Automated Data Entry System — Iligan City</p>
      </div>

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
          <FormSelect
            label="CIVIL STATUS"
            id="civilStatus"
            value={form.civilStatus}
            onChange={update.bind(null, 'civilStatus')}
            options={[{ value: 'single', label: 'Single' }, { value: 'married', label: 'Married' }]}
          />
        </div>
      </FormSection>

      {(form.formType === 'reg-ack' || form.formType === 'reg-ausf') && (
        <FormSection noNumber title="CERTIFICATE OF REGISTRATION DETAILS">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormInput label="AUSF REGISTRY NO." id="ausfRegistryNo" value={form.ausfRegistryNo} onChange={(v) => update('ausfRegistryNo', v)} />
            <FormInput label="AUSF DATE OF REGISTRATION" id="ausfDateOfRegistration" type="date" value={form.ausfDateOfRegistration} onChange={(v) => update('ausfDateOfRegistration', v)} />
            <FormInput label="CERTIFICATE ISSUANCE DATE" id="certificateIssuanceDate" type="date" value={form.certificateIssuanceDate} onChange={(v) => update('certificateIssuanceDate', v)} />
          </div>
        </FormSection>
      )}

      {(form.formType === 'child-not-ack-transmittal' || form.formType === 'out-of-town') && (
        <FormSection noNumber title="TRANSMITTAL DETAILS">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput label="TRANSMITTAL DATE" id="transmittalDate" type="date" value={form.transmittalDate} onChange={(v) => update('transmittalDate', v)} />
            <FormInput label="RECIPIENT NAME" id="recipientName" value={form.recipientName} onChange={(v) => update('recipientName', v)} />
            <FormInput label="RECIPIENT TITLE" id="recipientTitle" value={form.recipientTitle} onChange={(v) => update('recipientTitle', v)} />
            <FormInput label="RECIPIENT OFFICE / LOCATION" id="recipientOffice" value={form.recipientOffice} onChange={(v) => update('recipientOffice', v)} />
            <FormInput label="SIGNATORY NAME (optional)" id="transmittalSignatoryName" value={form.transmittalSignatoryName} onChange={(v) => update('transmittalSignatoryName', v)} placeholder="Leave blank for default" />
          </div>
        </FormSection>
      )}

      {form.formType !== 'reg-ack' && form.formType !== 'reg-ausf' && (
        <>
      <FormSection number={2} title="BIRTH OF CHILD REGISTERED IN ILIGAN">
        <FormRadioGroup
          name="birthIligan"
          value={form.birthRegisteredInIligan}
          onChange={(v) => update('birthRegisteredInIligan', v)}
          options={[{ value: 'YES', label: 'YES' }, { value: 'NO', label: 'NO' }]}
        />
      </FormSection>

      <FormSection number={3} title="CHILD ALREADY ACKNOWLEDGED BY THE FATHER?">
        <div className="flex flex-wrap items-start gap-4">
          <FormRadioGroup
            name="acknowledged"
            value={form.childAlreadyAcknowledged}
            onChange={(v) => update('childAlreadyAcknowledged', v)}
            options={[{ value: 'YES', label: 'YES' }, { value: 'NO', label: 'NO' }]}
          />
          {form.childAlreadyAcknowledged === 'NO' && (
            <div className="border-2 border-red-500 bg-red-50 text-red-800 text-sm font-medium px-3 py-2 rounded-lg">
              Instruction: Fill-up Items 4-7
            </div>
          )}
        </div>
      </FormSection>
        </>
      )}

      {showItems4to7 && form.formType !== 'reg-ack' && form.formType !== 'reg-ausf' && (
        <>
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
                    <p className="text-sm text-red-600 font-medium mt-1">NOTE: USE AUSF 0-6</p>
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

          <FormSection number={5} title="DETAILS OF REGISTERED COLB">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FormInput label="REGISTRY NO." id="colbRegistry" value={form.colbRegistryNo} onChange={(v) => update('colbRegistryNo', v)} />
              <FormInput label="DATE OF REGISTRATION" id="colbDate" type="date" value={form.colbDateOfRegistration} onChange={(v) => update('colbDateOfRegistration', v)} />
              <FormInput label="PAGE NUMBER" id="colbPage" value={form.colbPageNumber} onChange={(v) => update('colbPageNumber', v)} />
              <FormInput label="BOOK NUMBER" id="colbBook" value={form.colbBookNumber} onChange={(v) => update('colbBookNumber', v)} />
            </div>
          </FormSection>

          <FormSection number={6} title="DETAILS OF AFFIDAVIT TO USE THE SURNAME OF FATHER">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput label="REGISTRY NO." id="ausfRegistry" value={form.ausfRegistryNo} onChange={(v) => update('ausfRegistryNo', v)} />
              <FormInput label="DATE OF REGISTRATION" id="ausfDate" type="date" value={form.ausfDateOfRegistration} onChange={(v) => update('ausfDateOfRegistration', v)} />
            </div>
          </FormSection>

          <FormSection number={7} title="DETAILS OF AFFIDAVIT OF ACKNOWLEDGEMENT">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput label="REGISTRY NO." id="ackRegistry" value={form.ackRegistryNo} onChange={(v) => update('ackRegistryNo', v)} />
              <FormInput label="DATE OF REGISTRATION" id="ackDate" type="date" value={form.ackDateOfRegistration} onChange={(v) => update('ackDateOfRegistration', v)} />
            </div>
          </FormSection>
        </>
      )}

      <div className="flex flex-wrap gap-4 mt-6 no-print">
        <button
          type="button"
          onClick={handleDoneClick}
          className="px-6 py-2.5 bg-[var(--primary-blue)] text-white font-medium rounded-lg hover:bg-[var(--primary-blue-light)] transition"
        >
          Done
        </button>
        <a
          href="/ausf"
          className="px-6 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition inline-block"
        >
          Clear / New
        </a>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 no-print" role="dialog" aria-modal="true" aria-labelledby="confirm-done-title">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h2 id="confirm-done-title" className="text-lg font-semibold text-gray-800 mb-2">Complete form?</h2>
            <p className="text-sm text-gray-600 mb-6">Your entries will be saved and you can view and print the document. Continue?</p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleCancelModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDone}
                className="px-4 py-2 bg-[var(--primary-blue)] text-white font-medium rounded-lg hover:bg-[var(--primary-blue-light)] transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-6 no-print">created by: ATTY. YUSSIF DON JUSTINE F. MARTIL</p>
    </div>
  )
}
