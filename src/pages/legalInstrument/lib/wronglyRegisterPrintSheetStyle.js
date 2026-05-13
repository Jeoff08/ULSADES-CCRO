/**
 * Shared “Wrongly Register” print sheet metrics and injected CSS so other
 * legal-instrument print routes match the same paper shell and @page rules.
 */

/** Screen + base inline padding; print/PDF overrides in index.css align with these values. */
export function wronglyRegisterSheetPaddingCss(paperId) {
  if (paperId === 'short') return '5.5mm 6.5mm'
  if (paperId === 'a4') return '8mm'
  if (paperId === 'long') return '10mm 9mm'
  return '10mm'
}

export function wronglyRegisterTransmittalPageShellStyle(paperSpec, paperSize) {
  return {
    width: `${paperSpec.widthMm}mm`,
    minHeight: `${paperSpec.heightMm}mm`,
    padding: wronglyRegisterSheetPaddingCss(paperSize),
    boxSizing: 'border-box',
  }
}

export function wronglyRegisterLcrSheetInlineStyle(paperSpec, paperSize) {
  return {
    width: `${paperSpec.widthMm}mm`,
    minHeight: `${paperSpec.heightMm}mm`,
    boxSizing: 'border-box',
    padding: wronglyRegisterSheetPaddingCss(paperSize),
  }
}

/** Full style tag body for routes that render `.wrongly-register-print-sheet` (font scaling + @page). */
export function getWronglyRegisterPrintStylesheetText(spec, paperId) {
  return `
      .wrongly-register-print-sheet {
        font-size: 16px;
      }
      .wrongly-register-print-sheet .text-sm,
      .wrongly-register-print-sheet .text-\\[13px\\],
      .wrongly-register-print-sheet .text-\\[14px\\] {
        font-size: 1em !important;
      }
      .wrongly-register-print-sheet .text-base,
      .wrongly-register-print-sheet .text-\\[15px\\] {
        font-size: 1.1em !important;
      }
      .wrongly-register-print-sheet .text-xs,
      .wrongly-register-print-sheet .text-\\[11px\\],
      .wrongly-register-print-sheet .text-\\[12px\\] {
        font-size: 0.85em !important;
      }

      @media print {
        @page {
          size: ${spec.size};
          margin: 0;
        }
        .wrongly-register-print-sheet {
          font-size: 12pt !important;
        }
        html[data-paper-size="${paperId}"] .wrongly-register-print-sheet .wrongly-wr-transmittal-body-content {
          margin-left: 14mm !important;
          margin-right: 0 !important;
        }
        html[data-paper-size="long"] .wrongly-wr-lcr-sheet,
        html[data-paper-size="long"] .wrongly-wr-ocr-sheet {
          padding-bottom: 0 !important;
        }
      }
    `
}
