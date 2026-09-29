import React from 'react';
import { useApp } from '../../context/AppContext';
import { Search, UserCheck, Shield, PanelLeft, Bell } from 'lucide-react';

interface NavbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ sidebarOpen, onToggleSidebar }) => {
  const {
    currentUser,
    switchUserRole,
    setSearchModalOpen,
    presencas,
    pagamentos
  } = useApp();

  const isEquipe = currentUser.tipo_usuario === 'Equipe';

  // Count pending attendances and overdue payments
  const pendenciasCount = isEquipe
    ? presencas.filter((p) => p.status === 'pendente').length +
      pagamentos.filter((p) => p.status === 'Atrasado').length
    : pagamentos.filter(
        (p) => p.aluno_id === currentUser.aluno_id && p.status !== 'Pago'
      ).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#fae2c8] bg-white/95 px-4 backdrop-blur-md md:px-6 shadow-2xs">
      {/* Left: Sidebar Toggle Button (Matching the screenshot icon [|]) */}
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

      {/* Center: Global Student Search Bar */}
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

      {/* Right Controls: Mobile Search + Profile Switcher + User Info */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search Button */}
        <button
          onClick={() => setSearchModalOpen(true)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
          title="Buscar Aluno"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Notifications / Pending Alerts Badge */}
        <div className="relative">
          <button
            className="rounded-lg p-2 text-slate-500 hover:bg-orange-50 hover:text-brand-600 transition-colors"
            title={
              pendenciasCount > 0
                ? `${pendenciasCount} pendência(s) aguardando atenção`
                : 'Sem pendências'
            }
          >
            <Bell className="h-5 w-5" />
            {pendenciasCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                {pendenciasCount}
              </span>
            )}
          </button>
        </div>

        {/* Profile Switcher Simulator */}
        <div className="flex items-center rounded-xl bg-orange-50/90 p-1 border border-orange-200/80 text-xs">
          <button
            onClick={() => switchUserRole('Equipe')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium transition-all ${
              isEquipe
                ? 'bg-brand-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-brand-700 hover:bg-orange-100/70'
            }`}
            title="Alternar para Perfil Equipe"
          >
            <Shield className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Equipe</span>
          </button>
          <button
            onClick={() => switchUserRole('Aluno')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium transition-all ${
              !isEquipe
                ? 'bg-brand-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-brand-700 hover:bg-orange-100/70'
            }`}
            title="Alternar para Perfil Aluno"
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Aluno</span>
          </button>
        </div>

        {/* Active User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <img
            src={
              currentUser.avatar_url ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
            }
            alt={currentUser.nome}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-brand-500/30"
          />
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">
              {currentUser.nome.split(' ')[0]} {currentUser.nome.split(' ')[1] || ''}
            </p>
            <p className="text-[10px] text-brand-600 font-medium">
              {currentUser.tipo_usuario === 'Equipe' ? 'Admin / Professor' : 'Aluno'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
