import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Aluno, NivelForro, PapelDanca } from '../../types';
import {
  X,
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Award,
  CheckCircle,
  Clock,
  AlertCircle,
  Save,
  Trash2,
  FileText
} from 'lucide-react';

export const StudentDetailsModal: React.FC = () => {
  const {
    currentUser,
    selectedAlunoModal,
    setSelectedAlunoModal,
    updateAluno,
    deleteAluno,
    pagamentos,
    presencas,
    aulas,
    registrarPagamento,
    nivelamentoSessoes
  } = useApp();

  const isMaster = Boolean(currentUser.is_master || currentUser.role === 'master' || currentUser.tipo_usuario === 'AdminMaster');
  const isAluno = currentUser.role === 'aluno' || (!isMaster && currentUser.role !== 'professor' && currentUser.tipo_usuario === 'Aluno');

  const [activeTab, setActiveTab] = useState<'dados' | 'pagamentos' | 'presencas' | 'nivelamento'>('dados');
  const [formData, setFormData] = useState<Aluno | null>(null);

  useEffect(() => {
    if (selectedAlunoModal) {
      setFormData({ ...selectedAlunoModal });
      setActiveTab('dados');
    } else {
      setFormData(null);
    }
  }, [selectedAlunoModal]);

  if (!selectedAlunoModal || !formData || isAluno) return null;

  const alunoPagamentos = pagamentos.filter((p) => p.aluno_id === formData.id);
  const alunoPresencas = presencas.filter((p) => p.aluno_id === formData.id);
  const alunoNivelamentos = nivelamentoSessoes.filter((n) => n.aluno_id === formData.id);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    updateAluno(formData.id, formData);
    setSelectedAlunoModal(null);
  };

  const handleDelete = () => {
    if (window.confirm(`Tem certeza que deseja remover o cadastro de ${formData.nome}?`)) {
      deleteAluno(formData.id);
      setSelectedAlunoModal(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div
        className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with profile info */}
        <div className="relative bg-gradient-to-r from-orange-600 via-brand-600 to-amber-600 p-6 text-white">
          <button
            onClick={() => setSelectedAlunoModal(null)}
            className="absolute top-4 right-4 rounded-full bg-black/20 p-2 text-white/80 hover:bg-black/30 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-4">
            <img
              src={
                formData.foto_url ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
              }
              alt={formData.nome}
              className="h-16 w-16 rounded-full object-cover ring-4 ring-white/30 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">{formData.nome}</h3>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                  Nível {formData.nivel_atual}
                </span>
                <span className="rounded-full bg-emerald-500/80 px-2.5 py-0.5 text-xs font-semibold capitalize">
                  {formData.status}
                </span>
              </div>
              <p className="text-sm text-orange-100 mt-1 flex items-center gap-3">
                <span>Papel: {formData.papel}</span>
                <span>•</span>
                <span>Matriculado em: {formData.data_matricula}</span>
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-6 border-b border-white/20">
            <button
              onClick={() => setActiveTab('dados')}
              className={`pb-2.5 px-3 text-sm font-semibold transition-all border-b-2 ${
                activeTab === 'dados'
                  ? 'border-white text-white'
                  : 'border-transparent text-white/70 hover:text-white'
              }`}
            >
              Ficha & Cadastro
            </button>
            <button
              onClick={() => setActiveTab('pagamentos')}
              className={`pb-2.5 px-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'pagamentos'
                  ? 'border-white text-white'
                  : 'border-transparent text-white/70 hover:text-white'
              }`}
            >
              Pagamentos ({alunoPagamentos.length})
            </button>
            <button
              onClick={() => setActiveTab('presencas')}
              className={`pb-2.5 px-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'presencas'
                  ? 'border-white text-white'
                  : 'border-transparent text-white/70 hover:text-white'
              }`}
            >
              Presenças ({alunoPresencas.length})
            </button>
            <button
              onClick={() => setActiveTab('nivelamento')}
              className={`pb-2.5 px-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'nivelamento'
                  ? 'border-white text-white'
                  : 'border-transparent text-white/70 hover:text-white'
              }`}
            >
              Nivelamento ({alunoNivelamentos.length})
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: DADOS CADASTRAIS (EDITÁVEIS) */}
          {activeTab === 'dados' && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Nível Técnico Atual
                  </label>
                  <select
                    value={formData.nivel_atual}
                    onChange={(e) =>
                      setFormData({ ...formData, nivel_atual: e.target.value as NivelForro })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none bg-white"
                  >
                    <option value="B1">B1 — Básico 1 (Iniciante)</option>
                    <option value="B2">B2 — Básico 2</option>
                    <option value="I1">I1 — Intermediário 1</option>
                    <option value="I2">I2 — Intermediário 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Papel na Dança
                  </label>
                  <select
                    value={formData.papel}
                    onChange={(e) =>
                      setFormData({ ...formData, papel: e.target.value as PapelDanca })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none bg-white"
                  >
                    <option value="Condutor">Condutor</option>
                    <option value="Conduzido">Conduzido</option>
                    <option value="Ambos">Ambos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Status da Matrícula
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'ativo' | 'inativo' | 'trancado'
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none bg-white"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="trancado">Trancado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Valor da Mensalidade (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.mensalidade_valor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mensalidade_valor: parseFloat(e.target.value) || 0
                      })
                    }
                    required
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Dia de Vencimento
                  </label>
                  <select
                    value={formData.dia_vencimento}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dia_vencimento: parseInt(e.target.value, 10)
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none bg-white"
                  >
                    <option value={5}>Dia 5</option>
                    <option value={10}>Dia 10</option>
                    <option value={15}>Dia 15</option>
                    <option value={20}>Dia 20</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Observações Pedagógicas / Histórico
                </label>
                <textarea
                  rows={3}
                  value={formData.observacoes || ''}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Informações adicionais sobre o aluno..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir Aluno
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAlunoModal(null)}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
                  >
                    <Save className="h-4 w-4" />
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: PAGAMENTOS */}
          {activeTab === 'pagamentos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="font-semibold text-sm text-slate-800">
                  Histórico de Faturas & Mensalidades
                </h4>
                <span className="text-xs text-slate-500">
                  Mensalidade Padrão: R$ {formData.mensalidade_valor.toFixed(2)} (Venc. Dia {formData.dia_vencimento})
                </span>
              </div>

              {alunoPagamentos.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  Nenhum registro de pagamento encontrado para este aluno.
                </p>
              ) : (
                <div className="space-y-2">
                  {alunoPagamentos.map((pag) => (
                    <div
                      key={pag.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/60"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900">
                            {pag.referencia_mes}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              pag.status === 'Pago'
                                ? 'bg-emerald-100 text-emerald-800'
                                : pag.status === 'Atrasado'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {pag.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Vencimento: {pag.data_vencimento} • Método: {pag.metodo}
                          {pag.data_pagamento && ` • Pago em: ${pag.data_pagamento}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900 text-sm">
                          R$ {pag.valor.toFixed(2)}
                        </span>
                        {pag.status !== 'Pago' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => registrarPagamento(pag.id, 'PIX')}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 shadow-sm"
                            >
                              Baixar PIX
                            </button>
                            <button
                              onClick={() => registrarPagamento(pag.id, 'Dinheiro')}
                              className="px-2.5 py-1 bg-slate-700 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
                            >
                              Dinheiro
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRESENÇAS */}
          {activeTab === 'presencas' && (
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-slate-800">
                Histórico de Presenças e Chamadas
              </h4>

              {alunoPresencas.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  Nenhuma presença registrada ainda.
                </p>
              ) : (
                <div className="space-y-2">
                  {alunoPresencas.map((pres) => {
                    const aula = aulas.find((a) => a.id === pres.aula_id);
                    return (
                      <div
                        key={pres.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50"
                      >
                        <div>
                          <p className="font-semibold text-sm text-slate-800">
                            {aula?.nome || 'Aula de Forró'}
                          </p>
                          <p className="text-xs text-slate-500">
                            Data: {pres.data_presenca} • Nível {aula?.nivel || formData.nivel_atual}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            pres.status === 'confirmada'
                              ? 'bg-emerald-100 text-emerald-800'
                              : pres.status === 'pendente'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {pres.status === 'confirmada'
                            ? 'Confirmada'
                            : pres.status === 'pendente'
                            ? 'Pendente'
                            : 'Ausente'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: NIVELAMENTO */}
          {activeTab === 'nivelamento' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-slate-800">
                    Histórico de Avaliações Técnicas
                  </h4>
                  <p className="text-xs text-slate-500">
                    Nível Atual: <strong>{formData.nivel_atual}</strong> (iniciado em {formData.data_inicio_nivel})
                  </p>
                </div>
              </div>

              {alunoNivelamentos.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  Nenhuma sessão de nivelamento registrada para este aluno.
                </p>
              ) : (
                <div className="space-y-3">
                  {alunoNivelamentos.map((sessao) => (
                    <div
                      key={sessao.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">
                            Avaliação para Nível {sessao.nivel_alvo}
                          </span>
                          <span className="text-xs text-slate-500">
                            ({sessao.papel})
                          </span>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            sessao.status === 'Agendado'
                              ? 'bg-blue-100 text-blue-800'
                              : sessao.resultado === 'Aprovado'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {sessao.status === 'Agendado'
                            ? 'Agendado'
                            : sessao.resultado}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500">
                        Data: {sessao.data_agendada} • Avaliador Aulão: {sessao.avaliador_aulao} • Dança a dois: {sessao.avaliador_danca}
                      </p>

                      {sessao.feedback_geral && (
                        <div className="p-2.5 rounded-lg bg-orange-50/70 border border-orange-100 text-xs text-slate-700">
                          <strong>Feedback da Banca:</strong> {sessao.feedback_geral}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
