import React from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { UnsavedChangesProvider } from './context/UnsavedChangesContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { AUSFForm, AUSFPrint, AUSFSaved } from './pages/ausf'
import { CourtDecreeForm, CourtDecreeInstructions, CourtDecreePrint, CourtDecreeSaved } from './pages/courtDecree'
import { LegitimationForm, LegitimationPrint, LegitimationSaved } from './pages/legitimation'
import LegalInstrumentPage from './pages/LegalInstrumentPage'
import SupplementalPrint from './pages/legalInstrument/SupplementalPrint'
import SupplementalSaved from './pages/legalInstrument/SupplementalSaved'
import Mc2010Print from './pages/legalInstrument/Mc2010Print'
import Mc2010Saved from './pages/legalInstrument/Mc2010Saved'
import WronglyRegisterPrint from './pages/legalInstrument/WronglyRegisterPrint'
import WronglyRegisterSaved from './pages/legalInstrument/WronglyRegisterSaved'
import CourtDecreeWorkflowPage from './pages/CourtDecreeWorkflowPage'
import UploadedFileViewer from './pages/UploadedFileViewer'
import Log from './pages/Log'
import AnnotationFieldPage from './pages/AnnotationFieldPage'
import AnnotationAckFieldPage from './pages/AnnotationAckFieldPage'
import CorrectionOfEntriesForm from './pages/correctionOfEntries/CorrectionOfEntriesForm'
import CorrectionOfEntriesPrint from './pages/correctionOfEntries/CorrectionOfEntriesPrint'
import SystemDataPage from './pages/SystemDataPage'

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function AppLayoutShell() {
  return (
    <RequireAuth>
      <UnsavedChangesProvider>
        <Layout />
      </UnsavedChangesProvider>
    </RequireAuth>
  )
}

export const appRouter = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <AppLayoutShell />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'ausf', element: <AUSFForm /> },
      { path: 'ausf/print', element: <AUSFPrint /> },
      { path: 'ausf/saved', element: <AUSFSaved /> },
      { path: 'court-decree/workflow/:slug', element: <CourtDecreeWorkflowPage /> },
      { path: 'court-decree', element: <Navigate to="/court-decree/form?type=cert-authenticity" replace /> },
      { path: 'court-decree/form', element: <CourtDecreeForm /> },
      { path: 'court-decree/print', element: <CourtDecreePrint /> },
      { path: 'court-decree/instructions', element: <CourtDecreeInstructions /> },
      { path: 'court-decree/saved', element: <CourtDecreeSaved /> },
      { path: 'legitimation', element: <Navigate to="/legitimation/form?type=joint-affidavit" replace /> },
      { path: 'legitimation/form', element: <LegitimationForm /> },
      { path: 'legitimation/print', element: <LegitimationPrint /> },
      { path: 'legitimation/saved', element: <LegitimationSaved /> },
      { path: 'legal-instrument/:slug', element: <LegalInstrumentPage /> },
      { path: 'legal-instrument/supplemental/print', element: <SupplementalPrint /> },
      { path: 'legal-instrument/supplemental/saved', element: <SupplementalSaved /> },
      { path: 'legal-instrument/mc2010-04/print', element: <Mc2010Print /> },
      { path: 'legal-instrument/mc2010-04/saved', element: <Mc2010Saved /> },
      { path: 'legal-instrument/wrongly-register/print', element: <WronglyRegisterPrint /> },
      { path: 'legal-instrument/wrongly-register/saved', element: <WronglyRegisterSaved /> },
      { path: 'uploaded/:scope', element: <UploadedFileViewer /> },
      { path: 'logs', element: <Log /> },
      { path: 'annotation-field', element: <AnnotationFieldPage /> },
      { path: 'annotation-ack-field', element: <AnnotationAckFieldPage /> },
      { path: 'correction-of-entries', element: <CorrectionOfEntriesForm /> },
      { path: 'correction-of-entries/print', element: <CorrectionOfEntriesPrint /> },
      { path: 'system-data', element: <SystemDataPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
