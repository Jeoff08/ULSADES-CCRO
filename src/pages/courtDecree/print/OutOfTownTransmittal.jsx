import React from 'react'
import TransmittalDoc from '../../print/TransmittalDoc'
import { COURT_DECREE_TRANSMITTAL_LIST } from '../../../components/print'

/** Court decree Out of town transmittal. */
export default function OutOfTownTransmittal({ data, subjectLine }) {
  return (
    <TransmittalDoc
      data={data}
      isOutOfTown={true}
      attachments={COURT_DECREE_TRANSMITTAL_LIST}
      subjectLine={subjectLine}
    />
  )
}
