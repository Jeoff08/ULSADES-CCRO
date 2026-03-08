import React from 'react'
import { useNavigate } from 'react-router-dom'
import StandardAnnotationWithInstructions from './print/StandardAnnotationWithInstructions'

/** Dedicated page for Standard Annotation Instructions. Navigate here from Court Decree Print. */
export default function CourtDecreeInstructions() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen">
      <StandardAnnotationWithInstructions onBack={() => navigate('/court-decree/print')} />
    </div>
  )
}
