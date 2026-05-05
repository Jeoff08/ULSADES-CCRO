import React from 'react'
import TransmittalDoc from '../../ausf/print/TransmittalDoc'
import { COURT_DECREE_TRANSMITTAL_LIST } from '../../../components/print'

/** Court decree Transmittal (local): editable checklist inside the document; only checked items appear in print. */
export default function Transmittal({ data, subjectLine, onPersistDraft }) {
  return (
    <TransmittalDoc
      data={data}
      isOutOfTown={false}
      subjectLine={subjectLine}
      onPersistDraft={onPersistDraft}
      checklistConfig={{ isOutOfTown: false, defaultLabels: COURT_DECREE_TRANSMITTAL_LIST, listId: 'court-decree-local-v2' }}
    />
  )
}
