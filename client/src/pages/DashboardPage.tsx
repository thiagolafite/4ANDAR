import React, { useState } from 'react';
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
  UserCheck,
  FileSpreadsheet,
  BookOpen,
  Shield
} from 'lucide-react';

import { UserAvatar } from '../components/common/UserAvatar';
import { RegistrarPresencaModal } from '../components/modals/RegistrarPresencaModal';

export const DashboardPage: React.FC = () => {
  const {
    currentUser,
    pendingUsersCount,
    minhasTurmas,
    alunos,
    alunosCadastrados,
    professoresCadastrados,
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
  const [isRegistrarModalOpen, setIsRegistrarModalOpen] = useState(false);
  const isMaster = Boolean(currentUser.is_master || currentUser.role === 'master' || currentUser.tipo_usuario === 'AdminMaster');
  const isAluno = currentUser.role === 'aluno' || (!isMaster && currentUser.role !== 'professor' && currentUser.role !== 'secretaria' && currentUser.tipo_usuario === 'Aluno');
  const isEquipe = !isAluno;

  // Safe alunoLogado fallback when database is empty
  const alunoLogado: any = isAluno
    ? alunosCadastrados.find((a) => a.id === currentUser.aluno_id || a.email === currentUser.email || a.user_id === currentUser.id) ||
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
      }
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
    ? aulas.find((a) => a.nivel === alunoLogado.nivel_atual) || aulas[0] || null
    : null;

  const cronoProxima = proximaAulaAluno
    ? cronogramas.find((c) => c.aula_id === proximaAulaAluno.id) || null
    : null;

  const presencaAlunoHoje =
    alunoLogado && proximaAulaAluno
      ? presencas.find(
          (p) => p.aluno_id === alunoLogado.id && p.aula_id === proximaAulaAluno.id
        ) || null
      : null;

  // Scheduled leveling session for the student
  const proximoNivelamentoAluno = alunoLogado
    ? nivelamentoSessoes.find(
        (s) =>
          s.status === 'Agendado' &&
          ((alunoLogado?.id && s.aluno_id === alunoLogado.id) ||
            (alunoLogado?.aluno_id && s.aluno_id === alunoLogado.aluno_id) ||
            (alunoLogado?.user_id && s.aluno_id === alunoLogado.user_id) ||
            (currentUser?.aluno_id && s.aluno_id === currentUser.aluno_id) ||
            (currentUser?.id && s.aluno_id === currentUser.id) ||
            (s.aluno_email &&
              currentUser?.email &&
              s.aluno_email.trim().toLowerCase() === currentUser.email.trim().toLowerCase()) ||
            (s.aluno_nome &&
              currentUser?.nome &&
              s.aluno_nome.trim().toLowerCase() === currentUser.nome.trim().toLowerCase()))
      )
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
          {/* Banner de Novos Usuários Pendentes de Aprovação */}
          {(isMaster || currentUser.role === 'admin') && pendingUsersCount > 0 && (
            <div
              onClick={() => navigate('/usuarios')}
              className="cursor-pointer rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-500/50 hover:border-amber-500 p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3.5">
                <div className="h-11 w-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30 group-hover:scale-105 transition-transform">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <span>{pendingUsersCount} novo(s) cadastro(s) aguardando sua aprovação!</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                      Pendente
                    </span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                    Clique aqui para abrir a Gestão de Usuários, classificar a função (Secretaria, Aluno ou Professor) e liberar o acesso.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-md shadow-amber-500/20 shrink-0 cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
              >
                <span>Aprovar Cadastros</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

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

            {/* Metric 3: Receita (para Master/Admin) ou Minhas Turmas (para Professor) */}
            {isMaster || currentUser.role === 'admin' ? (
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
            ) : (
              <div
                onClick={() => navigate('/cronograma')}
                className="cursor-pointer rounded-2xl bg-white p-5 border border-amber-200 bg-amber-50/20 shadow-sm hover:shadow-md hover:border-amber-400 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                    Minhas Turmas
                  </span>
                  <div className="rounded-xl bg-amber-100 p-2.5 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <BookOpen className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">
                    {minhasTurmas.length}
                  </span>
                  <span className="text-xs font-semibold text-amber-700">
                    turmas atribuídas
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Ver no planejamento semanal
                </p>
              </div>
            )}

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

          {/* Seção Exclusiva: Minhas Turmas & Aulas Atribuídas (para professores ou equipe) */}
          {(currentUser.role === 'professor' || minhasTurmas.length > 0) && (
            <div className="rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white p-6 border-2 border-amber-300/80 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-500 text-white shadow-xs">
                      <BookOpen className="h-4 w-4" />
                    </span>
                    <h3 className="text-lg font-black text-slate-900">
                      ⭐ Minhas Turmas & Aulas Atribuídas
                    </h3>
                    <span className="rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 text-xs font-black">
                      {minhasTurmas.length} {minhasTurmas.length === 1 ? 'Turma' : 'Turmas'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Aulas associadas diretamente ao seu usuário. Você pode acompanhar os temas planejados e abrir a chamada.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/cronograma')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3.5 py-2 rounded-xl transition-colors"
                  >
                    <Calendar className="h-3.5 w-3.5 text-amber-700" />
                    Ver Meu Cronograma
                  </button>
                  <button
                    onClick={() => navigate('/aulas')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl transition-colors"
                  >
                    Gerenciar Turmas
                  </button>
                </div>
              </div>

              {minhasTurmas.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-amber-300 bg-white/70 p-6 text-center">
                  <BookOpen className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-amber-900">
                    Nenhuma turma vinculada ao seu usuário no momento.
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    O administrador master pode associar seu usuário a turmas e aulas no Planejamento Semanal (Cronograma) ou no menu de Turmas.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {minhasTurmas.map((turma) => {
                    const turmaCronos = cronogramas
                      .filter((c) => c.aula_id === turma.id)
                      .sort((a, b) => a.data_aula.localeCompare(b.data_aula));
                    const proximoCrono = turmaCronos[0];
                    const alunosNivel = alunos.filter(
                      (a) => a.nivel_atual === turma.nivel && a.status === 'ativo'
                    ).length;

                    return (
                      <div
                        key={turma.id}
                        className="rounded-2xl bg-white border border-amber-200 p-4 shadow-xs hover:shadow-md hover:border-amber-400 transition-all flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                              Nível {turma.nivel} • {turma.turno}
                            </span>
                            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {turma.dia_semana}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-slate-900 mt-2">
                            {turma.nome}
                          </h4>

                          <div className="mt-2.5 rounded-xl bg-orange-50/70 p-3 border border-orange-100 text-xs">
                            <span className="font-bold text-amber-900 block flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                              Próximo Tema ({proximoCrono?.data_aula || 'Em breve'}):
                            </span>
                            <span className="text-slate-700 font-medium block mt-1">
                              {proximoCrono?.tema_aula || 'Tema a ser definido'}
                            </span>
                            {proximoCrono?.observacoes && (
                              <span className="text-[11px] text-slate-500 block mt-1">
                                💡 {proximoCrono.observacoes}
                              </span>
                            )}
                          </div>

                          <div className="mt-3 text-[11px] text-slate-500 space-y-1">
                            <p className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3 text-slate-400" />
                              <span>{turma.horario_inicio} às {turma.horario_fim}</span>
                            </p>
                            <p>📍 {turma.sala}</p>
                            <p>👥 ~{alunosNivel} alunos ativos no nível</p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                          <button
                            onClick={() => navigate('/presenca')}
                            className="flex-1 text-center py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors shadow-xs"
                          >
                            Fazer Chamada
                          </button>
                          <button
                            onClick={() => navigate('/cronograma')}
                            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                          >
                            Cronograma
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Quick Actions & Automation Bar */}
          <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Ações Rápidas:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsRegistrarModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700 transition-colors"
                title="Chamada rápida: busque o aluno pelo nome e confirme a presença"
              >
                <UserCheck className="h-3.5 w-3.5" />
                Registrar Presença
              </button>

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
                Planejamento Semanal
              </button>

              <button
                onClick={() => navigate('/cronograma')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                Importar Grade Excel
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsRegistrarModalOpen(true)}
                      className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 bg-brand-50 px-2.5 py-1 rounded-lg hover:bg-brand-100 transition-colors"
                      title="Registrar presença avulsa ou manual"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      + Registrar
                    </button>
                    <button
                      onClick={() => navigate('/presenca')}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1"
                    >
                      Ver Todas ({presencas.length}) <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
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
                      const aluno =
                        alunosCadastrados.find((a) => a.id === pres.aluno_id || a.aluno_id === pres.aluno_id || a.user_id === pres.aluno_id) ||
                        alunos.find((a) => a.id === pres.aluno_id);
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
                            <UserAvatar
                              name={aluno?.nome || 'Aluno'}
                              fotoUrl={aluno?.foto_url}
                              size="sm"
                              className="ring-2 ring-amber-300"
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
          {/* Alerta de Nivelamento Agendado na Conta do Aluno */}
          {proximoNivelamentoAluno && (
            <div className="rounded-3xl border-2 border-brand-500 bg-gradient-to-r from-brand-600 via-orange-600 to-amber-500 p-5 md:p-6 text-white shadow-xl shadow-brand-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider bg-white/25 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      Banca Agendada na Agenda Oficial
                    </span>
                  </div>
                  <h3 className="text-lg font-black mt-1">
                    Seu Nivelamento para Nível {proximoNivelamentoAluno.nivel_alvo} ({proximoNivelamentoAluno.papel}) está confirmado!
                  </h3>
                  <p className="text-xs text-orange-100 font-medium mt-0.5">
                    📅 {proximoNivelamentoAluno.data_agendada} • Banca: {proximoNivelamentoAluno.avaliador_aulao} & {proximoNivelamentoAluno.avaliador_danca} • Salão 2
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/meus-nivelamentos')}
                className="shrink-0 rounded-xl bg-white text-brand-700 hover:bg-orange-50 font-bold px-4 py-2.5 text-xs shadow-md transition-all self-start sm:self-auto flex items-center gap-1.5"
              >
                <span>Ver Instruções e Ficha</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Card em Destaque: Minha Próxima Aula & Presença */}
          <div className="rounded-3xl bg-white p-6 md:p-8 border border-orange-100 shadow-md">
            {proximaAulaAluno ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-800">
                      Sua Turma: {alunoLogado.nivel_atual} ({alunoLogado.papel})
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {proximaAulaAluno.dia_semana} às {proximaAulaAluno.horario_inicio}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900">
                    {proximaAulaAluno.nome}
                  </h3>

                  <div className="rounded-2xl bg-orange-50/70 p-4 border border-orange-100 text-sm">
                    <p className="font-semibold text-brand-900 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-brand-600" />
                      Tema Planejado:
                    </p>
                    <p className="text-slate-700 mt-1 font-medium">
                      {cronoProxima?.tema_aula || 'Fundamentos de ritmo, conexão e abraço'}
                    </p>
                    {cronoProxima?.observacoes && (
                      <p className="text-xs text-slate-500 mt-1">
                        💡 Obs do professor: {cronoProxima.observacoes}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 flex items-center gap-3">
                    <span>📍 Local: {proximaAulaAluno.sala || 'Salão Principal'}</span>
                    <span>•</span>
                    <span>
                      Prof.: {
                        professoresCadastrados.find((p) => p.id === proximaAulaAluno.equipe_id || p.equipe_id === proximaAulaAluno.equipe_id || p.user_id === proximaAulaAluno.equipe_id)?.nome || 'A definir'
                      }
                    </span>
                  </p>
                </div>

                {/* Action Box: Marcar Presença */}
                <div className="shrink-0 flex flex-col items-start md:items-end justify-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Marcar Presença
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
                        solicitarPresenca(
                          alunoLogado.id,
                          proximaAulaAluno.id,
                          cronoProxima?.data_aula || new Date().toISOString().substring(0, 10)
                        )
                      }
                      className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 shadow-md shadow-brand-500/20 text-sm transition-all"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Marcar Presença na Aula
                    </button>
                  )}
                  <span className="text-[11px] text-slate-400 text-center">
                    Avise a equipe para organizarmos os pares na sala.
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Clock className="h-10 w-10 text-orange-400 mx-auto mb-2 opacity-80" />
                <h4 className="font-bold text-slate-800">Nenhuma aula programada no momento</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Assim que o professor publicar turmas para o seu nível ({alunoLogado.nivel_atual}), elas aparecerão aqui para você marcar presença.
                </p>
              </div>
            )}
          </div>

          {/* Student Status Grid: Nivelamento Técnico & Eventos Convidados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nivelamento Técnico */}
            <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Award className="h-4 w-4 text-purple-500" />
                    Meu Nivelamento & Evolução Técnica
                  </h4>
                  <button
                    onClick={() => navigate('/meus-nivelamentos')}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    Ver Detalhes <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {proximoNivelamentoAluno ? (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50/60 via-brand-50/40 to-amber-50/50 border border-brand-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-brand-900 uppercase flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Banca Agendada na Escola
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-brand-600 text-white">
                        Alvo: {proximoNivelamentoAluno.nivel_alvo} ({proximoNivelamentoAluno.papel})
                      </span>
                    </div>

                    <div className="rounded-lg bg-white p-2.5 border border-slate-200/70 space-y-1 text-xs">
                      <p className="flex items-center gap-2 text-slate-800">
                        <Calendar className="h-3.5 w-3.5 text-brand-600" />
                        <span>Data: <strong>{proximoNivelamentoAluno.data_agendada}</strong></span>
                      </p>
                      <p className="flex items-center gap-2 text-slate-600 text-[11px]">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span>Banca: {proximoNivelamentoAluno.avaliador_aulao} & {proximoNivelamentoAluno.avaliador_danca}</span>
                      </p>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Sua banca foi marcada na agenda oficial da escola. Acesse os detalhes para conferir os critérios do Aulão e Dança a dois.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-900 uppercase">
                        Nível Atual: {alunoLogado.nivel_atual} ({alunoLogado.papel})
                      </span>
                      <span className="text-xs text-purple-700 font-semibold">
                        Desde {alunoLogado.data_inicio_nivel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Seu próximo nível será{' '}
                      <strong>
                        {alunoLogado.nivel_atual === 'B1'
                          ? 'B2 (Básico 2)'
                          : alunoLogado.nivel_atual === 'B2'
                          ? 'I1 (Intermediário 1)'
                          : 'I2'}
                      </strong>
                      . O agendamento da sua banca de avaliação técnica é realizado diretamente pelos seus professores ou pela secretaria da escola.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                {proximoNivelamentoAluno ? (
                  <button
                    onClick={() => navigate('/meus-nivelamentos')}
                    className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors shadow-md shadow-brand-500/20"
                  >
                    Ver Ficha e Instruções do Nivelamento
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/meus-nivelamentos')}
                    className="w-full py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-purple-200"
                  >
                    <Award className="h-4 w-4" />
                    <span>Ver Critérios & Histórico de Nivelamento</span>
                  </button>
                )}
              </div>
            </div>

            {/* Eventos & Bailes Convidados */}
            <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <PartyPopper className="h-4 w-4 text-amber-500" />
                    Eventos & Bailes Convidados
                  </h4>
                  <button
                    onClick={() => navigate('/eventos')}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    Ver Todos <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {eventos.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">Nenhum evento agendado no momento.</p>
                  ) : (
                    eventos.slice(0, 2).map((evento) => (
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
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => navigate('/eventos')}
                  className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors"
                >
                  Explorar Eventos & Inscrições
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Atalho: Registrar Presença Rápida */}
      <RegistrarPresencaModal
        isOpen={isRegistrarModalOpen}
        onClose={() => setIsRegistrarModalOpen(false)}
      />
    </div>
  );
};
