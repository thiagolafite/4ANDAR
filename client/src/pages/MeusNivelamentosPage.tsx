import React from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
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
  const { currentUser, alunos, nivelamentoSessoes } = useApp();
  const navigate = useNavigate();

  const alunoLogado =
    alunos.find((a) => a.id === currentUser.aluno_id || a.email === currentUser.email) ||
    alunos[0];

  const minhasSessoes = nivelamentoSessoes.filter(
    (s) => s.aluno_id === alunoLogado.id
  );

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
