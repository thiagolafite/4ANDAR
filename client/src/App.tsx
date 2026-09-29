import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
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

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="home" element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="cronograma" element={<CronogramaPage />} />
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
