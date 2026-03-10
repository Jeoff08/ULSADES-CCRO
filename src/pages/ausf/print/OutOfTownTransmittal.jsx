import React from 'react'
import TransmittalDoc from './TransmittalDoc'

/** Out-of-Town Transmittal letter. */
export default function OutOfTownTransmittal(props) {
  return <TransmittalDoc {...props} isOutOfTown={true} />
}
