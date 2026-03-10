import React from 'react'
import TransmittalDoc from '../../ausf/print/TransmittalDoc'
import { LEGITIMATION_TRANSMITTAL_LIST } from '../../../components/print'

/** Legitimation Transmittal: editable checklist inside the document; only checked items appear in print. */
export default function Transmittal({ data, subjectLine }) {
  return (
    <TransmittalDoc
      data={data}
      isOutOfTown={false}
      subjectLine={subjectLine}
      checklistConfig={{ isOutOfTown: false, defaultLabels: LEGITIMATION_TRANSMITTAL_LIST, listId: 'legitimation-local' }}
    />
  )
}
