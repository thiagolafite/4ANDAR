import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  CheckSquare,
  BookOpen,
  DollarSign,
  Award,
  PartyPopper,
  Megaphone,
  UserCheck,
  Calendar,
  Sparkles,
  CreditCard,
  Target,
  History,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentUser, presencas, pagamentos, nivelamentoSessoes } = useApp();
  const isEquipe = currentUser.tipo_usuario === 'Equipe';

  // Badges calculation
  const pendingPresencas = presencas.filter((p) => p.status === 'pendente').length;
  const pendingPagamentos = pagamentos.filter((p) => p.status === 'Atrasado').length;
  const scheduledNivelamentos = nivelamentoSessoes.filter((s) => s.status === 'Agendado').length;

  const equipeNavItems: NavItem[] = [
    { label: 'Dashboard', to: '/', icon: LayoutDashboard },
    { label: 'Cronograma Semanal', to: '/cronograma', icon: CalendarDays },
    { label: 'Alunos', to: '/alunos', icon: Users },
    {
      label: 'Presença & Chamada',
      to: '/presenca',
      icon: CheckSquare,
      badge: pendingPresencas > 0 ? pendingPresencas : undefined,
      badgeColor: 'bg-amber-500'
    },
    { label: 'Turmas & Aulas', to: '/aulas', icon: BookOpen },
    {
      label: 'Pagamentos',
      to: '/pagamentos',
      icon: DollarSign,
      badge: pendingPagamentos > 0 ? pendingPagamentos : undefined,
      badgeColor: 'bg-rose-500'
    },
    {
      label: 'Nivelamento Técnico',
      to: '/nivelamento',
      icon: Award,
      badge: scheduledNivelamentos > 0 ? scheduledNivelamentos : undefined,
      badgeColor: 'bg-blue-500'
    },
    { label: 'Eventos & Bailes', to: '/eventos', icon: PartyPopper },
    { label: 'Mural de Avisos', to: '/avisos', icon: Megaphone },
    { label: 'Equipe de Professores', to: '/equipe', icon: UserCheck },
    { label: 'Google Calendar', to: '/agenda-google', icon: Calendar }
  ];

  const alunoNavItems: NavItem[] = [
    { label: 'Início', to: '/', icon: LayoutDashboard },
    { label: 'Minha Próxima Aula', to: '/proxima-aula', icon: Sparkles },
    { label: 'Cronograma da Escola', to: '/cronograma', icon: CalendarDays },
    { label: 'Meus Pagamentos', to: '/meus-pagamentos', icon: CreditCard },
    { label: 'Agendar Nivelamento', to: '/agendamento-nivelamento', icon: Target },
    { label: 'Meus Nivelamentos', to: '/meus-nivelamentos', icon: History },
    { label: 'Minha Frequência', to: '/frequencia', icon: CheckSquare },
    { label: 'Eventos & Workshops', to: '/eventos', icon: PartyPopper },
    { label: 'Mural de Avisos', to: '/avisos', icon: Megaphone }
  ];

  const navItems = isEquipe ? equipeNavItems : alunoNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-orange-100 bg-white shadow-lg transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 lg:shadow-none flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="flex items-center justify-between px-3 pb-3 mb-2 border-b border-orange-100/60 lg:hidden">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Navegação
            </span>
            <button
              onClick={onClose}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-3 px-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {isEquipe ? 'Painel da Equipe' : 'Área do Aluno'}
            </span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    `group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 font-semibold'
                        : 'text-slate-600 hover:bg-orange-50 hover:text-orange-700'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`h-4 w-4 transition-colors ${
                            isActive
                              ? 'text-white'
                              : 'text-slate-400 group-hover:text-orange-600'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white ${
                            isActive ? 'bg-white/20' : item.badgeColor
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info box */}
        <div className="p-4 border-t border-orange-100/60 bg-gradient-to-b from-transparent to-orange-50/50">
          <div className="rounded-xl bg-orange-100/60 p-3 text-xs text-orange-950">
            <p className="font-semibold flex items-center gap-1.5 text-brand-800">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Forró Pé de Serra & Salão
            </p>
            <p className="text-[11px] text-orange-700 mt-1 leading-relaxed">
              {isEquipe
                ? 'Modo Coordenação e Controle de Turmas ativo.'
                : 'Você está no modo Aluno (Nível B1).'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
