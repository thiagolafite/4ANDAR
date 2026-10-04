import React, { useState, useMemo } from 'react';
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
  Check,
  Upload,
  CalendarClock,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  LayoutGrid,
  List,
  AlignJustify,
  RotateCcw
} from 'lucide-react';
import { Aluno, NivelForro, PapelDanca } from '../types';
import { UserAvatar } from '../components/common/UserAvatar';
import { ImportarAlunosModal } from '../components/modals/ImportarAlunosModal';

export const AlunosPage: React.FC = () => {
  const { alunos, addAluno, setSelectedAlunoModal, usuariosList, pagamentos } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterNivel, setFilterNivel] = useState<string>('todos');
  const [filterPapel, setFilterPapel] = useState<string>('todos');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [filterStatusFinanc, setFilterStatusFinanc] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<string>('nome_asc');
  const [viewMode, setViewMode] = useState<'grade' | 'lista' | 'compacto'>(() => {
    return (localStorage.getItem('4andar_alunos_view_mode') as any) || 'grade';
  });

  const handleSetViewMode = (mode: 'grade' | 'lista' | 'compacto') => {
    setViewMode(mode);
    localStorage.setItem('4andar_alunos_view_mode', mode);
  };

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
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

  // Combina a lista de alunos com usuários aprovados como aluno, garantindo que nenhum fique de fora
  const todosAlunos = React.useMemo(() => {
    const list = [...alunos];
    usuariosList.forEach((u) => {
      const isAlunoUser = (u.role === 'aluno' || /alun/i.test(u.cargo_pretendido || '')) && u.status === 'aprovado';
      if (isAlunoUser) {
        const jaEstaNaLista = list.some(
          (a) => (u.aluno_id && a.id === u.aluno_id) ||
                 (a.user_id && a.user_id === u.id) ||
                 (a.email && u.email && a.email.toLowerCase() === u.email.toLowerCase())
        );
        if (!jaEstaNaLista) {
          list.push({
            id: u.aluno_id || `al_${u.id}`,
            user_id: u.id,
            nome: u.nome,
            email: u.email,
            telefone: u.telefone || '',
            nivel_atual: 'B1',
            papel: 'Condutor',
            mensalidade_valor: 190.0,
            dia_vencimento: 5,
            data_matricula: u.data_cadastro ? u.data_cadastro.substring(0, 10) : '2026-09-30',
            data_inicio_nivel: u.data_cadastro ? u.data_cadastro.substring(0, 10) : '2026-09-30',
            status: 'ativo',
            foto_url: u.avatar_url
          });
        }
      }
    });
    return list;
  }, [alunos, usuariosList]);

  const filteredAndSortedAlunos = useMemo(() => {
    const cleanStr = (s?: string) =>
      (s || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();

    const q = cleanStr(searchTerm);
    const qDigits = searchTerm.replace(/\D/g, '');

    const filtered = todosAlunos.filter((aluno) => {
      // 1. Filtro por Nível
      if (filterNivel !== 'todos' && aluno.nivel_atual !== filterNivel) return false;

      // 2. Filtro por Papel
      if (filterPapel !== 'todos' && aluno.papel !== filterPapel) return false;

      // 3. Filtro por Tipo de Frequência
      if (filterTipo !== 'todos') {
        const alunoTipo = aluno.tipo_frequencia || 'mensalista';
        if (alunoTipo !== filterTipo) return false;
      }

      // 4. Filtro por Situação Financeira
      if (filterStatusFinanc !== 'todos') {
        const sf = getStatusFinanceiro(aluno);
        if (sf.key !== filterStatusFinanc) return false;
      }

      // 5. Busca textual
      if (q) {
        const nomeClean = cleanStr(aluno.nome);
        const emailClean = cleanStr(aluno.email);
        const nomeMatch = nomeClean.includes(q);
        const emailMatch = emailClean.includes(q);

        let telMatch = false;
        if (qDigits.length > 0 && aluno.telefone) {
          const telDigits = aluno.telefone.replace(/\D/g, '');
          telMatch = telDigits.includes(qDigits);
        }

        if (!nomeMatch && !emailMatch && !telMatch) return false;
      }

      return true;
    });

    // Ordenação
    return filtered.sort((a, b) => {
      if (sortBy === 'nome_asc') {
        return a.nome.localeCompare(b.nome);
      }
      if (sortBy === 'nome_desc') {
        return b.nome.localeCompare(a.nome);
      }
      if (sortBy === 'nivel') {
        const niveisOrder: Record<string, number> = { B1: 1, B2: 2, I1: 3, I2: 4 };
        return (niveisOrder[a.nivel_atual] || 0) - (niveisOrder[b.nivel_atual] || 0);
      }
      if (sortBy === 'data_matricula') {
        const dA = new Date(a.data_matricula || 0).getTime();
        const dB = new Date(b.data_matricula || 0).getTime();
        return dB - dA;
      }
      if (sortBy === 'status_financ') {
        const sfOrder: Record<string, number> = {
          atrasado: 1,
          a_vencer: 2,
          em_dia: 3,
          avulso: 4,
          experimental: 5
        };
        const sfA = getStatusFinanceiro(a).key;
        const sfB = getStatusFinanceiro(b).key;
        return (sfOrder[sfA] || 99) - (sfOrder[sfB] || 99);
      }
      return 0;
    });
  }, [todosAlunos, filterNivel, filterPapel, filterTipo, filterStatusFinanc, searchTerm, sortBy, pagamentos]);

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    filterNivel !== 'todos' ||
    filterPapel !== 'todos' ||
    filterTipo !== 'todos' ||
    filterStatusFinanc !== 'todos' ||
    sortBy !== 'nome_asc';

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterNivel('todos');
    setFilterPapel('todos');
    setFilterTipo('todos');
    setFilterStatusFinanc('todos');
    setSortBy('nome_asc');
  };

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

  // Retorna o status financeiro do aluno com base nos pagamentos e no tipo_frequencia
  const getStatusFinanceiro = (aluno: Aluno) => {
    if (aluno.tipo_frequencia === 'experimental') {
      return { key: 'experimental', label: 'Experimental', icon: <CalendarClock className="h-3 w-3" />, cls: 'bg-blue-100 text-blue-800' };
    }
    if (aluno.tipo_frequencia === 'avulso') {
      return { key: 'avulso', label: 'Avulso', icon: <CalendarClock className="h-3 w-3" />, cls: 'bg-slate-100 text-slate-700' };
    }

    // Mensalista — verifica pagamentos
    const hoje = new Date();
    const dataVenc = aluno.data_vencimento_atual ? new Date(aluno.data_vencimento_atual + 'T12:00:00') : null;

    if (!dataVenc) {
      // Verifica em pagamentos se tem algum pendente
      const pagPendente = pagamentos.find((p) =>
        (p.aluno_id === aluno.id || p.aluno_id === aluno.user_id) && p.status !== 'Pago'
      );
      if (pagPendente) {
        const venc = new Date(pagPendente.data_vencimento + 'T12:00:00');
        if (venc < hoje) {
          return { key: 'atrasado', label: 'Atrasado', icon: <AlertTriangle className="h-3 w-3" />, cls: 'bg-rose-100 text-rose-800' };
        }
        const diff = Math.ceil((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        if (diff <= 7) {
          return { key: 'a_vencer', label: `Vence em ${diff}d`, icon: <CalendarClock className="h-3 w-3" />, cls: 'bg-amber-100 text-amber-800' };
        }
      }
      return { key: 'em_dia', label: 'Em dia', icon: <ShieldCheck className="h-3 w-3" />, cls: 'bg-emerald-100 text-emerald-800' };
    }

    if (dataVenc < hoje) {
      return { key: 'atrasado', label: 'Atrasado', icon: <AlertTriangle className="h-3 w-3" />, cls: 'bg-rose-100 text-rose-800' };
    }

    const diasRestantes = Math.ceil((dataVenc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    if (diasRestantes <= 7) {
      return { key: 'a_vencer', label: `Vence em ${diasRestantes}d`, icon: <CalendarClock className="h-3 w-3" />, cls: 'bg-amber-100 text-amber-800' };
    }

    return { key: 'em_dia', label: 'Em dia', icon: <ShieldCheck className="h-3 w-3" />, cls: 'bg-emerald-100 text-emerald-800' };
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

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 font-bold px-4 py-2.5 text-xs transition-colors shadow-xs"
            title="Importar alunos a partir de planilha Excel (.xlsx, .xls) ou CSV"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Importar Base de Alunos (Planilha)</span>
          </button>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 text-xs shadow-md shadow-brand-500/20 transition-all"
          >
            <UserPlus className="h-4 w-4" />
            <span>+ Matricular Novo Aluno</span>
          </button>
        </div>
      </div>

      {/* Metrics by Level */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-2xl bg-white p-3.5 border border-slate-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Alunos
          </span>
          <p className="text-xl font-black text-slate-900 mt-1">{todosAlunos.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-3.5 border border-slate-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
            Nível B1
          </span>
          <p className="text-xl font-black text-amber-700 mt-1">
            {todosAlunos.filter((a) => a.nivel_atual === 'B1').length}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-3.5 border border-slate-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
            Nível B2
          </span>
          <p className="text-xl font-black text-blue-700 mt-1">
            {todosAlunos.filter((a) => a.nivel_atual === 'B2').length}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-3.5 border border-slate-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
            Nível I1
          </span>
          <p className="text-xl font-black text-purple-700 mt-1">
            {todosAlunos.filter((a) => a.nivel_atual === 'I1').length}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-3.5 border border-slate-100 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
            Nível I2
          </span>
          <p className="text-xl font-black text-emerald-700 mt-1">
            {todosAlunos.filter((a) => a.nivel_atual === 'I2').length}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar with View Mode Toggle */}
      <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, telefone ou email..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-9 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-brand-500 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Toggle: Grade | Lista | Compacto */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200/80 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => handleSetViewMode('grade')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'grade'
                  ? 'bg-white text-brand-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Exibição em Grade de Cartões"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Grade</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetViewMode('lista')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'lista'
                  ? 'bg-white text-brand-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Exibição em Tabela Detalhada"
            >
              <List className="h-3.5 w-3.5" />
              <span>Lista / Tabela</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetViewMode('compacto')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'compacto'
                  ? 'bg-white text-brand-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Exibição em Linhas Compactas"
            >
              <AlignJustify className="h-3.5 w-3.5" />
              <span>Compacto</span>
            </button>
          </div>
        </div>

        {/* Dropdowns Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100/80">
          {/* Nível */}
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

          {/* Papel */}
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

          {/* Frequência */}
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-brand-500"
          >
            <option value="todos">Todas as Frequências</option>
            <option value="mensalista">🗓️ Mensalistas</option>
            <option value="experimental">🎁 Experimentais</option>
            <option value="avulso">🎟️ Avulsos</option>
          </select>

          {/* Situação Financeira */}
          <select
            value={filterStatusFinanc}
            onChange={(e) => setFilterStatusFinanc(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-brand-500"
          >
            <option value="todos">Todas as Situações</option>
            <option value="em_dia">🟢 Em dia</option>
            <option value="a_vencer">🟡 A vencer (≤ 7 dias)</option>
            <option value="atrasado">🔴 Em atraso</option>
          </select>

          {/* Ordenação */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[11px] font-bold text-slate-400 uppercase hidden sm:inline">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-brand-500"
            >
              <option value="nome_asc">Nome (A → Z)</option>
              <option value="nome_desc">Nome (Z → A)</option>
              <option value="nivel">Nível (B1 → I2)</option>
              <option value="data_matricula">Matrícula (Mais Recentes)</option>
              <option value="status_financ">Situação (Atrasados Primeiro)</option>
            </select>
          </div>

          {/* Limpar Filtros */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
              title="Limpar todos os filtros"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Limpar</span>
            </button>
          )}
        </div>

        {/* Counter footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-0.5">
          <span>
            Exibindo <strong>{filteredAndSortedAlunos.length}</strong> de {todosAlunos.length} alunos
          </span>
          <span className="text-[11px] text-slate-400">
            Visualização: <strong>{viewMode === 'grade' ? 'Grade de Cartões' : viewMode === 'lista' ? 'Tabela Completa' : 'Linhas Compactas'}</strong>
          </span>
        </div>
      </div>

      {/* Content Rendering: Empty State / Grade / Lista / Compacto */}
      {filteredAndSortedAlunos.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center text-slate-400 border border-slate-100">
          Nenhum aluno encontrado com os filtros selecionados.
        </div>
      ) : viewMode === 'grade' ? (
        /* Modo 1: Grade de Cartões */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedAlunos.map((aluno) => (
            <div
              key={aluno.id}
              onClick={() => setSelectedAlunoModal(aluno)}
              className="group cursor-pointer rounded-2xl bg-white p-5 border border-slate-200 shadow-sm hover:border-brand-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={aluno.nome}
                      fotoUrl={aluno.foto_url}
                      size="lg"
                      className="ring-2 ring-slate-100 group-hover:ring-brand-500 transition-all"
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
                    <span>{aluno.telefone || <span className="text-slate-300 italic">Não informado</span>}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate">{aluno.email || <span className="text-slate-300 italic">Não informado</span>}</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Mensalidade</span>
                  <span className="font-bold text-slate-900">
                    R$ {aluno.mensalidade_valor.toFixed(2)}{' '}
                    {aluno.tipo_frequencia === 'avulso' && (
                      <span className="text-[10px] font-normal text-slate-400">(Avulso)</span>
                    )}
                    {aluno.tipo_frequencia === 'experimental' && (
                      <span className="text-[10px] font-normal text-slate-400">(Experimental)</span>
                    )}
                    {(!aluno.tipo_frequencia || aluno.tipo_frequencia === 'mensalista') && aluno.data_vencimento_atual && (
                      <span className="text-[10px] font-normal text-slate-400">
                        (Venc. {new Date(aluno.data_vencimento_atual + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })})
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {(() => {
                    const sf = getStatusFinanceiro(aluno);
                    return (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${sf.cls}`}>
                        {sf.icon}
                        {sf.label}
                      </span>
                    );
                  })()}
                  <span className="inline-flex items-center gap-1 font-semibold text-brand-600 group-hover:translate-x-0.5 transition-transform">
                    Ver Ficha <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === 'lista' ? (
        /* Modo 2: Tabela Detalhada */
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="p-3.5">Aluno</th>
                  <th className="p-3.5">Nível</th>
                  <th className="p-3.5">Papel</th>
                  <th className="p-3.5">Contato</th>
                  <th className="p-3.5">Frequência</th>
                  <th className="p-3.5">Mensalidade</th>
                  <th className="p-3.5">Situação</th>
                  <th className="p-3.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSortedAlunos.map((aluno) => {
                  const sf = getStatusFinanceiro(aluno);
                  return (
                    <tr
                      key={aluno.id}
                      onClick={() => setSelectedAlunoModal(aluno)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={aluno.nome}
                            fotoUrl={aluno.foto_url}
                            size="md"
                            className="ring-2 ring-slate-100 group-hover:ring-brand-500 transition-all"
                          />
                          <div>
                            <p className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition-colors">
                              {aluno.nome}
                            </p>
                            {Boolean(aluno.user_id || usuariosList.some((u) => u.email.toLowerCase() === aluno.email.toLowerCase())) && (
                              <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                Conta Vinculada
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${getNivelBadge(aluno.nivel_atual)}`}>
                          {aluno.nivel_atual}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 font-medium">
                        {aluno.papel}
                      </td>
                      <td className="p-3.5">
                        <div className="space-y-0.5 text-slate-600">
                          {aluno.telefone ? (
                            <p className="flex items-center gap-1 font-mono text-[11px]">
                              <Phone className="h-3 w-3 text-slate-400" />
                              {aluno.telefone}
                            </p>
                          ) : (
                            <span className="text-slate-300 italic text-[11px]">Sem telefone</span>
                          )}
                          {aluno.email && (
                            <p className="flex items-center gap-1 text-[11px] text-slate-400 truncate max-w-[180px]">
                              <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="truncate">{aluno.email}</span>
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            aluno.tipo_frequencia === 'mensalista' || !aluno.tipo_frequencia
                              ? 'bg-blue-100 text-blue-800'
                              : aluno.tipo_frequencia === 'experimental'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {aluno.tipo_frequencia === 'experimental'
                            ? '🎁 Experimental'
                            : aluno.tipo_frequencia === 'avulso'
                            ? '🎟️ Avulso'
                            : '🗓️ Mensalista'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <p className="font-bold text-slate-900">
                          R$ {aluno.mensalidade_valor.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {aluno.data_vencimento_atual
                            ? `Venc. ${new Date(aluno.data_vencimento_atual + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`
                            : `Dia ${aluno.dia_vencimento}`}
                        </p>
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${sf.cls}`}>
                          {sf.icon}
                          {sf.label}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAlunoModal(aluno);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 group-hover:translate-x-0.5 transition-transform"
                        >
                          Ver Ficha <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Modo 3: Linhas Compactas */
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100 overflow-hidden">
          {filteredAndSortedAlunos.map((aluno) => {
            const sf = getStatusFinanceiro(aluno);
            return (
              <div
                key={aluno.id}
                onClick={() => setSelectedAlunoModal(aluno)}
                className="p-3 sm:px-5 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <UserAvatar
                    name={aluno.nome}
                    fotoUrl={aluno.foto_url}
                    size="md"
                    className="ring-2 ring-slate-100 group-hover:ring-brand-500 transition-all shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition-colors truncate">
                        {aluno.nome}
                      </h4>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-black border shrink-0 ${getNivelBadge(aluno.nivel_atual)}`}>
                        {aluno.nivel_atual}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs text-slate-400">
                      <span>{aluno.papel}</span>
                      {aluno.telefone && (
                        <span className="font-mono text-[11px] text-slate-500">{aluno.telefone}</span>
                      )}
                      <span>• R$ {aluno.mensalidade_valor.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${sf.cls}`}>
                    {sf.icon}
                    {sf.label}
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-brand-600 group-hover:translate-x-0.5 transition-transform">
                    Ver Ficha <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
                    Tipo de Frequência *
                  </label>
                  <select
                    value={newStudent.tipo_frequencia || 'mensalista'}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        tipo_frequencia: e.target.value as 'mensalista' | 'avulso' | 'experimental'
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-brand-500 bg-white"
                  >
                    <option value="mensalista">🗓️ Mensalista (ciclo 30 dias)</option>
                    <option value="avulso">🎟️ Avulso (paga por aula)</option>
                    <option value="experimental">🎁 Experimental (1ª aula gratuita)</option>
                  </select>
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
                  Foto do Aluno (Opcional)
                </label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <UserAvatar
                    name={newStudent.nome || 'Aluno'}
                    fotoUrl={newStudent.foto_url}
                    size="md"
                  />
                  <div className="flex-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-200 bg-white hover:bg-orange-50 text-brand-700 text-xs font-bold cursor-pointer transition-colors">
                      <Upload className="h-3.5 w-3.5" />
                      <span>Escolher foto do computador</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setNewStudent({ ...newStudent, foto_url: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {newStudent.foto_url && (
                      <button
                        type="button"
                        onClick={() => setNewStudent({ ...newStudent, foto_url: '' })}
                        className="text-[11px] text-rose-600 hover:underline block mt-1"
                      >
                        Remover foto
                      </button>
                    )}
                  </div>
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

      {/* Modal Importar Alunos (Planilha) */}
      <ImportarAlunosModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};
