// filepath: src/components/colb/ColbCertificateFieldsOverlay.jsx
import React from 'react';

const ColbCertificateFieldsOverlay = ({ merged, omitFieldKeys }) => {
  // Filter out omitted fields
  const fields = merged ? Object.keys(merged).filter(key => !omitFieldKeys.includes(key)) : [];

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10
    }}>
      <h3>Certificate Fields Overlay</h3>
      {fields.map(field => (
        <div key={field}>
          <label>{field}: {merged[field] || ''}</label>
        </div>
      ))}
    </div>
  );
};

export default ColbCertificateFieldsOverlay;