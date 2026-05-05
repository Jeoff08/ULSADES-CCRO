import React from 'react'
import TransmittalDoc from '../../ausf/print/TransmittalDoc'
import { COURT_DECREE_OUT_OF_TOWN_ATTACHMENTS } from '../../../components/print'

/** Court decree Out-of-Town transmittal: editable checklist inside the document; only checked items appear in print. */
export default function OutOfTownTransmittal({ data, subjectLine, onPersistDraft }) {
  return (
    <TransmittalDoc
      data={data}
      isOutOfTown={true}
      subjectLine={subjectLine}
      hideLineBelowDate
      showLineAboveDate
      onPersistDraft={onPersistDraft}
      checklistConfig={{ isOutOfTown: true, defaultLabels: COURT_DECREE_OUT_OF_TOWN_ATTACHMENTS, listId: 'court-decree-out-of-town' }}
    />
  )
}
