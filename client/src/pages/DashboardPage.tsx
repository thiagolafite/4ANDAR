import React from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  DollarSign,
  Send,
  PlusCircle,
  Clock,
  PartyPopper,
  Megaphone,
  UserCheck
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    currentUser,
    alunos,
    aulas,
    cronogramas,
    presencas,
    pagamentos,
    nivelamentoSessoes,
    eventos,
    avisos,
    solicitarPresenca,
    confirmarPresenca,
    marcarAusente,
    dispararLembretesMensalidade,
    setSelectedAlunoModal
  } = useApp();

  const navigate = useNavigate();
  const isEquipe = currentUser.tipo_usuario === 'Equipe';

  // Current student if logged in as Aluno
  const alunoLogado = !isEquipe
    ? alunos.find((a) => a.id === currentUser.aluno_id || a.email === currentUser.email) || alunos[0]
    : null;

  // EQUIPE METRICS
  const totalAlunosAtivos = alunos.filter((a) => a.status === 'ativo').length;
  const presencasPendentes = presencas.filter((p) => p.status === 'pendente');
  const pagamentosAtrasados = pagamentos.filter((p) => p.status === 'Atrasado');
  const pagamentosPagos = pagamentos.filter((p) => p.status === 'Pago');
  const totalRecebidoMes = pagamentosPagos.reduce((acc, p) => acc + p.valor, 0);
  const sessoesNivelamentoAgendadas = nivelamentoSessoes.filter((s) => s.status === 'Agendado');

  // Next class for student
  const proximaAulaAluno = alunoLogado
    ? aulas.find((a) => a.nivel === alunoLogado.nivel_atual) || aulas[0]
    : null;

  const cronoProxima = proximaAulaAluno
    ? cronogramas.find((c) => c.aula_id === proximaAulaAluno.id)
    : null;

  const presencaAlunoHoje =
    alunoLogado && proximaAulaAluno
      ? presencas.find(
          (p) => p.aluno_id === alunoLogado.id && p.aula_id === proximaAulaAluno.id
        )
      : null;

  // Student Payment status
  const pagamentoAlunoAtual = alunoLogado
    ? pagamentos.find((p) => p.aluno_id === alunoLogado.id)
    : null;

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-brand-600 to-amber-500 p-6 md:p-8 text-white shadow-xl shadow-orange-500/10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Escola de Dança 4ANDAR • Ritmo, Conexão e Forró</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
            Olá, {currentUser.nome.split(' ')[0]}! Seja bem-vindo(a).
          </h2>
          <p className="mt-2 text-sm md:text-base text-orange-100 font-medium leading-relaxed">
            {isEquipe
              ? 'Painel de gestão pedagógica e operacional. Acompanhe a frequência de hoje, aprove confirmações de chamada e monitore a saúde financeira.'
              : `Você está na turma de nível ${alunoLogado?.nivel_atual} (${alunoLogado?.papel}). Pratique seus passos e confirme sua presença na próxima aula.`}
          </p>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-32 -top-10 h-40 w-40 rounded-full bg-amber-300/20 blur-xl pointer-events-none" />
      </div>

      {/* ======================================================== */}
      {/* VIEW: EQUIPE / ADMIN                                     */}
      {/* ======================================================== */}
      {isEquipe && (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => navigate('/alunos')}
              className="cursor-pointer rounded-2xl bg-white p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-brand-300 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Alunos Ativos
                </span>
                <div className="rounded-xl bg-orange-50 p-2.5 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {totalAlunosAtivos}
                </span>
                <span className="text-xs font-semibold text-emerald-600">
                  100% matriculados
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Total na base: {alunos.length}
              </p>
            </div>

            <div
              onClick={() => navigate('/presenca')}
              className="cursor-pointer rounded-2xl bg-white p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-amber-300 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Presenças a Confirmar
                </span>
                <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {presencasPendentes.length}
                </span>
                <span className="text-xs font-semibold text-amber-600">
                  solicitações pendentes
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Aguardando aprovação da equipe
              </p>
            </div>

            <div
              onClick={() => navigate('/pagamentos')}
              className="cursor-pointer rounded-2xl bg-white p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Receita do Mês
                </span>
                <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  R$ {totalRecebidoMes.toFixed(2)}
                </span>
                <span className="text-xs font-semibold text-emerald-600">
                  {pagamentosPagos.length} baixas
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {pagamentosAtrasados.length} mensalidade(s) em atraso
              </p>
            </div>

            <div
              onClick={() => navigate('/nivelamento')}
              className="cursor-pointer rounded-2xl bg-white p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-300 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Nivelamentos
                </span>
                <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Award className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {sessoesNivelamentoAgendadas.length}
                </span>
                <span className="text-xs font-semibold text-purple-600">
                  agendados
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Banca técnica avaliadora
              </p>
            </div>
          </div>

          {/* Quick Actions & Automation Bar */}
          <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Ações Rápidas:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => navigate('/alunos')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <PlusCircle className="h-3.5 w-3.5 text-slate-500" />
                Cadastrar Aluno
              </button>

              <button
                onClick={() => navigate('/cronograma')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                Editar Temas da Semana
              </button>

              <button
                onClick={() => dispararLembretesMensalidade()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-orange-50 border border-orange-200 px-3.5 py-2 text-xs font-semibold text-brand-700 hover:bg-orange-100 transition-colors"
                title="Disparar e-mails para alunos a vencer em até 3 dias ou com mensalidade em atraso"
              >
                <Send className="h-3.5 w-3.5 text-brand-600" />
                Disparar Lembretes de Mensalidade
              </button>
            </div>
          </div>

          {/* Two-column layout: Aulas de Hoje & Presenças Pendentes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Turmas & Temas da Semana */}
            <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-brand-500" />
                    Turmas e Temas de Aulas
                  </h3>
                  <button
                    onClick={() => navigate('/cronograma')}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    Ver Grade Completa <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {aulas.slice(0, 4).map((aula) => {
                    const crono = cronogramas.find((c) => c.aula_id === aula.id);
                    return (
                      <div
                        key={aula.id}
                        className="p-3.5 rounded-xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-800">
                              {aula.nome}
                            </span>
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                              {aula.turno}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-brand-700 mt-1">
                            Tema:{' '}
                            <span className="font-normal text-slate-600">
                              {crono?.tema_aula || 'Tema a definir'}
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {aula.dia_semana} às {aula.horario_inicio} • {aula.sala}
                          </p>
                        </div>

                        <button
                          onClick={() => navigate('/presenca')}
                          className="shrink-0 self-start sm:self-center px-3 py-1.5 rounded-lg bg-orange-100 text-brand-700 text-xs font-semibold hover:bg-orange-200 transition-colors"
                        >
                          Chamada
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Presenças Aguardando Confirmação */}
            <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-500" />
                    Solicitações de Presença Recentes
                  </h3>
                  <button
                    onClick={() => navigate('/presenca')}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    Gerenciar Todas ({presencas.length}) <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {presencasPendentes.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-600">
                      Tudo em dia!
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Nenhuma solicitação de presença pendente no momento.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {presencasPendentes.slice(0, 4).map((pres) => {
                      const aluno = alunos.find((a) => a.id === pres.aluno_id);
                      const aula = aulas.find((a) => a.id === pres.aula_id);
                      return (
                        <div
                          key={pres.id}
                          className="p-3 rounded-xl border border-amber-100 bg-amber-50/40 flex items-center justify-between gap-3"
                        >
                          <div
                            onClick={() => aluno && setSelectedAlunoModal(aluno)}
                            className="cursor-pointer flex items-center gap-2.5"
                          >
                            <img
                              src={
                                aluno?.foto_url ||
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                              }
                              alt={aluno?.nome}
                              className="h-9 w-9 rounded-full object-cover ring-2 ring-amber-300"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-900 hover:text-brand-600">
                                {aluno?.nome}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {aula?.nome} ({pres.data_presenca})
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => confirmarPresenca(pres.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => marcarAusente(pres.id)}
                              className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                            >
                              Falta
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ======================================================== */}
      {/* VIEW: ALUNO                                              */}
      {/* ======================================================== */}
      {!isEquipe && alunoLogado && (
        <div className="space-y-6">
          {/* Card em Destaque: Minha Próxima Aula */}
          <div className="rounded-3xl bg-white p-6 md:p-8 border border-orange-100 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-800">
                    Sua Turma: {alunoLogado.nivel_atual} ({alunoLogado.papel})
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {proximaAulaAluno?.dia_semana} às {proximaAulaAluno?.horario_inicio}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-slate-900">
                  {proximaAulaAluno?.nome}
                </h3>

                <div className="rounded-2xl bg-orange-50/70 p-4 border border-orange-100 text-sm">
                  <p className="font-semibold text-brand-900 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-brand-600" />
                    Tema Planejado:
                  </p>
                  <p className="text-slate-700 mt-1 font-medium">
                    {cronoProxima?.tema_aula || 'Fundamentos de giro e caminhada no tempo 1'}
                  </p>
                  {cronoProxima?.observacoes && (
                    <p className="text-xs text-slate-500 mt-1">
                      💡 Obs do professor: {cronoProxima.observacoes}
                    </p>
                  )}
                </div>

                <p className="text-xs text-slate-500 flex items-center gap-3">
                  <span>📍 Local: {proximaAulaAluno?.sala}</span>
                  <span>•</span>
                  <span>Prof.: Mariana Sol / Mestre Gonzaga</span>
                </p>
              </div>

              {/* Action Box */}
              <div className="shrink-0 flex flex-col items-start md:items-end justify-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Status de Presença
                </span>

                {presencaAlunoHoje ? (
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                        presencaAlunoHoje.status === 'confirmada'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {presencaAlunoHoje.status === 'confirmada'
                        ? 'Presença Confirmada!'
                        : 'Solicitação Enviada (Pendente)'}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() =>
                      proximaAulaAluno &&
                      solicitarPresenca(
                        alunoLogado.id,
                        proximaAulaAluno.id,
                        cronoProxima?.data_aula || '2026-09-29'
                      )
                    }
                    className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 shadow-md shadow-brand-500/20 text-sm transition-all"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Solicitar Presença na Aula
                  </button>
                )}
                <span className="text-[11px] text-slate-400 text-center">
                  Avise a equipe com antecedência para equilibrar os pares.
                </span>
              </div>
            </div>
          </div>

          {/* Student Status Grid: Financeiro & Nivelamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Financeiro */}
            <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    Minha Mensalidade
                  </h4>
                  <button
                    onClick={() => navigate('/meus-pagamentos')}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    Ver Extrato <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <span className="text-xs text-slate-400">Referência</span>
                    <p className="font-bold text-slate-900 text-base">
                      {pagamentoAlunoAtual?.referencia_mes || 'Outubro/2026'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Vence dia {alunoLogado.dia_vencimento}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                        pagamentoAlunoAtual?.status === 'Pago'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {pagamentoAlunoAtual?.status || 'Pendente'}
                    </span>
                    <p className="font-black text-slate-900 text-lg mt-1">
                      R$ {alunoLogado.mensalidade_valor.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => navigate('/meus-pagamentos')}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
                >
                  Pagar via Chave PIX
                </button>
              </div>
            </div>

            {/* Nivelamento Técnico */}
            <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Award className="h-4 w-4 text-purple-500" />
                    Nivelamento & Evolução Técnica
                  </h4>
                  <button
                    onClick={() => navigate('/agendamento-nivelamento')}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    Agendar Teste <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 uppercase">
                      Nível Atual: {alunoLogado.nivel_atual}
                    </span>
                    <span className="text-xs text-purple-700 font-semibold">
                      Desde {alunoLogado.data_inicio_nivel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Você está apto(a) para se preparar para o nivelamento de{' '}
                    <strong>
                      {alunoLogado.nivel_atual === 'B1'
                        ? 'B2 (Básico 2)'
                        : alunoLogado.nivel_atual === 'B2'
                        ? 'I1 (Intermediário 1)'
                        : 'I2'}
                    </strong>
                    . As bancas avaliam Aulão de ritmo e Dança a dois.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => navigate('/agendamento-nivelamento')}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors"
                >
                  Agendar Sessão de Avaliação
                </button>
              </div>
            </div>
          </div>

          {/* Avisos e Eventos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mural de Avisos */}
            <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-brand-500" />
                  Mural de Avisos
                </h4>
                <button
                  onClick={() => navigate('/avisos')}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  Ver Todos
                </button>
              </div>
              <div className="space-y-2.5">
                {avisos.slice(0, 2).map((aviso) => (
                  <div
                    key={aviso.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <p className="font-bold text-slate-900">{aviso.titulo}</p>
                    <p className="text-slate-600 mt-1 line-clamp-2">
                      {aviso.conteudo}
                    </p>
                    {aviso.link_url && (
                      <a
                        href={aviso.link_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-2 font-semibold text-brand-600 hover:underline"
                      >
                        {aviso.link_texto || 'Acessar Link'} →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Próximos Eventos */}
            <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <PartyPopper className="h-4 w-4 text-amber-500" />
                  Bailes & Workshops
                </h4>
                <button
                  onClick={() => navigate('/eventos')}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  Ver Todos
                </button>
              </div>
              <div className="space-y-2.5">
                {eventos.slice(0, 2).map((evento) => (
                  <div
                    key={evento.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={evento.foto_url}
                        alt={evento.titulo}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-bold text-xs text-slate-900 line-clamp-1">
                          {evento.titulo}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {evento.data_evento} às {evento.horario}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-xs text-brand-700 shrink-0">
                      R$ {evento.preco.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
