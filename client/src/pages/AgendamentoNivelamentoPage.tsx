import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Calendar,
  CheckCircle2,
  Award,
  Sparkles,
  Info,
  ArrowRight
} from 'lucide-react';
import { NivelForro, PapelDanca, Aluno } from '../types';
import { UserAvatar } from '../components/common/UserAvatar';

export const AgendamentoNivelamentoPage: React.FC = () => {
  const { currentUser, alunos, alunosCadastrados, nivelamentoSessoes, agendarNivelamento, showToast } = useApp();
  const navigate = useNavigate();

  const isEquipeOrMaster = Boolean(
    currentUser.is_master ||
    currentUser.role === 'master' ||
    currentUser.role === 'admin' ||
    currentUser.role === 'professor' ||
    currentUser.tipo_usuario === 'AdminMaster' ||
    currentUser.tipo_usuario === 'Equipe'
  );

  const [selectedAlunoId, setSelectedAlunoId] = useState<string>(() => {
    const defaultStudent =
      alunosCadastrados.find((a) => a.id === currentUser.aluno_id || a.email === currentUser.email) ||
      alunosCadastrados[0] ||
      alunos[0];
    return defaultStudent?.id || '';
  });

  const targetAluno: any =
    alunosCadastrados.find((a) => a.id === selectedAlunoId || a.aluno_id === selectedAlunoId || a.user_id === selectedAlunoId) ||
    alunos.find((a) => a.id === selectedAlunoId || a.id === currentUser.aluno_id || a.email === currentUser.email) || {
      id: currentUser.aluno_id || currentUser.id || 'aluno_temp',
      nome: currentUser.nome || 'Aluno',
      email: currentUser.email || '',
      telefone: currentUser.telefone || '',
      nivel_atual: 'B1' as const,
      papel: 'Condutor' as const,
      status: 'ativo' as const,
      mensalidade_status: 'em_dia' as const,
      mensalidade_valor: 150,
      dia_vencimento: 10,
      data_inicio_nivel: '2026-09-01',
      frequencia_percentual: 100,
      foto_url: currentUser.avatar_url || ''
    };

  const jaAgendado = nivelamentoSessoes.find(
    (s) =>
      s.status === 'Agendado' &&
      (s.aluno_id === targetAluno?.id ||
        s.aluno_id === targetAluno?.aluno_id ||
        s.aluno_id === targetAluno?.user_id ||
        (s.aluno_email && targetAluno?.email && s.aluno_email.toLowerCase() === targetAluno.email.toLowerCase()))
  );

  // Target level default
  const proximoNivelMap: Record<NivelForro, NivelForro> = {
    B1: 'B2',
    B2: 'I1',
    I1: 'I2',
    I2: 'I2'
  };

  const [nivelAlvo, setNivelAlvo] = useState<NivelForro>(
    proximoNivelMap[targetAluno.nivel_atual as NivelForro] || 'B2'
  );
  const [papel, setPapel] = useState<PapelDanca>(targetAluno.papel || 'Condutor');
  const [dataAgendada, setDataAgendada] = useState<string>('2026-10-10 14:00');

  const datasDisponiveis = [
    { label: 'Sábado, 10/10/2026 às 14:00 (Banca Mestre Gonzaga & Mariana)', value: '2026-10-10 14:00' },
    { label: 'Sábado, 10/10/2026 às 15:30 (Banca Tiago Baião & Mariana)', value: '2026-10-10 15:30' },
    { label: 'Sábado, 24/10/2026 às 14:00 (Banca Geral)', value: '2026-10-24 14:00' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    agendarNivelamento(targetAluno.id || targetAluno.aluno_id, nivelAlvo, papel, dataAgendada);
    navigate('/meus-nivelamentos');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Target className="h-6 w-6 text-brand-600" />
          Agendar Sessão de Nivelamento Técnico
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          A banca avaliadora analisa sua evolução através do Aulão coletivo e da Dança a dois.
        </p>
      </div>

      {/* Alerta se o aluno já tiver agendamento */}
      {!isEquipeOrMaster && jaAgendado && (
        <div className="rounded-2xl border-2 border-brand-500 bg-amber-50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Você já tem um nivelamento agendado!
              </p>
              <p className="text-sm font-black text-slate-900">
                Banca marcada para {jaAgendado.data_agendada} (Nível Alvo: {jaAgendado.nivel_alvo})
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/meus-nivelamentos')}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            Ver Meus Nivelamentos
          </button>
        </div>
      )}

      {/* Info Card */}
      <div className="rounded-2xl bg-orange-50 border border-orange-200 p-5 text-xs text-orange-950 space-y-2">
        <p className="font-bold flex items-center gap-1.5 text-brand-800 text-sm">
          <Info className="h-4 w-4" />
          Como funciona a avaliação técnica no 4ANDAR?
        </p>
        <p className="leading-relaxed">
          1. <strong>Aulão (Aquecimento e Fundamentos):</strong> Você participa de uma dinâmica com todos os candidatos, demonstrando postura, ritmo constante no tempo 1, marcação e abraço confortável.
        </p>
        <p className="leading-relaxed">
          2. <strong>Dança a Dois:</strong> Você dança com professores e instrutores no papel escolhido ({papel}), demonstrando clareza de sinalização, resposta, navegação no salão e escuta musical.
        </p>
      </div>

      {/* Booking Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl bg-white border border-slate-200 shadow-md p-6 md:p-8 space-y-6"
      >
        {isEquipeOrMaster && (
          <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-2xl space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-900 flex items-center justify-between">
              <span>Selecionar Aluno Cadastrado</span>
              <span className="text-[10px] text-brand-600 font-semibold">Agendamento Administrativo</span>
            </label>
            <select
              value={selectedAlunoId}
              onChange={(e) => {
                setSelectedAlunoId(e.target.value);
                const a = alunosCadastrados.find((al) => al.id === e.target.value || al.aluno_id === e.target.value);
                if (a) {
                  setPapel(a.papel || 'Condutor');
                  setNivelAlvo(proximoNivelMap[a.nivel_atual as NivelForro] || 'B2');
                }
              }}
              className="w-full rounded-xl border border-orange-300 bg-white p-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-brand-500"
            >
              {alunosCadastrados.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome} ({a.email}) — Nível Atual: {a.nivel_atual} [{a.papel}]
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <UserAvatar
            name={targetAluno.nome}
            fotoUrl={targetAluno.foto_url}
            size="xl"
            className="ring-4 ring-orange-100"
          />
          <div>
            <h3 className="font-bold text-lg text-slate-900">{targetAluno.nome}</h3>
            <p className="text-xs text-slate-500">
              Nível atual: <strong>{targetAluno.nivel_atual}</strong> (iniciado em{' '}
              {targetAluno.data_inicio_nivel})
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Target Level */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Nível Alvo Desejado
            </label>
            <select
              value={nivelAlvo}
              onChange={(e) => setNivelAlvo(e.target.value as NivelForro)}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm font-semibold text-slate-800 bg-white outline-none focus:border-brand-500"
            >
              <option value="B2">B2 — Básico 2</option>
              <option value="I1">I1 — Intermediário 1</option>
              <option value="I2">I2 — Intermediário 2</option>
            </select>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Recomendamos pelo menos 2 a 3 meses de prática no nível atual.
            </span>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Papel na Avaliação
            </label>
            <select
              value={papel}
              onChange={(e) => setPapel(e.target.value as PapelDanca)}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm font-semibold text-slate-800 bg-white outline-none focus:border-brand-500"
            >
              <option value="Condutor">Condutor</option>
              <option value="Conduzido">Conduzido</option>
            </select>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Você será avaliado(a) prioritariamente nesta função de dança.
            </span>
          </div>
        </div>

        {/* Date Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Horário da Banca Disponível
          </label>
          <div className="space-y-2">
            {datasDisponiveis.map((item) => (
              <label
                key={item.value}
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  dataAgendada === item.value
                    ? 'border-brand-500 bg-orange-50/50 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="dataSessao"
                  value={item.value}
                  checked={dataAgendada === item.value}
                  onChange={(e) => setDataAgendada(e.target.value)}
                  className="accent-brand-600"
                />
                <span className="text-xs font-semibold text-slate-800">
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/meus-nivelamentos')}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Ver Meus Nivelamentos Anteriores
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 text-xs shadow-md shadow-brand-500/20 transition-all"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Confirmar Agendamento</span>
          </button>
        </div>
      </form>
    </div>
  );
};
