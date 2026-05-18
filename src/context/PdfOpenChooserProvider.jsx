import React, { useEffect, useState } from 'react'
import OpenPdfChooserModal from '../components/pdf/OpenPdfChooserModal'
import { setPdfOpenChooserHandler } from '../lib/pdfOpenChooserHost'

export default function PdfOpenChooserProvider({ children }) {
  const [pending, setPending] = useState(null)

  useEffect(() => {
    setPdfOpenChooserHandler((filePath) =>
      new Promise((resolve) => {
        setPending({ filePath, resolve })
      }),
    )
    return () => setPdfOpenChooserHandler(null)
  }, [])

  const finish = (result) => {
    pending?.resolve(result)
    setPending(null)
  }

  return (
    <>
      {children}
      {pending ? (
        <OpenPdfChooserModal
          filePath={pending.filePath}
          onConfirm={(browser, remember) => finish({ cancelled: false, browser, remember })}
          onCancel={() => finish({ cancelled: true })}
        />
      ) : null}
    </>
  )
}
