import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Award,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Star,
  FileCheck,
  ChevronRight,
  X,
  Check,
  Sparkles
} from 'lucide-react';
import { NivelamentoSessao } from '../types';

export const NivelamentoPage: React.FC = () => {
  const {
    nivelamentoSessoes,
    criteriosNivelamento,
    alunos,
    alunosCadastrados,
    avaliarNivelamento
  } = useApp();

  const [activeTab, setActiveTab] = useState<'agendados' | 'concluidos'>('agendados');
  const [selectedSessao, setSelectedSessao] = useState<NivelamentoSessao | null>(null);

  // Grading form state
  const [notas, setNotas] = useState<Record<string, number>>({});
  const [feedbackAulao, setFeedbackAulao] = useState('');
  const [feedbackDanca, setFeedbackDanca] = useState('');
  const [feedbackGeral, setFeedbackGeral] = useState('');

  const agendados = nivelamentoSessoes.filter((s) => s.status === 'Agendado');
  const concluidos = nivelamentoSessoes.filter((s) => s.status === 'Concluído');

  const handleOpenAvaliacao = (sessao: NivelamentoSessao) => {
    setSelectedSessao(sessao);
    setFeedbackAulao(sessao.feedback_aulao || '');
    setFeedbackDanca(sessao.feedback_danca || '');
    setFeedbackGeral(sessao.feedback_geral || '');
    setNotas(sessao.notas || {});
  };

  const handleSetNota = (criterioId: string, nota: number) => {
    setNotas((prev) => ({ ...prev, [criterioId]: nota }));
  };

  const handleConcluir = (resultado: 'Aprovado' | 'Reprovado') => {
    if (!selectedSessao) return;
    avaliarNivelamento(
      selectedSessao.id,
      resultado,
      feedbackGeral,
      feedbackAulao,
      feedbackDanca,
      notas
    );
    setSelectedSessao(null);
  };

  // Filter criteria for target level
  const criteriosTarget = selectedSessao
    ? criteriosNivelamento.filter((c) => c.nivel === selectedSessao.nivel_alvo)
    : [];

  const criteriosAulao = criteriosTarget.filter((c) => c.secao === 'Aulão');
  const criteriosDanca = criteriosTarget.filter((c) => c.secao === 'Dança a dois');

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Award className="h-6 w-6 text-brand-600" />
            Nivelamento Técnico & Bancas Avaliadoras
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Fichas estruturadas de avaliação (Aulão + Dança a dois) e progressão de nível.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1 shadow-sm self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('agendados')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'agendados'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Sessões Agendadas ({agendados.length})
          </button>
          <button
            onClick={() => setActiveTab('concluidos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'concluidos'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Histórico Concluído ({concluidos.length})
          </button>
        </div>
      </div>

      {/* SESSÕES AGENDADAS */}
      {activeTab === 'agendados' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agendados.length === 0 ? (
            <div className="col-span-full rounded-2xl bg-white p-12 text-center text-slate-400 border border-slate-100">
              Nenhuma sessão de nivelamento aguardando avaliação no momento.
            </div>
          ) : (
            agendados.map((sessao) => {
              const aluno =
                alunosCadastrados.find((a) => a.id === sessao.aluno_id || a.aluno_id === sessao.aluno_id || a.user_id === sessao.aluno_id) ||
                alunos.find((a) => a.id === sessao.aluno_id);

              return (
                <div
                  key={sessao.id}
                  className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm hover:border-brand-400 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          {sessao.nivel_atual} ➔ Nível Alvo: {sessao.nivel_alvo}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">
                          ({sessao.papel})
                        </span>
                      </div>
                      <span className="rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-[11px] font-bold">
                        Agendado
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <img
                        src={
                          aluno?.foto_url ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                        }
                        alt={aluno?.nome}
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100"
                      />
                      <div>
                        <h4 className="font-bold text-base text-slate-900">
                          {aluno?.nome}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {aluno?.telefone} • {aluno?.email}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
                      <p className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>Data agendada: <strong>{sessao.data_agendada}</strong></span>
                      </p>
                      <p className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span>Banca: {sessao.avaliador_aulao} & {sessao.avaliador_danca}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => handleOpenAvaliacao(sessao)}
                      className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2 text-xs shadow-md shadow-brand-500/20 transition-all"
                    >
                      <FileCheck className="h-4 w-4" />
                      <span>Abrir Ficha de Avaliação</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* SESSÕES CONCLUÍDAS */}
      {activeTab === 'concluidos' && (
        <div className="space-y-3">
          {concluidos.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center text-slate-400 border border-slate-100">
              Nenhuma sessão concluída ainda.
            </div>
          ) : (
            concluidos.map((sessao) => {
              const aluno =
                alunosCadastrados.find((a) => a.id === sessao.aluno_id || a.aluno_id === sessao.aluno_id || a.user_id === sessao.aluno_id) ||
                alunos.find((a) => a.id === sessao.aluno_id);

              return (
                <div
                  key={sessao.id}
                  className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        aluno?.foto_url ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                      }
                      alt={aluno?.nome}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-slate-900">
                          {aluno?.nome}
                        </h4>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                            sessao.resultado === 'Aprovado'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {sessao.resultado}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {sessao.nivel_atual} ➔ {sessao.nivel_alvo} ({sessao.papel}) • Realizado em {sessao.data_agendada}
                      </p>
                      {sessao.feedback_geral && (
                        <p className="text-xs text-slate-600 mt-2 bg-orange-50/60 border border-orange-100 p-2 rounded-lg">
                          <strong>Parecer da Banca:</strong> {sessao.feedback_geral}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-xs text-slate-400 font-medium shrink-0">
                    Avaliadores: {sessao.avaliador_aulao} e {sessao.avaliador_danca}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal Ficha Técnica de Avaliação (Aulão + Dança a dois) */}
      {selectedSessao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                  Ficha Oficial de Avaliação Técnica 4ANDAR
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                  Nivelamento para Nível {selectedSessao.nivel_alvo} ({selectedSessao.papel})
                </h3>
                <p className="text-xs text-slate-500">
                  Aluno:{' '}
                  <strong>
                    {alunosCadastrados.find((a) => a.id === selectedSessao.aluno_id || a.aluno_id === selectedSessao.aluno_id || a.user_id === selectedSessao.aluno_id)?.nome ||
                     alunos.find((a) => a.id === selectedSessao.aluno_id)?.nome}
                  </strong>{' '}
                  (Nível atual: {selectedSessao.nivel_atual})
                </p>
              </div>
              <button
                onClick={() => setSelectedSessao(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* SEÇÃO 1: CRITÉRIOS DE AULÃO */}
            <div className="rounded-2xl bg-amber-50/50 border border-amber-200/70 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <h4 className="font-bold text-sm text-amber-950 uppercase tracking-wider">
                  Etapa 1: Critérios de Aulão (Ritmo, Postura, Base e Tempo)
                </h4>
              </div>

              {criteriosAulao.length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  Critérios padrão: Pulso musical, abraço e tempo 1 do forró.
                </p>
              ) : (
                <div className="space-y-3">
                  {criteriosAulao.map((crit) => (
                    <div
                      key={crit.id}
                      className="p-3 bg-white rounded-xl border border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <p className="font-bold text-xs text-slate-900">
                          {crit.criterio}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {crit.descricao}
                        </p>
                      </div>

                      {/* Score selector 1 to 5 */}
                      <div className="flex items-center gap-1 shrink-0">
                        {[1, 2, 3, 4, 5].map((nota) => (
                          <button
                            key={nota}
                            type="button"
                            onClick={() => handleSetNota(crit.id, nota)}
                            className={`h-7 w-7 rounded-lg text-xs font-bold transition-all ${
                              notas[crit.id] === nota
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {nota}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-amber-900 mb-1">
                  Feedback da Etapa Aulão:
                </label>
                <textarea
                  rows={2}
                  value={feedbackAulao}
                  onChange={(e) => setFeedbackAulao(e.target.value)}
                  placeholder="Comentários sobre musicalidade, marcação dos tempos e postura..."
                  className="w-full rounded-xl border border-amber-200 bg-white p-2.5 text-xs outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* SEÇÃO 2: CRITÉRIOS DE DANÇA A DOIS */}
            <div className="rounded-2xl bg-purple-50/50 border border-purple-200/70 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-500" />
                <h4 className="font-bold text-sm text-purple-950 uppercase tracking-wider">
                  Etapa 2: Dança a Dois (Condução / Resposta, Conexão e Repertório)
                </h4>
              </div>

              {criteriosDanca.length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  Critérios padrão: Giro simples, caminhadas, navegação no salão e tônus.
                </p>
              ) : (
                <div className="space-y-3">
                  {criteriosDanca.map((crit) => (
                    <div
                      key={crit.id}
                      className="p-3 bg-white rounded-xl border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <p className="font-bold text-xs text-slate-900">
                          {crit.criterio}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {crit.descricao}
                        </p>
                      </div>

                      {/* Score selector 1 to 5 */}
                      <div className="flex items-center gap-1 shrink-0">
                        {[1, 2, 3, 4, 5].map((nota) => (
                          <button
                            key={nota}
                            type="button"
                            onClick={() => handleSetNota(crit.id, nota)}
                            className={`h-7 w-7 rounded-lg text-xs font-bold transition-all ${
                              notas[crit.id] === nota
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {nota}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-purple-900 mb-1">
                  Feedback da Dança a Dois:
                </label>
                <textarea
                  rows={2}
                  value={feedbackDanca}
                  onChange={(e) => setFeedbackDanca(e.target.value)}
                  placeholder="Comentários sobre clareza de sinalização, tônus do abraço e fluidez..."
                  className="w-full rounded-xl border border-purple-200 bg-white p-2.5 text-xs outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* PARECER GERAL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Parecer Geral da Banca / Recomendações
              </label>
              <textarea
                rows={2}
                value={feedbackGeral}
                onChange={(e) => setFeedbackGeral(e.target.value)}
                placeholder="Parecer final direcionado ao aluno..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs outline-none focus:border-brand-500"
              />
            </div>

            {/* Actions: Aprovar / Reprovar */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500 text-center sm:text-left">
                Ao aprovar, o nível do aluno será atualizado automaticamente para{' '}
                <strong>{selectedSessao.nivel_alvo}</strong>.
              </span>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => handleConcluir('Reprovado')}
                  className="px-4 py-2.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors"
                >
                  Reprovar
                </button>
                <button
                  type="button"
                  onClick={() => handleConcluir('Aprovado')}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-md shadow-emerald-600/20"
                >
                  <Sparkles className="h-4 w-4" />
                  Aprovar Aluno(a)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
