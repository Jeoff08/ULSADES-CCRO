// filepath: src/components/print/AnnotationPrintLayout.jsx
import React from 'react';

const AnnotationPrintLayout = ({ className, paperSize, moduleClass, children }) => {
  const paperClass = paperSize === 'legal' ? 'print:w-[8.5in] print:h-[14in]' : 'print:w-[8.5in] print:h-[11in]';
  const combinedClass = `${className || ''} ${paperClass} ${moduleClass || ''}`.trim();

  return (
    <div className={combinedClass}>
      {children}
    </div>
  );
};

export default AnnotationPrintLayout;