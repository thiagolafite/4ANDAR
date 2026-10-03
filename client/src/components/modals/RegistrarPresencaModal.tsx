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
  XCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Aluno, StatusPresenca } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

interface RegistrarPresencaModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAulaId?: string;
  defaultData?: string;
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
    presencas,
    registrarPresencaManual,
    showToast
  } = useApp();

  const hojeStr = new Date().toISOString().substring(0, 10);
  const [selectedAulaId, setSelectedAulaId] = useState<string>(defaultAulaId || aulas[0]?.id || '');
  const [selectedData, setSelectedData] = useState<string>(defaultData || hojeStr);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
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

      // Auto-foco no campo de busca ao abrir
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, defaultAulaId, defaultData, aulas]);

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
      return todosAlunos.slice(0, 8); // exibe os primeiros se não digitou nada
    }

    const q = searchTerm.toLowerCase().trim();
    return todosAlunos.filter((aluno) => {
      const nomeMatch = aluno.nome.toLowerCase().includes(q);
      const telMatch = aluno.telefone && aluno.telefone.replace(/\D/g, '').includes(q.replace(/\D/g, ''));
      const emailMatch = aluno.email && aluno.email.toLowerCase().includes(q);
      return nomeMatch || telMatch || emailMatch;
    });
  }, [todosAlunos, searchTerm]);

  // Verifica status atual do aluno na turma/data selecionada
  const getPresencaAtual = (alunoId: string) => {
    return presencas.find(
      (p) =>
        (p.aluno_id === alunoId) &&
        p.aula_id === selectedAulaId &&
        (p.data_aula === selectedData || p.data_presenca === selectedData)
    );
  };

  const handleSelectAluno = (aluno: Aluno) => {
    setSelectedAluno(aluno);
    // Se a turma do aluno for compatível com a aula selecionada, mantém, caso contrário sugere a turma do nível dele
    const aulaDoNivel = aulas.find((a) => a.nivel === aluno.nivel_atual);
    if (aulaDoNivel && selectedAulaId !== aulaDoNivel.id) {
      // Opcional: mantém a aula atual se já foi escolhida
    }
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
                Digite o nome para localizar a ficha do aluno e confirmar a chamada na hora.
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
          {/* Controls: Turma & Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Turma da Aula *
              </label>
              <select
                value={selectedAulaId}
                onChange={(e) => setSelectedAulaId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-brand-500"
              >
                {aulas.map((aula) => (
                  <option key={aula.id} value={aula.id}>
                    [{aula.nivel}] {aula.nome} — {aula.dia_semana} ({aula.horario_inicio})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Data da Aula *
              </label>
              <input
                type="date"
                value={selectedData}
                onChange={(e) => setSelectedData(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-brand-500"
              />
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
                  if (selectedAluno) setSelectedAluno(null); // reseta seleção ao digitar nova busca
                }}
                placeholder="Comece a digitar o nome do aluno (ex: Adriana, Lucas, Bia)..."
                className="w-full rounded-2xl border-2 border-slate-200 bg-white pl-10 pr-10 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand-500 shadow-xs transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedAluno(null);
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 italic">
              Conforme você digita, os cadastros dos alunos aparecem abaixo em tempo real.
            </p>
          </div>

          {/* Search Results / Student Cards */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span>Alunos Encontrados ({filteredAlunos.length})</span>
              {selectedAluno && (
                <span className="text-brand-600 font-bold">1 aluno selecionado</span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2.5 max-h-60 overflow-y-auto pr-1">
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

          {/* Selected Student Confirmation Box */}
          {selectedAluno && (
            <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-brand-50/40 p-4 border border-emerald-200/80 space-y-3 animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Pronto para registrar presença
                </span>
                <span className="text-xs text-slate-600 font-semibold">
                  {selectedAula?.nome} • {selectedData}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-emerald-200/60">
                {/* Status Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Situação:</span>
                  <button
                    type="button"
                    onClick={() => setStatusPresenca('confirmada')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      statusPresenca === 'ausente'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    ✕ Marcar Falta
                  </button>
                </div>

                {/* Confirm Button */}
                <button
                  type="button"
                  onClick={handleConfirmarPresenca}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black px-5 py-2.5 text-xs shadow-md shadow-emerald-600/20 transition-all"
                >
                  <Check className="h-4 w-4" />
                  <span>
                    {statusPresenca === 'confirmada' ? 'Confirmar Presença' : 'Registrar Falta'}
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
            Dica: Ao confirmar, a busca é limpa automaticamente para você chamar o próximo aluno.
          </span>
        </div>
      </div>
    </div>
  );
};
