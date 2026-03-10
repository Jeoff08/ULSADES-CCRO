import React from 'react'
import TransmittalDoc from '../../ausf/print/TransmittalDoc'
import { LEGITIMATION_OUT_OF_TOWN_ATTACHMENTS } from '../../../components/print'

/** Legitimation Out-of-Town Transmittal: editable checklist inside the document; only checked items appear in print. */
export default function OutOfTownTransmittal({ data, subjectLine }) {
  return (
    <TransmittalDoc
      data={data}
      isOutOfTown={true}
      subjectLine={subjectLine}
      checklistConfig={{ isOutOfTown: true, defaultLabels: LEGITIMATION_OUT_OF_TOWN_ATTACHMENTS, listId: 'legitimation-out-of-town' }}
    />
  )
}
