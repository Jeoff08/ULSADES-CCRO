// filepath: src/components/annotations/AnnotationRenderer.jsx
import React from 'react';

const AnnotationRenderer = ({ annotationText, type }) => {
  return (
    <div className="annotation-renderer">
      <span className={`annotation-text annotation-${type}`}>
        {annotationText}
      </span>
    </div>
  );
};

export { AnnotationRenderer };