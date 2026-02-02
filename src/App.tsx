import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import PatientsList from './pages/patients/PatientsList';
import PatientForm from './pages/patients/PatientForm';
import PatientDetails from './pages/patients/PatientDetails';
import AppointmentsList from './pages/appointments/AppointmentsList';
import AppointmentForm from './pages/appointments/AppointmentForm';
import RecordForm from './pages/records/RecordForm';
import Settings from './pages/settings/Settings';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import DebugPage from './pages/DebugPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Debug Page - Acesse com /#/debug */}
        <Route path="/debug" element={<DebugPage />} />

        {/* Dashboard Home */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Pacientes */}
        <Route
          path="/dashboard/patients"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <PatientsList />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/patients/new"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <PatientForm />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/patients/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <PatientDetails />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/patients/:id/edit"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <PatientForm />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Placeholders - Agenda */}
        <Route
          path="/dashboard/schedule"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AppointmentsList />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/schedule/new"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AppointmentForm />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Placeholders - Prontuários */}
        <Route
          path="/dashboard/records"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <div className="text-center py-12">
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">Prontuários</h1>
                  <p className="text-gray-600">Lista de prontuários em desenvolvimento</p>
                </div>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/records/new"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <RecordForm />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Configurações */}
        <Route
          path="/dashboard/settings"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Rota 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-gray-600 mb-6">Página não encontrada</p>
                <a
                  href="#/dashboard"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Voltar ao início
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </HashRouter>
  );
}

export default App;