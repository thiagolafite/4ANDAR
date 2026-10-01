import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export const ProximaAulaPage: React.FC = () => {
  const {
    currentUser,
    alunos,
    alunosCadastrados,
    aulas,
    cronogramas,
    presencas,
    equipe,
    professoresCadastrados,
    solicitarPresenca
  } = useApp();

  const alunoLogado: any =
    alunosCadastrados.find((a) => a.id === currentUser.aluno_id || a.email === currentUser.email || a.user_id === currentUser.id) ||
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
    };

  // Classes matching student's level
  const turmasNivel = aulas.filter((a) => a.nivel === alunoLogado.nivel_atual);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Sparkles className="h-6 w-6 text-brand-600" />
          Minhas Próximas Aulas & Presença
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Confira o cronograma da sua turma e solicite sua presença com antecedência para organização dos pares.
        </p>
      </div>

      {/* Student Status Header */}
      <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={
              alunoLogado.foto_url ||
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120'
            }
            alt={alunoLogado.nome}
            className="h-14 w-14 rounded-full object-cover ring-4 ring-white/30"
          />
          <div>
            <h3 className="text-lg font-bold">{alunoLogado.nome}</h3>
            <p className="text-xs text-orange-100 flex items-center gap-2 mt-0.5">
              <span>Nível Atual: <strong>{alunoLogado.nivel_atual}</strong></span>
              <span>•</span>
              <span>Papel: <strong>{alunoLogado.papel}</strong></span>
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white/20 backdrop-blur-md px-4 py-2.5 text-xs text-right">
          <span className="text-orange-100">Frequência Escolar:</span>
          <p className="font-bold text-white text-sm">{alunoLogado.frequencia_percentual}% de Presença</p>
        </div>
      </div>

      {/* Available Classes List */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-slate-700 uppercase tracking-wider">
          Aulas do seu nível ({alunoLogado.nivel_atual})
        </h3>

        {turmasNivel.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-slate-500 border border-slate-100">
            Nenhuma turma encontrada para o seu nível no momento.
          </div>
        ) : (
          turmasNivel.map((turma) => {
            const professor =
              professoresCadastrados.find((p) => p.id === turma.equipe_id || p.equipe_id === turma.equipe_id || p.user_id === turma.equipe_id) ||
              equipe.find((e) => e.id === turma.equipe_id);
            // Find upcoming scheduled cronograma for this class
            const crono = cronogramas.find((c) => c.aula_id === turma.id);
            const dataAula = crono?.data_aula || '2026-09-29';

            const presencaExistente = presencas.find(
              (p) =>
                p.aluno_id === alunoLogado.id &&
                p.aula_id === turma.id &&
                p.data_aula === dataAula
            );

            return (
              <div
                key={turma.id}
                className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm hover:border-orange-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="rounded-md bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5">
                      Nível {turma.nivel}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {turma.turno} • {turma.dia_semana}
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-slate-900">
                    {turma.nome}
                  </h4>

                  {/* Planned Theme */}
                  <div className="rounded-xl bg-orange-50/70 p-3 border border-orange-100 text-xs">
                    <span className="font-bold text-brand-800 block mb-0.5">
                      Tema Planejado para a Aula:
                    </span>
                    <p className="text-slate-700 font-medium">
                      {crono?.tema_aula || 'Fundamentos e técnica do forró'}
                    </p>
                    {crono?.observacoes && (
                      <p className="text-[11px] text-slate-500 mt-1 italic">
                        Nota: {crono.observacoes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {turma.horario_inicio} às {turma.horario_fim}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {turma.sala}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                      Prof.: {professor?.nome || 'Equipe 4ANDAR'}
                    </span>
                  </div>
                </div>

                {/* Presence Action Button */}
                <div className="shrink-0 flex flex-col items-start md:items-end justify-center gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {presencaExistente ? (
                    <div className="flex flex-col items-start md:items-end gap-1">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold ${
                          presencaExistente.status === 'confirmada'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {presencaExistente.status === 'confirmada'
                          ? 'Presença Confirmada!'
                          : 'Solicitação Enviada (Pendente)'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {presencaExistente.status === 'confirmada'
                          ? 'Vaga garantida na aula.'
                          : 'Aguardando validação da equipe.'}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        solicitarPresenca(alunoLogado.id, turma.id, dataAula)
                      }
                      className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold px-5 py-2.5 text-xs shadow-md shadow-brand-500/20 transition-all"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Solicitar Presença nesta Aula
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
