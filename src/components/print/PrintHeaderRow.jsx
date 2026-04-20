import React from 'react'
import { LOGO_RIGHT_SRC, SEAL_LEFT_SRC } from './constants'

const defaultHeaderImgCls = 'w-20 h-20 object-contain shrink-0'

export default function PrintHeaderRow({ rightContent, headerTextSize, headerImageClassName, singleLineAddress = true }) {
  const juratStyle = headerTextSize ? { fontSize: headerTextSize } : undefined
  const juratClass = 'font-bold leading-tight'
  const imgCls = headerImageClassName || defaultHeaderImgCls
  return (
    <div className="ccr-header flex justify-between items-center gap-4 mb-2">
      <img src={SEAL_LEFT_SRC} alt="City of Iligan Official Seal" className={`ccr-header-logo ${imgCls}`} />
      <div className="ccr-header-center text-center flex-1 min-w-0 px-2">
        <div style={juratStyle}>
          <p className={`ccr-header-line-1 ${headerTextSize ? `${juratClass}` : `${juratClass} text-sm`}`}>Republic of the Philippines</p>
          <p className={`ccr-header-line-2 ${headerTextSize ? `${juratClass} uppercase tracking-tight` : `${juratClass} text-lg uppercase tracking-tight`}`}>City Civil Registrar&apos;s Office</p>
          <p className={`ccr-header-line-3 ${headerTextSize ? juratClass : `${juratClass} text-sm`}`}>City of Iligan</p>
          <p className="ccr-header-address print-header-address text-[11px] leading-tight m-0">
          {'Ground Flr., Pedro Generalao Bldg., Buhanginan Hill, Pala-o, Iligan City'}
        </p>
        </div>
        

      </div>
      {rightContent ?? <img src={LOGO_RIGHT_SRC} alt="Office of the City Civil Registrar" className={`ccr-header-logo ${imgCls}`} />}
    </div>
  )
}
