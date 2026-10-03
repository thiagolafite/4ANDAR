import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  CheckSquare,
  Download,
  Calendar,
  Filter,
  Check,
  X,
  Clock,
  UserCheck,
  Users,
  Search,
  Plus,
  FileSpreadsheet
} from 'lucide-react';
import { Presenca, StatusPresenca } from '../types';
import { UserAvatar } from '../components/common/UserAvatar';
import { RegistrarPresencaModal } from '../components/modals/RegistrarPresencaModal';

export const PresencaPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const {
    currentUser,
    alunos,
    alunosCadastrados,
    aulas,
    presencas,
    confirmarPresenca,
    marcarAusente,
    solicitarPresenca,
    showToast
  } = useApp();

  const [selectedAulaId, setSelectedAulaId] = useState<string>(aulas[0]?.id || '');
  const [selectedData, setSelectedData] = useState<string>('2026-09-29');
  const [alunoManualId, setAlunoManualId] = useState<string>('');
  const [isRegistrarModalOpen, setIsRegistrarModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('registrar') === 'true' || searchParams.get('registrar') === '1') {
      setIsRegistrarModalOpen(true);
    }
  }, [searchParams]);

  const canRegisterPresenca =
    Boolean(currentUser?.is_master) ||
    currentUser?.role === 'master' ||
    currentUser?.role === 'admin' ||
    currentUser?.role === 'secretaria' ||
    currentUser?.role === 'professor' ||
    currentUser?.tipo_usuario === 'AdminMaster' ||
    currentUser?.tipo_usuario === 'Secretaria' ||
    currentUser?.tipo_usuario === 'Equipe';

  const selectedAula = aulas.find((a) => a.id === selectedAulaId);

  // Filter attendances for selected class and date
  const filteredPresencas = presencas.filter(
    (p) => p.aula_id === selectedAulaId && p.data_aula === selectedData
  );

  const confirmados = filteredPresencas.filter((p) => p.status === 'confirmada');
  const pendentes = filteredPresencas.filter((p) => p.status === 'pendente');
  const ausentes = filteredPresencas.filter((p) => p.status === 'ausente');

  // Count condutores and conduzidos among confirmados
  const condutoresConfirmados = confirmados.filter((p) => {
    const a =
      alunosCadastrados.find((al) => al.id === p.aluno_id || al.aluno_id === p.aluno_id || al.user_id === p.aluno_id) ||
      alunos.find((al) => al.id === p.aluno_id);
    return a?.papel === 'Condutor' || a?.papel === 'Ambos';
  }).length;

  const conduzidosConfirmados = confirmados.filter((p) => {
    const a =
      alunosCadastrados.find((al) => al.id === p.aluno_id || al.aluno_id === p.aluno_id || al.user_id === p.aluno_id) ||
      alunos.find((al) => al.id === p.aluno_id);
    return a?.papel === 'Conduzido' || a?.papel === 'Ambos';
  }).length;

  // Requirement: Download da lista de presença em CSV (alunos confirmados da turma/dia)
  const handleDownloadCSV = () => {
    if (confirmados.length === 0) {
      showToast('Nenhum aluno confirmado para exportar nesta turma/data.', 'error');
      return;
    }

    const headers = ['Nome', 'Telefone', 'Email', 'Nivel', 'Papel', 'Status', 'Data_Aula', 'Confirmado_Por'];
    const rows = confirmados.map((p) => {
      const a =
        alunosCadastrados.find((al) => al.id === p.aluno_id || al.aluno_id === p.aluno_id || al.user_id === p.aluno_id) ||
        alunos.find((al) => al.id === p.aluno_id);
      return [
        `"${a?.nome || 'N/A'}"`,
        `"${a?.telefone || 'N/A'}"`,
        `"${a?.email || 'N/A'}"`,
        `"${a?.nivel_atual || 'N/A'}"`,
        `"${a?.papel || 'N/A'}"`,
        `"${p.status}"`,
        `"${p.data_aula}"`,
        `"${p.confirmado_por || 'Sistema'}"`
      ].join(';');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `lista_presenca_${selectedAula?.nome.replace(/\s+/g, '_')}_${selectedData}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Arquivo CSV da lista baixado com sucesso (${confirmados.length} confirmados)!`);
  };

  const handleAddAlunoManual = () => {
    if (!alunoManualId) return;
    solicitarPresenca(alunoManualId, selectedAulaId, selectedData);
    setAlunoManualId('');
  };

  return (
    <div className="space-y-6">
      {/* Page Title & CSV Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <CheckSquare className="h-6 w-6 text-brand-600" />
            Controle de Presença & Chamada
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Confirme solicitações de alunos, monitore o balanço de condutores/conduzidos e exporte a lista.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 text-xs font-bold transition-all shadow-xs"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Baixar Lista em CSV ({confirmados.length})</span>
          </button>

          {canRegisterPresenca && (
            <button
              onClick={() => setIsRegistrarModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
            >
              <UserCheck className="h-4 w-4" />
              <span>Registrar Presença</span>
            </button>
          )}
        </div>
      </div>

      {/* Selectors: Turma + Data */}
      <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Selecione a Turma
          </label>
          <select
            value={selectedAulaId}
            onChange={(e) => setSelectedAulaId(e.target.value)}
            className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-medium text-slate-800 outline-none focus:border-brand-500 bg-white"
          >
            {aulas.map((aula) => (
              <option key={aula.id} value={aula.id}>
                [{aula.nivel}] {aula.nome} — {aula.dia_semana} ({aula.horario_inicio})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Data da Aula
          </label>
          <input
            type="date"
            value={selectedData}
            onChange={(e) => setSelectedData(e.target.value)}
            className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-medium text-slate-800 outline-none focus:border-brand-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Adicionar Aluno na Chamada
          </label>
          <div className="flex gap-2">
            <select
              value={alunoManualId}
              onChange={(e) => setAlunoManualId(e.target.value)}
              className="flex-1 rounded-xl border border-slate-300 p-2.5 text-sm font-medium text-slate-800 outline-none focus:border-brand-500 bg-white"
            >
              <option value="">Selecione o aluno cadastrado...</option>
              {alunosCadastrados.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome} (Nível {a.nivel_atual} - {a.papel})
                </option>
              ))}
            </select>
            <button
              onClick={handleAddAlunoManual}
              disabled={!alunoManualId}
              className="px-3 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Class Overview Cards & Balance Indicator */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Confirmados
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {confirmados.length}
          </p>
          <p className="text-[11px] text-slate-400">
            de {selectedAula?.capacidade_maxima || 24} vagas
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Pendentes
          </span>
          <p className="text-2xl font-black text-amber-500 mt-1">
            {pendentes.length}
          </p>
          <p className="text-[11px] text-slate-400">
            aguardando aprovação
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Condutores
          </span>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {condutoresConfirmados}
          </p>
          <p className="text-[11px] text-slate-400">
            confirmados
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Conduzidos
          </span>
          <p className="text-2xl font-black text-purple-600 mt-1">
            {conduzidosConfirmados}
          </p>
          <p className="text-[11px] text-slate-400">
            {Math.abs(condutoresConfirmados - conduzidosConfirmados) === 0
              ? '✨ Par perfeito!'
              : `Diferença: ${Math.abs(condutoresConfirmados - conduzidosConfirmados)}`}
          </p>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Users className="h-4 w-4 text-brand-600" />
            Alunos Solicitados / Presentes ({filteredPresencas.length})
          </h3>
          <span className="text-xs font-medium text-slate-500">
            {selectedAula?.sala} • {selectedAula?.horario_inicio} às {selectedAula?.horario_fim}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="p-4">Aluno</th>
                <th className="p-4">Nível / Papel</th>
                <th className="p-4">Telefone</th>
                <th className="p-4">Status da Presença</th>
                <th className="p-4 text-right">Ações da Equipe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPresencas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    <UserCheck className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-600">
                      Nenhuma presença registrada para esta aula nesta data.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Alunos podem solicitar presença pelo app ou você pode adicioná-los acima.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPresencas.map((pres) => {
                  const aluno =
                    alunosCadastrados.find((a) => a.id === pres.aluno_id || a.aluno_id === pres.aluno_id || a.user_id === pres.aluno_id) ||
                    alunos.find((a) => a.id === pres.aluno_id);
                  if (!aluno) return null;

                  return (
                    <tr key={pres.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={aluno.nome}
                            fotoUrl={aluno.foto_url}
                            size="md"
                            className="ring-2 ring-slate-100"
                          />
                          <div>
                            <p className="font-bold text-sm text-slate-900">
                              {aluno.nome}
                            </p>
                            <p className="text-xs text-slate-400">
                              Solicitado: {pres.data_solicitacao}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded font-black text-xs bg-slate-100 text-slate-700">
                            {aluno.nivel_atual}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {aluno.papel}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 text-xs text-slate-600">
                        {aluno.telefone}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            pres.status === 'confirmada'
                              ? 'bg-emerald-100 text-emerald-800'
                              : pres.status === 'pendente'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              pres.status === 'confirmada'
                                ? 'bg-emerald-500'
                                : pres.status === 'pendente'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          />
                          {pres.status === 'confirmada'
                            ? 'Confirmada'
                            : pres.status === 'pendente'
                            ? 'Pendente'
                            : 'Ausente'}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {pres.status !== 'confirmada' && (
                            <button
                              onClick={() => confirmarPresenca(pres.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1"
                              title="Confirmar Presença"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Confirmar
                            </button>
                          )}

                          {pres.status !== 'ausente' && (
                            <button
                              onClick={() => marcarAusente(pres.id)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                              title="Marcar Falta / Ausente"
                            >
                              <X className="h-3.5 w-3.5" />
                              Falta
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Registro de Presença com Busca Instantânea */}
      <RegistrarPresencaModal
        isOpen={isRegistrarModalOpen}
        onClose={() => setIsRegistrarModalOpen(false)}
        defaultAulaId={selectedAulaId}
        defaultData={selectedData}
      />
    </div>
  );
};
