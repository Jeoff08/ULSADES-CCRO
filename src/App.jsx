import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { AUSFForm, AUSFPrint, AUSFSaved } from './pages/ausf'
import { CourtDecreeForm, CourtDecreeInstructions, CourtDecreePrint, CourtDecreeSaved } from './pages/courtDecree'
import { LegitimationForm, LegitimationPrint, LegitimationSaved } from './pages/legitimation'

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
        <Route path="court-decree" element={<Navigate to="/court-decree/form?type=cert-authenticity" replace />} />
        <Route path="court-decree/form" element={<CourtDecreeForm />} />
        <Route path="court-decree/print" element={<CourtDecreePrint />} />
        <Route path="court-decree/instructions" element={<CourtDecreeInstructions />} />
        <Route path="court-decree/saved" element={<CourtDecreeSaved />} />
        <Route path="legitimation" element={<Navigate to="/legitimation/form?type=joint-affidavit" replace />} />
        <Route path="legitimation/form" element={<LegitimationForm />} />
        <Route path="legitimation/print" element={<LegitimationPrint />} />
        <Route path="legitimation/saved" element={<LegitimationSaved />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
