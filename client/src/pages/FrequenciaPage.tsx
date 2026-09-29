import React from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckSquare,
  Award,
  Calendar,
  TrendingUp,
  UserCheck,
  Clock,
  Sparkles
} from 'lucide-react';

export const FrequenciaPage: React.FC = () => {
  const { currentUser, alunos, aulas, presencas } = useApp();
  const isEquipe = currentUser.tipo_usuario === 'Equipe';

  const alunoLogado = !isEquipe
    ? alunos.find((a) => a.id === currentUser.aluno_id || a.email === currentUser.email) || alunos[0]
    : null;

  // Student specific stats
  const presencasDoAluno = alunoLogado
    ? presencas.filter((p) => p.aluno_id === alunoLogado.id)
    : [];

  const totalConfirmadas = presencasDoAluno.filter((p) => p.status === 'confirmada').length;
  const taxaFrequencia = presencasDoAluno.length > 0
    ? Math.round((totalConfirmadas / presencasDoAluno.length) * 100)
    : 100;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <CheckSquare className="h-6 w-6 text-brand-600" />
          Frequência & Assiduidade
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Acompanhamento de presença e engajamento nas aulas de forró.
        </p>
      </div>

      {/* Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Taxa de Presença
          </span>
          <p className="text-3xl font-black text-brand-600 mt-2">
            {taxaFrequencia}%
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Média ideal para nivelamento: &gt;80%
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Aulas Confirmadas
          </span>
          <p className="text-3xl font-black text-emerald-600 mt-2">
            {isEquipe ? presencas.filter((p) => p.status === 'confirmada').length : totalConfirmadas}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Presenças validadas
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Aulas Registradas
          </span>
          <p className="text-3xl font-black text-slate-900 mt-2">
            {isEquipe ? presencas.length : presencasDoAluno.length}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Total de chamadas
          </p>
        </div>
      </div>

      {/* List of recent attendances */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="font-bold text-sm text-slate-900">
            Histórico Detalhado de Aulas
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {(isEquipe ? presencas : presencasDoAluno).map((pres) => {
            const aluno = alunos.find((a) => a.id === pres.aluno_id);
            const aula = aulas.find((a) => a.id === pres.aula_id);

            return (
              <div
                key={pres.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div>
                  <p className="font-bold text-sm text-slate-900">
                    {aula?.nome || 'Aula de Forró'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Data: {pres.data_presenca} • Aluno: <strong>{aluno?.nome}</strong> ({aluno?.nivel_atual})
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
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
                    : 'Falta'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
