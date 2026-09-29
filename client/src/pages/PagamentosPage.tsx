import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  DollarSign,
  Send,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Search,
  Check,
  X,
  FileText
} from 'lucide-react';
import { MetodoPagamento, Pagamento, StatusPagamento } from '../types';

export const PagamentosPage: React.FC = () => {
  const {
    pagamentos,
    alunos,
    registrarPagamento,
    addPagamento,
    dispararLembretesMensalidade,
    setSelectedAlunoModal,
    showToast
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isNewCobrancaModalOpen, setIsNewCobrancaModalOpen] = useState(false);

  // New charge state
  const [novaCobranca, setNovaCobranca] = useState<Omit<Pagamento, 'id'>>({
    aluno_id: alunos[0]?.id || '',
    valor: 190.0,
    data_pagamento: null,
    data_vencimento: '2026-10-05',
    metodo: 'PIX',
    tipo: 'Mensalidade',
    status: 'Pendente',
    referencia_mes: 'Outubro/2026'
  });

  const filteredPagamentos = pagamentos.filter((pag) => {
    if (filterStatus !== 'todos' && pag.status !== filterStatus) return false;
    if (!searchTerm.trim()) return true;

    const aluno = alunos.find((a) => a.id === pag.aluno_id);
    const q = searchTerm.toLowerCase();
    return (
      aluno?.nome.toLowerCase().includes(q) ||
      pag.referencia_mes.toLowerCase().includes(q) ||
      pag.metodo.toLowerCase().includes(q)
    );
  });

  // Financial metrics
  const totalRecebido = pagamentos
    .filter((p) => p.status === 'Pago')
    .reduce((sum, p) => sum + p.valor, 0);

  const totalPendente = pagamentos
    .filter((p) => p.status === 'Pendente')
    .reduce((sum, p) => sum + p.valor, 0);

  const totalAtrasado = pagamentos
    .filter((p) => p.status === 'Atrasado')
    .reduce((sum, p) => sum + p.valor, 0);

  const handleCriarCobranca = (e: React.FormEvent) => {
    e.preventDefault();
    addPagamento(novaCobranca);
    setIsNewCobrancaModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <DollarSign className="h-6 w-6 text-brand-600" />
            Gestão Financeira & Mensalidades
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Controle de pagamentos em PIX, Cartão e Dinheiro, e workflow diário de régua de cobrança.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Automated Reminder Button */}
          <button
            onClick={() => dispararLembretesMensalidade()}
            className="flex items-center gap-2 rounded-xl bg-orange-50 border border-orange-200 hover:bg-orange-100 text-brand-700 font-bold px-4 py-2.5 text-xs transition-colors shadow-xs"
            title="Dispara e-mail de lembrete para mensalidades a vencer em até 3 dias ou atrasadas"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Disparar Lembretes Automáticos</span>
          </button>

          <button
            onClick={() => setIsNewCobrancaModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 text-xs shadow-md shadow-brand-500/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>+ Nova Cobrança</span>
          </button>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Recebido no Mês
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              ✓
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            R$ {totalRecebido.toFixed(2)}
          </p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">
            {pagamentos.filter((p) => p.status === 'Pago').length} pagamentos confirmados
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              A Vencer / Pendente
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              ⏱
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            R$ {totalPendente.toFixed(2)}
          </p>
          <p className="text-xs text-amber-600 font-semibold mt-1">
            {pagamentos.filter((p) => p.status === 'Pendente').length} faturas aguardando
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Mensalidades Atrasadas
            </span>
            <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              !
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">
            R$ {totalAtrasado.toFixed(2)}
          </p>
          <p className="text-xs text-rose-500 font-semibold mt-1">
            {pagamentos.filter((p) => p.status === 'Atrasado').length} aluno(s) em atraso
          </p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome do aluno ou mês de referência..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-brand-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          {['todos', 'Pago', 'Pendente', 'Atrasado'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'todos' ? 'Todos os Status' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Aluno</th>
                <th className="p-4">Referência / Tipo</th>
                <th className="p-4">Vencimento</th>
                <th className="p-4">Valor</th>
                <th className="p-4">Status & Método</th>
                <th className="p-4 text-right">Dar Baixa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPagamentos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Nenhum pagamento localizado.
                  </td>
                </tr>
              ) : (
                filteredPagamentos.map((pag) => {
                  const aluno = alunos.find((a) => a.id === pag.aluno_id);

                  return (
                    <tr key={pag.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div
                          onClick={() => aluno && setSelectedAlunoModal(aluno)}
                          className="cursor-pointer flex items-center gap-3 group"
                        >
                          <img
                            src={
                              aluno?.foto_url ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                            }
                            alt={aluno?.nome}
                            className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-brand-500"
                          />
                          <div>
                            <p className="font-bold text-sm text-slate-900 group-hover:text-brand-600">
                              {aluno?.nome || 'Aluno Desconhecido'}
                            </p>
                            <p className="text-xs text-slate-400">
                              Nível {aluno?.nivel_atual} • {aluno?.telefone}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-slate-800 text-xs block">
                          {pag.referencia_mes}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {pag.tipo}
                        </span>
                      </td>

                      <td className="p-4 text-xs">
                        <span className="font-medium text-slate-700">
                          {pag.data_vencimento}
                        </span>
                        {pag.data_pagamento && (
                          <span className="block text-[10px] text-emerald-600">
                            Pago em {pag.data_pagamento}
                          </span>
                        )}
                      </td>

                      <td className="p-4 font-black text-slate-900 text-sm">
                        R$ {pag.valor.toFixed(2)}
                      </td>

                      <td className="p-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              pag.status === 'Pago'
                                ? 'bg-emerald-100 text-emerald-800'
                                : pag.status === 'Atrasado'
                                ? 'bg-rose-100 text-rose-800 animate-pulse'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {pag.status}
                          </span>
                          <span className="block text-[11px] text-slate-400">
                            Via {pag.metodo}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        {pag.status === 'Pago' ? (
                          <span className="text-xs font-semibold text-emerald-600 flex items-center justify-end gap-1">
                            <CheckCircle2 className="h-4 w-4" /> Baixado
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => registrarPagamento(pag.id, 'PIX')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                            >
                              PIX
                            </button>
                            <button
                              onClick={() => registrarPagamento(pag.id, 'Cartão')}
                              className="px-2.5 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                              Cartão
                            </button>
                            <button
                              onClick={() => registrarPagamento(pag.id, 'Dinheiro')}
                              className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                            >
                              Dinheiro
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova Cobrança */}
      {isNewCobrancaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                Lançar Cobrança Manual
              </h3>
              <button
                onClick={() => setIsNewCobrancaModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCriarCobranca} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Aluno *
                </label>
                <select
                  value={novaCobranca.aluno_id}
                  onChange={(e) => {
                    const sel = alunos.find((a) => a.id === e.target.value);
                    setNovaCobranca({
                      ...novaCobranca,
                      aluno_id: e.target.value,
                      valor: sel?.mensalidade_valor || novaCobranca.valor
                    });
                  }}
                  className="w-full rounded-xl border border-slate-300 p-2 text-sm bg-white outline-none focus:border-brand-500"
                >
                  {alunos.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nome} (Nível {a.nivel_atual})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mês de Referência
                </label>
                <input
                  type="text"
                  required
                  value={novaCobranca.referencia_mes}
                  onChange={(e) =>
                    setNovaCobranca({ ...novaCobranca, referencia_mes: e.target.value })
                  }
                  placeholder="Ex.: Outubro/2026"
                  className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={novaCobranca.valor}
                    onChange={(e) =>
                      setNovaCobranca({
                        ...novaCobranca,
                        valor: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Data de Vencimento
                  </label>
                  <input
                    type="date"
                    required
                    value={novaCobranca.data_vencimento}
                    onChange={(e) =>
                      setNovaCobranca({
                        ...novaCobranca,
                        data_vencimento: e.target.value
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Método Preferencial
                  </label>
                  <select
                    value={novaCobranca.metodo}
                    onChange={(e) =>
                      setNovaCobranca({
                        ...novaCobranca,
                        metodo: e.target.value as MetodoPagamento
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2 text-sm bg-white outline-none focus:border-brand-500"
                  >
                    <option value="PIX">PIX</option>
                    <option value="Cartão">Cartão</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tipo
                  </label>
                  <select
                    value={novaCobranca.tipo}
                    onChange={(e) =>
                      setNovaCobranca({
                        ...novaCobranca,
                        tipo: e.target.value as any
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2 text-sm bg-white outline-none focus:border-brand-500"
                  >
                    <option value="Mensalidade">Mensalidade</option>
                    <option value="Aula Avulsa">Aula Avulsa</option>
                    <option value="Evento">Evento</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewCobrancaModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
                >
                  Gerar Cobrança
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
