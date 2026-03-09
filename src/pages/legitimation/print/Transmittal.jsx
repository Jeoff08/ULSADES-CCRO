import React, { useState } from 'react'
import TransmittalDoc from '../../print/TransmittalDoc'
import TransmittalChecklistEditor from '../../print/TransmittalChecklistEditor'
import { LEGITIMATION_TRANSMITTAL_LIST } from '../../../components/print'

/** Legitimation Transmittal: editable checklist; only checked items appear in print. */
export default function Transmittal({ data, subjectLine }) {
  const [checkedLabels, setCheckedLabels] = useState([])

  return (
    <>
      <TransmittalChecklistEditor
        isOutOfTown={false}
        listId="legitimation-local"
        defaultLabels={LEGITIMATION_TRANSMITTAL_LIST}
        onCheckedLabelsChange={setCheckedLabels}
      />
      <TransmittalDoc
        data={data}
        isOutOfTown={false}
        attachments={checkedLabels}
        subjectLine={subjectLine}
      />
    </>
  )
}
