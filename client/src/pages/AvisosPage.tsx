import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Megaphone,
  Pin,
  ExternalLink,
  Plus,
  Trash2,
  Calendar,
  X,
  UserCheck,
  Users,
  GraduationCap,
  Shield,
  AlertTriangle,
  Bell,
  Sparkles,
  Layers,
  Eye
} from 'lucide-react';
import { Aviso, DestinatarioAviso, PrioridadeAviso } from '../types';

export const AvisosPage: React.FC = () => {
  const { currentUser, avisos, addAviso, deleteAviso, hasPermission } = useApp();

  const isMaster = Boolean(currentUser.is_master || currentUser.role === 'master' || currentUser.tipo_usuario === 'AdminMaster');
  const isProfessor = currentUser.role === 'professor' || currentUser.tipo_usuario === 'Equipe';
  const isAluno = currentUser.role === 'aluno' || (!isMaster && !isProfessor && currentUser.tipo_usuario === 'Aluno');

  const canManage = isMaster || isProfessor || hasPermission('avisos', 'manage');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterAudiencia, setFilterAudiencia] = useState<'all' | 'todos' | 'aluno' | 'professor' | 'admin'>('all');
  const [previewAviso, setPreviewAviso] = useState<Aviso | null>(null);

  const [novoAviso, setNovoAviso] = useState<Omit<Aviso, 'id'>>({
    titulo: '',
    conteudo: '',
    data_publicacao: new Date().toISOString().substring(0, 10),
    link_url: '',
    link_texto: '',
    fixado: false,
    autor: currentUser.nome,
    destinatario_tipo: 'todos',
    mostrar_popup: true,
    prioridade: 'normal'
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addAviso(novoAviso);
    setIsModalOpen(false);
    setNovoAviso({
      titulo: '',
      conteudo: '',
      data_publicacao: new Date().toISOString().substring(0, 10),
      link_url: '',
      link_texto: '',
      fixado: false,
      autor: currentUser.nome,
      destinatario_tipo: 'todos',
      mostrar_popup: true,
      prioridade: 'normal'
    });
  };

  // Restringe a lista para alunos ou professores se não for master
  const visibleAvisos = isAluno
    ? avisos.filter((a) => !a.destinatario_tipo || a.destinatario_tipo === 'todos' || a.destinatario_tipo === 'aluno')
    : isProfessor && !isMaster
    ? avisos.filter((a) => !a.destinatario_tipo || a.destinatario_tipo === 'todos' || a.destinatario_tipo === 'professor')
    : avisos;

  // Aplica filtro de público
  const filteredAvisos = visibleAvisos.filter((a) => {
    if (filterAudiencia === 'all') return true;
    if (filterAudiencia === 'todos') return !a.destinatario_tipo || a.destinatario_tipo === 'todos';
    return a.destinatario_tipo === filterAudiencia;
  });

  // Ordena fixados primeiro e depois por data
  const sortedAvisos = [...filteredAvisos].sort((a, b) => {
    if (a.fixado && !b.fixado) return -1;
    if (!a.fixado && b.fixado) return 1;
    return b.data_publicacao.localeCompare(a.data_publicacao);
  });

  const getAudienceBadge = (dest?: DestinatarioAviso) => {
    switch (dest) {
      case 'aluno':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
            <GraduationCap className="h-3 w-3" /> Alunos
          </span>
        );
      case 'professor':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 border border-purple-200 px-2.5 py-0.5 text-[11px] font-bold text-purple-700">
            <UserCheck className="h-3 w-3" /> Professores / Equipe
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[11px] font-bold text-rose-700">
            <Shield className="h-3 w-3" /> Apenas Coordenação
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
            <Users className="h-3 w-3" /> Todos os Usuários
          </span>
        );
    }
  };

  const getPriorityBadge = (p?: PrioridadeAviso) => {
    switch (p) {
      case 'urgente':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 border border-rose-300 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-800">
            <AlertTriangle className="h-3 w-3" /> Urgente
          </span>
        );
      case 'importante':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-800">
            <Bell className="h-3 w-3" /> Importante
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Megaphone className="h-6 w-6 text-brand-600" />
            Mural de Avisos & Comunicados
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Notícias da escola, materiais de aula, comunicados pedagógicos e pop-ups aos usuários.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 text-xs shadow-md shadow-brand-500/20 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Publicar Novo Aviso</span>
          </button>
        )}
      </div>

      {/* Filter Tabs by Target Audience */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-bold text-slate-400 px-3 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-slate-400" />
          Filtrar por Público:
        </span>

        <button
          onClick={() => setFilterAudiencia('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterAudiencia === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Todos ({visibleAvisos.length})
        </button>

        <button
          onClick={() => setFilterAudiencia('todos')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            filterAudiencia === 'todos'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          Geral / Todos ({visibleAvisos.filter((a) => !a.destinatario_tipo || a.destinatario_tipo === 'todos').length})
        </button>

        <button
          onClick={() => setFilterAudiencia('aluno')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            filterAudiencia === 'aluno'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="h-3.5 w-3.5" />
          Alunos ({visibleAvisos.filter((a) => a.destinatario_tipo === 'aluno').length})
        </button>

        {(isMaster || isProfessor) && (
          <button
            onClick={() => setFilterAudiencia('professor')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterAudiencia === 'professor'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            Professores ({visibleAvisos.filter((a) => a.destinatario_tipo === 'professor').length})
          </button>
        )}

        {isMaster && (
          <button
            onClick={() => setFilterAudiencia('admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterAudiencia === 'admin'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            Coordenação ({visibleAvisos.filter((a) => a.destinatario_tipo === 'admin').length})
          </button>
        )}
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {sortedAvisos.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Megaphone className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-700">Nenhum aviso encontrado para esta categoria.</p>
            <p className="text-xs text-slate-400 mt-1">
              {canManage ? 'Clique no botão "+ Publicar Novo Aviso" para criar um novo comunicado.' : 'Novos avisos publicados pela escola aparecerão aqui.'}
            </p>
          </div>
        ) : (
          sortedAvisos.map((aviso) => (
            <div
              key={aviso.id}
              className={`rounded-2xl border p-5 md:p-6 transition-all ${
                aviso.prioridade === 'urgente'
                  ? 'bg-rose-50/40 border-rose-300 shadow-xs'
                  : aviso.fixado
                  ? 'bg-amber-50/50 border-amber-200/80 shadow-xs'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2.5 flex-1">
                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-2">
                    {aviso.fixado && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-200/80 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-900">
                        <Pin className="h-3 w-3" /> Fixado
                      </span>
                    )}
                    {getPriorityBadge(aviso.prioridade)}
                    {getAudienceBadge(aviso.destinatario_tipo)}
                    {aviso.mostrar_popup !== false && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 border border-orange-200 px-2 py-0.5 text-[10px] font-bold text-brand-800">
                        <Sparkles className="h-3 w-3" /> Pop-up Ativo
                      </span>
                    )}
                    <span className="text-xs font-semibold text-slate-400 ml-auto flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {aviso.data_publicacao}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {aviso.titulo}
                  </h3>

                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {aviso.conteudo}
                  </p>

                  {aviso.link_url && (
                    <div className="pt-1">
                      <a
                        href={aviso.link_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-brand-50 border border-brand-200 px-3.5 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-100 transition-colors"
                      >
                        <span>{aviso.link_texto || 'Acessar Link Externo'}</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  )}

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 border-t border-slate-100">
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                      Publicado por: <strong className="text-slate-600">{aviso.autor}</strong>
                    </span>

                    <button
                      onClick={() => setPreviewAviso(aviso)}
                      className="text-brand-600 hover:text-brand-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Visualizar como Pop-up</span>
                    </button>
                  </div>
                </div>

                {canManage && (
                  <button
                    onClick={() => deleteAviso(aviso.id)}
                    className="text-slate-300 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Excluir aviso"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Novo Aviso */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-brand-600" />
                Cadastrar Aviso & Comunicado
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Título do Comunicado *
                </label>
                <input
                  type="text"
                  required
                  value={novoAviso.titulo}
                  onChange={(e) =>
                    setNovoAviso({ ...novoAviso, titulo: e.target.value })
                  }
                  placeholder="Ex.: 📢 Aulas especiais de Forró Pé de Serra neste Sábado"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>

              {/* Público-Alvo e Prioridade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Público-Alvo (Destinatário) *
                  </label>
                  <select
                    value={novoAviso.destinatario_tipo}
                    onChange={(e) =>
                      setNovoAviso({ ...novoAviso, destinatario_tipo: e.target.value as DestinatarioAviso })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-brand-500 bg-white"
                  >
                    <option value="todos">👥 Todos (Alunos e Professores)</option>
                    <option value="aluno">🎓 Apenas Alunos</option>
                    <option value="professor">👨‍🏫 Apenas Professores / Equipe</option>
                    <option value="admin">🛡️ Apenas Coordenação / Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Prioridade *
                  </label>
                  <select
                    value={novoAviso.prioridade}
                    onChange={(e) =>
                      setNovoAviso({ ...novoAviso, prioridade: e.target.value as PrioridadeAviso })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-brand-500 bg-white"
                  >
                    <option value="normal">Informativo Geral (Normal)</option>
                    <option value="importante">🔔 Importante</option>
                    <option value="urgente">⚠️ Urgente / Alerta Máximo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Conteúdo do Aviso *
                </label>
                <textarea
                  rows={4}
                  required
                  value={novoAviso.conteudo}
                  onChange={(e) =>
                    setNovoAviso({ ...novoAviso, conteudo: e.target.value })
                  }
                  placeholder="Escreva a mensagem completa do aviso..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Link Externo (Opcional)
                  </label>
                  <input
                    type="url"
                    value={novoAviso.link_url}
                    onChange={(e) =>
                      setNovoAviso({ ...novoAviso, link_url: e.target.value })
                    }
                    placeholder="https://chat.whatsapp.com/..."
                    className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Texto do Botão
                  </label>
                  <input
                    type="text"
                    value={novoAviso.link_texto}
                    onChange={(e) =>
                      setNovoAviso({ ...novoAviso, link_texto: e.target.value })
                    }
                    placeholder="Ex.: Entrar no Grupo do WhatsApp"
                    className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Opções de Pop-up e Fixar */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={novoAviso.mostrar_popup}
                    onChange={(e) =>
                      setNovoAviso({ ...novoAviso, mostrar_popup: e.target.checked })
                    }
                    className="h-4 w-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>Exibir Pop-up na tela dos usuários ao entrarem</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-600">
                  <input
                    type="checkbox"
                    checked={novoAviso.fixado}
                    onChange={(e) =>
                      setNovoAviso({ ...novoAviso, fixado: e.target.checked })
                    }
                    className="h-4 w-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>Fixar este aviso no topo do mural</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 cursor-pointer"
                >
                  Publicar Aviso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pop-up Preview Modal */}
      {previewAviso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-brand-400 animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="bg-gradient-to-r from-brand-600 to-orange-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Megaphone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/25 text-white">
                    Pré-visualização do Pop-up
                  </span>
                  <h4 className="text-lg font-bold text-white mt-0.5">
                    {previewAviso.titulo}
                  </h4>
                </div>
              </div>
              <button
                onClick={() => setPreviewAviso(null)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>Publicado em: {previewAviso.data_publicacao}</span>
                <span>•</span>
                <span>Por: {previewAviso.autor}</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {previewAviso.conteudo}
              </div>

              {previewAviso.link_url && (
                <a
                  href={previewAviso.link_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-50 border border-brand-200 px-4 py-3 text-sm font-bold text-brand-700 hover:bg-brand-100 transition-colors"
                >
                  <span>{previewAviso.link_texto || 'Acessar Link Externo'}</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewAviso(null)}
                className="px-5 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-sm hover:bg-brand-700 cursor-pointer"
              >
                Fechar Pré-visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
