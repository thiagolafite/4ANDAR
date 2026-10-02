import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  PartyPopper,
  UserCheck,
  Shield,
  FileSpreadsheet,
  X,
  Moon,
  Sun
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

interface NavCategory {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentUser, hasPermission, pendingUsersCount, theme, toggleTheme } = useApp();
  const location = useLocation();

  if (!currentUser) return null;

  const isMaster = Boolean(currentUser.is_master || currentUser.role === 'master' || currentUser.tipo_usuario === 'AdminMaster');
  const isAluno = currentUser.role === 'aluno' || (!isMaster && currentUser.role !== 'professor' && currentUser.role !== 'secretaria' && currentUser.tipo_usuario === 'Aluno');
  const isProfessor = currentUser.role === 'professor';
  const isSecretaria = currentUser.role === 'secretaria';

  const isItemActive = (to: string) => {
    if (to.includes('?')) {
      return location.pathname + location.search === to;
    }
    return location.pathname === to && (!location.search || location.search === '');
  };

  // Menu organizado por categorias funcionais
  const categories: NavCategory[] = isAluno
    ? [
        {
          title: 'Meu Espaço',
          items: [
            { label: 'Meu Painel', to: '/', icon: LayoutGrid },
            { label: 'Minhas Aulas & Presença', to: '/proxima-aula', icon: Clock }
          ]
        },
        {
          title: 'Nivelamento Técnico',
          items: [
            { label: 'Meu Nivelamento', to: '/meus-nivelamentos', icon: Crown },
            { label: 'Agendar Nivelamento', to: '/agendamento-nivelamento', icon: ClipboardList }
          ]
        },
        {
          title: 'Eventos & Comunidade',
          items: [
            { label: 'Eventos & Bailes', to: '/eventos', icon: PartyPopper }
          ]
        }
      ]
    : [
        {
          title: 'Visão Geral',
          items: [
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
              : [])
          ]
        },
        {
          title: 'Pedagógico & Aulas',
          items: [
            ...(hasPermission('cronograma')
              ? [
                  { label: 'Planejamento Semanal / Anual', to: '/cronograma', icon: Calendar },
                  { label: 'Importar Planilha Excel', to: '/cronograma?importar=true', icon: FileSpreadsheet }
                ]
              : []),
            ...(hasPermission('presenca')
              ? [{ label: 'Presença & Chamada', to: '/presenca', icon: ClipboardCheck }]
              : []),
            ...(hasPermission('frequencia') || isMaster || isProfessor
              ? [{ label: 'Frequência Escolar', to: '/frequencia', icon: BarChart3 }]
              : []),
            ...(hasPermission('aulas')
              ? [{ label: 'Turmas & Salas', to: '/aulas', icon: Clock }]
              : []),
            ...(hasPermission('nivelamento')
              ? [{ label: 'Nivelamento Técnico', to: '/nivelamento', icon: Crown }]
              : [])
          ]
        },
        {
          title: 'Gestão Escolar',
          items: [
            ...(hasPermission('alunos')
              ? [{ label: 'Alunos', to: '/alunos', icon: Contact }]
              : []),
            ...(hasPermission('equipe')
              ? [{ label: 'Equipe de Professores', to: '/equipe', icon: UserCheck }]
              : []),
            ...(isMaster || hasPermission('pagamentos')
              ? [{ label: 'Pagamentos & Financeiro', to: '/pagamentos', icon: DollarSign }]
              : [])
          ]
        },
        {
          title: 'Eventos & Comunicação',
          items: [
            ...(hasPermission('eventos')
              ? [{ label: 'Eventos & Bailes', to: '/eventos', icon: PartyPopper }]
              : []),
            ...(hasPermission('avisos')
              ? [{ label: 'Avisos & Comunicados', to: '/avisos', icon: Megaphone }]
              : [])
          ]
        }
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
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-[#fae2c8] dark:border-slate-800 bg-[#ffffff] dark:bg-slate-900 shadow-sm transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 flex flex-col justify-between select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {/* Mobile close button */}
          <div className="flex items-center justify-end px-4 pt-3 lg:hidden">
            <button
              onClick={onClose}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Top Logo Section (Circular Badge) */}
          <div className="flex flex-col items-center justify-center pt-5 pb-4 px-6">
            <div className="h-20 w-20 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center p-1 shadow-xs border border-orange-100/90 dark:border-slate-700 hover:scale-105 transition-transform duration-200">
              <img
                src="/logo-4andar.png"
                alt="Forró 4º Andar"
                className="h-full w-full object-contain rounded-full"
              />
            </div>
          </div>

          {/* Delicate Warm Divider Line */}
          <div className="border-b border-[#f4dfc7] dark:border-slate-800 mx-4 mb-2" />

          {/* Navigation Categories */}
          <nav className="px-3 pb-4 space-y-3">
            {categories
              .filter((category) => category.items.length > 0)
              .map((category, catIdx) => (
                <div key={category.title} className="space-y-1">
                  {catIdx > 0 && <div className="border-t border-[#f4dfc7]/50 dark:border-slate-800/60 my-2 mx-1" />}
                  <div className="px-2.5 pt-1 pb-1">
                    <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#b85d19] dark:text-brand-400 font-sans">
                      {category.title}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {category.items.map((item) => {
                      const Icon = item.icon;
                      const active = isItemActive(item.to);
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          onClick={() => onClose()}
                          className={`group flex items-center gap-3 rounded-2xl px-3 py-2 text-[13.5px] transition-all ${
                            active
                              ? 'bg-[#fde3c7] dark:bg-brand-950/70 text-[#78350f] dark:text-brand-200 font-semibold shadow-xs border border-transparent dark:border-brand-800/40'
                              : 'text-[#334155] dark:text-slate-300 hover:bg-[#fff6ec] dark:hover:bg-slate-800/80 hover:text-[#9a3412] dark:hover:text-brand-400 font-normal'
                          }`}
                        >
                          <Icon
                            className={`h-[17px] w-[17px] shrink-0 transition-colors ${
                              active
                                ? 'text-[#78350f] dark:text-brand-300'
                                : 'text-[#475569] dark:text-slate-400 group-hover:text-[#9a3412] dark:group-hover:text-brand-400'
                            }`}
                          />
                          <span className="truncate flex-1">{item.label}</span>
                          {typeof item.badge === 'number' && item.badge > 0 && (
                            <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-black text-white shadow-xs animate-pulse">
                              {item.badge}
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              ))}
          </nav>
        </div>

        {/* Bottom Footer with Dark Mode Switcher */}
        <div className="p-3 border-t border-[#f4dfc7]/80 dark:border-slate-800 bg-[#fffdfb] dark:bg-slate-900/95 space-y-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
            title={theme === 'dark' ? 'Mudar para Modo Claro (☀️)' : 'Mudar para Modo Noturno (🌙)'}
          >
            <span className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600" />
              )}
              <span>{theme === 'dark' ? 'Modo Noturno' : 'Modo Claro'}</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-900 text-brand-600 dark:text-amber-400 border border-slate-200/60 dark:border-slate-800">
              {theme === 'dark' ? '🌙 Noite' : '☀️ Dia'}
            </span>
          </button>

          <div className="px-3 py-1 text-center">
            <p className="text-[11px] font-semibold text-[#b85d19] dark:text-brand-400">
              Forró 4º Andar
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              Gestão Escolar de Dança
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
