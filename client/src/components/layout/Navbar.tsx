import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Search, UserCheck, Shield, PanelLeft, Bell, Crown, LogOut } from 'lucide-react';

interface NavbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ sidebarOpen, onToggleSidebar }) => {
  const navigate = useNavigate();
  const {
    currentUser,
    switchUserRole,
    setSearchModalOpen,
    presencas,
    pagamentos,
    pendingUsersCount,
    logout
  } = useApp();

  const isMaster = Boolean(currentUser.is_master || currentUser.role === 'master' || currentUser.tipo_usuario === 'AdminMaster');
  const isAluno = currentUser.role === 'aluno' || (!isMaster && currentUser.role !== 'professor' && currentUser.tipo_usuario === 'Aluno');
  const isProfessor = currentUser.role === 'professor';
  const isEquipe = !isAluno;

  // Count pending attendances and overdue payments
  const pendenciasCount = isEquipe
    ? presencas.filter((p) => p.status === 'pendente').length +
      pagamentos.filter((p) => p.status === 'Atrasado').length
    : 0;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#fae2c8] bg-white/95 px-4 backdrop-blur-md md:px-6 shadow-2xs">
      {/* Left: Sidebar Toggle Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-orange-50 hover:border-orange-200 hover:text-brand-700 transition-colors shadow-2xs"
          title={sidebarOpen ? 'Recolher Menu' : 'Expandir Menu'}
          aria-label="Alternar menu lateral"
        >
          <PanelLeft className="h-5 w-5" />
        </button>

        <span className="hidden sm:inline-block text-xs font-bold text-[#b85d19] uppercase tracking-wider">
          4ANDAR • Gestão Escolar de Dança
        </span>
      </div>

      {/* Center: Global Student Search Bar (Apenas Master e Professores) */}
      {!isAluno ? (
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="group flex w-full items-center justify-between rounded-full border border-slate-200/90 bg-slate-50/80 px-4 py-2 text-sm text-slate-500 transition-all hover:border-brand-300 hover:bg-white hover:shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <Search className="h-4 w-4 text-slate-400 group-hover:text-brand-500" />
              <span className="truncate">Buscar aluno por nome ou telefone...</span>
            </div>
            <kbd className="hidden rounded bg-slate-200/70 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600 sm:inline-block">
              Ctrl + K
            </kbd>
          </button>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Right Controls: Mobile Search + Profile Switcher + User Info */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search Button (Apenas Master e Professores) */}
        {!isAluno && (
          <button
            onClick={() => setSearchModalOpen(true)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
            title="Buscar Aluno"
          >
            <Search className="h-5 w-5" />
          </button>
        )}

        {/* Notifications / Pending Alerts Badge */}
        {!isAluno && (
          <div className="relative">
            <button
              onClick={() => {
                if (isMaster && pendingUsersCount > 0) navigate('/usuarios');
                else if (isEquipe) navigate('/presenca');
              }}
              className="rounded-lg p-2 text-slate-500 hover:bg-orange-50 hover:text-brand-600 transition-colors"
              title={
                pendingUsersCount > 0
                  ? `${pendingUsersCount} cadastro(s) aguardando aprovação do Master`
                  : pendenciasCount > 0
                  ? `${pendenciasCount} pendência(s) na escola`
                  : 'Sem pendências'
              }
            >
              <Bell className="h-5 w-5" />
              {isMaster && pendingUsersCount > 0 ? (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-white ring-2 ring-white animate-bounce">
                  {pendingUsersCount}
                </span>
              ) : pendenciasCount > 0 ? (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                  {pendenciasCount}
                </span>
              ) : null}
            </button>
          </div>
        )}

        {/* Profile Switcher Simulator (Apenas Master Thiago Lafite para testes) */}
        {isMaster && (
          <div className="flex items-center rounded-xl bg-orange-50/90 p-1 border border-orange-200/80 text-xs">
            <button
              onClick={() => switchUserRole('AdminMaster')}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 font-medium transition-all ${
                currentUser.is_master || currentUser.tipo_usuario === 'AdminMaster'
                  ? 'bg-amber-500 text-white shadow-xs font-bold'
                  : 'text-amber-800 hover:bg-amber-100/70'
              }`}
              title="Administrador Master (Thiago Lafite)"
            >
              <Crown className="h-3.5 w-3.5 text-amber-200" />
              <span className="hidden sm:inline">Master</span>
            </button>
            <button
              onClick={() => switchUserRole('Equipe')}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 font-medium transition-all ${
                !currentUser.is_master && currentUser.role === 'professor'
                  ? 'bg-brand-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-brand-700 hover:bg-orange-100/70'
              }`}
              title="Simular Visão Professor"
            >
              <Shield className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Professor</span>
            </button>
            <button
              onClick={() => switchUserRole('Aluno')}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 font-medium transition-all ${
                isAluno
                  ? 'bg-brand-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-brand-700 hover:bg-orange-100/70'
              }`}
              title="Simular Visão Aluno"
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Aluno</span>
            </button>
          </div>
        )}

        {/* Active User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <img
            src={
              currentUser.avatar_url ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
            }
            alt={currentUser.nome}
            className={`h-8 w-8 rounded-full object-cover ${
              currentUser.is_master ? 'ring-2 ring-amber-400' : 'ring-2 ring-brand-500/30'
            }`}
          />
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight flex items-center gap-1">
              <span>{currentUser.nome.split(' ')[0]}</span>
              {currentUser.is_master && <Crown className="h-3 w-3 text-amber-500" />}
            </p>
            <p className="text-[10px] text-brand-600 font-medium">
              {currentUser.is_master
                ? 'Admin Master'
                : currentUser.tipo_usuario === 'Equipe'
                ? 'Admin / Professor'
                : 'Aluno'}
            </p>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              if (window.confirm('Deseja realmente sair do sistema?')) {
                logout();
                navigate('/login');
              }
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
            title="Sair do Sistema (Logout)"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
