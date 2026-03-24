import React from 'react'
import { buildDefaultAnnotationText } from '../../../lib/printUtils'
import { DocumentFooter } from '../../../components/print'

/**
 * Annotation (Child Not Ack): standalone annotation editor/preview.
 * Output format: "Acknowledged by [Name] on [DATE] under Registry Number [No]. The child shall be known as [CHILD NAME] pursuant to R.A. 9255"
 */
export default function AnnotationChildNotAck({ data, onAnnotationChange }) {
  const defaultAnnotation = buildDefaultAnnotationText(data)
  const annotationText = data.annotationChildAckText || defaultAnnotation

  // Render annotation in two lines (break after " under ") with "known as [NAME]" bold+underline
  const renderAnnotationContent = () => {
    const text = annotationText || '—'
    const pursuantIdx = text.toLowerCase().indexOf('pursuant')
    if (pursuantIdx <= 0) {
      const match = text.match(/known as\s+(.+?)\s+pursuant/i)
      if (match) {
        const before = text.slice(0, text.indexOf(match[1]))
        const name = match[1]
        const after = text.slice(text.indexOf(match[1]) + name.length)
        return <>{before}<strong style={{ textDecoration: 'underline' }}>{name}</strong>{after}</>
      }
      return text
    }
    const mainPart = text.slice(0, pursuantIdx).trim()
    const pursuantPart = text.slice(pursuantIdx).replace(/["\s]+$/g, '').trim()
    const underIdx = mainPart.indexOf(' under ')
    const firstLine = underIdx >= 0 ? mainPart.slice(0, underIdx + 7) : mainPart
    const secondLineContent = underIdx >= 0 ? mainPart.slice(underIdx + 7) : ''
    const nameMatch = secondLineContent.match(/known as\s+(.+?)\s*$/i) || mainPart.match(/known as\s+(.+?)\s*$/i) || text.match(/known as\s+(.+?)\s+pursuant/i)
    const name = nameMatch ? nameMatch[1].trim() : ''
    const knownAsIdx = secondLineContent.toLowerCase().indexOf('known as')
    const secondBeforeName = knownAsIdx >= 0 ? secondLineContent.slice(0, knownAsIdx + 9) : secondLineContent
    const secondAfterName = name && knownAsIdx >= 0 ? secondLineContent.slice(knownAsIdx + 9 + name.length) : ''
    return (
      <span className="inline-block">
        <span>{firstLine}</span>
        <br />
        <span>{secondBeforeName}</span>
        {name ? <strong style={{ textDecoration: 'underline' }}>{name}</strong> : null}
        <span>{secondAfterName}</span>
        <br />
        <span>{pursuantPart}</span>
      </span>
    )
  }

  return (
    <div className="ausf-doc print-doc colb-annotation-ack bg-white text-black text-sm max-w-[210mm] mx-auto flex flex-col relative px-4 py-3">
      <h2 className="text-base font-bold uppercase mb-3 text-center print:hidden">Annotation (Child Not Ack) — COLB Office File</h2>

      <div className="mb-4">
        <p className="font-medium text-sm mb-1">REMARKS/ANNOTATION (Child not acknowledged)</p>
        <div className="border border-black min-h-[5rem] p-4 bg-white">
          <p className="text-sm whitespace-pre-wrap text-justify">{renderAnnotationContent()}</p>
        </div>
      </div>

      <div className="no-print mb-4">
        <p className="font-medium text-sm mb-1">Edit annotation</p>
        <textarea
          value={annotationText}
          onChange={(e) => onAnnotationChange?.(e.target.value)}
          placeholder="Acknowledged by [Name] on MAY 7, 2025 under Registry Number 2025-0990. The child shall be known as [CHILD NAME] pursuant to R.A. 9255"
          className="w-full min-h-[5rem] p-3 border border-gray-300 rounded-lg text-sm font-sans"
          rows={4}
        />
      </div>

      <div className="mt-auto pt-4 shrink-0 print:hidden">
        <DocumentFooter contactPhone={data.contactPhone} contactEmail={data.contactEmail} />
      </div>
    </div>
  )
}
