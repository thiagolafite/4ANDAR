import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  PartyPopper,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Plus,
  X,
  CheckCircle2,
  Ticket
} from 'lucide-react';
import { Evento } from '../types';

export const EventosPage: React.FC = () => {
  const { currentUser, eventos, addEvento, inscreverEvento } = useApp();
  const isEquipe = currentUser.tipo_usuario === 'Equipe';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novoEvento, setNovoEvento] = useState<Omit<Evento, 'id'>>({
    titulo: '',
    descricao: '',
    data_evento: '2026-10-31',
    horario: '20:00 às 02:00',
    local: 'Salão Nobre do 4ANDAR',
    foto_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
    preco: 40.0,
    vagas_limite: 120,
    vagas_preenchidas: 0,
    status: 'Inscrições Abertas'
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addEvento(novoEvento);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <PartyPopper className="h-6 w-6 text-brand-600" />
            Eventos, Bailes & Workshops
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Festas, shows de forró ao vivo, quadrilhas e workshops técnicos com limite de vagas.
          </p>
        </div>

        {isEquipe && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 text-xs shadow-md shadow-brand-500/20 transition-all self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>+ Criar Novo Evento</span>
          </button>
        )}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventos.map((evento) => {
          const vagasDisponiveis = Math.max(0, evento.vagas_limite - evento.vagas_preenchidas);
          const percentualOcupado = Math.min(
            100,
            Math.round((evento.vagas_preenchidas / evento.vagas_limite) * 100)
          );

          return (
            <div
              key={evento.id}
              className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={evento.foto_url}
                    alt={evento.titulo}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                        evento.status === 'Esgotado'
                          ? 'bg-rose-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {evento.status}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="rounded-xl bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-black text-white">
                      R$ {evento.preco.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-lg text-slate-900 leading-snug">
                    {evento.titulo}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {evento.descricao}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <p className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-brand-600" />
                      <span>{evento.data_evento} às {evento.horario}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{evento.local}</span>
                    </p>
                  </div>

                  {/* Vagas Bar */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500 font-medium">Ocupação de Vagas:</span>
                      <span className="font-bold text-slate-800">
                        {evento.vagas_preenchidas} / {evento.vagas_limite} ({vagasDisponiveis} restantes)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentualOcupado > 80 ? 'bg-amber-500' : 'bg-brand-500'
                        }`}
                        style={{ width: `${percentualOcupado}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => inscreverEvento(evento.id)}
                  disabled={vagasDisponiveis <= 0}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold py-2.5 text-xs shadow-md shadow-brand-500/20 transition-all"
                >
                  <Ticket className="h-4 w-4" />
                  <span>
                    {vagasDisponiveis <= 0
                      ? 'Vagas Esgotadas'
                      : isEquipe
                      ? 'Simular Inscrição de Aluno'
                      : 'Garantir Minha Vaga'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Criar Evento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Novo Evento / Baile</h3>
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
                  Título do Evento *
                </label>
                <input
                  type="text"
                  required
                  value={novoEvento.titulo}
                  onChange={(e) =>
                    setNovoEvento({ ...novoEvento, titulo: e.target.value })
                  }
                  placeholder="Ex.: Baile Pé de Serra com Sanfoneiro Convidado"
                  className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Descrição
                </label>
                <textarea
                  rows={2}
                  value={novoEvento.descricao}
                  onChange={(e) =>
                    setNovoEvento({ ...novoEvento, descricao: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Data do Evento
                  </label>
                  <input
                    type="date"
                    required
                    value={novoEvento.data_evento}
                    onChange={(e) =>
                      setNovoEvento({ ...novoEvento, data_evento: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Horário
                  </label>
                  <input
                    type="text"
                    required
                    value={novoEvento.horario}
                    onChange={(e) =>
                      setNovoEvento({ ...novoEvento, horario: e.target.value })
                    }
                    placeholder="21:00 às 03:00"
                    className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Preço Ingresso (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={novoEvento.preco}
                    onChange={(e) =>
                      setNovoEvento({
                        ...novoEvento,
                        preco: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Limite de Vagas
                  </label>
                  <input
                    type="number"
                    required
                    value={novoEvento.vagas_limite}
                    onChange={(e) =>
                      setNovoEvento({
                        ...novoEvento,
                        vagas_limite: parseInt(e.target.value, 10) || 50
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Local
                </label>
                <input
                  type="text"
                  required
                  value={novoEvento.local}
                  onChange={(e) =>
                    setNovoEvento({ ...novoEvento, local: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  URL da Foto de Capa
                </label>
                <input
                  type="url"
                  value={novoEvento.foto_url}
                  onChange={(e) =>
                    setNovoEvento({ ...novoEvento, foto_url: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-brand-500"
                />
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
                  Publicar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
