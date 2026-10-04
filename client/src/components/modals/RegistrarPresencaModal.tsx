import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  UserCheck,
  Search,
  X,
  Check,
  Calendar,
  Clock,
  Sparkles,
  Phone,
  Mail,
  ShieldCheck,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  XCircle,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Aluno, Aula, Cronograma, StatusPresenca } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

interface RegistrarPresencaModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAulaId?: string;
  defaultData?: string;
}

/**
 * Função inteligente que analisa o horário atual do sistema, o dia da semana e o
 * cronograma importado para encontrar a turma exata correspondente ao nível do aluno.
 */
function findBestAulaForAluno(
  aluno: Aluno,
  aulasList: Aula[],
  targetDate: string,
  cronosList: Cronograma[]
): { aula: Aula; motivo: string } | null {
  if (!aulasList || aulasList.length === 0) return null;

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Determina turno atual com base no relógio do sistema
  // Manhã: antes das 13h | Tarde: entre 13h e 18h | Noite: após as 18h
  const turnoAtual: 'Manhã' | 'Tarde' | 'Noite' =
    currentHour < 13 ? 'Manhã' : currentHour < 18 ? 'Tarde' : 'Noite';

  // 1. Prioridade máxima: Turma do nível do aluno no turno atual (ex: B1 Manhã se for de manhã)
  const aulasDoNivel = aulasList.filter((a) => a.nivel === aluno.nivel_atual);

  if (aulasDoNivel.length > 0) {
    // 1.1 Turma do mesmo nível no turno atual
    const aulaMesmoTurno = aulasDoNivel.find((a) => a.turno === turnoAtual);
    if (aulaMesmoTurno) {
      return {
        aula: aulaMesmoTurno,
        motivo: `detectada automaticamente pelo nível (${aluno.nivel_atual}) no turno atual da ${turnoAtual}`
      };
    }

    // 1.2 Turma do mesmo nível mais próxima do horário atual
    let melhorAula = aulasDoNivel[0];
    let menorDiff = Infinity;
    for (const a of aulasDoNivel) {
      if (a.horario_inicio) {
        const [h, m] = a.horario_inicio.split(':').map(Number);
        const aulaMin = h * 60 + (m || 0);
        const diff = Math.abs(currentMinutes - aulaMin);
        if (diff < menorDiff) {
          menorDiff = diff;
          melhorAula = a;
        }
      }
    }
    return {
      aula: melhorAula,
      motivo: `detectada pelo nível (${aluno.nivel_atual}) mais próximo do horário`
    };
  }

  // 2. Se não houver turma específica para o nível, verifica se há cronograma cadastrado para a data
  const cronosDoDia = cronosList.filter((c) => c.data_aula === targetDate);
  if (cronosDoDia.length > 0) {
    const aulaComCrono = aulasList.find(
      (a) => a.turno === turnoAtual && cronosDoDia.some((c) => c.aula_id === a.id)
    );
    if (aulaComCrono) {
      return {
        aula: aulaComCrono,
        motivo: `detectada pelo cronograma semanal ativo para hoje (${turnoAtual})`
      };
    }
  }

  // 3. Fallback: primeira turma do turno atual
  const aulaTurno = aulasList.find((a) => a.turno === turnoAtual);
  if (aulaTurno) {
    return { aula: aulaTurno, motivo: `detectada pelo turno atual da ${turnoAtual}` };
  }

  return { aula: aulasList[0], motivo: 'primeira turma cadastrada' };
}

export const RegistrarPresencaModal: React.FC<RegistrarPresencaModalProps> = ({
  isOpen,
  onClose,
  defaultAulaId,
  defaultData
}) => {
  const {
    currentUser,
    alunos,
    alunosCadastrados,
    usuariosList,
    aulas,
    cronogramas,
    presencas,
    registrarPresencaManual,
    showToast
  } = useApp();

  const hojeStr = new Date().toISOString().substring(0, 10);
  const [selectedAulaId, setSelectedAulaId] = useState<string>(defaultAulaId || aulas[0]?.id || '');
  const [selectedData, setSelectedData] = useState<string>(defaultData || hojeStr);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
  const [autoDetectReason, setAutoDetectReason] = useState<string | null>(null);
  const [statusPresenca, setStatusPresenca] = useState<StatusPresenca>('confirmada');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sincroniza props iniciais quando abre o modal
  useEffect(() => {
    if (isOpen) {
      if (defaultAulaId) setSelectedAulaId(defaultAulaId);
      else if (!selectedAulaId && aulas[0]?.id) setSelectedAulaId(aulas[0].id);

      if (defaultData) setSelectedData(defaultData);
      else setSelectedData(hojeStr);

      setSearchTerm('');
      setSelectedAluno(null);
      setAutoDetectReason(null);

      // Auto-foco no campo de busca ao abrir
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, defaultAulaId, defaultData, aulas, hojeStr]);

  // Lista unificada de alunos (alunos cadastrados + usuários aprovados como alunos)
  const todosAlunos = useMemo(() => {
    const list = [...alunos];
    usuariosList.forEach((u) => {
      const isAlunoUser = (u.role === 'aluno' || /alun/i.test(u.cargo_pretendido || '')) && u.status === 'aprovado';
      if (isAlunoUser) {
        const jaEstaNaLista = list.some(
          (a) => (u.aluno_id && a.id === u.aluno_id) ||
                 (a.user_id && a.user_id === u.id) ||
                 (a.email && u.email && a.email.toLowerCase() === u.email.toLowerCase())
        );
        if (!jaEstaNaLista) {
          list.push({
            id: u.aluno_id || `al_${u.id}`,
            user_id: u.id,
            nome: u.nome,
            email: u.email,
            telefone: u.telefone || '',
            nivel_atual: 'B1',
            papel: 'Condutor',
            mensalidade_valor: 190.0,
            dia_vencimento: 5,
            data_matricula: u.data_cadastro ? u.data_cadastro.substring(0, 10) : hojeStr,
            data_inicio_nivel: u.data_cadastro ? u.data_cadastro.substring(0, 10) : hojeStr,
            status: 'ativo',
            foto_url: u.avatar_url,
            tipo_frequencia: 'mensalista'
          });
        }
      }
    });
    return list;
  }, [alunos, usuariosList, hojeStr]);

  // Filtra alunos em tempo real conforme o usuário digita o nome
  const filteredAlunos = useMemo(() => {
    if (!searchTerm.trim()) {
      return todosAlunos.slice(0, 10);
    }

    // Normaliza texto removendo acentos e espaços extras
    const cleanStr = (s?: string) =>
      (s || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();

    const q = cleanStr(searchTerm);
    const qDigits = searchTerm.replace(/\D/g, ''); // apenas números se o usuário digitou algum

    return todosAlunos.filter((aluno) => {
      const nomeClean = cleanStr(aluno.nome);
      const emailClean = cleanStr(aluno.email);

      const nomeMatch = nomeClean.includes(q);
      const emailMatch = emailClean.includes(q);

      // Busca por telefone SOMENTE se a pesquisa contiver dígitos numéricos
      let telMatch = false;
      if (qDigits.length > 0 && aluno.telefone) {
        const telDigits = aluno.telefone.replace(/\D/g, '');
        telMatch = telDigits.includes(qDigits);
      }

      return nomeMatch || emailMatch || telMatch;
    });
  }, [todosAlunos, searchTerm]);

  // Seleciona o aluno e detecta automaticamente a turma com base no cronograma e horário
  const handleSelectAluno = (aluno: Aluno) => {
    setSelectedAluno(aluno);

    // Sistema inteligente: detecta a turma com base no horário atual e no cronograma
    const match = findBestAulaForAluno(aluno, aulas, selectedData, cronogramas);
    if (match) {
      setSelectedAulaId(match.aula.id);
      setAutoDetectReason(match.motivo);
    }
  };

  // Verifica status de presença do aluno na turma/data selecionada
  const getPresencaAtual = (alunoId: string, aulaId?: string) => {
    const targetAulaId = aulaId || selectedAulaId;
    return presencas.find(
      (p) =>
        p.aluno_id === alunoId &&
        p.aula_id === targetAulaId &&
        (p.data_aula === selectedData || p.data_presenca === selectedData)
    );
  };

  const handleConfirmarPresenca = async () => {
    if (!selectedAluno || !selectedAulaId) {
      showToast('Selecione um aluno e uma turma para registrar presença.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await registrarPresencaManual(
        selectedAluno.id,
        selectedAulaId,
        selectedData,
        statusPresenca
      );

      // Reseta a seleção e limpa o campo de busca para o próximo aluno
      setSelectedAluno(null);
      setAutoDetectReason(null);
      setSearchTerm('');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } catch (err: any) {
      showToast('Erro ao registrar presença: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAula = aulas.find((a) => a.id === selectedAulaId);

  // Tema planejado do cronograma para esta aula e data
  const temaCronograma = useMemo(() => {
    if (!selectedAulaId || !selectedData) return null;
    const crono = cronogramas.find(
      (c) => c.aula_id === selectedAulaId && c.data_aula === selectedData
    );
    return crono?.tema_aula || null;
  }, [cronogramas, selectedAulaId, selectedData]);

  const presencaAtualDoSelecionado = selectedAluno
    ? getPresencaAtual(selectedAluno.id, selectedAulaId)
    : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center shadow-xs">
              <UserCheck className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Registrar Presença de Aluno
              </h3>
              <p className="text-xs text-slate-500">
                Digite o nome para localizar a ficha do aluno. A turma é reconhecida automaticamente pelo horário e cronograma.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Controls: Data da Aula e Turma Geral */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Data da Aula *
              </label>
              <input
                type="date"
                value={selectedData}
                onChange={(e) => setSelectedData(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-brand-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Turma Ativa da Sessão
              </label>
              <select
                value={selectedAulaId}
                onChange={(e) => {
                  setSelectedAulaId(e.target.value);
                  setAutoDetectReason(null);
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-brand-500 shadow-xs"
              >
                {aulas.map((aula) => (
                  <option key={aula.id} value={aula.id}>
                    [{aula.nivel}] {aula.nome} — {aula.turno} ({aula.horario_inicio} às {aula.horario_fim})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search-as-you-type Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Buscar Aluno pelo Nome *
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-600" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (selectedAluno) setSelectedAluno(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filteredAlunos.length > 0) {
                    e.preventDefault();
                    handleSelectAluno(filteredAlunos[0]);
                  }
                }}
                placeholder="Comece a digitar o nome do aluno (ex: Adriana, Lucas, Thaise)..."
                className="w-full rounded-2xl border-2 border-slate-200 bg-white pl-10 pr-10 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand-500 shadow-xs transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedAluno(null);
                    setAutoDetectReason(null);
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 italic">
              Conforme você digita, os cadastros dos alunos aparecem abaixo em tempo real. Pressione Enter para selecionar o primeiro.
            </p>
          </div>

          {/* Search Results / Student Cards */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span>
                {searchTerm.trim()
                  ? `Alunos Encontrados com "${searchTerm}" (${filteredAlunos.length})`
                  : `Alunos Cadastrados (${todosAlunos.length})`}
              </span>
              {selectedAluno && (
                <span className="text-brand-600 font-bold">1 aluno selecionado</span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {filteredAlunos.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-xs">
                  Nenhum aluno encontrado com o termo "{searchTerm}".
                </div>
              ) : (
                filteredAlunos.map((aluno) => {
                  const isSelected = selectedAluno?.id === aluno.id;
                  const presencaAtual = getPresencaAtual(aluno.id);

                  return (
                    <div
                      key={aluno.id}
                      onClick={() => handleSelectAluno(aluno)}
                      className={`group cursor-pointer rounded-2xl p-3 border transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/70 shadow-sm ring-2 ring-brand-500/20'
                          : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-slate-50/80 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar
                          name={aluno.nome}
                          fotoUrl={aluno.foto_url}
                          size="md"
                          className="ring-2 ring-slate-100 group-hover:ring-brand-400 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900 group-hover:text-brand-700 truncate">
                              {aluno.nome}
                            </h4>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                              {aluno.nivel_atual}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs text-slate-500">
                            <span>{aluno.papel}</span>
                            {aluno.telefone && (
                              <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                                <Phone className="h-3 w-3" />
                                {aluno.telefone}
                              </span>
                            )}
                            {aluno.tipo_frequencia && (
                              <span
                                className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                  aluno.tipo_frequencia === 'mensalista'
                                    ? 'bg-blue-50 text-blue-700'
                                    : aluno.tipo_frequencia === 'experimental'
                                    ? 'bg-purple-50 text-purple-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {aluno.tipo_frequencia === 'mensalista'
                                  ? 'Mensalista'
                                  : aluno.tipo_frequencia === 'experimental'
                                  ? 'Experimental'
                                  : 'Avulso'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right indicator: presence status or radio check */}
                      <div className="flex items-center gap-2 shrink-0">
                        {presencaAtual && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              presencaAtual.status === 'confirmada'
                                ? 'bg-emerald-100 text-emerald-800'
                                : presencaAtual.status === 'ausente'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {presencaAtual.status === 'confirmada'
                              ? '✓ Presente'
                              : presencaAtual.status === 'ausente'
                              ? '✕ Falta'
                              : '⏱ Pendente'}
                          </span>
                        )}

                        <div
                          className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-brand-600 bg-brand-600 text-white'
                              : 'border-slate-300 bg-white group-hover:border-slate-400'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Selected Student Confirmation Box & Smart Turma Selector */}
          {selectedAluno && (
            <div className="rounded-3xl bg-gradient-to-br from-emerald-50/90 via-white to-brand-50/50 p-5 border-2 border-brand-400 shadow-md space-y-4 animate-in zoom-in-95">
              {/* Header do Aluno Selecionado */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={selectedAluno.nome}
                    fotoUrl={selectedAluno.foto_url}
                    size="lg"
                    className="ring-2 ring-brand-500 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-base text-slate-900">
                        {selectedAluno.nome}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-xs font-black bg-brand-100 text-brand-800">
                        Nível {selectedAluno.nivel_atual}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedAluno.papel} • {selectedAluno.tipo_frequencia || 'Mensalista'}
                      {selectedAluno.telefone ? ` • ${selectedAluno.telefone}` : ''}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedAluno(null);
                    setAutoDetectReason(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Banner de Detecção Automática Inteligente */}
              {autoDetectReason && (
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-50 border border-brand-200/80 text-brand-900 text-xs font-medium">
                  <Sparkles className="h-4 w-4 text-brand-600 shrink-0" />
                  <div className="flex-1">
                    <span>Turma sugerida: <strong>{selectedAula?.nome}</strong> ({autoDetectReason})</span>
                  </div>
                </div>
              )}

              {/* Seletor da Turma que o aluno vai frequentar */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Confirmar Turma do Aluno:</span>
                  <span className="text-[11px] font-normal text-slate-400">
                    Você pode alterar a turma livremente se ele fizer outra aula
                  </span>
                </label>
                <select
                  value={selectedAulaId}
                  onChange={(e) => {
                    setSelectedAulaId(e.target.value);
                    setAutoDetectReason(null);
                  }}
                  className="w-full rounded-2xl border-2 border-brand-200 bg-white p-3 text-sm font-bold text-slate-900 outline-none focus:border-brand-500 shadow-xs"
                >
                  {aulas.map((aula) => {
                    const isNivelAluno = aula.nivel === selectedAluno.nivel_atual;
                    return (
                      <option key={aula.id} value={aula.id}>
                        [{aula.nivel}] {aula.nome} — {aula.turno} ({aula.horario_inicio} às {aula.horario_fim})
                        {isNivelAluno ? ' ★ (Turma do Nível do Aluno)' : ''}
                      </option>
                    );
                  })}
                </select>

                {/* Tema do Cronograma da Turma */}
                {temaCronograma && (
                  <p className="text-xs text-slate-600 flex items-center gap-1.5 pt-1">
                    <BookOpen className="h-3.5 w-3.5 text-brand-600 shrink-0" />
                    <span>Tema do planejamento de hoje: <strong>{temaCronograma}</strong></span>
                  </p>
                )}
              </div>

              {/* Alerta se o aluno já tiver presença nesta turma hoje */}
              {presencaAtualDoSelecionado && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>
                    Atenção: Este aluno já possui registro <strong>{presencaAtualDoSelecionado.status.toUpperCase()}</strong> nesta turma em {selectedData}. Você pode atualizar a chamada abaixo.
                  </span>
                </div>
              )}

              {/* Ações: Situação e Botão de Confirmação */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Situação:</span>
                  <button
                    type="button"
                    onClick={() => setStatusPresenca('confirmada')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      statusPresenca === 'confirmada'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    ✓ Presente (Confirmada)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusPresenca('ausente')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      statusPresenca === 'ausente'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    ✕ Marcar Falta
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmarPresenca}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black px-6 py-3 text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>
                    {statusPresenca === 'confirmada'
                      ? `Confirmar Presença na ${selectedAula?.nome || 'Turma'}`
                      : `Registrar Falta na ${selectedAula?.nome || 'Turma'}`}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            Fechar
          </button>

          <span className="text-[11px] text-slate-400">
            Dica: Ao confirmar, o campo de busca é limpo e focado para você chamar o próximo aluno na fila.
          </span>
        </div>
      </div>
    </div>
  );
};
