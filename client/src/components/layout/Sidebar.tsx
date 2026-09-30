import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutGrid,
  Crown,
  ClipboardList,
  Contact,
  DollarSign,
  Megaphone,
  ClipboardCheck,
  BarChart3,
  Clock,
  Calendar,
  CalendarClock,
  PartyPopper,
  UserCheck,
  Shield,
  FileSpreadsheet,
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
  highlight?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentUser, hasPermission, pendingUsersCount } = useApp();
  const isMaster = Boolean(currentUser.is_master || currentUser.role === 'master' || currentUser.tipo_usuario === 'AdminMaster');
  const isAluno = currentUser.role === 'aluno' || (!isMaster && currentUser.role !== 'professor' && currentUser.tipo_usuario === 'Aluno');
  const isProfessor = currentUser.role === 'professor';

  // Aluno: Acesso estritamente limitado aos seus próprios módulos
  // Master e Professor: Gestão completa e módulos da escola
  const menuItems: NavItem[] = isAluno
    ? [
        { label: 'Meu Painel', to: '/', icon: LayoutGrid },
        { label: 'Minhas Aulas & Presença', to: '/proxima-aula', icon: Clock },
        { label: 'Meu Nivelamento', to: '/meus-nivelamentos', icon: Crown },
        { label: 'Agendar Nivelamento', to: '/agendamento-nivelamento', icon: ClipboardList },
        { label: 'Eventos & Bailes', to: '/eventos', icon: PartyPopper }
      ]
    : [
        { label: 'Dashboard', to: '/', icon: LayoutGrid },
        ...(isMaster || hasPermission('usuarios')
          ? [
              {
                label: 'Gestão de Usuários',
                to: '/usuarios',
                icon: Shield,
                badge: pendingUsersCount,
                highlight: true
              }
            ]
          : []),
        ...(hasPermission('alunos') ? [{ label: 'Alunos', to: '/alunos', icon: Contact }] : []),
        ...(hasPermission('presenca') ? [{ label: 'Presença & Chamada', to: '/presenca', icon: ClipboardCheck }] : []),
        ...(hasPermission('cronograma')
          ? [
              { label: 'Planejamento Semanal / Anual', to: '/cronograma', icon: Calendar },
              { label: 'Importar Excel (Grade)', to: '/cronograma?importar=true', icon: FileSpreadsheet }
            ]
          : []),
        ...(hasPermission('aulas') ? [{ label: 'Aulas & Salas', to: '/aulas', icon: Clock }] : []),
        ...(hasPermission('nivelamento') ? [{ label: 'Nivelamento', to: '/nivelamento', icon: Crown }] : []),
        ...(hasPermission('frequencia') || isMaster || isProfessor ? [{ label: 'Frequência', to: '/frequencia', icon: BarChart3 }] : []),
        ...(isMaster || hasPermission('pagamentos') ? [{ label: 'Pagamentos', to: '/pagamentos', icon: DollarSign }] : []),
        ...(hasPermission('equipe') ? [{ label: 'Equipe de Professores', to: '/equipe', icon: UserCheck }] : []),
        ...(hasPermission('eventos') ? [{ label: 'Eventos & Bailes', to: '/eventos', icon: PartyPopper }] : []),
        ...(hasPermission('avisos') ? [{ label: 'Avisos', to: '/avisos', icon: Megaphone }] : []),
        { label: 'Minha Agenda', to: '/agenda-google', icon: CalendarClock }
      ];

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-[#fae2c8] bg-[#ffffff] shadow-sm transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 flex flex-col justify-between select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto">
          {/* Mobile close button */}
          <div className="flex items-center justify-end px-4 pt-3 lg:hidden">
            <button
              onClick={onClose}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Top Logo Section (Circular Badge as in screenshot) */}
          <div className="flex flex-col items-center justify-center pt-6 pb-5 px-6">
            <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center p-1 shadow-xs border border-orange-100/90 hover:scale-105 transition-transform duration-200">
              <img
                src="/logo-4andar.png"
                alt="Forró 4º Andar"
                className="h-full w-full object-contain rounded-full"
              />
            </div>
          </div>

          {/* Delicate Warm Divider Line */}
          <div className="border-b border-[#f4dfc7] mx-4" />

          {/* Menu Category Header */}
          <div className="px-5 pt-4 pb-2">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#b85d19] font-sans">
              MENU
            </span>
          </div>

          {/* Navigation Items List */}
          <nav className="px-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    `group flex items-center gap-3.5 rounded-2xl px-3.5 py-2.5 text-[14px] transition-all ${
                      isActive
                        ? 'bg-[#fde3c7] text-[#78350f] font-semibold shadow-xs'
                        : 'text-[#334155] hover:bg-[#fff6ec] hover:text-[#9a3412] font-normal'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                          isActive
                            ? 'text-[#78350f]'
                            : 'text-[#475569] group-hover:text-[#9a3412]'
                        }`}
                      />
                      <span className="truncate flex-1">{item.label}</span>
                      {typeof item.badge === 'number' && item.badge > 0 && (
                        <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-black text-white shadow-xs animate-pulse">
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

        {/* Subtle Bottom Footer */}
        <div className="p-3 border-t border-[#f4dfc7]/80 bg-[#fffdfb]">
          <div className="px-3 py-1.5 text-center">
            <p className="text-[11px] font-semibold text-[#b85d19]">
              Forró 4º Andar
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Gestão Escolar de Dança
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
