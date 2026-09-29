import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Clock,
  Sparkles
} from 'lucide-react';

export const GoogleCalendarPage: React.FC = () => {
  const { currentUser, equipe, aulas, cronogramas, showToast } = useApp();

  const [conectado, setConectado] = useState(true);
  const [sincronizando, setSincronizando] = useState(false);
  const [ultimaSincronizacao, setUltimaSincronizacao] = useState<string>('29/09/2026 às 18:30');

  // Find teacher profile for current user or default to Mariana Sol
  const professor =
    equipe.find((e) => e.user_id === currentUser.id || e.email === currentUser.email) ||
    equipe[0];

  const turmasDoProfessor = aulas.filter((a) => a.equipe_id === professor.id);

  // Synchronized events log state
  const [eventosSincronizados, setEventosSincronizados] = useState([
    {
      id: 'gcal_1',
      titulo: 'Básico 2 — Aula de Forró (Tema: Giro invertido)',
      data: '30/09/2026 20:00 - 21:15',
      sala: 'Salão Principal (Gonzagão)',
      status: 'Sincronizado (Deduplicado)',
      cor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'gcal_2',
      titulo: 'Intermediário 1 — Aula de Forró (Tema: Sacadas de perna)',
      data: '01/10/2026 20:45 - 22:00',
      sala: 'Salão Principal (Gonzagão)',
      status: 'Sincronizado (Deduplicado)',
      cor: 'bg-emerald-100 text-emerald-800'
    }
  ]);

  const handleSincronizar = () => {
    setSincronizando(true);
    setTimeout(() => {
      setSincronizando(false);
      const agora = new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR').substring(0, 5);
      setUltimaSincronizacao(agora);
      showToast('Sincronização com Google Calendar concluída com sucesso! (Eventos deduplicados)');
    }, 1200);
  };

  const handleToggleConexao = () => {
    if (conectado) {
      setConectado(false);
      showToast('Conta do Google desconectada.', 'info');
    } else {
      setConectado(true);
      showToast('Conta do Google Calendar conectada com sucesso!', 'success');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Calendar className="h-6 w-6 text-brand-600" />
          Sincronização com Google Calendar (App-User)
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Cada professor conecta sua própria conta Google e sincroniza as aulas futuras com deduplicação de eventos.
        </p>
      </div>

      {/* Account Connection Card */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-brand-600">
              <Calendar className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-slate-900">
                  Google Calendar de {professor.nome}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    conectado
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {conectado ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Conta vinculada: <strong>{professor.email}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleConexao}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all self-start sm:self-auto ${
              conectado
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
            }`}
          >
            {conectado ? 'Desconectar Agenda' : 'Conectar Conta Google'}
          </button>
        </div>

        {/* Sync Controls */}
        {conectado && (
          <div className="rounded-2xl bg-orange-50/60 border border-orange-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="font-bold text-sm text-brand-900 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Sincronização Ativa com Deduplicação
              </span>
              <p className="text-xs text-slate-600">
                Aulas futuras atribuídas a você são sincronizadas sem duplicar eventos já criados anteriormente.
              </p>
              <p className="text-[11px] text-slate-400">
                Última sincronização realizada: {ultimaSincronizacao}
              </p>
            </div>

            <button
              onClick={handleSincronizar}
              disabled={sincronizando}
              className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 text-xs shadow-md shadow-brand-500/20 transition-all shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${sincronizando ? 'animate-spin' : ''}`} />
              <span>{sincronizando ? 'Sincronizando...' : 'Sincronizar Aulas Agora'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Sync Log & Associated Classes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Your Managed Classes */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-3">
          <h4 className="font-bold text-sm text-slate-900">
            Suas Turmas Vinculadas ({turmasDoProfessor.length})
          </h4>
          <p className="text-xs text-slate-500">
            Somente as aulas destas turmas serão importadas para sua agenda pessoal.
          </p>

          <div className="space-y-2 pt-2">
            {turmasDoProfessor.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <p className="font-bold text-slate-900">[{t.nivel}] {t.nome}</p>
                <p className="text-slate-500 mt-0.5">
                  {t.dia_semana} • {t.horario_inicio} às {t.horario_fim}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Synchronized Events List */}
        <div className="md:col-span-2 rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="font-bold text-sm text-slate-900">
              Eventos na sua Agenda Google
            </h4>
            <span className="text-xs text-slate-400">
              {eventosSincronizados.length} eventos confirmados
            </span>
          </div>

          <div className="space-y-3">
            {eventosSincronizados.map((ev) => (
              <div
                key={ev.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <p className="font-bold text-sm text-slate-900">{ev.titulo}</p>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>{ev.data}</span>
                    <span>•</span>
                    <span>{ev.sala}</span>
                  </p>
                </div>

                <span
                  className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold ${ev.cor}`}
                >
                  {ev.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
