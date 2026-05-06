import React from 'react'
const SEAL_LEFT_SRC = '/Screenshot_2026-05-05_114926-removebg-preview.png'
const LOGO_RIGHT_SRC = '/logo-shortcut.png'

/**
 * LCRO letterhead matching RA samples — header only (no footer).
 * @param {{ formCornerLeft?: string, children?: React.ReactNode }} props
 */
export default function LcroRaHeader({ children }) {
  return (
    <header className="correction-print-header mb-8">
      <div className="h-2 mb-2 overflow-hidden" />
      <div className="flex justify-between items-center mb-1">
        <img src={SEAL_LEFT_SRC} alt="" className="w-[100px] h-[100px] object-contain shrink-0" />
        <div className="text-center flex-1">
          <p className="text-[12px] font-bold m-0 leading-tight">Republic of the Philippines</p>
          <p className="text-[12px] font-bold m-0 leading-tight">Province of Lanao del Norte</p>
          <p className="text-[12px] font-bold m-0 leading-tight">City of Iligan</p>
          <p className="text-[13px] font-bold m-0 uppercase mt-1 leading-tight tracking-tight">
            OFFICE OF THE LOCAL CIVIL REGISTRAR
          </p>
          {children}
        </div>
        <img src={LOGO_RIGHT_SRC} alt="" className="w-[100px] h-[100px] object-contain shrink-0" />
      </div>
      <div className="border-t-[1px] border-black mb-[1px]" aria-hidden="true" />
      <div className="border-t-[1px] border-black" aria-hidden="true" />
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
