import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  Award,
  DollarSign,
  ArrowRight,
  X,
  Check
} from 'lucide-react';
import { Aluno, NivelForro, PapelDanca } from '../types';

export const AlunosPage: React.FC = () => {
  const { alunos, addAluno, setSelectedAlunoModal, usuariosList } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterNivel, setFilterNivel] = useState<string>('todos');
  const [filterPapel, setFilterPapel] = useState<string>('todos');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // New Student Form State
  const [newStudent, setNewStudent] = useState<Omit<Aluno, 'id'>>({
    nome: '',
    telefone: '',
    email: '',
    nivel_atual: 'B1',
    papel: 'Condutor',
    mensalidade_valor: 190.0,
    dia_vencimento: 5,
    data_matricula: '2026-09-29',
    data_inicio_nivel: '2026-09-29',
    status: 'ativo',
    observacoes: ''
  });

  const candidatosAluno = usuariosList.filter(
    (u) =>
      u.role === 'aluno' ||
      u.tipo_usuario === 'Aluno' ||
      (u.cargo_pretendido && /alun/i.test(u.cargo_pretendido)) ||
      (!u.is_master && u.role !== 'master' && u.role !== 'admin' && u.role !== 'professor')
  );

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    const u = usuariosList.find((usr) => usr.id === userId);
    if (u) {
      setNewStudent({
        ...newStudent,
        user_id: u.id,
        nome: u.nome,
        email: u.email,
        telefone: u.telefone || newStudent.telefone
      });
    }
  };

  const filteredAlunos = alunos.filter((aluno) => {
    if (filterNivel !== 'todos' && aluno.nivel_atual !== filterNivel) return false;
    if (filterPapel !== 'todos' && aluno.papel !== filterPapel) return false;
    if (!searchTerm.trim()) return true;

    const q = searchTerm.toLowerCase();
    return (
      aluno.nome.toLowerCase().includes(q) ||
      aluno.telefone.includes(q) ||
      aluno.email.toLowerCase().includes(q)
    );
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAluno(newStudent);
    setIsNewModalOpen(false);
    setSelectedUserId('');
    setNewStudent({
      nome: '',
      telefone: '',
      email: '',
      nivel_atual: 'B1',
      papel: 'Condutor',
      mensalidade_valor: 190.0,
      dia_vencimento: 5,
      data_matricula: '2026-09-29',
      data_inicio_nivel: '2026-09-29',
      status: 'ativo',
      observacoes: ''
    });
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
            <Users className="h-6 w-6 text-brand-600" />
            Gestão de Alunos
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Matrículas, níveis técnicos, valores de mensalidade e histórico individual.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 text-xs shadow-md shadow-brand-500/20 transition-all self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4" />
          <span>+ Matricular Novo Aluno</span>
        </button>
      </div>

      {/* Metrics by Level */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-2xl bg-white p-3.5 border border-slate-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Alunos
          </span>
          <p className="text-xl font-black text-slate-900 mt-1">{alunos.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-3.5 border border-slate-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
            Nível B1
          </span>
          <p className="text-xl font-black text-amber-700 mt-1">
            {alunos.filter((a) => a.nivel_atual === 'B1').length}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-3.5 border border-slate-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
            Nível B2
          </span>
          <p className="text-xl font-black text-blue-700 mt-1">
            {alunos.filter((a) => a.nivel_atual === 'B2').length}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-3.5 border border-slate-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
            Nível I1
          </span>
          <p className="text-xl font-black text-purple-700 mt-1">
            {alunos.filter((a) => a.nivel_atual === 'I1').length}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-3.5 border border-slate-100 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
            Nível I2
          </span>
          <p className="text-xl font-black text-emerald-700 mt-1">
            {alunos.filter((a) => a.nivel_atual === 'I2').length}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por nome, telefone ou email..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-brand-500 focus:bg-white transition-all"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterNivel}
            onChange={(e) => setFilterNivel(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-brand-500"
          >
            <option value="todos">Todos os Níveis</option>
            <option value="B1">Básico 1 (B1)</option>
            <option value="B2">Básico 2 (B2)</option>
            <option value="I1">Intermediário 1 (I1)</option>
            <option value="I2">Intermediário 2 (I2)</option>
          </select>

          <select
            value={filterPapel}
            onChange={(e) => setFilterPapel(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-brand-500"
          >
            <option value="todos">Todos os Papéis</option>
            <option value="Condutor">Condutores</option>
            <option value="Conduzido">Conduzidos</option>
            <option value="Ambos">Ambos</option>
          </select>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAlunos.length === 0 ? (
          <div className="col-span-full rounded-2xl bg-white p-12 text-center text-slate-400 border border-slate-100">
            Nenhum aluno encontrado com os filtros selecionados.
          </div>
        ) : (
          filteredAlunos.map((aluno) => (
            <div
              key={aluno.id}
              onClick={() => setSelectedAlunoModal(aluno)}
              className="group cursor-pointer rounded-2xl bg-white p-5 border border-slate-200 shadow-sm hover:border-brand-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        aluno.foto_url ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                      }
                      alt={aluno.nome}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-brand-500 transition-all"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition-colors">
                        {aluno.nome}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-slate-400">{aluno.papel}</span>
                        {Boolean(aluno.user_id || usuariosList.some((u) => u.email.toLowerCase() === aluno.email.toLowerCase())) && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                            Conta Vinculada
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black border ${getNivelBadge(
                      aluno.nivel_atual
                    )}`}
                  >
                    {aluno.nivel_atual}
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-500 pt-3 border-t border-slate-100">
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{aluno.telefone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate">{aluno.email}</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Mensalidade</span>
                  <span className="font-bold text-slate-900">
                    R$ {aluno.mensalidade_valor.toFixed(2)}{' '}
                    <span className="text-[10px] font-normal text-slate-400">
                      (Venc. {aluno.dia_vencimento})
                    </span>
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 font-semibold text-brand-600 group-hover:translate-x-0.5 transition-transform">
                  Ver Ficha <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Novo Aluno (Requirement: Matrícula com nível, mensalidade e vencimento) */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Nova Matrícula de Aluno
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cadastre os dados pessoais, nível inicial e condições de mensalidade.
                </p>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Seleção de Usuário Cadastrado */}
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5">
                <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Vincular a Usuário já Cadastrado (Aluno)</span>
                  <span className="text-[10px] font-semibold text-amber-600">Preenchimento automático</span>
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => handleSelectUser(e.target.value)}
                  className="w-full rounded-lg border border-amber-300 bg-white p-2 text-xs font-medium text-slate-800 outline-none focus:border-brand-500"
                >
                  <option value="">-- Selecionar usuário cadastrado (ou preencher manual abaixo) --</option>
                  {candidatosAluno.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nome} ({u.email}) — Papel: {u.cargo_pretendido || u.role} [{u.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudent.nome}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, nome: e.target.value })
                    }
                    placeholder="Ex.: Mariana Silva"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Telefone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudent.telefone}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, telefone: e.target.value })
                    }
                    placeholder="(11) 98765-4321"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={newStudent.email}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, email: e.target.value })
                    }
                    placeholder="aluno@email.com"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nível Inicial
                  </label>
                  <select
                    value={newStudent.nivel_atual}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        nivel_atual: e.target.value as NivelForro
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-brand-500 bg-white"
                  >
                    <option value="B1">B1 — Básico 1 (Iniciante)</option>
                    <option value="B2">B2 — Básico 2</option>
                    <option value="I1">I1 — Intermediário 1</option>
                    <option value="I2">I2 — Intermediário 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Papel na Dança
                  </label>
                  <select
                    value={newStudent.papel}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        papel: e.target.value as PapelDanca
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-brand-500 bg-white"
                  >
                    <option value="Condutor">Condutor</option>
                    <option value="Conduzido">Conduzido</option>
                    <option value="Ambos">Ambos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Valor da Mensalidade (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newStudent.mensalidade_valor}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        mensalidade_valor: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Dia de Vencimento
                  </label>
                  <select
                    value={newStudent.dia_vencimento}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        dia_vencimento: parseInt(e.target.value, 10)
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-brand-500 bg-white"
                  >
                    <option value={5}>Dia 5</option>
                    <option value={10}>Dia 10</option>
                    <option value={15}>Dia 15</option>
                    <option value={20}>Dia 20</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Data da Matrícula
                  </label>
                  <input
                    type="date"
                    value={newStudent.data_matricula}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        data_matricula: e.target.value,
                        data_inicio_nivel: e.target.value
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-brand-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Observações Iniciais
                </label>
                <textarea
                  rows={2}
                  value={newStudent.observacoes || ''}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, observacoes: e.target.value })
                  }
                  placeholder="Preferências, experiências anteriores de dança..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
                >
                  <Check className="h-4 w-4" />
                  Concluir Matrícula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
