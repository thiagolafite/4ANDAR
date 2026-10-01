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
import { FrequenciaPage } from './pages/FrequenciaPage';
import { AvisosPopUpModal } from './components/modals/AvisosPopUpModal';

// Guard for protected routes
const ProtectedAppLayout: React.FC = () => {
  const { isAuthenticated, currentUser } = useApp();

  // Permite acesso ESTRITAMENTE se estiver autenticado E com usuário carregado
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <AppLayout />
      <AvisosPopUpModal />
    </>
  );
};

interface RoleRouteProps {
  children: React.ReactElement;
  allowAluno?: boolean;
  requiresMaster?: boolean;
  requiredModule?: string;
}

const RoleRoute: React.FC<RoleRouteProps> = ({
  children,
  allowAluno = false,
  requiresMaster = false,
  requiredModule
}) => {
  const { currentUser, hasPermission } = useApp();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const isMaster = Boolean(currentUser.is_master || currentUser.role === 'master' || currentUser.tipo_usuario === 'AdminMaster');
  const isAluno = currentUser.role === 'aluno' || (!isMaster && currentUser.role !== 'professor' && currentUser.tipo_usuario === 'Aluno');

  // Master tem acesso total irrestrito a todas as páginas e ações
  if (isMaster) return children;

  // Rotas restritas exclusivamente para o Master Thiago Lafite
  if (requiresMaster && !isMaster) {
    return <Navigate to="/" replace />;
  }

  // Aluno tem acesso estritamente restrito:
  // - os eventos que ele for convidado (/eventos)
  // - as aulas dele (/proxima-aula)
  // - o nivelamento dele (/meus-nivelamentos e /agendamento-nivelamento)
  // - marcar presença na aula (/proxima-aula)
  // Qualquer outro acesso é redirecionado para /proxima-aula
  if (isAluno && !allowAluno) {
    return <Navigate to="/proxima-aula" replace />;
  }

  // Se exigir módulo administrativo que o usuário não tem permissão
  if (requiredModule && !hasPermission(requiredModule)) {
    return <Navigate to="/" replace />;
  }

  return children;
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
            <Route path="usuarios" element={<RoleRoute requiresMaster><UsuariosPage /></RoleRoute>} />
            <Route path="gestao-usuarios" element={<RoleRoute requiresMaster><UsuariosPage /></RoleRoute>} />
            <Route path="cronograma" element={<RoleRoute requiredModule="cronograma"><CronogramaPage /></RoleRoute>} />
            <Route path="planejamento" element={<RoleRoute requiredModule="cronograma"><CronogramaPage /></RoleRoute>} />
            <Route path="planejamento-semanal" element={<RoleRoute requiredModule="cronograma"><CronogramaPage /></RoleRoute>} />
            <Route path="presenca" element={<RoleRoute requiredModule="presenca"><PresencaPage /></RoleRoute>} />
            <Route path="proxima-aula" element={<RoleRoute allowAluno><ProximaAulaPage /></RoleRoute>} />
            <Route path="proximaaula" element={<RoleRoute allowAluno><ProximaAulaPage /></RoleRoute>} />
            <Route path="alunos" element={<RoleRoute requiredModule="alunos"><AlunosPage /></RoleRoute>} />
            <Route path="pagamentos" element={<RoleRoute requiredModule="pagamentos"><PagamentosPage /></RoleRoute>} />
            <Route path="meus-pagamentos" element={<RoleRoute requiredModule="pagamentos"><MeusPagamentosPage /></RoleRoute>} />
            <Route path="meuspagamentos" element={<RoleRoute requiredModule="pagamentos"><MeusPagamentosPage /></RoleRoute>} />
            <Route path="nivelamento" element={<RoleRoute requiredModule="nivelamento"><NivelamentoPage /></RoleRoute>} />
            <Route path="agendamento-nivelamento" element={<RoleRoute allowAluno><AgendamentoNivelamentoPage /></RoleRoute>} />
            <Route path="agendamentonivelamento" element={<RoleRoute allowAluno><AgendamentoNivelamentoPage /></RoleRoute>} />
            <Route path="meus-nivelamentos" element={<RoleRoute allowAluno><MeusNivelamentosPage /></RoleRoute>} />
            <Route path="meusnivelamentos" element={<RoleRoute allowAluno><MeusNivelamentosPage /></RoleRoute>} />
            <Route path="aulas" element={<RoleRoute requiredModule="aulas"><AulasPage /></RoleRoute>} />
            <Route path="eventos" element={<RoleRoute allowAluno><EventosPage /></RoleRoute>} />
            <Route path="avisos" element={<RoleRoute requiredModule="avisos"><AvisosPage /></RoleRoute>} />
            <Route path="equipe" element={<RoleRoute requiredModule="equipe"><EquipePage /></RoleRoute>} />
            <Route path="frequencia" element={<RoleRoute><FrequenciaPage /></RoleRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
