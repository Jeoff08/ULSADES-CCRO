import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { defaultLegitimation } from '../../lib/legitimationDefaults'
import { addSavedLegitimation, getLegitimationDraft, updateSavedLegitimation } from '../../lib/legitimationStorage'
import { LEGITIMATION_TYPES } from './constants'

const inputClass = 'w-full border border-orange-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-orange-100 focus:border-[var(--primary-blue)] focus:ring-2 focus:ring-[var(--primary-blue)]/20'

function LegitimationSection({ number, title, children, instruction }) {
  return (
    <div className="mb-4 rounded-lg overflow-hidden border border-gray-200 bg-white">
      <div className="bg-[var(--primary-blue)] text-white px-4 py-2.5 font-semibold text-sm uppercase">
        {number} {title}
      </div>
      {instruction && (
        <div className="bg-amber-100 text-amber-900 px-4 py-1.5 text-xs font-medium">
          Instruction: {instruction}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}

export default function LegitimationForm() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const typeFromUrl = searchParams.get('type') || 'joint-affidavit'
  const [showConfirm, setShowConfirm] = useState(false)

  const [form, setForm] = useState(() => {
    const draft = getLegitimationDraft()
    if (draft && typeof draft === 'object') {
      return { ...defaultLegitimation, ...draft, formType: draft.formType || typeFromUrl || 'joint-affidavit' }
    }
    return {
      ...defaultLegitimation,
      formType: LEGITIMATION_TYPES.find(t => t.id === typeFromUrl)?.id || typeFromUrl || 'joint-affidavit',
    }
  })

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const proceedToPrint = () => {
    const editId = searchParams.get('id')
    const isEdit = searchParams.get('edit') === '1'
    if (isEdit && editId) {
      updateSavedLegitimation(editId, form)
    } else {
      addSavedLegitimation(form)
    }
    navigate(`/legitimation/print?type=${form.formType}`)
  }

  useEffect(() => {
    const type = searchParams.get('type')
    if (type && LEGITIMATION_TYPES.some(t => t.id === type)) {
      setForm((prev) => ({ ...prev, formType: type }))
    }
  }, [searchParams])

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white bg-red-600 px-6 py-4 rounded-lg text-center uppercase">
          Legitimation Automated Data Entry Form
        </h1>
      </div>

      <LegitimationSection number="1" title="Birth of child registered in Iligan?" instruction={form.birthRegisteredIligan === 'YES' ? 'Fill-in ITEM 11' : null}>
        <div className="flex gap-4">
          <label className="flex items-center gap-2"><input type="radio" checked={form.birthRegisteredIligan === 'YES'} onChange={() => update('birthRegisteredIligan', 'YES')} /> YES</label>
          <label className="flex items-center gap-2"><input type="radio" checked={form.birthRegisteredIligan === 'NO'} onChange={() => update('birthRegisteredIligan', 'NO')} /> NO</label>
        </div>
      </LegitimationSection>

      <LegitimationSection number="2" title="Acknowledged by father in COLB?" instruction={form.acknowledgedByFatherInColb === 'YES' ? "Don't Fill-in ITEM 8" : null}>
        <div className="flex gap-4">
          <label className="flex items-center gap-2"><input type="radio" checked={form.acknowledgedByFatherInColb === 'YES'} onChange={() => update('acknowledgedByFatherInColb', 'YES')} /> YES</label>
          <label className="flex items-center gap-2"><input type="radio" checked={form.acknowledgedByFatherInColb === 'NO'} onChange={() => update('acknowledgedByFatherInColb', 'NO')} /> NO</label>
        </div>
      </LegitimationSection>

      <LegitimationSection number="3" title="Parent/s minor at the time of birth?">
        <div className="flex gap-4">
          <label className="flex items-center gap-2"><input type="radio" checked={form.parentsMinorAtBirth === 'YES'} onChange={() => update('parentsMinorAtBirth', 'YES')} /> YES</label>
          <label className="flex items-center gap-2"><input type="radio" checked={form.parentsMinorAtBirth === 'NO'} onChange={() => update('parentsMinorAtBirth', 'NO')} /> NO</label>
        </div>
      </LegitimationSection>

      <LegitimationSection number="4" title="Details of child">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name of child (First, Middle, Surname)</label>
            <div className="grid grid-cols-3 gap-2">
              <input type="text" value={form.childFirst} onChange={(e) => update('childFirst', e.target.value)} placeholder="First" className={inputClass} />
              <input type="text" value={form.childMiddle} onChange={(e) => update('childMiddle', e.target.value)} placeholder="Middle" className={inputClass} />
              <input type="text" value={form.childLast} onChange={(e) => update('childLast', e.target.value)} placeholder="Surname" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of birth</label>
              <input type="text" value={form.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} placeholder="e.g. 09-Mar-23" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
              <input type="text" value={form.sex} onChange={(e) => update('sex', e.target.value)} placeholder="e.g. MALE" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Place of birth</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input type="text" value={form.placeOfBirthStreet} onChange={(e) => update('placeOfBirthStreet', e.target.value)} placeholder="House/Hospital/Street/Purok/Barangay" className={inputClass} />
              <input type="text" value={form.placeOfBirthCity} onChange={(e) => update('placeOfBirthCity', e.target.value)} placeholder="City/Municipality" className={inputClass} />
              <input type="text" value={form.placeOfBirthProvince} onChange={(e) => update('placeOfBirthProvince', e.target.value)} placeholder="Province" className={inputClass} />
            </div>
          </div>
        </div>
      </LegitimationSection>

      <LegitimationSection number="5" title="Both parent/s alive/present?" instruction={form.bothParentsAlive === 'YES' ? 'Fill-up ITEM 6 ONLY and use JOINT AFFIDAVIT' : null}>
        <div className="flex gap-4">
          <label className="flex items-center gap-2"><input type="radio" checked={form.bothParentsAlive === 'YES'} onChange={() => update('bothParentsAlive', 'YES')} /> YES</label>
          <label className="flex items-center gap-2"><input type="radio" checked={form.bothParentsAlive === 'NO'} onChange={() => update('bothParentsAlive', 'NO')} /> NO</label>
        </div>
      </LegitimationSection>

      <LegitimationSection number="6" title="Details of parents">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mother&apos;s maiden name (First, Middle, Surname)</label>
            <div className="grid grid-cols-3 gap-2">
              <input type="text" value={form.motherFirst} onChange={(e) => update('motherFirst', e.target.value)} className={inputClass} />
              <input type="text" value={form.motherMiddle} onChange={(e) => update('motherMiddle', e.target.value)} className={inputClass} />
              <input type="text" value={form.motherLast} onChange={(e) => update('motherLast', e.target.value)} className={inputClass} />
            </div>
            <input type="text" value={form.motherCitizenship} onChange={(e) => update('motherCitizenship', e.target.value)} placeholder="Citizenship" className={`${inputClass} mt-2`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Father&apos;s name (First, Middle, Surname)</label>
            <div className="grid grid-cols-3 gap-2">
              <input type="text" value={form.fatherFirst} onChange={(e) => update('fatherFirst', e.target.value)} className={inputClass} />
              <input type="text" value={form.fatherMiddle} onChange={(e) => update('fatherMiddle', e.target.value)} className={inputClass} />
              <input type="text" value={form.fatherLast} onChange={(e) => update('fatherLast', e.target.value)} className={inputClass} />
            </div>
            <input type="text" value={form.fatherCitizenship} onChange={(e) => update('fatherCitizenship', e.target.value)} placeholder="Citizenship" className={`${inputClass} mt-2`} />
          </div>
        </div>
      </LegitimationSection>

      <LegitimationSection number="7" title="Details of surviving and deceased parent">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Surviving parent</label>
            <div className="grid grid-cols-3 gap-2">
              <input type="text" value={form.survivingParentFirst} onChange={(e) => update('survivingParentFirst', e.target.value)} className={inputClass} />
              <input type="text" value={form.survivingParentMiddle} onChange={(e) => update('survivingParentMiddle', e.target.value)} className={inputClass} />
              <input type="text" value={form.survivingParentLast} onChange={(e) => update('survivingParentLast', e.target.value)} className={inputClass} />
            </div>
            <input type="text" value={form.survivingParentCitizenship} onChange={(e) => update('survivingParentCitizenship', e.target.value)} placeholder="Citizenship" className={`${inputClass} mt-2`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deceased parent</label>
            <div className="grid grid-cols-3 gap-2">
              <input type="text" value={form.deceasedParentFirst} onChange={(e) => update('deceasedParentFirst', e.target.value)} className={inputClass} />
              <input type="text" value={form.deceasedParentMiddle} onChange={(e) => update('deceasedParentMiddle', e.target.value)} className={inputClass} />
              <input type="text" value={form.deceasedParentLast} onChange={(e) => update('deceasedParentLast', e.target.value)} className={inputClass} />
            </div>
            <input type="text" value={form.dateOfDeath} onChange={(e) => update('dateOfDeath', e.target.value)} placeholder="Date of death" className={`${inputClass} mt-2`} />
          </div>
        </div>
      </LegitimationSection>

      <LegitimationSection number="8" title="Details of affidavit of acknowledgement">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registry number</label>
            <input type="text" value={form.affidavitAckRegistryNo} onChange={(e) => update('affidavitAckRegistryNo', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration date</label>
            <input type="text" value={form.affidavitAckDate} onChange={(e) => update('affidavitAckDate', e.target.value)} placeholder="e.g. May 22, 2025" className={inputClass} />
          </div>
        </div>
      </LegitimationSection>

      <LegitimationSection number="9" title="Details of the affidavit of legitimation">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registry number</label>
            <input type="text" value={form.affidavitLegitRegistryNo} onChange={(e) => update('affidavitLegitRegistryNo', e.target.value)} placeholder="e.g. 1139" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration date</label>
            <input type="text" value={form.affidavitLegitDate} onChange={(e) => update('affidavitLegitDate', e.target.value)} placeholder="e.g. May 22, 2025" className={inputClass} />
          </div>
        </div>
      </LegitimationSection>

      <LegitimationSection number="10" title="Details of marriage of parents">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registry number</label>
              <input type="text" value={form.marriageRegistryNo} onChange={(e) => update('marriageRegistryNo', e.target.value)} placeholder="e.g. 2024-13" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of marriage</label>
              <input type="text" value={form.dateOfMarriage} onChange={(e) => update('dateOfMarriage', e.target.value)} placeholder="e.g. 31-Jan-24" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Place of marriage</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input type="text" value={form.placeOfMarriageCity} onChange={(e) => update('placeOfMarriageCity', e.target.value)} placeholder="City/Municipality" className={inputClass} />
              <input type="text" value={form.placeOfMarriageProvince} onChange={(e) => update('placeOfMarriageProvince', e.target.value)} placeholder="Province" className={inputClass} />
              <input type="text" value={form.placeOfMarriageCountry} onChange={(e) => update('placeOfMarriageCountry', e.target.value)} placeholder="Country" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Solemnizing officer</label>
            <input type="text" value={form.solemnizingOfficer} onChange={(e) => update('solemnizingOfficer', e.target.value)} placeholder="e.g. RICHIE GAY T. MENDOZA" className={inputClass} />
          </div>
        </div>
      </LegitimationSection>

      <LegitimationSection number="11" title="Details of registered COLB of child">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registry number</label>
            <input type="text" value={form.colbRegistryNo} onChange={(e) => update('colbRegistryNo', e.target.value)} placeholder="e.g. 2023-2.146" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration date</label>
            <input type="text" value={form.colbRegDate} onChange={(e) => update('colbRegDate', e.target.value)} placeholder="e.g. APR 03 2023" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page number</label>
            <input type="text" value={form.colbPageNo} onChange={(e) => update('colbPageNo', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Book number</label>
            <input type="text" value={form.colbBookNo} onChange={(e) => update('colbBookNo', e.target.value)} className={inputClass} />
          </div>
        </div>
      </LegitimationSection>

      <LegitimationSection number="12" title="Annotation" instruction="Choose from the two sample Annotations applicable to the client">
        <p className="text-sm text-gray-600 mb-2">
          A. ANNOTATION WITHOUT ACKNOWLEDGEMENT: Legitimated by the subsequent marriage of parents (name of spouse) and (name of spouse) on (date of marriage) at (place of marriage) under registry number (Affidavit of Legitimation).
        </p>
        <p className="text-sm text-gray-600">
          B. ANNOTATION WITH ACKNOWLEDGEMENT: Legitimated by the subsequent marriage of parents (name of spouse) and (name of spouse) on (date of marriage) at (place of marriage) under registry number (Affidavit of Legitimation). The child shall be known as (complete name of child).
        </p>
      </LegitimationSection>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => navigate('/legitimation')}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="px-4 py-2 bg-[var(--primary-blue)] text-white rounded-lg text-sm font-medium hover:opacity-90"
        >
          Done
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowConfirm(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Confirm submission</h3>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to proceed? Please verify that all entries are correct. You will be directed to the print view.
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="button" onClick={() => { setShowConfirm(false); proceedToPrint() }} className="px-4 py-2 bg-[var(--primary-blue)] text-white rounded-lg text-sm font-medium hover:opacity-90">Confirm &amp; Proceed</button>
            </div>
          </div>
        </div>
      )}

      <p className="mt-8 text-xs text-gray-500">created by: ATTY. YUSSIF DON JUSTIN F. MARTIL</p>
    </div>
  )
}
