import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CalendarDays,
  Edit3,
  Check,
  X,
  Filter,
  User,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { NivelForro } from '../types';

export const CronogramaPage: React.FC = () => {
  const {
    currentUser,
    aulas,
    cronogramas,
    equipe,
    updateTemaCronograma
  } = useApp();

  const isEquipe = currentUser.tipo_usuario === 'Equipe';

  // Filters
  const [selectedNivel, setSelectedNivel] = useState<string>('todos');
  const [selectedTurno, setSelectedTurno] = useState<string>('todos');

  // Edit modal / cell state
  const [editingCell, setEditingCell] = useState<{
    aulaId: string;
    dataAula: string;
    turmaNome: string;
    temaAtual: string;
    obsAtual: string;
  } | null>(null);

  const [novoTema, setNovoTema] = useState('');
  const [novaObs, setNovaObs] = useState('');

  // Sample weekly dates (2026-09-28 to 2026-10-03)
  const diasSemana = [
    { dia: 'Segunda-feira', data: '2026-09-28', formatted: '28/09' },
    { dia: 'Terça-feira', data: '2026-09-29', formatted: '29/09' },
    { dia: 'Quarta-feira', data: '2026-09-30', formatted: '30/09' },
    { dia: 'Quinta-feira', data: '2026-10-01', formatted: '01/10' },
    { dia: 'Sexta-feira', data: '2026-10-02', formatted: '02/10' },
    { dia: 'Sábado', data: '2026-10-03', formatted: '03/10' }
  ];

  // Filter aulas
  const filteredAulas = aulas.filter((aula) => {
    if (selectedNivel !== 'todos' && aula.nivel !== selectedNivel) return false;
    if (selectedTurno !== 'todos' && aula.turno !== selectedTurno) return false;
    return true;
  });

  const handleOpenEdit = (aulaId: string, dataAula: string, turmaNome: string) => {
    if (!isEquipe) return;
    const crono = cronogramas.find(
      (c) => c.aula_id === aulaId && c.data_aula === dataAula
    );
    setEditingCell({
      aulaId,
      dataAula,
      turmaNome,
      temaAtual: crono?.tema_aula || '',
      obsAtual: crono?.observacoes || ''
    });
    setNovoTema(crono?.tema_aula || '');
    setNovaObs(crono?.observacoes || '');
  };

  const handleSaveTema = () => {
    if (!editingCell) return;
    updateTemaCronograma(
      editingCell.aulaId,
      editingCell.dataAula,
      novoTema,
      novaObs
    );
    setEditingCell(null);
  };

  const getNivelBadge = (nivel: NivelForro) => {
    switch (nivel) {
      case 'B1':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'B2':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'I1':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'I2':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarDays className="h-6 w-6 text-brand-600" />
            Cronograma & Planejamento Semanal
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Grade interativa Data × Turma com temas pedagógicos editáveis por célula.
          </p>
        </div>

        {/* Week navigation simulator */}
        <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
          <button className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-bold text-slate-700 px-2">
            Semana: 28/Set — 03/Out / 2026
          </span>
          <button className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            <span>Filtrar Nível:</span>
          </div>

          <div className="flex items-center gap-1.5">
            {['todos', 'B1', 'B2', 'I1', 'I2'].map((n) => (
              <button
                key={n}
                onClick={() => setSelectedNivel(n)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedNivel === n
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {n === 'todos' ? 'Todos os Níveis' : n}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <span>Turno:</span>
          </div>
          <select
            value={selectedTurno}
            onChange={(e) => setSelectedTurno(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-brand-500"
          >
            <option value="todos">Todos os turnos</option>
            <option value="Manhã">Manhã</option>
            <option value="Tarde">Tarde</option>
            <option value="Noite">Noite</option>
          </select>
        </div>
      </div>

      {/* Instruction Tip */}
      {isEquipe && (
        <div className="rounded-xl bg-orange-50 border border-orange-200/80 p-3 text-xs text-orange-900 flex items-center gap-2">
          <Info className="h-4 w-4 text-brand-600 shrink-0" />
          <span>
            <strong>Dica para a Equipe:</strong> Clique em qualquer tema na célula para editar o conteúdo planejado daquela aula.
          </span>
        </div>
      )}

      {/* Responsive Weekly Matrix Table (Overflow-x-auto as per requirements) */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="p-4 font-bold text-slate-700 text-xs uppercase tracking-wider min-w-[220px]">
                  Turma & Professor
                </th>
                {diasSemana.map((d) => (
                  <th
                    key={d.data}
                    className="p-4 font-bold text-slate-700 text-xs uppercase tracking-wider min-w-[200px] border-l border-slate-100"
                  >
                    <div className="flex items-center justify-between">
                      <span>{d.dia}</span>
                      <span className="rounded bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                        {d.formatted}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAulas.map((aula) => {
                const professor = equipe.find((e) => e.id === aula.equipe_id);

                return (
                  <tr key={aula.id} className="hover:bg-slate-50/40 transition-colors">
                    {/* Turma Header Column */}
                    <td className="p-4 bg-slate-50/30">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black border ${getNivelBadge(
                            aula.nivel
                          )}`}
                        >
                          {aula.nivel}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">
                          {aula.nome}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 space-y-0.5 mt-1.5">
                        <p className="flex items-center gap-1">
                          <User className="h-3 w-3 text-slate-400" />
                          <span>Prof.: <strong>{professor?.nome || 'A definir'}</strong></span>
                        </p>
                        <p className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span>{aula.dia_semana} às {aula.horario_inicio} ({aula.turno})</span>
                        </p>
                        <p className="flex items-center gap-1 text-[11px] text-slate-400">
                          <MapPin className="h-3 w-3" />
                          <span>{aula.sala}</span>
                        </p>
                      </div>
                    </td>

                    {/* Cells per day */}
                    {diasSemana.map((d) => {
                      const isClassDay = aula.dia_semana.toLowerCase().includes(
                        d.dia.toLowerCase().split('-')[0]
                      );

                      const crono = cronogramas.find(
                        (c) => c.aula_id === aula.id && c.data_aula === d.data
                      );

                      if (!isClassDay && !crono) {
                        return (
                          <td
                            key={d.data}
                            className="p-4 border-l border-slate-100 bg-slate-50/10 text-center"
                          >
                            <span className="text-[11px] text-slate-300">—</span>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={d.data}
                          onClick={() => handleOpenEdit(aula.id, d.data, aula.nome)}
                          className={`p-3.5 border-l border-slate-100 align-top transition-colors ${
                            isEquipe ? 'cursor-pointer hover:bg-orange-50/50 group' : ''
                          }`}
                        >
                          <div className="rounded-xl border border-orange-200/60 bg-white p-3 shadow-xs h-full flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                                  Tema da Aula
                                </span>
                                {isEquipe && (
                                  <Edit3 className="h-3.5 w-3.5 text-slate-300 group-hover:text-brand-600 transition-colors" />
                                )}
                              </div>
                              <p className="text-xs font-semibold text-slate-800 leading-snug">
                                {crono?.tema_aula || 'Clique para definir o tema desta aula...'}
                              </p>
                            </div>

                            {crono?.observacoes && (
                              <p className="mt-2 text-[11px] text-slate-500 italic bg-slate-50 p-1.5 rounded">
                                {crono.observacoes}
                              </p>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Theme Modal */}
      {editingCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Editar Tema do Cronograma
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingCell.turmaNome} • Data: {editingCell.dataAula}
                </p>
              </div>
              <button
                onClick={() => setEditingCell(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tema da Aula
                </label>
                <textarea
                  rows={2}
                  value={novoTema}
                  onChange={(e) => setNovoTema(e.target.value)}
                  placeholder="Ex.: Giros combinados no tempo 1 com travessia de condução"
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Observações Pedagógicas (Opcional)
                </label>
                <input
                  type="text"
                  value={novaObs}
                  onChange={(e) => setNovaObs(e.target.value)}
                  placeholder="Ex.: Trazer foco no abraço e relaxamento dos ombros"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingCell(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveTema}
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
              >
                <Check className="h-4 w-4" />
                Salvar Tema
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
