import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { AUSFForm, AUSFPrint, AUSFSaved } from './pages/ausf'
import { CourtDecreeForm, CourtDecreeInstructions, CourtDecreePrint, CourtDecreeSaved } from './pages/courtDecree'
import { LegitimationForm, LegitimationPrint, LegitimationSaved } from './pages/legitimation'
import LegalInstrumentPage from './pages/LegalInstrumentPage'
import SupplementalPrint from './pages/legalInstrument/SupplementalPrint'
import SupplementalSaved from './pages/legalInstrument/SupplementalSaved'
import CourtDecreeWorkflowPage from './pages/CourtDecreeWorkflowPage'
import UploadedFileViewer from './pages/UploadedFileViewer'
import Log from './pages/Log'
import AnnotationFieldPage from './pages/AnnotationFieldPage'
import AnnotationAckFieldPage from './pages/AnnotationAckFieldPage'
import CorrectionOfEntriesForm from './pages/correctionOfEntries/CorrectionOfEntriesForm'
import CorrectionOfEntriesPrint from './pages/correctionOfEntries/CorrectionOfEntriesPrint'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="ausf" element={<AUSFForm />} />
        <Route path="ausf/print" element={<AUSFPrint />} />
        <Route path="ausf/saved" element={<AUSFSaved />} />
        <Route path="court-decree/workflow/:slug" element={<CourtDecreeWorkflowPage />} />
        <Route path="court-decree" element={<Navigate to="/court-decree/form?type=cert-authenticity" replace />} />
        <Route path="court-decree/form" element={<CourtDecreeForm />} />
        <Route path="court-decree/print" element={<CourtDecreePrint />} />
        <Route path="court-decree/instructions" element={<CourtDecreeInstructions />} />
        <Route path="court-decree/saved" element={<CourtDecreeSaved />} />
        <Route path="legitimation" element={<Navigate to="/legitimation/form?type=joint-affidavit" replace />} />
        <Route path="legitimation/form" element={<LegitimationForm />} />
        <Route path="legitimation/print" element={<LegitimationPrint />} />
        <Route path="legitimation/saved" element={<LegitimationSaved />} />
        <Route path="legal-instrument/:slug" element={<LegalInstrumentPage />} />
        <Route path="legal-instrument/supplemental/print" element={<SupplementalPrint />} />
        <Route path="legal-instrument/supplemental/saved" element={<SupplementalSaved />} />
        <Route path="uploaded/:scope" element={<UploadedFileViewer />} />
        <Route path="logs" element={<Log />} />
        <Route path="annotation-field" element={<AnnotationFieldPage />} />
        <Route path="annotation-ack-field" element={<AnnotationAckFieldPage />} />
        <Route path="correction-of-entries" element={<CorrectionOfEntriesForm />} />
        <Route path="correction-of-entries/print" element={<CorrectionOfEntriesPrint />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
