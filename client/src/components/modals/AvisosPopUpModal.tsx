import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Aviso } from '../../types';
import {
  Megaphone,
  Bell,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  X,
  ChevronRight,
  ChevronLeft,
  Calendar,
  UserCheck,
  Sparkles
} from 'lucide-react';

export const AvisosPopUpModal: React.FC = () => {
  const { currentUser, avisos } = useApp();
  if (!currentUser) return null;

  const [activeAvisoIndex, setActiveAvisoIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [lidosIds, setLidosIds] = useState<string[]>([]);

  const storageKey = `4andar_avisos_lidos_${currentUser.id || 'guest'}`;

  // Carrega IDs já lidos pelo usuário do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setLidosIds(JSON.parse(stored));
      } else {
        setLidosIds([]);
      }
    } catch {
      setLidosIds([]);
    }
  }, [storageKey]);

  // Determina se o usuário corresponde ao público-alvo
  const isMaster = Boolean(currentUser.is_master || currentUser.role === 'master' || currentUser.tipo_usuario === 'AdminMaster');
  const isProfessor = currentUser.role === 'professor' || currentUser.tipo_usuario === 'Equipe';
  const isAluno = currentUser.role === 'aluno' || (!isMaster && !isProfessor && currentUser.tipo_usuario === 'Aluno');

  // Filtra avisos que devem aparecer como pop-up e ainda não foram lidos
  const avisosPendentes = avisos.filter((av: Aviso) => {
    // Se o aviso estiver configurado para NÃO exibir pop-up
    if (av.mostrar_popup === false) return false;

    // Se já foi marcado como lido/dispensado
    if (lidosIds.includes(av.id)) return false;

    const dest = av.destinatario_tipo || 'todos';

    // Master/Admin pode ver todos os comunicados
    if (isMaster) return true;

    // Destinado a todos
    if (dest === 'todos') return true;

    // Destinado a alunos
    if (dest === 'aluno' && isAluno) return true;

    // Destinado a professores
    if (dest === 'professor' && (isProfessor || isMaster)) return true;

    // Destinado a admin
    if (dest === 'admin' && isMaster) return true;

    return false;
  });

  // Abre o modal se houver avisos pendentes
  useEffect(() => {
    if (avisosPendentes.length > 0) {
      setIsOpen(true);
      if (activeAvisoIndex >= avisosPendentes.length) {
        setActiveAvisoIndex(0);
      }
    } else {
      setIsOpen(false);
    }
  }, [avisosPendentes.length, activeAvisoIndex]);

  if (!isOpen || avisosPendentes.length === 0) {
    return null;
  }

  const avisoAtual = avisosPendentes[activeAvisoIndex] || avisosPendentes[0];

  const marcarComoLido = (id: string) => {
    const novos = [...lidosIds, id];
    setLidosIds(novos);
    try {
      localStorage.setItem(storageKey, JSON.stringify(novos));
    } catch {}

    if (activeAvisoIndex >= avisosPendentes.length - 1) {
      setActiveAvisoIndex(Math.max(0, avisosPendentes.length - 2));
    }
  };

  const dispensarTodos = () => {
    const todosIds = Array.from(new Set([...lidosIds, ...avisosPendentes.map((a) => a.id)]));
    setLidosIds(todosIds);
    try {
      localStorage.setItem(storageKey, JSON.stringify(todosIds));
    } catch {}
    setIsOpen(false);
  };

  const getPriorityStyle = (prioridade?: string) => {
    switch (prioridade) {
      case 'urgente':
        return {
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
          cardBorder: 'border-rose-400',
          headerBg: 'bg-gradient-to-r from-rose-600 to-red-700',
          icon: AlertTriangle,
          label: 'Urgente / Alerta Máximo'
        };
      case 'importante':
        return {
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
          cardBorder: 'border-amber-400',
          headerBg: 'bg-gradient-to-r from-amber-500 to-orange-600',
          icon: Bell,
          label: 'Importante'
        };
      default:
        return {
          badgeBg: 'bg-orange-100 text-brand-800 border-orange-200',
          cardBorder: 'border-brand-300',
          headerBg: 'bg-gradient-to-r from-brand-600 to-orange-600',
          icon: Megaphone,
          label: 'Informativo Geral'
        };
    }
  };

  const getAudienceLabel = (dest?: string) => {
    switch (dest) {
      case 'aluno':
        return '🎓 Exclusivo para Alunos';
      case 'professor':
        return '👨‍🏫 Equipe & Professores';
      case 'admin':
        return '🛡️ Gestão & Administração';
      default:
        return '👥 Todos os Alunos & Professores';
    }
  };

  const style = getPriorityStyle(avisoAtual.prioridade);
  const IconComponent = style.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border-2 ${style.cardBorder} animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]`}
      >
        {/* Modal Header */}
        <div className={`${style.headerBg} p-5 text-white relative`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 backdrop-blur-xs rounded-2xl flex items-center justify-center shadow-inner">
                <IconComponent className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/25 text-white">
                    {style.label}
                  </span>
                  <span className="text-[11px] font-medium text-white/80">
                    {getAudienceLabel(avisoAtual.destinatario_tipo)}
                  </span>
                </div>
                <h3 className="text-xl font-black mt-1 tracking-tight text-white line-clamp-1">
                  Aviso da Escola 4ANDAR
                </h3>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              title="Fechar (ver depois)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Tabs if multiple avisos */}
          {avisosPendentes.length > 1 && (
            <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between text-xs text-white/90">
              <span className="font-semibold">
                Comunicado {activeAvisoIndex + 1} de {avisosPendentes.length}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={activeAvisoIndex === 0}
                  onClick={() => setActiveAvisoIndex((prev) => Math.max(0, prev - 1))}
                  className="p-1 rounded bg-white/15 hover:bg-white/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title="Aviso anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={activeAvisoIndex >= avisosPendentes.length - 1}
                  onClick={() => setActiveAvisoIndex((prev) => Math.min(avisosPendentes.length - 1, prev + 1))}
                  className="p-1 rounded bg-white/15 hover:bg-white/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title="Próximo aviso"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Publicado em: {avisoAtual.data_publicacao}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <UserCheck className="h-3.5 w-3.5 text-slate-400" />
              Por: {avisoAtual.autor || 'Coordenação 4ANDAR'}
            </span>
          </div>

          <h4 className="text-xl font-bold text-slate-900 leading-snug">
            {avisoAtual.titulo}
          </h4>

          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 font-normal">
            {avisoAtual.conteudo}
          </div>

          {avisoAtual.link_url && (
            <div className="pt-2">
              <a
                href={avisoAtual.link_url}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-50 border border-brand-200 px-4 py-3 text-sm font-bold text-brand-700 hover:bg-brand-100 transition-colors shadow-xs"
              >
                <span>{avisoAtual.link_texto || 'Acessar Link Externo / WhatsApp'}</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          {avisosPendentes.length > 1 ? (
            <button
              type="button"
              onClick={dispensarTodos}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline transition-colors"
            >
              Marcar todos como lidos ({avisosPendentes.length})
            </button>
          ) : (
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-brand-500" />
              Fique sempre atento aos novos avisos
            </div>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-all"
            >
              Lembrar depois
            </button>

            <button
              type="button"
              onClick={() => marcarComoLido(avisoAtual.id)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Entendido / Marcar como Lido</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
