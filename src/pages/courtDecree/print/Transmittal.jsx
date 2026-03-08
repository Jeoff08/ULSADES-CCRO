import React from 'react'
import TransmittalDoc from '../../print/TransmittalDoc'
import { COURT_DECREE_TRANSMITTAL_LIST } from '../../../components/print'

/** Court decree Transmittal (local/PSA letter). */
export default function Transmittal({ data, subjectLine }) {
  return (
    <TransmittalDoc
      data={data}
      isOutOfTown={false}
      attachments={COURT_DECREE_TRANSMITTAL_LIST}
      subjectLine={subjectLine}
    />
  )
}
