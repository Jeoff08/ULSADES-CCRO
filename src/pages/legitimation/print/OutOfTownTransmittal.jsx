import React, { useState } from 'react'
import TransmittalDoc from '../../print/TransmittalDoc'
import TransmittalChecklistEditor from '../../print/TransmittalChecklistEditor'
import { LEGITIMATION_OUT_OF_TOWN_ATTACHMENTS } from '../../../components/print'

/** Legitimation Out-of-Town Transmittal: editable checklist; only checked items appear in print. */
export default function OutOfTownTransmittal({ data, subjectLine }) {
  const [checkedLabels, setCheckedLabels] = useState([])

  return (
    <>
      <TransmittalChecklistEditor
        isOutOfTown={true}
        listId="legitimation-out-of-town"
        defaultLabels={LEGITIMATION_OUT_OF_TOWN_ATTACHMENTS}
        onCheckedLabelsChange={setCheckedLabels}
      />
      <TransmittalDoc
        data={data}
        isOutOfTown={true}
        attachments={checkedLabels}
        subjectLine={subjectLine}
      />
    </>
  )
}
