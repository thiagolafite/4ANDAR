import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CreditCard,
  QrCode,
  Copy,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Calendar,
  DollarSign
} from 'lucide-react';

export const MeusPagamentosPage: React.FC = () => {
  const { currentUser, alunos, alunosCadastrados, pagamentos, registrarPagamento, showToast } = useApp();

  const alunoLogado: any =
    alunosCadastrados.find((a) => a.id === currentUser.aluno_id || a.email === currentUser.email || a.user_id === currentUser.id) ||
    alunos.find((a) => a.id === currentUser.aluno_id || a.email === currentUser.email) ||
    alunos[0] || { id: currentUser.aluno_id || currentUser.id || 'aluno_temp', nome: currentUser.nome };

  const alunoPagamentos = pagamentos.filter((p) => p.aluno_id === alunoLogado.id || p.aluno_id === currentUser.aluno_id || p.aluno_id === currentUser.id);
  const pagamentoAberto = alunoPagamentos.find((p) => p.status !== 'Pago');

  const [copiado, setCopiado] = useState(false);
  const chavePixSimulada = '00020126580014br.gov.bcb.pix01364andar-forro-financeiro-pix@escola.com.br5204000053039865802BR5920ESCOLA 4ANDAR FORRO6009SAO PAULO62070503***6304ABCD';

  const handleCopyPix = () => {
    navigator.clipboard.writeText(chavePixSimulada);
    setCopiado(true);
    showToast('Chave PIX Copia e Cola copiada para a área de transferência!');
    setTimeout(() => setCopiado(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <CreditCard className="h-6 w-6 text-brand-600" />
          Minhas Mensalidades & Pagamentos
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Consulte faturas, emita a chave PIX de pagamento e veja seu histórico de mensalidades.
        </p>
      </div>

      {/* Current Invoice Card */}
      {pagamentoAberto ? (
        <div className="rounded-3xl bg-white border border-orange-200 shadow-md p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                Fatura em Aberto • {pagamentoAberto.status}
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                {pagamentoAberto.referencia_mes}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Vencimento: <strong>{pagamentoAberto.data_vencimento}</strong>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-400">Valor da Fatura</span>
              <p className="text-3xl font-black text-slate-900">
                R$ {pagamentoAberto.valor.toFixed(2)}
              </p>
            </div>
          </div>

          {/* PIX Payment Box */}
          <div className="rounded-2xl bg-orange-50/60 border border-orange-100 p-5 space-y-4">
            <div className="flex items-center gap-2 font-bold text-sm text-brand-900">
              <QrCode className="h-5 w-5 text-brand-600" />
              <span>Pague via PIX Instantâneo</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Utilize o código Pix Copia e Cola no aplicativo do seu banco. A baixa é confirmada automaticamente pela secretaria.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={chavePixSimulada}
                className="flex-1 rounded-xl border border-orange-200 bg-white px-3.5 py-2 text-xs text-slate-600 font-mono outline-none"
              />
              <button
                onClick={handleCopyPix}
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-xs font-bold shrink-0 transition-colors shadow-sm"
              >
                {copiado ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copiado ? 'Copiado!' : 'Copiar PIX'}</span>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => registrarPagamento(pagamentoAberto.id, 'PIX')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Simular Pagamento Realizado
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-emerald-50 border border-emerald-200 p-6 md:p-8 flex items-center gap-4 text-emerald-900">
          <CheckCircle2 className="h-10 w-10 text-emerald-600 shrink-0" />
          <div>
            <h3 className="text-lg font-bold">Parabéns! Nenhuma fatura pendente</h3>
            <p className="text-xs text-emerald-700 mt-1">
              Suas mensalidades estão em dia.{' '}
              {(alunoLogado as any).data_vencimento_atual
                ? <>Seu próximo vencimento é <strong>{new Date((alunoLogado as any).data_vencimento_atual + 'T12:00:00').toLocaleDateString('pt-BR')}</strong>.</>
                : <>Seu dia de vencimento regular é todo dia {alunoLogado.dia_vencimento}.</>
              }
            </p>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-brand-600" />
            Histórico de Pagamentos Realizados
          </h3>
          <span className="text-xs text-slate-400">
            Total: {alunoPagamentos.length} registros
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {alunoPagamentos.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Nenhum pagamento anterior encontrado.
            </div>
          ) : (
            alunoPagamentos.map((pag) => (
              <div
                key={pag.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {pag.referencia_mes}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
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
                    {pag.data_pagamento && ` • Pago em ${pag.data_pagamento}`}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="font-black text-slate-900 text-base">
                    R$ {pag.valor.toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
