import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Plus,
  Clock,
  MapPin,
  User,
  Users,
  X,
  Check,
  Edit2,
  Trash2
} from 'lucide-react';
import { Aula, NivelForro } from '../types';

export const AulasPage: React.FC = () => {
  const { aulas, equipe, alunos, professoresCadastrados, addAula, updateAula, deleteAula, currentUser, minhasTurmas } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAula, setEditingAula] = useState<Aula | null>(null);
  const [filterMinhasTurmas, setFilterMinhasTurmas] = useState(false);

  const defaultProf = professoresCadastrados[0];

  const [formData, setFormData] = useState<Omit<Aula, 'id'>>({
    nome: '',
    nivel: 'B1',
    turno: 'Noite',
    dia_semana: 'Segunda',
    horario_inicio: '19:30',
    horario_fim: '20:45',
    sala: 'Salão Principal (Gonzagão)',
    equipe_id: defaultProf?.id || equipe[0]?.id || '',
    user_id: defaultProf?.user_id || '',
    professor_nome: defaultProf?.nome || '',
    capacidade_maxima: 24
  });

  const isMinhaTurma = (aula: Aula) => {
    if (!currentUser) return false;
    if (aula.user_id && aula.user_id === currentUser.id) return true;
    if (aula.equipe_id && (aula.equipe_id === currentUser.id || aula.equipe_id === currentUser.equipe_id)) return true;
    if (aula.professor_nome && currentUser.nome && (
      aula.professor_nome.toLowerCase().includes(currentUser.nome.toLowerCase()) ||
      currentUser.nome.toLowerCase().includes(aula.professor_nome.toLowerCase())
    )) return true;
    return minhasTurmas.some((m) => m.id === aula.id);
  };

  const handleOpenCreate = () => {
    setEditingAula(null);
    setFormData({
      nome: '',
      nivel: 'B1',
      turno: 'Noite',
      dia_semana: 'Segunda',
      horario_inicio: '19:30',
      horario_fim: '20:45',
      sala: 'Salão Principal (Gonzagão)',
      equipe_id: defaultProf?.id || equipe[0]?.id || '',
      user_id: defaultProf?.user_id || '',
      professor_nome: defaultProf?.nome || '',
      capacidade_maxima: 24
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (aula: Aula) => {
    setEditingAula(aula);
    setFormData({
      nome: aula.nome,
      nivel: aula.nivel,
      turno: aula.turno,
      dia_semana: aula.dia_semana,
      horario_inicio: aula.horario_inicio,
      horario_fim: aula.horario_fim,
      sala: aula.sala,
      equipe_id: aula.equipe_id,
      user_id: aula.user_id || '',
      professor_nome: aula.professor_nome || '',
      capacidade_maxima: aula.capacidade_maxima
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProf = professoresCadastrados.find(
      (p) => p.id === formData.equipe_id || p.user_id === formData.equipe_id || p.equipe_id === formData.equipe_id
    );

    const payload = {
      ...formData,
      equipe_id: selectedProf?.id || formData.equipe_id,
      user_id: selectedProf?.user_id || formData.user_id || undefined,
      professor_nome: selectedProf?.nome || formData.professor_nome || undefined
    };

    if (editingAula) {
      updateAula(editingAula.id, payload);
    } else {
      addAula(payload);
    }
    setIsModalOpen(false);
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

  const displayedAulas = filterMinhasTurmas ? aulas.filter(isMinhaTurma) : aulas;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookOpen className="h-6 w-6 text-brand-600" />
            Turmas & Horários
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Cadastro de turmas por nível (B1, B2, I1, I2) e turno, vinculadas a professores responsáveis.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 text-xs shadow-md shadow-brand-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>+ Cadastrar Nova Turma</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setFilterMinhasTurmas(false)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            !filterMinhasTurmas
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Todas as Turmas ({aulas.length})
        </button>
        <button
          onClick={() => setFilterMinhasTurmas(true)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            filterMinhasTurmas
              ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-400'
              : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
          }`}
        >
          <span>⭐ Minhas Turmas ({minhasTurmas.length})</span>
        </button>
      </div>

      {/* Grid of Classes */}
      {displayedAulas.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700">Nenhuma turma encontrada</h4>
          <p className="text-xs text-slate-400 mt-1">
            {filterMinhasTurmas
              ? 'Você ainda não está associado como professor responsável em nenhuma turma.'
              : 'Nenhuma turma cadastrada no sistema.'}
          </p>
          {filterMinhasTurmas && (
            <button
              onClick={() => setFilterMinhasTurmas(false)}
              className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              Ver todas as turmas
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedAulas.map((aula) => {
            const professor =
              professoresCadastrados.find((p) => p.id === aula.equipe_id || p.equipe_id === aula.equipe_id || p.user_id === aula.equipe_id) ||
              equipe.find((e) => e.id === aula.equipe_id);
            const alunosMatriculadosNivel = alunos.filter(
              (a) => a.nivel_atual === aula.nivel && a.status === 'ativo'
            ).length;
            const ehMinha = isMinhaTurma(aula);
            const profNome = aula.professor_nome || professor?.nome || 'A definir';

            return (
              <div
                key={aula.id}
                className={`rounded-2xl bg-white border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                  ehMinha ? 'border-amber-300 ring-2 ring-amber-200/60 bg-amber-50/10' : 'border-slate-200 hover:border-brand-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[11px] font-black border ${getNivelBadge(
                          aula.nivel
                        )}`}
                      >
                        Nivel {aula.nivel}
                      </span>
                      {ehMinha && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 shadow-xs">
                          ⭐ Sua Turma
                        </span>
                      )}
                    </div>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                      {aula.turno}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mt-2.5">
                    {aula.nome}
                  </h3>

                  <div className="mt-4 space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                    <p className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-brand-600" />
                      <span>
                        Professor:{' '}
                        <strong className={ehMinha ? 'text-amber-900 font-bold' : ''}>
                          {profNome}
                        </strong>
                        {ehMinha && <span className="ml-1 text-[10px] text-amber-700 font-bold">(Você)</span>}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{aula.dia_semana} • {aula.horario_inicio} às {aula.horario_fim}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{aula.sala}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span>
                        Capacidade: <strong>{aula.capacidade_maxima} alunos</strong> (~{alunosMatriculadosNivel} no nível)
                      </span>
                    </p>
                  </div>
                </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    if (confirm(`Deseja realmente excluir a turma "${aula.nome}" e todas as aulas do cronograma associadas a ela?`)) {
                      deleteAula(aula.id);
                    }
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Excluir Turma</span>
                </button>

                <button
                  onClick={() => handleOpenEdit(aula)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600 transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Editar Turma
                </button>
              </div>
            </div>
          );
        })}
      </div>
    )}

      {/* Modal Criar / Editar Turma */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingAula ? 'Editar Turma' : 'Cadastrar Nova Turma'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nome da Turma
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex.: Básico 1 — Terça & Quinta"
                  className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nível
                  </label>
                  <select
                    value={formData.nivel}
                    onChange={(e) =>
                      setFormData({ ...formData, nivel: e.target.value as NivelForro })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2 text-sm bg-white outline-none focus:border-brand-500"
                  >
                    <option value="B1">B1 — Básico 1</option>
                    <option value="B2">B2 — Básico 2</option>
                    <option value="I1">I1 — Intermediário 1</option>
                    <option value="I2">I2 — Intermediário 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Turno
                  </label>
                  <select
                    value={formData.turno}
                    onChange={(e) =>
                      setFormData({ ...formData, turno: e.target.value as any })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2 text-sm bg-white outline-none focus:border-brand-500"
                  >
                    <option value="Manhã">Manhã</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noite">Noite</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Dia Principal
                  </label>
                  <select
                    value={formData.dia_semana}
                    onChange={(e) =>
                      setFormData({ ...formData, dia_semana: e.target.value as any })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2 text-sm bg-white outline-none focus:border-brand-500"
                  >
                    <option value="Segunda">Segunda</option>
                    <option value="Terça">Terça</option>
                    <option value="Quarta">Quarta</option>
                    <option value="Quinta">Quinta</option>
                    <option value="Sexta">Sexta</option>
                    <option value="Sábado">Sábado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Professor Responsável
                  </label>
                  <select
                    value={formData.equipe_id}
                    onChange={(e) => {
                      const selId = e.target.value;
                      const prof = professoresCadastrados.find((p) => p.id === selId || p.user_id === selId || p.equipe_id === selId);
                      setFormData({
                        ...formData,
                        equipe_id: prof?.id || selId,
                        user_id: prof?.user_id || '',
                        professor_nome: prof?.nome || ''
                      });
                    }}
                    className="w-full rounded-xl border border-slate-300 p-2 text-sm bg-white outline-none focus:border-brand-500"
                  >
                    <option value="">Selecione um professor...</option>
                    {professoresCadastrados.map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.nome} ({prof.papel}){prof.user_id ? ' • 👤 com login' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Horário de Início
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.horario_inicio}
                    onChange={(e) =>
                      setFormData({ ...formData, horario_inicio: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Horário de Fim
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.horario_fim}
                    onChange={(e) =>
                      setFormData({ ...formData, horario_fim: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Sala / Espaço
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sala}
                    onChange={(e) => setFormData({ ...formData, sala: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Capacidade de Alunos
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.capacidade_maxima}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacidade_maxima: parseInt(e.target.value, 10) || 20
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
                >
                  Salvar Turma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
