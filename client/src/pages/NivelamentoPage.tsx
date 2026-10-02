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
  Sparkles,
  CalendarPlus,
  Search,
  Users,
  CheckCircle,
  CalendarCheck,
  MapPin
} from 'lucide-react';
import { NivelamentoSessao, NivelForro, PapelDanca } from '../types';
import { UserAvatar } from '../components/common/UserAvatar';

export const NivelamentoPage: React.FC = () => {
  const {
    nivelamentoSessoes,
    criteriosNivelamento,
    alunos,
    alunosCadastrados,
    professoresCadastrados,
    agendarNivelamento,
    avaliarNivelamento
  } = useApp();

  const [activeTab, setActiveTab] = useState<'agendados' | 'concluidos'>('agendados');
  const [selectedSessao, setSelectedSessao] = useState<NivelamentoSessao | null>(null);

  // Modal Agendar Nivelamento State
  const [modalAgendarOpen, setModalAgendarOpen] = useState(false);
  const [alunoSearch, setAlunoSearch] = useState('');
  const [selectedAlunoId, setSelectedAlunoId] = useState<string>('');
  const [nivelAlvo, setNivelAlvo] = useState<NivelForro>('B2');
  const [papel, setPapel] = useState<PapelDanca>('Condutor');
  const [dataAgendada, setDataAgendada] = useState<string>('');
  const [horarioAgendado, setHorarioAgendado] = useState<string>('14:00');
  const [avaliadorAulao, setAvaliadorAulao] = useState<string>('Mestre Gonzaga Silva');
  const [avaliadorDanca, setAvaliadorDanca] = useState<string>('Mariana Sol');
  const [avaliadorObserva, setAvaliadorObserva] = useState<string>('Tiago Baião');
  const [feedbackGeralAgendamento, setFeedbackGeralAgendamento] = useState<string>(
    'Sessão oficial de nivelamento. Trazer calçado apropriado e toalha.'
  );
  const [sincronizarAgenda, setSincronizarAgenda] = useState<boolean>(true);

  // Grading form state
  const [notas, setNotas] = useState<Record<string, number>>({});
  const [feedbackAulao, setFeedbackAulao] = useState('');
  const [feedbackDanca, setFeedbackDanca] = useState('');
  const [feedbackGeral, setFeedbackGeral] = useState('');

  const agendados = nivelamentoSessoes.filter((s) => s.status === 'Agendado');
  const concluidos = nivelamentoSessoes.filter((s) => s.status === 'Concluído');

  const proximoNivelMap: Record<NivelForro, NivelForro> = {
    B1: 'B2',
    B2: 'I1',
    I1: 'I2',
    I2: 'I2'
  };

  const handleOpenModalAgendar = (alunoIdPre?: string) => {
    const defaultAluno = alunoIdPre
      ? alunosCadastrados.find((a) => a.id === alunoIdPre || a.aluno_id === alunoIdPre || a.user_id === alunoIdPre) ||
        alunos.find((a) => a.id === alunoIdPre)
      : alunosCadastrados[0] || alunos[0];

    const currentId = defaultAluno?.id || defaultAluno?.aluno_id || '';
    setSelectedAlunoId(currentId);
    setAlunoSearch('');

    const currentNivel = (defaultAluno?.nivel_atual as NivelForro) || 'B1';
    setNivelAlvo(proximoNivelMap[currentNivel] || 'B2');
    setPapel((defaultAluno?.papel as PapelDanca) || 'Condutor');

    // Próximo sábado padrão
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilNextSat = (6 - dayOfWeek + 7) % 7 || 7;
    const nextSat = new Date(today);
    nextSat.setDate(today.getDate() + daysUntilNextSat);
    setDataAgendada(nextSat.toISOString().substring(0, 10));
    setHorarioAgendado('14:00');
    setFeedbackGeralAgendamento('Sessão oficial de nivelamento técnico. Trazer calçado apropriado e toalha.');
    setSincronizarAgenda(true);
    setModalAgendarOpen(true);
  };

  const handleSelectAluno = (alunoId: string) => {
    setSelectedAlunoId(alunoId);
    const al =
      alunosCadastrados.find((a) => a.id === alunoId || a.aluno_id === alunoId || a.user_id === alunoId) ||
      alunos.find((a) => a.id === alunoId);
    if (al) {
      if (al.papel) setPapel(al.papel as PapelDanca);
      const currentNivel = (al.nivel_atual as NivelForro) || 'B1';
      setNivelAlvo(proximoNivelMap[currentNivel] || 'B2');
    }
  };

  const handleConfirmarAgendamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlunoId) {
      alert('Por favor, selecione um aluno para o nivelamento.');
      return;
    }
    if (!dataAgendada) {
      alert('Por favor, informe a data da avaliação.');
      return;
    }

    const dataFinal = `${dataAgendada} ${horarioAgendado || '14:00'}`;

    agendarNivelamento(selectedAlunoId, nivelAlvo, papel, dataFinal, {
      avaliador_aulao: avaliadorAulao,
      avaliador_danca: avaliadorDanca,
      avaliador_observa: avaliadorObserva,
      feedback_geral: feedbackGeralAgendamento,
      sincronizarAgenda
    });

    setModalAgendarOpen(false);
    setActiveTab('agendados');
  };

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

  // Alunos filtrados para o modal
  const filteredAlunos = alunosCadastrados.filter((a) => {
    if (!alunoSearch.trim()) return true;
    const term = alunoSearch.toLowerCase();
    return (
      a.nome.toLowerCase().includes(term) ||
      (a.email && a.email.toLowerCase().includes(term)) ||
      (a.nivel_atual && a.nivel_atual.toLowerCase().includes(term))
    );
  });

  const currentSelectedAluno =
    alunosCadastrados.find(
      (a) => a.id === selectedAlunoId || a.aluno_id === selectedAlunoId || a.user_id === selectedAlunoId
    ) || alunos.find((a) => a.id === selectedAlunoId);

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Award className="h-6 w-6 text-brand-600" />
            Nivelamento Técnico & Bancas Avaliadoras
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Fichas estruturadas de avaliação (Aulão + Dança a dois), agendamento oficial e progressão de nível.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Botão de Criar Nivelamento */}
          <button
            onClick={() => handleOpenModalAgendar()}
            className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 text-xs shadow-md shadow-brand-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <CalendarPlus className="h-4 w-4" />
            <span>+ Criar Nivelamento</span>
          </button>

          {/* Tab switch */}
          <div className="flex items-center gap-1.5 bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
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
                alunosCadastrados.find(
                  (a) =>
                    a.id === sessao.aluno_id ||
                    a.aluno_id === sessao.aluno_id ||
                    a.user_id === sessao.aluno_id ||
                    (sessao.aluno_email && a.email?.toLowerCase() === sessao.aluno_email?.toLowerCase())
                ) ||
                alunos.find(
                  (a) =>
                    a.id === sessao.aluno_id ||
                    (sessao.aluno_email && a.email?.toLowerCase() === sessao.aluno_email?.toLowerCase())
                );

              const nomeExibicao = sessao.aluno_nome || aluno?.nome || 'Aluno';
              const emailExibicao = sessao.aluno_email || aluno?.email || '';

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
                      <UserAvatar
                        name={nomeExibicao}
                        fotoUrl={aluno?.foto_url}
                        size="lg"
                        className="ring-2 ring-slate-100"
                      />
                      <div>
                        <h4 className="font-bold text-base text-slate-900">
                          {nomeExibicao}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {aluno?.telefone ? `${aluno.telefone} • ` : ''}
                          {emailExibicao}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 space-y-1.5">
                      <p className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-brand-600" />
                        <span>Data agendada: <strong>{sessao.data_agendada}</strong></span>
                      </p>
                      <p className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span>Banca: {sessao.avaliador_aulao} & {sessao.avaliador_danca}</span>
                      </p>
                      <p className="flex items-center gap-2 text-[11px] text-emerald-700 font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Sincronizado na Agenda Oficial & Notificado ao Aluno</span>
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
                    <UserAvatar
                      name={aluno?.nome || 'Aluno'}
                      fotoUrl={aluno?.foto_url}
                      size="lg"
                      className="ring-2 ring-slate-100"
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
      {/* MODAL CRIAR E AGENDAR NIVELAMENTO */}
      {modalAgendarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 md:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
                  <CalendarPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    Criar & Agendar Nivelamento
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Marque a avaliação técnica e sincronize automaticamente com a agenda da escola.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalAgendarOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmarAgendamento} className="space-y-5">
              {/* 1. SELEÇÃO DE ALUNO */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  1. Selecionar Aluno
                </label>

                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrar aluno por nome ou email..."
                    value={alunoSearch}
                    onChange={(e) => setAlunoSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 outline-none transition-all"
                  />
                </div>

                {/* Dropdown / Select */}
                <select
                  value={selectedAlunoId}
                  onChange={(e) => handleSelectAluno(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-semibold text-slate-800 outline-none focus:border-brand-500 shadow-sm"
                  required
                >
                  <option value="">Selecione um aluno...</option>
                  {filteredAlunos.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nome} ({a.email || 'sem email'}) — Nível: {a.nivel_atual} [{a.papel || 'Condutor'}]
                    </option>
                  ))}
                </select>

                {/* Card de prévia do aluno selecionado */}
                {currentSelectedAluno && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-brand-50/50 border border-brand-100/80 mt-2">
                    <UserAvatar
                      name={currentSelectedAluno.nome}
                      fotoUrl={currentSelectedAluno.foto_url}
                      size="md"
                      className="ring-2 ring-brand-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-xs text-slate-900 truncate">
                          {currentSelectedAluno.nome}
                        </p>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                          Nível Atual: {currentSelectedAluno.nivel_atual}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {currentSelectedAluno.email} • Papel: {currentSelectedAluno.papel || papel}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. NÍVEL ALVO & PAPEL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    2. Nível Alvo Pretendido
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['B2', 'I1', 'I2'] as NivelForro[]).map((nv) => (
                      <button
                        key={nv}
                        type="button"
                        onClick={() => setNivelAlvo(nv)}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                          nivelAlvo === nv
                            ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {nv}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Transição a partir de {currentSelectedAluno?.nivel_atual || 'B1'}.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    3. Papel na Dança
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Condutor', 'Conduzido', 'Ambos'] as PapelDanca[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPapel(p)}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                          papel === p
                            ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. DATA E HORÁRIO COM PRESETS DE SÁBADO */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    4. Data e Horário da Avaliação
                  </label>
                  <span className="text-[10px] text-brand-600 font-semibold">
                    Salão 2 (Dominguinhos)
                  </span>
                </div>

                {/* Atalhos rápidos */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      const dayOfWeek = today.getDay();
                      const daysUntilNextSat = (6 - dayOfWeek + 7) % 7 || 7;
                      const nextSat = new Date(today);
                      nextSat.setDate(today.getDate() + daysUntilNextSat);
                      setDataAgendada(nextSat.toISOString().substring(0, 10));
                      setHorarioAgendado('14:00');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
                  >
                    Próx. Sábado às 14:00
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      const dayOfWeek = today.getDay();
                      const daysUntilNextSat = (6 - dayOfWeek + 7) % 7 || 7;
                      const nextSat = new Date(today);
                      nextSat.setDate(today.getDate() + daysUntilNextSat);
                      setDataAgendada(nextSat.toISOString().substring(0, 10));
                      setHorarioAgendado('15:30');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
                  >
                    Próx. Sábado às 15:30
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      const dayOfWeek = today.getDay();
                      const daysUntilNextSat = (6 - dayOfWeek + 7) % 7 || 7;
                      const nextSat = new Date(today);
                      nextSat.setDate(today.getDate() + daysUntilNextSat);
                      setDataAgendada(nextSat.toISOString().substring(0, 10));
                      setHorarioAgendado('17:00');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
                  >
                    Próx. Sábado às 17:00
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Data (Dia da Banca)
                    </label>
                    <input
                      type="date"
                      value={dataAgendada}
                      onChange={(e) => setDataAgendada(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-800 bg-white outline-none focus:border-brand-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Horário
                    </label>
                    <input
                      type="time"
                      value={horarioAgendado}
                      onChange={(e) => setHorarioAgendado(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-800 bg-white outline-none focus:border-brand-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 4. BANCA AVALIADORA (PROFESSORES) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    5. Avaliador da Etapa Aulão
                  </label>
                  <select
                    value={avaliadorAulao}
                    onChange={(e) => setAvaliadorAulao(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-800 bg-white outline-none focus:border-brand-500"
                  >
                    {professoresCadastrados.map((p) => (
                      <option key={p.id} value={p.nome}>
                        {p.nome} ({p.papel})
                      </option>
                    ))}
                    <option value="Mestre Gonzaga Silva">Mestre Gonzaga Silva</option>
                    <option value="Mariana Sol">Mariana Sol</option>
                    <option value="Tiago Baião">Tiago Baião</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    6. Avaliador Dança a Dois
                  </label>
                  <select
                    value={avaliadorDanca}
                    onChange={(e) => setAvaliadorDanca(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-800 bg-white outline-none focus:border-brand-500"
                  >
                    {professoresCadastrados.map((p) => (
                      <option key={p.id} value={p.nome}>
                        {p.nome} ({p.papel})
                      </option>
                    ))}
                    <option value="Mariana Sol">Mariana Sol</option>
                    <option value="Mestre Gonzaga Silva">Mestre Gonzaga Silva</option>
                    <option value="Tiago Baião">Tiago Baião</option>
                  </select>
                </div>
              </div>

              {/* 5. INSTRUÇÕES / OBSERVAÇÕES */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  7. Observações / Instruções para o Aluno
                </label>
                <textarea
                  rows={2}
                  value={feedbackGeralAgendamento}
                  onChange={(e) => setFeedbackGeralAgendamento(e.target.value)}
                  placeholder="Orientações de preparação para o aluno..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs outline-none focus:border-brand-500 bg-white"
                />
              </div>

              {/* 6. SINCRONIZAÇÃO COM A AGENDA DA ESCOLA */}
              <div className="rounded-2xl bg-amber-50/70 border border-amber-200/90 p-4 space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sincronizarAgenda}
                    onChange={(e) => setSincronizarAgenda(e.target.checked)}
                    className="h-4 w-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                  />
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <CalendarCheck className="h-4 w-4 text-brand-600" />
                    Sincronizar e publicar automaticamente na Agenda da Escola
                  </span>
                </label>
                <p className="text-[11px] text-amber-800/90 pl-6 leading-relaxed">
                  Cria um evento oficial de banca na agenda da escola, grava no banco de dados e exibe o agendamento imediatamente no painel e na aba do aluno assim que ele acessar sua conta.
                </p>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalAgendarOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/25 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <CalendarCheck className="h-4 w-4" />
                  <span>Confirmar e Agendar Nivelamento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
