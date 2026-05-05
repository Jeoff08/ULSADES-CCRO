import React from 'react'
import { LOGO_RIGHT_SRC, SEAL_LEFT_SRC } from '../../../components/print/constants'

/**
 * LCRO letterhead matching RA samples — header only (no footer).
 * @param {{ formCornerLeft?: string, children?: React.ReactNode }} props
 */
export default function LcroRaHeader({ formCornerLeft, children }) {
  return (
    <header className="correction-print-header mb-3">
      {formCornerLeft ? (
        <p className="text-left text-[11px] font-bold mb-2 m-0">{formCornerLeft}</p>
      ) : null}
      <div className="flex justify-between items-start gap-3">
        <img src={SEAL_LEFT_SRC} alt="" className="w-[72px] h-[72px] object-contain shrink-0" />
        <div className="flex-1 text-center min-w-0 px-1">
          <p className="text-[11px] font-semibold m-0 leading-tight">Republic of the Philippines</p>
          <p className="text-[11px] font-semibold m-0 leading-tight">Province of Lanao del Norte</p>
          <p className="text-[11px] font-semibold m-0 leading-tight">City of Iligan</p>
          <p className="text-[12px] font-bold m-0 mt-1 leading-tight uppercase tracking-tight">
            Office of the Local Civil Registrar
          </p>
          {children}
        </div>
        <img src={LOGO_RIGHT_SRC} alt="" className="w-[72px] h-[72px] object-contain shrink-0" />
      </div>
      <hr className="border-black border-t mt-2 mb-2" />
    </header>
  )
}

export function SignatoryBlock({ name, title = 'City Civil Registrar' }) {
  const n = name || '—'
  return (
    <div className="mt-10 flex flex-col items-end text-right w-full">
      <div className="inline-flex flex-col items-center gap-0 min-w-[14rem]">
        <div className="w-full border-b border-black min-h-[2rem]" aria-hidden />
        <p className="font-bold uppercase text-[11px] underline m-0 mt-1">{n}</p>
        <p className="text-[10px] m-0">{title}</p>
      </div>
    </div>
  )
}
