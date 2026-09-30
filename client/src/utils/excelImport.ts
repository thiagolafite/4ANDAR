import * as XLSX from 'xlsx';
import { Aula, NivelForro } from '../types';

export interface ParsedCronogramaEntry {
  turma_nome: string;
  nivel: NivelForro;
  turno: 'Manhã' | 'Tarde' | 'Noite';
  data_aula: string; // YYYY-MM-DD
  formatted_label: string; // Ex: sábado, 04/01
  tema_aula: string;
  observacoes?: string;
}

export interface ParsedTurmaColumn {
  colIndex: number;
  nome: string;
  nivel: NivelForro;
  turno: 'Manhã' | 'Tarde' | 'Noite';
}

export interface ExcelParseResult {
  success: boolean;
  error?: string;
  sheetName: string;
  turmas: ParsedTurmaColumn[];
  datas: string[];
  entries: ParsedCronogramaEntry[];
  previewRows: Array<{
    dataLabel: string;
    isoDate: string;
    temas: Record<string, string>;
  }>;
}

// Auxiliar para extrair nível e turno a partir do nome da turma (ex: "I2 Manhã", "Básico 1 Tarde")
export function parseNivelETurno(nome: string): {
  nivel: NivelForro;
  turno: 'Manhã' | 'Tarde' | 'Noite';
} {
  const upper = nome.toUpperCase();

  let nivel: NivelForro = 'B1';
  if (upper.includes('I2') || upper.includes('INTERMEDIÁRIO 2') || upper.includes('INTERMEDIARIO 2')) {
    nivel = 'I2';
  } else if (upper.includes('I1') || upper.includes('INTERMEDIÁRIO 1') || upper.includes('INTERMEDIARIO 1')) {
    nivel = 'I1';
  } else if (upper.includes('B2') || upper.includes('BÁSICO 2') || upper.includes('BASICO 2')) {
    nivel = 'B2';
  } else if (upper.includes('B1') || upper.includes('BÁSICO 1') || upper.includes('BASICO 1')) {
    nivel = 'B1';
  }

  let turno: 'Manhã' | 'Tarde' | 'Noite' = 'Manhã';
  if (upper.includes('TARDE')) {
    turno = 'Tarde';
  } else if (upper.includes('NOITE')) {
    turno = 'Noite';
  } else if (upper.includes('MANHÃ') || upper.includes('MANHA')) {
    turno = 'Manhã';
  }

  return { nivel, turno };
}

// Converte valores variados de data (sábado, 04/01; 04/01/2026; serial number do Excel) para ISO YYYY-MM-DD
export function normalizeDate(
  val: any,
  defaultYear: number = 2026
): { isoDate: string; label: string } | null {
  if (val === null || val === undefined || val === '') return null;

  // Se for número serial de data do Excel
  if (typeof val === 'number') {
    const excelEpoch = new Date(Math.round((val - 25569) * 86400 * 1000));
    const y = excelEpoch.getUTCFullYear();
    const m = String(excelEpoch.getUTCMonth() + 1).padStart(2, '0');
    const d = String(excelEpoch.getUTCDate()).padStart(2, '0');
    const isoDate = `${y}-${m}-${d}`;
    return {
      isoDate,
      label: `sábado, ${d}/${m}`
    };
  }

  const str = String(val).trim();

  // Caso: "sábado, 04/01" ou "sabado, 04/01" ou "04/01"
  const regexDM = /(\d{1,2})\/(\d{1,2})/;
  const matchDM = str.match(regexDM);

  if (matchDM) {
    const day = matchDM[1].padStart(2, '0');
    const month = matchDM[2].padStart(2, '0');

    // Verifica se tem ano no final: 04/01/2026
    const regexFull = /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/;
    const matchFull = str.match(regexFull);

    let year = defaultYear;
    if (matchFull) {
      const parsedYear = parseInt(matchFull[3], 10);
      year = parsedYear < 100 ? 2000 + parsedYear : parsedYear;
    }

    const isoDate = `${year}-${month}-${day}`;
    const label = str.includes('sábado') || str.includes('sabado')
      ? str
      : `sábado, ${day}/${month}`;

    return { isoDate, label };
  }

  // Caso ISO YYYY-MM-DD
  const regexISO = /^(\d{4})-(\d{2})-(\d{2})/;
  const matchISO = str.match(regexISO);
  if (matchISO) {
    const y = matchISO[1];
    const m = matchISO[2];
    const d = matchISO[3];
    return {
      isoDate: `${y}-${m}-${d}`,
      label: `sábado, ${d}/${m}`
    };
  }

  return null;
}

// Analisador principal de planilhas Excel (.xlsx, .xls, .csv)
export async function parseCronogramaExcel(file: File): Promise<ExcelParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        if (!buffer) {
          return resolve({
            success: false,
            error: 'Arquivo vazio ou ilegível',
            sheetName: '',
            turmas: [],
            datas: [],
            entries: [],
            previewRows: []
          });
        }

        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Converte planilha em matriz 2D de células
        const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: ''
        });

        if (!rows || rows.length < 2) {
          return resolve({
            success: false,
            error: 'A planilha não contém linhas de dados suficientes.',
            sheetName,
            turmas: [],
            datas: [],
            entries: [],
            previewRows: []
          });
        }

        // 1. Encontra a linha de cabeçalho (que contém 'Data' ou 'Date' ou 'Dia')
        let headerRowIndex = -1;
        let dateColIndex = -1;

        for (let r = 0; r < Math.min(rows.length, 6); r++) {
          const row = rows[r];
          for (let c = 0; c < row.length; c++) {
            const cell = String(row[c] || '').trim().toLowerCase();
            if (cell === 'data' || cell === 'date' || cell === 'dia' || cell.includes('data')) {
              headerRowIndex = r;
              dateColIndex = c;
              break;
            }
          }
          if (headerRowIndex !== -1) break;
        }

        // Se não achou 'data' explicitamente, assume a linha 0 como cabeçalho e coluna 0 como data
        if (headerRowIndex === -1) {
          headerRowIndex = 0;
          dateColIndex = 0;
        }

        const headerRow = rows[headerRowIndex];

        // 2. Identifica as colunas de Turma
        const turmas: ParsedTurmaColumn[] = [];
        for (let c = 0; c < headerRow.length; c++) {
          if (c === dateColIndex) continue;

          const colTitle = String(headerRow[c] || '').trim();
          if (!colTitle) continue;

          const { nivel, turno } = parseNivelETurno(colTitle);
          turmas.push({
            colIndex: c,
            nome: colTitle,
            nivel,
            turno
          });
        }

        if (turmas.length === 0) {
          return resolve({
            success: false,
            error: 'Não foi possível reconhecer as colunas de turma na planilha.',
            sheetName,
            turmas: [],
            datas: [],
            entries: [],
            previewRows: []
          });
        }

        // 3. Processa cada linha subsequente
        const entries: ParsedCronogramaEntry[] = [];
        const datasSet = new Set<string>();
        const previewRows: Array<{
          dataLabel: string;
          isoDate: string;
          temas: Record<string, string>;
        }> = [];

        for (let r = headerRowIndex + 1; r < rows.length; r++) {
          const row = rows[r];
          if (!row || row.length === 0) continue;

          const dateCell = row[dateColIndex];
          const parsedDate = normalizeDate(dateCell, 2026);

          if (!parsedDate) continue;

          datasSet.add(parsedDate.isoDate);

          const rowTemas: Record<string, string> = {};

          turmas.forEach((turma) => {
            const rawTheme = row[turma.colIndex];
            const tema = String(rawTheme || '').trim();

            if (tema) {
              rowTemas[turma.nome] = tema;

              entries.push({
                turma_nome: turma.nome,
                nivel: turma.nivel,
                turno: turma.turno,
                data_aula: parsedDate.isoDate,
                formatted_label: parsedDate.label,
                tema_aula: tema
              });
            } else {
              rowTemas[turma.nome] = '—';
            }
          });

          previewRows.push({
            dataLabel: parsedDate.label,
            isoDate: parsedDate.isoDate,
            temas: rowTemas
          });
        }

        resolve({
          success: true,
          sheetName,
          turmas,
          datas: Array.from(datasSet).sort(),
          entries,
          previewRows
        });
      } catch (err: any) {
        resolve({
          success: false,
          error: `Erro ao processar o arquivo Excel: ${err?.message || 'Arquivo corrompido ou formato não suportado'}`,
          sheetName: '',
          turmas: [],
          datas: [],
          entries: [],
          previewRows: []
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        error: 'Falha ao ler o arquivo no navegador.',
        sheetName: '',
        turmas: [],
        datas: [],
        entries: [],
        previewRows: []
      });
    };

    reader.readAsArrayBuffer(file);
  });
}

// Gera e dispara o download da planilha modelo em Excel (.xlsx) com a grade padrão do 4ANDAR
export function downloadCronogramaTemplate(
  turmas: string[] = [
    'I2 Manhã',
    'I1 Tarde',
    'B1 Manhã',
    'B2 Manhã',
    'B2 Tarde',
    'I1 Manhã',
    'B1 Tarde'
  ]
) {
  const headers = ['Data', ...turmas];

  // Gera alguns sábados de exemplo
  const sampleData = [
    headers,
    [
      'sábado, 04/01',
      'Ano Novo - SEM AULA',
      'Ano Novo - SEM AULA',
      'Ano Novo - SEM AULA',
      'Ano Novo - SEM AULA',
      'Ano Novo - SEM AULA',
      'Ano Novo - SEM AULA',
      'Ano Novo - SEM AULA'
    ],
    [
      'sábado, 11/01',
      'Esmeril Quebrado',
      'Revisão de Contratempo',
      'Passo Básico',
      'Ritmo',
      'Ritmo',
      'Revisão de Contratempo',
      'Passo Básico'
    ],
    [
      'sábado, 18/01',
      'Esmeril Invertido',
      'Banana c contra',
      'Xaxadinho',
      'Musicalidade',
      'Musicalidade',
      'Banana c contra',
      'Xaxadinho'
    ],
    [
      'sábado, 25/01',
      'Miudinho',
      'Chuveirinho c Contra',
      'Deslocamento 1',
      'Breques',
      'Breques',
      'Chuveirinho c Contra',
      'Deslocamento 1'
    ],
    [
      'sábado, 01/02',
      'Sacada com Pescada',
      'Sinistro',
      'Deslocamento 2',
      'Revisão Meio Giro',
      'Revisão Meio Giro',
      'Sinistro',
      'Deslocamento 2'
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet(sampleData);

  // Define larguras das colunas
  ws['!cols'] = [
    { wch: 18 }, // Data
    { wch: 22 }, // I2 Manhã
    { wch: 24 }, // I1 Tarde
    { wch: 22 }, // B1 Manhã
    { wch: 22 }, // B2 Manhã
    { wch: 22 }, // B2 Tarde
    { wch: 24 }, // I1 Manhã
    { wch: 22 }  // B1 Tarde
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Planejamento Anual');

  XLSX.writeFile(wb, 'modelo_planejamento_4andar.xlsx');
}

// Exporta o cronograma completo atual do sistema para Excel (.xlsx)
export function exportCurrentScheduleToExcel(
  aulas: Aula[],
  cronogramas: { aula_id: string; data_aula: string; tema_aula: string }[],
  filename: string = 'planejamento_4andar_exportado.xlsx'
) {
  // Ordena aulas por nível e turno
  const sortedAulas = [...aulas].sort((a, b) => a.nome.localeCompare(b.nome));
  const headers = ['Data', ...sortedAulas.map((a) => a.nome)];

  // Agrupa todas as datas únicas
  const allDates = Array.from(new Set(cronogramas.map((c) => c.data_aula))).sort();

  const rows: any[][] = [headers];

  allDates.forEach((isoDate) => {
    const [y, m, d] = isoDate.split('-');
    const label = `sábado, ${d}/${m}`;
    const row = [label];

    sortedAulas.forEach((aula) => {
      const crono = cronogramas.find(
        (c) => c.aula_id === aula.id && c.data_aula === isoDate
      );
      row.push(crono?.tema_aula || '');
    });

    rows.push(row);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Planejamento');

  XLSX.writeFile(wb, filename);
}
