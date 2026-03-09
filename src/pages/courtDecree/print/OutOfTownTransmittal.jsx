import React, { useState } from 'react'
import TransmittalDoc from '../../print/TransmittalDoc'
import TransmittalChecklistEditor from '../../print/TransmittalChecklistEditor'
import { COURT_DECREE_OUT_OF_TOWN_ATTACHMENTS } from '../../../components/print'

/** Court decree Out-of-Town transmittal: editable checklist; only checked items appear in print. */
export default function OutOfTownTransmittal({ data, subjectLine }) {
  const [checkedLabels, setCheckedLabels] = useState([])

  return (
    <>
      <TransmittalChecklistEditor
        isOutOfTown={true}
        listId="court-decree-out-of-town"
        defaultLabels={COURT_DECREE_OUT_OF_TOWN_ATTACHMENTS}
        onCheckedLabelsChange={setCheckedLabels}
      />
      <TransmittalDoc
        data={data}
        isOutOfTown={true}
        attachments={checkedLabels}
        subjectLine={subjectLine}
        hideLineBelowDate
        showLineAboveDate
      />
    </>
  )
}
