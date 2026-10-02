import React from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Aluno } from '../types';
import {
  History,
  Award,
  CheckCircle2,
  XCircle,
  Calendar,
  Sparkles,
  MessageSquare,
  ArrowRight
} from 'lucide-react';

export const MeusNivelamentosPage: React.FC = () => {
  const { currentUser, alunos, alunosCadastrados, nivelamentoSessoes } = useApp();
  const navigate = useNavigate();

  const alunoLogado: any =
    alunosCadastrados.find((a) => a.id === currentUser.aluno_id || a.email === currentUser.email || a.user_id === currentUser.id) ||
    alunos.find((a) => a.id === currentUser.aluno_id || a.email === currentUser.email) ||
    alunos[0] || {
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

  const minhasSessoes = nivelamentoSessoes.filter((s) => {
    const matchId =
      (alunoLogado?.id && s.aluno_id === alunoLogado.id) ||
      (alunoLogado?.aluno_id && s.aluno_id === alunoLogado.aluno_id) ||
      (alunoLogado?.user_id && s.aluno_id === alunoLogado.user_id) ||
      (currentUser?.aluno_id && s.aluno_id === currentUser.aluno_id) ||
      (currentUser?.id && s.aluno_id === currentUser.id);

    const matchEmail =
      s.aluno_email &&
      currentUser?.email &&
      s.aluno_email.trim().toLowerCase() === currentUser.email.trim().toLowerCase();

    const matchNome =
      s.aluno_nome &&
      currentUser?.nome &&
      s.aluno_nome.trim().toLowerCase() === currentUser.nome.trim().toLowerCase();

    return Boolean(matchId || matchEmail || matchNome);
  });

  const proximoAgendado = minhasSessoes.find((s) => s.status === 'Agendado');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <History className="h-6 w-6 text-brand-600" />
            Meus Nivelamentos & Feedbacks
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Consulte o histórico de suas bancas avaliadoras, pareceres dos professores e resultados.
          </p>
        </div>

        <button
          onClick={() => navigate('/agendamento-nivelamento')}
          className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 text-xs shadow-md shadow-brand-500/20 transition-all self-start sm:self-auto"
        >
          <Award className="h-4 w-4" />
          <span>+ Agendar Novo Nivelamento</span>
        </button>
      </div>

      {/* Current Level Status Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 p-6 md:p-8 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">
            Sua Graduação Atual
          </span>
          <h3 className="text-3xl font-black tracking-tight">
            Nível {alunoLogado.nivel_atual} ({alunoLogado.papel})
          </h3>
          <p className="text-xs text-purple-200">
            Praticando neste nível desde {alunoLogado.data_inicio_nivel}
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 text-xs text-purple-100 max-w-xs">
          <p className="font-semibold text-white mb-1">Dica Pedagógica:</p>
          <p className="text-[11px] leading-relaxed">
            Mantenha presença regular nas aulas semanais para consolidar os fundamentos antes da próxima banca.
          </p>
        </div>
      </div>

      {/* Destaque do Nivelamento Agendado (Sincronizado na Conta do Aluno) */}
      {proximoAgendado && (
        <div className="rounded-3xl border-2 border-brand-500 bg-gradient-to-br from-brand-50 via-white to-amber-50/60 p-6 md:p-8 shadow-md space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/25">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-brand-700 bg-brand-100/80 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Agendamento Oficial Confirmado
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  Banca de Nivelamento: Transição para Nível {proximoAgendado.nivel_alvo} ({proximoAgendado.papel})
                </h3>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200/80 self-start sm:self-auto">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              Aguardando Avaliação
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="rounded-2xl bg-white p-3.5 border border-slate-200/80 shadow-sm">
              <p className="text-[11px] font-semibold text-slate-400">Data e Horário</p>
              <p className="text-sm font-black text-slate-900 mt-0.5">{proximoAgendado.data_agendada}</p>
            </div>
            <div className="rounded-2xl bg-white p-3.5 border border-slate-200/80 shadow-sm">
              <p className="text-[11px] font-semibold text-slate-400">Banca Avaliadora</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                {proximoAgendado.avaliador_aulao} & {proximoAgendado.avaliador_danca}
              </p>
            </div>
            <div className="rounded-2xl bg-white p-3.5 border border-slate-200/80 shadow-sm">
              <p className="text-[11px] font-semibold text-slate-400">Local da Sessão</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5">Salão 2 (Dominguinhos)</p>
            </div>
          </div>

          {proximoAgendado.feedback_geral && (
            <div className="rounded-2xl bg-white/80 border border-brand-200/70 p-3.5 text-xs text-slate-700">
              <strong className="text-brand-900">Orientações da Coordenação:</strong> {proximoAgendado.feedback_geral}
            </div>
          )}

          <div className="rounded-2xl bg-amber-100/50 border border-amber-200/80 p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Como se preparar:</strong> Chegue com 15 minutos de antecedência com calçado apropriado para forró e toalha. A avaliação contempla a dinâmica de Aulão (ritmo, postura e tempo 1) e Dança a dois (conexão e repertório).
            </p>
          </div>
        </div>
      )}

      {/* History of Sessions */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          Sessões Registradas ({minhasSessoes.length})
        </h3>

        {minhasSessoes.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center text-slate-400 border border-slate-100">
            Você ainda não realizou ou agendou nenhuma sessão de nivelamento.
          </div>
        ) : (
          minhasSessoes.map((sessao) => (
            <div
              key={sessao.id}
              className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-slate-900">
                    Avaliação para Nível {sessao.nivel_alvo}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    ({sessao.papel})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                      sessao.status === 'Agendado'
                        ? 'bg-blue-100 text-blue-800'
                        : sessao.resultado === 'Aprovado'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {sessao.status === 'Agendado' && <Calendar className="h-3.5 w-3.5" />}
                    {sessao.resultado === 'Aprovado' && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {sessao.resultado === 'Reprovado' && <XCircle className="h-3.5 w-3.5" />}
                    {sessao.status === 'Agendado' ? 'Agendado' : sessao.resultado}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-4">
                <span>Data: <strong>{sessao.data_agendada}</strong></span>
                <span>•</span>
                <span>Avaliador Aulão: <strong>{sessao.avaliador_aulao}</strong></span>
                <span>•</span>
                <span>Avaliador Dança a dois: <strong>{sessao.avaliador_danca}</strong></span>
              </div>

              {/* Feedbacks */}
              {(sessao.feedback_aulao || sessao.feedback_danca || sessao.feedback_geral) && (
                <div className="space-y-2 pt-2">
                  {sessao.feedback_aulao && (
                    <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-xs text-amber-950">
                      <strong>Feedback do Aulão:</strong> {sessao.feedback_aulao}
                    </div>
                  )}

                  {sessao.feedback_danca && (
                    <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-xs text-purple-950">
                      <strong>Feedback da Dança a Dois:</strong> {sessao.feedback_danca}
                    </div>
                  )}

                  {sessao.feedback_geral && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
                      <strong>Parecer Geral:</strong> {sessao.feedback_geral}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
