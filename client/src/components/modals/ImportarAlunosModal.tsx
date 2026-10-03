import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  Filter,
  Check,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  parseAlunosExcel,
  downloadModeloAlunosExcel,
  ExcelAlunosParseResult,
  ParsedAlunoItem
} from '../../utils/excelAlunosImport';

interface ImportarAlunosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportarAlunosModal: React.FC<ImportarAlunosModalProps> = ({
  isOpen,
  onClose
}) => {
  const { importarAlunosBulk, showToast } = useApp();

  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [parseResult, setParseResult] = useState<ExcelAlunosParseResult | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('TODAS');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [previewFilter, setPreviewFilter] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessFile = (selectedFile: File) => {
    setIsProcessing(true);
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (buffer) {
        setFileBuffer(buffer);
        const res = parseAlunosExcel(buffer, selectedSheet);
        setParseResult(res);
      }
      setIsProcessing(false);
    };
    reader.onerror = () => {
      showToast('Erro ao ler arquivo da planilha.', 'error');
      setIsProcessing(false);
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      handleProcessFile(f);
    }
  };

  const handleSheetChange = (sheetName: string) => {
    setSelectedSheet(sheetName);
    if (fileBuffer) {
      setIsProcessing(true);
      setTimeout(() => {
        const res = parseAlunosExcel(fileBuffer, sheetName);
        setParseResult(res);
        setIsProcessing(false);
      }, 50);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = async () => {
    if (!parseResult || parseResult.alunos.length === 0) return;

    setIsImporting(true);
    try {
      await importarAlunosBulk(parseResult.alunos);
      onClose();
      // Reset state
      setFile(null);
      setFileBuffer(null);
      setParseResult(null);
    } catch (err: any) {
      showToast('Falha na importação: ' + (err.message || 'Erro desconhecido'), 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const filteredPreviewAlunos = (parseResult?.alunos || []).filter((al) => {
    if (!previewFilter.trim()) return true;
    const q = previewFilter.toLowerCase();
    return (
      al.nome.toLowerCase().includes(q) ||
      al.telefone.toLowerCase().includes(q) ||
      al.email.toLowerCase().includes(q) ||
      al.nivel_atual.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Importar Base de Alunos
              </h3>
              <p className="text-xs text-slate-500">
                Importação rápida e inteligente via planilha Excel (.xlsx, .xls) ou CSV.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadModeloAlunosExcel}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors shadow-xs"
              title="Baixar planilha modelo formatada"
            >
              <Download className="h-3.5 w-3.5 text-brand-600" />
              <span>Baixar Modelo Excel</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Upload Zone */}
          {!parseResult ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-brand-500 bg-brand-50/60 scale-[0.99]'
                  : 'border-slate-200 bg-slate-50/50 hover:border-brand-400 hover:bg-orange-50/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="h-16 w-16 mx-auto rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-brand-600 mb-4 group-hover:scale-105 transition-transform">
                <Upload className="h-8 w-8" />
              </div>

              <h4 className="text-base font-bold text-slate-900">
                {isProcessing ? 'Lendo e analisando dados...' : 'Arraste a planilha aqui ou clique para selecionar'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Suporta planilhas padrão da escola 4ANDAR (abas MANHÃ, TARDE, INAUGURAL E AVULSO) ou planilhas com colunas de Nome, Telefone, Nível e Tipo.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                  ✓ .xlsx
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                  ✓ .xls
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                  ✓ .csv
                </span>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/60 sm:hidden">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadModeloAlunosExcel();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold"
                >
                  <Download className="h-3.5 w-3.5 text-brand-600" />
                  <span>Baixar Planilha Modelo (.xlsx)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* File Info & Options Bar */}
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900 truncate max-w-xs md:max-w-md">
                      {file?.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {parseResult.stats.total} alunos reconhecidos na planilha
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Sheet Selector if multiple sheets exist */}
                  {parseResult.sheetNames.length > 1 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-500">Aba:</span>
                      <select
                        value={selectedSheet}
                        onChange={(e) => handleSheetChange(e.target.value)}
                        className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-brand-500"
                      >
                        <option value="TODAS">Todas as Abas ({parseResult.sheetNames.length})</option>
                        {parseResult.sheetNames.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setFile(null);
                      setFileBuffer(null);
                      setParseResult(null);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-xs font-bold transition-colors"
                  >
                    Trocar Arquivo
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl bg-white p-3.5 border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Total Reconhecido
                  </span>
                  <span className="text-xl font-black text-slate-900">
                    {parseResult.stats.total}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    alunos prontos
                  </span>
                </div>

                <div className="rounded-2xl bg-white p-3.5 border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                    Mensalistas
                  </span>
                  <span className="text-xl font-black text-blue-700">
                    {parseResult.stats.mensalistas}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    ciclo regular 30 dias
                  </span>
                </div>

                <div className="rounded-2xl bg-white p-3.5 border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block">
                    Experimentais
                  </span>
                  <span className="text-xl font-black text-purple-700">
                    {parseResult.stats.experimentais}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    1ª aula gratuita
                  </span>
                </div>

                <div className="rounded-2xl bg-white p-3.5 border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                    Avulsos
                  </span>
                  <span className="text-xl font-black text-slate-700">
                    {parseResult.stats.avulsos}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    paga por aula
                  </span>
                </div>
              </div>

              {/* Levels breakdown badges */}
              <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <span className="font-bold text-slate-500">Distribuição por nível:</span>
                <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 font-bold text-[11px]">
                  B1: {parseResult.stats.porNivel.B1 || 0}
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 font-bold text-[11px]">
                  B2: {parseResult.stats.porNivel.B2 || 0}
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-800 font-bold text-[11px]">
                  I1: {parseResult.stats.porNivel.I1 || 0}
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                  I2: {parseResult.stats.porNivel.I2 || 0}
                </span>
              </div>

              {/* Search Filter inside Preview */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={previewFilter}
                    onChange={(e) => setPreviewFilter(e.target.value)}
                    placeholder="Filtrar pré-visualização por nome, telefone ou nível..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-brand-500 focus:bg-white"
                  />
                </div>
                <span className="text-xs text-slate-400 font-medium shrink-0">
                  Exibindo {Math.min(filteredPreviewAlunos.length, 30)} de {filteredPreviewAlunos.length}
                </span>
              </div>

              {/* Preview Table */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      <tr>
                        <th className="p-3">Nome do Aluno</th>
                        <th className="p-3">Nível</th>
                        <th className="p-3">Papel</th>
                        <th className="p-3">Telefone</th>
                        <th className="p-3">Tipo Frequência</th>
                        <th className="p-3">Mensalidade</th>
                        <th className="p-3">Origem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPreviewAlunos.slice(0, 30).map((al, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          <td className="p-3 font-bold text-slate-900">
                            {al.nome}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded font-black text-[10px] bg-slate-100 text-slate-700">
                              {al.nivel_atual}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600">
                            {al.papel}
                          </td>
                          <td className="p-3 text-slate-600 font-mono text-[11px]">
                            {al.telefone || <span className="text-slate-300 italic">Não informado</span>}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                al.tipo_frequencia === 'mensalista'
                                  ? 'bg-blue-100 text-blue-800'
                                  : al.tipo_frequencia === 'experimental'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {al.tipo_frequencia === 'mensalista'
                                ? '🗓️ Mensalista'
                                : al.tipo_frequencia === 'experimental'
                                ? '🎁 Experimental'
                                : '🎟️ Avulso'}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-slate-800">
                            R$ {al.mensalidade_valor.toFixed(2)}
                          </td>
                          <td className="p-3 text-slate-400 text-[10px]">
                            {al.aba_origem || 'Planilha'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>

          {parseResult && (
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={isImporting || parseResult.alunos.length === 0}
              className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 text-xs shadow-md shadow-brand-500/20 transition-all"
            >
              {isImporting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Salvando no banco de dados...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Confirmar Importação de {parseResult.alunos.length} Alunos</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
