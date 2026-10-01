import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Info,
  FileSpreadsheet,
  Download,
  Upload,
  Plus,
  Trash2,
  Search,
  Sparkles,
  Calendar,
  Grid,
  List,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { NivelForro, Aula } from '../types';
import {
  parseCronogramaExcel,
  downloadCronogramaTemplate,
  exportCurrentScheduleToExcel,
  ExcelParseResult
} from '../utils/excelImport';
import { annualScheduleRows, historicalScheduleRows2023 } from '../data/annualScheduleData';

export const CronogramaPage: React.FC = () => {
  const {
    currentUser,
    aulas,
    cronogramas,
    equipe,
    professoresCadastrados,
    updateTemaCronograma,
    deleteCronogramaCell,
    deleteCronogramaRow,
    importCronogramaExcel
  } = useApp();

  const isEquipe = Boolean(
    currentUser.is_master ||
    currentUser.role === 'master' ||
    currentUser.role === 'admin' ||
    currentUser.role === 'professor' ||
    currentUser.tipo_usuario === 'Equipe' ||
    currentUser.tipo_usuario === 'AdminMaster'
  );

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('importar') === 'true' || searchParams.get('import') === 'true') {
      setExcelFile(null);
      setParseResult(null);
      setIsImportModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // View modes: 'anual' (Data × Turmas matrix like screenshots) or 'semanal' (card view)
  const [viewMode, setViewMode] = useState<'anual' | 'semanal'>('anual');

  // Filters
  const [selectedAno, setSelectedAno] = useState<'2026' | '2023' | 'todos'>('2026');
  const [selectedMes, setSelectedMes] = useState<string>('todos');
  const [selectedNivel, setSelectedNivel] = useState<string>('todos');
  const [selectedTurno, setSelectedTurno] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Weekly view pagination state
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(0);

  // Edit cell modal state
  const [editingCell, setEditingCell] = useState<{
    aulaId: string;
    dataAula: string;
    turmaNome: string;
    formattedDate: string;
    temaAtual: string;
    obsAtual: string;
  } | null>(null);

  const [novoTema, setNovoTema] = useState('');
  const [novaObs, setNovaObs] = useState('');

  // Excel Import Modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isParsingExcel, setIsParsingExcel] = useState(false);
  const [parseResult, setParseResult] = useState<ExcelParseResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add Class / Date Modal state
  const [isAddDateModalOpen, setIsAddDateModalOpen] = useState(false);
  const [newDateVal, setNewDateVal] = useState('');
  const [newDateTurmaId, setNewDateTurmaId] = useState('');
  const [newDateTema, setNewDateTema] = useState('');

  // 1. Organize Turmas for the columns (Priority to official Saturday classes in exact screenshot order)
  const sortedAulas = useMemo(() => {
    const orderPreference = [
      'B1 Manhã',
      'I2 Manhã',
      'B2 Manhã',
      'I1 Manhã',
      'B1 Tarde',
      'I1 Tarde',
      'B2 Tarde',
      'I2 Tarde'
    ];

    const list = [...aulas].filter((aula) => {
      if (selectedNivel !== 'todos' && aula.nivel !== selectedNivel) return false;
      if (selectedTurno !== 'todos' && aula.turno !== selectedTurno) return false;
      return true;
    });

    return list.sort((a, b) => {
      const idxA = orderPreference.indexOf(a.nome);
      const idxB = orderPreference.indexOf(b.nome);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.nome.localeCompare(b.nome);
    });
  }, [aulas, selectedNivel, selectedTurno]);

  // 2. Gather and sort all unique dates from cronogramas & official schedule
  const allUniqueDates = useMemo(() => {
    const datesSet = new Set<string>();

    // Include dates from annual schedule 2026
    annualScheduleRows.forEach((r) => datesSet.add(r.data));

    // Include dates from historical schedule 2023
    historicalScheduleRows2023.forEach((r) => datesSet.add(r.data));

    // Include dates from cronogramas state
    cronogramas.forEach((c) => {
      if (c.data_aula) datesSet.add(c.data_aula);
    });

    return Array.from(datesSet).sort();
  }, [cronogramas]);

  // Filter dates by year, month and search query
  const filteredDates = useMemo(() => {
    return allUniqueDates.filter((isoDate) => {
      // Filter by selected Academic Year
      if (selectedAno !== 'todos' && !isoDate.startsWith(selectedAno)) {
        return false;
      }

      const parts = isoDate.split('-');
      const month = parts[1]; // '01' .. '12'

      if (selectedMes !== 'todos' && month !== selectedMes) {
        return false;
      }

      // If search query is typed, check if any cell on this date matches
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hasMatchingTheme = cronogramas.some(
          (c) =>
            c.data_aula === isoDate &&
            (c.tema_aula.toLowerCase().includes(q) || (c.observacoes && c.observacoes.toLowerCase().includes(q)))
        );
        const dateMatches = isoDate.includes(q);
        if (!hasMatchingTheme && !dateMatches) return false;
      }

      return true;
    });
  }, [allUniqueDates, selectedAno, selectedMes, searchQuery, cronogramas]);

  // Format date helper: "2026-01-04" -> "sábado, 04/01"
  const formatDateLabel = (isoDate: string): string => {
    const official = annualScheduleRows.find((r) => r.data === isoDate) || historicalScheduleRows2023.find((r) => r.data === isoDate);
    if (official) return official.label;

    const parts = isoDate.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
      const dayNames = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
      const dayName = dayNames[dateObj.getDay()] || 'sábado';
      return `${dayName}, ${d}/${m}`;
    }
    return isoDate;
  };

  // Badge styler based on theme content
  const renderThemeBadge = (tema: string | undefined) => {
    if (!tema || tema.trim() === '' || tema === '—') {
      return <span className="text-slate-300 text-xs italic">Não planejado</span>;
    }

    const upper = tema.toUpperCase();

    // INÍCIO DE MÓDULO
    if (upper.includes('INÍCIO') || upper.includes('INICIO') || upper.includes('MODULO') || upper.includes('MÓDULO')) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold leading-snug">
          <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>{tema}</span>
        </div>
      );
    }

    // SEM AULA / FERIADOS
    if (upper.includes('SEM AULA') || upper.includes('FERIADO') || upper.includes('RECESSO') || upper.includes('CARNAVAL') || upper.includes('SÃO JOÃO') || upper.includes('SAO JOAO')) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold leading-snug">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
          <span>{tema}</span>
        </div>
      );
    }

    // NIVELAMENTO
    if (upper.includes('NIVELAMENTO')) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold leading-snug">
          <Sparkles className="w-3 h-3 text-purple-600 shrink-0" />
          <span>{tema}</span>
        </div>
      );
    }

    // AULA ESPECIAL / HALLOWEEN
    if (upper.includes('AULA ESPECIAL') || upper.includes('HALLOWEEN') || upper.includes('ESPECIAL')) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold leading-snug">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
          <span>{tema}</span>
        </div>
      );
    }

    // REVISÃO
    if (upper.includes('REVISÃO') || upper.includes('REVISAO')) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 border border-sky-200 text-xs font-semibold leading-snug">
          <span>{tema}</span>
        </div>
      );
    }

    // Standard Theme
    return (
      <span className="text-xs font-medium text-slate-800 leading-snug group-hover:text-brand-900">
        {tema}
      </span>
    );
  };

  // Open edit modal
  const handleOpenEdit = (aulaId: string, dataAula: string, turmaNome: string) => {
    if (!isEquipe) return;
    const crono = cronogramas.find(
      (c) => c.aula_id === aulaId && c.data_aula === dataAula
    );
    setEditingCell({
      aulaId,
      dataAula,
      turmaNome,
      formattedDate: formatDateLabel(dataAula),
      temaAtual: crono?.tema_aula || '',
      obsAtual: crono?.observacoes || ''
    });
    setNovoTema(crono?.tema_aula || '');
    setNovaObs(crono?.observacoes || '');
  };

  // Save theme
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

  // Delete single cell
  const handleDeleteCell = (aulaId: string, dataAula: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isEquipe) return;
    if (confirm('Deseja realmente remover esta aula do cronograma desta data?')) {
      deleteCronogramaCell(aulaId, dataAula);
      if (editingCell) setEditingCell(null);
    }
  };

  // Delete date row
  const handleDeleteRow = (dataAula: string) => {
    if (!isEquipe) return;
    const label = formatDateLabel(dataAula);
    if (confirm(`Deseja excluir todo o planejamento da data "${label}"?`)) {
      deleteCronogramaRow(dataAula);
    }
  };

  // Handle Excel file selection & parsing
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFile(file);
    setIsParsingExcel(true);
    try {
      const result = await parseCronogramaExcel(file);
      setParseResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsParsingExcel(false);
    }
  };

  const handleSheetChange = async (sheetName: string) => {
    if (!excelFile) return;
    setIsParsingExcel(true);
    try {
      const result = await parseCronogramaExcel(excelFile, sheetName);
      setParseResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsParsingExcel(false);
    }
  };

  // Confirm and execute Excel import
  const handleConfirmImport = async () => {
    if (!parseResult || !parseResult.success) return;
    setIsImporting(true);
    try {
      await importCronogramaExcel(parseResult);
      setIsImportModalOpen(false);
      setExcelFile(null);
      setParseResult(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsImporting(false);
    }
  };

  // Add custom date / class
  const handleAddDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDateVal || !newDateTurmaId || !newDateTema) return;

    updateTemaCronograma(newDateTurmaId, newDateVal, newDateTema);
    setIsAddDateModalOpen(false);
    setNewDateVal('');
    setNewDateTurmaId('');
    setNewDateTema('');
  };

  const meses = [
    { id: 'todos', nome: 'Ano Todo' },
    { id: '01', nome: 'Jan' },
    { id: '02', nome: 'Fev' },
    { id: '03', nome: 'Mar' },
    { id: '04', nome: 'Abr' },
    { id: '05', nome: 'Mai' },
    { id: '06', nome: 'Jun' },
    { id: '07', nome: 'Jul' },
    { id: '08', nome: 'Ago' },
    { id: '09', nome: 'Set' },
    { id: '10', nome: 'Out' },
    { id: '11', nome: 'Nov' },
    { id: '12', nome: 'Dez' }
  ];

  const getNivelBadgeColor = (nivel: NivelForro) => {
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
    <div className="space-y-6 pb-12">
      {/* Top Header & Prominent Excel Import Action */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-brand-700 flex items-center justify-center shadow-xs">
              <CalendarDays className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Planejamento Semanal & Anual
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Grade anual Data × Turma com temas pedagógicos oficiais do 4ANDAR.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* PROMINENT IMPORT EXCEL BUTTON */}
          <button
            onClick={() => {
              setExcelFile(null);
              setParseResult(null);
              setIsImportModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-4 py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer ring-2 ring-emerald-500/20"
          >
            <FileSpreadsheet className="h-4 w-4 shrink-0 text-white" />
            <span>Importar Planilha Excel</span>
          </button>

          {/* Download Template Button */}
          <button
            onClick={() => downloadCronogramaTemplate()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 text-xs font-bold transition-all shadow-xs"
            title="Baixar planilha padrão (.xlsx) para preenchimento no Excel"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Modelo Excel</span>
          </button>

          {/* Export Current Schedule */}
          <button
            onClick={() => exportCurrentScheduleToExcel(aulas, cronogramas)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 text-xs font-bold transition-all shadow-xs"
            title="Exportar toda a grade atual para arquivo Excel"
          >
            <Download className="h-3.5 w-3.5 text-brand-600" />
            <span>Exportar Grade</span>
          </button>

          {/* Add Date / Class */}
          {isEquipe && (
            <button
              onClick={() => setIsAddDateModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-3.5 py-2 text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nova Aula / Data</span>
            </button>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setViewMode('anual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'anual'
                  ? 'bg-white text-brand-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              <span>Grade Anual</span>
            </button>
            <button
              onClick={() => setViewMode('semanal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'semanal'
                  ? 'bg-white text-brand-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Semanal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Month Navigation Bar */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm space-y-3">
        {/* Academic Year Selector & Metrics Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ano Letivo:
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedAno('2026')}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                  selectedAno === '2026'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2026 (Atual)
              </button>
              <button
                type="button"
                onClick={() => setSelectedAno('2023')}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                  selectedAno === '2023'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2023 (Histórico)
              </button>
              <button
                type="button"
                onClick={() => setSelectedAno('todos')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedAno === 'todos'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos os Anos
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Exibindo <strong>{filteredDates.length}</strong> datas • <strong>{sortedAulas.length}</strong> turmas
          </div>
        </div>

        {/* Months Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Mês:
          </span>
          {meses.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMes(m.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedMes === m.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {m.nome}
            </button>
          ))}
        </div>

        {/* Secondary filters: Search, Nivel, Turno */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search by theme */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar tema (ex: Sacada, Nivelamento...)"
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 outline-none w-64 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Level Filter */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-400 font-bold mr-1">Nível:</span>
              {['todos', 'B1', 'B2', 'I1', 'I2'].map((n) => (
                <button
                  key={n}
                  onClick={() => setSelectedNivel(n)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    selectedNivel === n
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {n === 'todos' ? 'Todos' : n}
                </button>
              ))}
            </div>

            {/* Turno Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-bold">Turno:</span>
              <select
                value={selectedTurno}
                onChange={(e) => setSelectedTurno(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-brand-500"
              >
                <option value="todos">Todos</option>
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
                <option value="Noite">Noite</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Exibindo <strong>{filteredDates.length}</strong> datas • <strong>{sortedAulas.length}</strong> turmas
          </div>
        </div>
      </div>

      {/* Information Tip for the Team */}
      {isEquipe && (
        <div className="rounded-xl bg-amber-50/80 border border-amber-200 p-3 text-xs text-amber-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-brand-600 shrink-0" />
            <span>
              <strong>Dica de Edição:</strong> Clique em qualquer tema para editar o conteúdo ou marcar feriado/nivelamento. Use o botão <strong>Importar Planilha Excel</strong> para carregar o ano letivo completo automaticamente.
            </span>
          </div>
        </div>
      )}

      {/* VIEW 1: ANNUAL MATRIX TABLE (Exact match to the provided attachments) */}
      {viewMode === 'anual' ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto max-h-[750px] scrollbar-thin">
            <table className="w-full border-collapse text-left text-xs">
              {/* Sticky Header Row matching the spreadsheet attachments */}
              <thead className="sticky top-0 z-20 bg-[#fff5ea] shadow-xs">
                <tr className="border-b border-[#fed7aa]">
                  {/* Column 1: Data */}
                  <th className="p-3.5 font-black text-brand-900 text-xs uppercase tracking-wider min-w-[140px] sticky left-0 z-30 bg-[#fff5ea] border-r border-[#fed7aa]">
                    Data
                  </th>

                  {/* Turma Columns: I2 Manhã, I1 Tarde, B1 Manhã, B2 Manhã, B2 Tarde, I1 Manhã, B1 Tarde... */}
                  {sortedAulas.map((turma) => {
                    const prof =
                      professoresCadastrados.find((p) => p.id === turma.equipe_id || p.equipe_id === turma.equipe_id || p.user_id === turma.equipe_id) ||
                      equipe.find((e) => e.id === turma.equipe_id);

                    return (
                      <th
                        key={turma.id}
                        className="p-3 font-bold text-slate-800 text-xs min-w-[170px] border-r border-orange-100/80 last:border-r-0"
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-extrabold text-slate-900 text-[13px]">
                            {turma.nome}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-black border ${getNivelBadgeColor(
                              turma.nivel
                            )}`}
                          >
                            {turma.nivel}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-normal flex items-center justify-between">
                          <span>{turma.turno}</span>
                          <span>Prof. {prof?.nome.split(' ')[0] || '—'}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Rows: Dates on rows, themes on cells */}
              <tbody className="divide-y divide-slate-100">
                {filteredDates.length === 0 ? (
                  <tr>
                    <td
                      colSpan={sortedAulas.length + 1}
                      className="p-12 text-center text-slate-400"
                    >
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40 text-brand-500" />
                      <p className="font-semibold text-slate-600">Nenhuma data encontrada para este filtro.</p>
                      <p className="text-xs text-slate-400 mt-1">Selecione outro mês ou limpe a busca.</p>
                    </td>
                  </tr>
                ) : (
                  filteredDates.map((isoDate, index) => {
                    const dateLabel = formatDateLabel(isoDate);
                    const isEven = index % 2 === 0;

                    return (
                      <tr
                        key={isoDate}
                        className={`hover:bg-amber-50/30 transition-colors ${
                          isEven ? 'bg-white' : 'bg-slate-50/30'
                        }`}
                      >
                        {/* Data Column (Sticky Left) */}
                        <td className="p-3 font-bold text-slate-800 whitespace-nowrap sticky left-0 z-10 bg-inherit border-r border-slate-200 group">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-slate-900">{dateLabel}</span>
                            {isEquipe && (
                              <button
                                onClick={() => handleDeleteRow(isoDate)}
                                title={`Excluir planejamento da data ${dateLabel}`}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Cell for each Turma */}
                        {sortedAulas.map((turma) => {
                          const crono = cronogramas.find(
                            (c) => c.aula_id === turma.id && c.data_aula === isoDate
                          );
                          const fallbackSchedule =
                            annualScheduleRows.find((r) => r.data === isoDate) ||
                            historicalScheduleRows2023.find((r) => r.data === isoDate);

                          const tema = crono?.tema_aula || fallbackSchedule?.temas?.[turma.nome];
                          const professor = crono?.observacoes || (fallbackSchedule?.professores?.[turma.nome] ? `Prof: ${fallbackSchedule.professores[turma.nome]}` : '');

                          return (
                            <td
                              key={turma.id}
                              onClick={() => handleOpenEdit(turma.id, isoDate, turma.nome)}
                              className={`p-2.5 border-r border-slate-100 last:border-r-0 align-top transition-colors relative group ${
                                isEquipe
                                  ? 'cursor-pointer hover:bg-orange-50/60'
                                  : ''
                              }`}
                            >
                              <div className="min-h-[48px] flex flex-col justify-between">
                                <div>
                                  {renderThemeBadge(tema)}
                                  {professor && !tema?.includes('SEM AULA') && (
                                    <div className="text-[10.5px] font-semibold text-slate-500 flex items-center gap-1 mt-1">
                                      <User className="w-2.5 h-2.5 text-brand-600 shrink-0" />
                                      <span>{professor}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Floating edit/delete actions on cell hover */}
                                {isEquipe && (
                                  <div className="mt-1 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEdit(turma.id, isoDate, turma.nome);
                                      }}
                                      title="Editar tema"
                                      className="p-1 rounded text-slate-400 hover:text-brand-700 hover:bg-white shadow-xs"
                                    >
                                      <Edit3 className="h-3 w-3" />
                                    </button>
                                    {tema && (
                                      <button
                                        onClick={(e) => handleDeleteCell(turma.id, isoDate, e)}
                                        title="Limpar tema"
                                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-white shadow-xs"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VIEW 2: DETAILED WEEKLY CARD VIEW */
        <div className="space-y-4">
          {/* Week Selector */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setSelectedWeekIndex((prev) => Math.max(0, prev - 1))}
              disabled={selectedWeekIndex === 0}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="text-center">
              <span className="text-xs uppercase font-bold text-brand-600 tracking-wider">
                Semana {selectedWeekIndex + 1} de {filteredDates.length}
              </span>
              <h3 className="text-lg font-black text-slate-900">
                {filteredDates[selectedWeekIndex]
                  ? formatDateLabel(filteredDates[selectedWeekIndex])
                  : 'Nenhuma data selecionada'}
              </h3>
            </div>

            <button
              onClick={() =>
                setSelectedWeekIndex((prev) =>
                  Math.min(filteredDates.length - 1, prev + 1)
                )
              }
              disabled={selectedWeekIndex >= filteredDates.length - 1}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Cards of classes for this day */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDates[selectedWeekIndex] &&
              sortedAulas.map((turma) => {
                const currentDate = filteredDates[selectedWeekIndex];
                const crono = cronogramas.find(
                  (c) => c.aula_id === turma.id && c.data_aula === currentDate
                );
                const prof =
                  professoresCadastrados.find((p) => p.id === turma.equipe_id || p.equipe_id === turma.equipe_id || p.user_id === turma.equipe_id) ||
                  equipe.find((e) => e.id === turma.equipe_id);

                return (
                  <div
                    key={turma.id}
                    onClick={() => handleOpenEdit(turma.id, currentDate, turma.nome)}
                    className={`p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                      isEquipe ? 'cursor-pointer group hover:border-brand-300' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black border ${getNivelBadgeColor(
                              turma.nivel
                            )}`}
                          >
                            {turma.nivel}
                          </span>
                          <span className="font-bold text-slate-900 text-sm">
                            {turma.nome}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-semibold">
                          {turma.turno}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 space-y-1 mb-3">
                        <p className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <span>Prof. <strong>{prof?.nome || 'A definir'}</strong></span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{turma.horario_inicio} às {turma.horario_fim}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span>{turma.sala}</span>
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 block mb-1">
                          Tema Planejado:
                        </span>
                        <div>{renderThemeBadge(crono?.tema_aula)}</div>
                        {crono?.observacoes && (
                          <p className="text-[11px] text-slate-500 italic mt-2 border-t border-orange-100/60 pt-1.5">
                            {crono.observacoes}
                          </p>
                        )}
                      </div>
                    </div>

                    {isEquipe && (
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 group-hover:text-brand-600 font-semibold">
                        <span>Clique para editar</span>
                        <Edit3 className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: EXCEL IMPORT (Recognizes columns & pre-fills)   */}
      {/* ======================================================== */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Importar Planejamento via Excel
                  </h3>
                  <p className="text-xs text-slate-500">
                    Carregue seu cronograma em .xlsx, .xls ou .csv com colunas de Turma e linhas de Data.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1">
              {/* File Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/80 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                />
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {excelFile ? excelFile.name : 'Clique para selecionar a planilha Excel (.xlsx, .xls, .csv)'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Reconhece automaticamente a coluna Data e as turmas (I2 Manhã, I1 Tarde, B1 Manhã, etc.)
                  </p>
                </div>
              </div>

              {/* Parsing status / error */}
              {isParsingExcel && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-600">
                  Lendo planilha e mapeando campos pedagógicos...
                </div>
              )}

              {parseResult && !parseResult.success && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{parseResult.error}</span>
                </div>
              )}

              {/* Parse Success Preview */}
              {parseResult && parseResult.success && (
                <div className="space-y-3">
                  {/* Sheet Selector (if multiple sheets exist in workbook) */}
                  {parseResult.availableSheets.length > 1 && (
                    <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">Aba da Planilha:</span>
                        <select
                          value={parseResult.sheetName}
                          onChange={(e) => handleSheetChange(e.target.value)}
                          className="text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1 outline-none focus:border-brand-500"
                        >
                          {parseResult.availableSheets.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        {parseResult.formatDetected === 'matriz_f4a_horizontal'
                          ? 'Matriz Pedagógica Oficial F4A (Horizontal)'
                          : 'Tabela Vertical Padrão'}
                      </span>
                    </div>
                  )}

                  {/* Metrics Badges */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {parseResult.stats.totalAulas} aulas mapeadas
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-bold">
                      {parseResult.stats.totalDatas} sábados
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 font-bold">
                      {parseResult.stats.totalTurmas} turmas
                    </span>
                    {parseResult.stats.totalProfessores > 0 && (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                        {parseResult.stats.totalProfessores} professores identificados
                      </span>
                    )}
                    {parseResult.stats.modulosCount > 0 && (
                      <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 font-bold">
                        {parseResult.stats.modulosCount} inícios de módulo
                      </span>
                    )}
                  </div>

                  {/* Turmas Recognized Badges */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Turmas reconhecidas na planilha:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {parseResult.turmas.map((t) => (
                        <span
                          key={t.nome}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                        >
                          <span
                            className={`px-1 py-0.2 rounded text-[9px] font-black border ${getNivelBadgeColor(
                              t.nivel
                            )}`}
                          >
                            {t.nivel}
                          </span>
                          <span>{t.nome} ({t.turno})</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Preview Table of First 5 Rows */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Prévia dos Dados (Primeiras Linhas):
                    </label>
                    <div className="rounded-xl border border-slate-200 overflow-x-auto text-[11px]">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="p-2 font-bold text-slate-700">Data</th>
                            {parseResult.turmas.slice(0, 4).map((t) => (
                              <th key={t.nome} className="p-2 font-bold text-slate-700">
                                {t.nome}
                              </th>
                            ))}
                            {parseResult.turmas.length > 4 && (
                              <th className="p-2 font-bold text-slate-400">
                                +{parseResult.turmas.length - 4} turmas
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {parseResult.previewRows.slice(0, 5).map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-2 font-semibold text-slate-800 whitespace-nowrap">
                                {row.dataLabel}
                              </td>
                              {parseResult.turmas.slice(0, 4).map((t) => (
                                <td key={t.nome} className="p-2 text-slate-600 truncate max-w-[150px]">
                                  <div className="truncate font-medium">{row.temas[t.nome] || '—'}</div>
                                  {row.professores?.[t.nome] && (
                                    <div className="text-[10px] text-brand-600 font-semibold truncate">
                                      Prof: {row.professores[t.nome]}
                                    </div>
                                  )}
                                </td>
                              ))}
                              {parseResult.turmas.length > 4 && (
                                <td className="p-2 text-slate-400">...</td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions and Download Template Link */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">Formato esperado do Excel:</p>
                <p>
                  A 1ª coluna deve ser <strong>Data</strong> (ex: <em>sábado, 04/01</em> ou <em>04/01/2026</em>) e as outras colunas devem conter o nome das turmas (ex: <em>I2 Manhã</em>, <em>I1 Tarde</em>, <em>B1 Manhã</em>).
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => downloadCronogramaTemplate()}
                    className="text-brand-600 hover:text-brand-800 font-bold underline inline-flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Baixar planilha modelo preenchida (.xlsx)
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={!parseResult || !parseResult.success || isImporting}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2 text-xs font-bold shadow-sm transition-all"
              >
                {isImporting ? (
                  <span>Importando para o banco...</span>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Confirmar e Salvar no Sistema</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT CELL THEME & OBSERVATIONS                 */}
      {/* ======================================================== */}
      {editingCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Editar Aula do Cronograma
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Turma: <strong>{editingCell.turmaNome}</strong> • Data: <strong>{editingCell.formattedDate}</strong>
                </p>
              </div>
              <button
                onClick={() => setEditingCell(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Atalhos Rápidos:
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setNovoTema('SEM AULA')}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold border border-rose-200 transition-colors"
                >
                  Sem Aula (Feriado)
                </button>
                <button
                  type="button"
                  onClick={() => setNovoTema('Nivelamento')}
                  className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold border border-purple-200 transition-colors"
                >
                  Nivelamento
                </button>
                <button
                  type="button"
                  onClick={() => setNovoTema('AULA ESPECIAL')}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-bold border border-amber-200 transition-colors"
                >
                  Aula Especial
                </button>
                <button
                  type="button"
                  onClick={() => setNovoTema('Revisão Geral')}
                  className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 hover:bg-sky-100 text-xs font-bold border border-sky-200 transition-colors"
                >
                  Revisão
                </button>
                <button
                  type="button"
                  onClick={() => setNovoTema('Práticas Dançantes')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 transition-colors"
                >
                  Práticas Dançantes
                </button>
              </div>
            </div>

            {/* Form inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tema da Aula
                </label>
                <textarea
                  rows={2}
                  value={novoTema}
                  onChange={(e) => setNovoTema(e.target.value)}
                  placeholder="Ex: Sacada com arrasto, Conduções de contra, Passo Básico..."
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
                  placeholder="Ex: Foco no abraço fechado e tônus dos braços"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>

            {/* Footer with Edit & Delete actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {/* Delete / Clear button */}
              <button
                type="button"
                onClick={() => handleDeleteCell(editingCell.aulaId, editingCell.dataAula)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Limpar Aula Deste Dia</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCell(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveTema}
                  className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-5 py-2 text-xs font-bold text-white shadow-sm transition-all"
                >
                  <Check className="h-4 w-4" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ADD DATE / CLASS MANUALLY                       */}
      {/* ======================================================== */}
      {isAddDateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleAddDateSubmit}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                Adicionar Nova Aula / Data
              </h3>
              <button
                type="button"
                onClick={() => setIsAddDateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Data da Aula
                </label>
                <input
                  type="date"
                  required
                  value={newDateVal}
                  onChange={(e) => setNewDateVal(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Turma
                </label>
                <select
                  required
                  value={newDateTurmaId}
                  onChange={(e) => setNewDateTurmaId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 outline-none"
                >
                  <option value="">Selecione uma turma...</option>
                  {aulas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nome} ({a.nivel} • {a.turno})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tema da Aula
                </label>
                <input
                  type="text"
                  required
                  value={newDateTema}
                  onChange={(e) => setNewDateTema(e.target.value)}
                  placeholder="Ex: Giro com travessia, Nivelamento..."
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddDateModalOpen(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-xl bg-brand-600 hover:bg-brand-700 px-5 py-2 text-xs font-bold text-white shadow-sm"
              >
                Salvar Aula
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
