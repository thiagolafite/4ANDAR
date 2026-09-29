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
  UserCheck
} from 'lucide-react';
import { Aviso } from '../types';

export const AvisosPage: React.FC = () => {
  const { currentUser, avisos, addAviso, deleteAviso } = useApp();
  const isEquipe = currentUser.tipo_usuario === 'Equipe';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novoAviso, setNovoAviso] = useState<Omit<Aviso, 'id'>>({
    titulo: '',
    conteudo: '',
    data_publicacao: '2026-09-29',
    link_url: '',
    link_texto: '',
    fixado: false,
    autor: currentUser.nome
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addAviso(novoAviso);
    setIsModalOpen(false);
    setNovoAviso({
      titulo: '',
      conteudo: '',
      data_publicacao: '2026-09-29',
      link_url: '',
      link_texto: '',
      fixado: false,
      autor: currentUser.nome
    });
  };

  // Sort pinned first
  const sortedAvisos = [...avisos].sort((a, b) => {
    if (a.fixado && !b.fixado) return -1;
    if (!a.fixado && b.fixado) return 1;
    return b.data_publicacao.localeCompare(a.data_publicacao);
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Megaphone className="h-6 w-6 text-brand-600" />
            Mural de Avisos & Comunicados
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Notícias da escola, materiais de aula, comunicados pedagógicos e grupos de WhatsApp.
          </p>
        </div>

        {isEquipe && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 text-xs shadow-md shadow-brand-500/20 transition-all self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>+ Publicar Aviso</span>
          </button>
        )}
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {sortedAvisos.map((aviso) => (
          <div
            key={aviso.id}
            className={`rounded-2xl border p-5 md:p-6 transition-all ${
              aviso.fixado
                ? 'bg-amber-50/50 border-amber-200/80 shadow-xs'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  {aviso.fixado && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-200/80 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-900">
                      <Pin className="h-3 w-3" /> Fixado
                    </span>
                  )}
                  <span className="text-xs font-semibold text-slate-400">
                    {aviso.data_publicacao}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  {aviso.titulo}
                </h3>

                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {aviso.conteudo}
                </p>

                {aviso.link_url && (
                  <div className="pt-2">
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

                <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Publicado por: {aviso.autor}</span>
                </div>
              </div>

              {isEquipe && (
                <button
                  onClick={() => deleteAviso(aviso.id)}
                  className="text-slate-300 hover:text-rose-600 p-1.5 rounded transition-colors"
                  title="Excluir aviso"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Novo Aviso */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Publicar Novo Aviso</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
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
                  placeholder="Ex.: 📢 Novas vagas abertas para o Workshop"
                  className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-brand-500"
                />
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
                  placeholder="Escreva a mensagem que todos os alunos e equipe verão..."
                  className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Link URL (Opcional)
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
                    placeholder="Ex.: Entrar no Grupo"
                    className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={novoAviso.fixado}
                    onChange={(e) =>
                      setNovoAviso({ ...novoAviso, fixado: e.target.checked })
                    }
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>Fixar este aviso no topo do mural</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
                >
                  Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
