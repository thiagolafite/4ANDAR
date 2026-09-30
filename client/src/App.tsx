import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';

// Auth Pages
import { LoginPage } from './pages/LoginPage';
import { CadastroPage } from './pages/CadastroPage';
import { UsuariosPage } from './pages/UsuariosPage';

// System Pages
import { DashboardPage } from './pages/DashboardPage';
import { CronogramaPage } from './pages/CronogramaPage';
import { PresencaPage } from './pages/PresencaPage';
import { ProximaAulaPage } from './pages/ProximaAulaPage';
import { AlunosPage } from './pages/AlunosPage';
import { PagamentosPage } from './pages/PagamentosPage';
import { MeusPagamentosPage } from './pages/MeusPagamentosPage';
import { NivelamentoPage } from './pages/NivelamentoPage';
import { AgendamentoNivelamentoPage } from './pages/AgendamentoNivelamentoPage';
import { MeusNivelamentosPage } from './pages/MeusNivelamentosPage';
import { AulasPage } from './pages/AulasPage';
import { EventosPage } from './pages/EventosPage';
import { AvisosPage } from './pages/AvisosPage';
import { EquipePage } from './pages/EquipePage';
import { GoogleCalendarPage } from './pages/GoogleCalendarPage';
import { FrequenciaPage } from './pages/FrequenciaPage';

// Guard for protected routes
const ProtectedAppLayout: React.FC = () => {
  const { isAuthenticated, currentUser } = useApp();

  // Permite acesso se estiver autenticado ou tiver currentUser inicializado (ex: Thiago Lafite Master)
  if (!isAuthenticated && !currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout />;
};

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />

          {/* Protected System Routes */}
          <Route path="/" element={<ProtectedAppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="home" element={<DashboardPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="gestao-usuarios" element={<UsuariosPage />} />
            <Route path="cronograma" element={<CronogramaPage />} />
            <Route path="planejamento" element={<CronogramaPage />} />
            <Route path="planejamento-semanal" element={<CronogramaPage />} />
            <Route path="presenca" element={<PresencaPage />} />
            <Route path="proxima-aula" element={<ProximaAulaPage />} />
            <Route path="proximaaula" element={<ProximaAulaPage />} />
            <Route path="alunos" element={<AlunosPage />} />
            <Route path="pagamentos" element={<PagamentosPage />} />
            <Route path="meus-pagamentos" element={<MeusPagamentosPage />} />
            <Route path="meuspagamentos" element={<MeusPagamentosPage />} />
            <Route path="nivelamento" element={<NivelamentoPage />} />
            <Route path="agendamento-nivelamento" element={<AgendamentoNivelamentoPage />} />
            <Route path="agendamentonivelamento" element={<AgendamentoNivelamentoPage />} />
            <Route path="meus-nivelamentos" element={<MeusNivelamentosPage />} />
            <Route path="meusnivelamentos" element={<MeusNivelamentosPage />} />
            <Route path="aulas" element={<AulasPage />} />
            <Route path="eventos" element={<EventosPage />} />
            <Route path="avisos" element={<AvisosPage />} />
            <Route path="equipe" element={<EquipePage />} />
            <Route path="agenda-google" element={<GoogleCalendarPage />} />
            <Route path="agendagoogle" element={<GoogleCalendarPage />} />
            <Route path="frequencia" element={<FrequenciaPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
