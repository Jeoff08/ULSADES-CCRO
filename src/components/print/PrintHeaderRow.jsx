import React from 'react'
import { LOGO_RIGHT_SRC, SEAL_LEFT_SRC } from './constants'

export default function PrintHeaderRow({ rightContent }) {
  return (
    <div className="flex justify-between items-center gap-4 mb-2">
      <img src={SEAL_LEFT_SRC} alt="City of Iligan Official Seal" className="w-20 h-20 object-contain shrink-0" />
      <div className="text-center flex-1 min-w-0 px-2">
        <p className="font-bold text-sm leading-tight">Republic of the Philippines</p>
        <p className="font-bold text-lg uppercase leading-tight tracking-tight">City Civil Registrar&apos;s Office</p>
        <p className="font-bold text-sm leading-tight">City of Iligan</p>
        <p className="text-sm leading-tight">Ground Flr., Pedro Generalao Bldg., Buhanginan</p>
        <p className="text-sm leading-tight">Hill, Pala-o, Iligan City</p>
      </div>
      {rightContent ?? <img src={LOGO_RIGHT_SRC} alt="Office of the City Civil Registrar" className="w-20 h-20 object-contain shrink-0" />}
    </div>
  )
}
