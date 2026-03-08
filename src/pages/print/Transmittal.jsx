import React from 'react'
import TransmittalDoc from './TransmittalDoc'

/** Transmittal (local/PSA letter). */
export default function Transmittal(props) {
  return <TransmittalDoc {...props} isOutOfTown={false} />
}
