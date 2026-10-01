import * as XLSX from 'xlsx';
import { Aula, NivelForro } from '../types';

export interface ParsedCronogramaEntry {
  turma_nome: string;
  nivel: NivelForro;
  turno: 'Manhã' | 'Tarde' | 'Noite';
  data_aula: string; // YYYY-MM-DD
  formatted_label: string; // Ex: sábado, 17/01
  tema_aula: string;
  professor?: string;
  is_inicio_modulo?: boolean;
  is_sem_aula?: boolean;
  observacoes?: string;
}

export interface ParsedTurmaColumn {
  colIndex?: number;
  rowIndex?: number;
  nome: string;
  nivel: NivelForro;
  turno: 'Manhã' | 'Tarde' | 'Noite';
}

export interface ExcelParseResult {
  success: boolean;
  error?: string;
  sheetName: string;
  availableSheets: string[];
  formatDetected: 'matriz_f4a_horizontal' | 'tabela_vertical' | 'desconhecido';
  turmas: ParsedTurmaColumn[];
  datas: string[];
  entries: ParsedCronogramaEntry[];
  previewRows: Array<{
    dataLabel: string;
    isoDate: string;
    temas: Record<string, string>;
    professores?: Record<string, string>;
    isModulo?: Record<string, boolean>;
  }>;
  stats: {
    totalAulas: number;
    totalDatas: number;
    totalTurmas: number;
    totalProfessores: number;
    modulosCount: number;
  };
}

// Auxiliar para extrair nível e turno a partir do nome da turma (ex: "I2 Manhã", "Básico 1 - Tarde", "B2")
export function parseNivelETurno(nome: string): {
  nivel: NivelForro;
  turno: 'Manhã' | 'Tarde' | 'Noite';
} {
  const upper = nome.toUpperCase();

  let nivel: NivelForro = 'B1';
  if (upper.includes('I2') || upper.includes('INTER 2') || upper.includes('INTERMEDIÁRIO 2') || upper.includes('INTERMEDIARIO 2')) {
    nivel = 'I2';
  } else if (upper.includes('I1') || upper.includes('INTER 1') || upper.includes('INTERMEDIÁRIO 1') || upper.includes('INTERMEDIARIO 1')) {
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

  // Se for número serial de data do Excel (ex: 46039, 44933)
  if (typeof val === 'number' && val > 30000 && val < 60000) {
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

// Analisador principal de planilhas Excel (.xlsx, .xls, .csv) com suporte inteligente à estrutura da escola F4A
export async function parseCronogramaExcel(
  file: File,
  targetSheetName?: string
): Promise<ExcelParseResult> {
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
            availableSheets: [],
            formatDetected: 'desconhecido',
            turmas: [],
            datas: [],
            entries: [],
            previewRows: [],
            stats: { totalAulas: 0, totalDatas: 0, totalTurmas: 0, totalProfessores: 0, modulosCount: 0 }
          });
        }

        const workbook = XLSX.read(buffer, { type: 'array' });
        const availableSheets = workbook.SheetNames || [];

        if (availableSheets.length === 0) {
          return resolve({
            success: false,
            error: 'Nenhuma aba encontrada na planilha.',
            sheetName: '',
            availableSheets: [],
            formatDetected: 'desconhecido',
            turmas: [],
            datas: [],
            entries: [],
            previewRows: [],
            stats: { totalAulas: 0, totalDatas: 0, totalTurmas: 0, totalProfessores: 0, modulosCount: 0 }
          });
        }

        // Escolhe a aba apropriada: se o usuário escolheu, usa a dele; senão busca por prioridade
        let sheetName = targetSheetName && availableSheets.includes(targetSheetName) ? targetSheetName : '';
        if (!sheetName) {
          const priority = [
            'CRONOGRAMA e EQUIPE',
            '2023 CRONOGRAMA e EQUIPE',
            'Planejamento 2026',
            'CRONOGRAMA',
            'CRONOGRAMAS',
            'PLANEJAMENTO',
            'Planejamento Anual'
          ];
          for (const p of priority) {
            const found = availableSheets.find((s) => s.trim().toLowerCase() === p.toLowerCase());
            if (found) {
              sheetName = found;
              break;
            }
          }
        }
        if (!sheetName) {
          sheetName = availableSheets[0];
        }

        const worksheet = workbook.Sheets[sheetName];
        const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: ''
        });

        if (!rows || rows.length < 2) {
          return resolve({
            success: false,
            error: `A aba "${sheetName}" não contém linhas suficientes de dados.`,
            sheetName,
            availableSheets,
            formatDetected: 'desconhecido',
            turmas: [],
            datas: [],
            entries: [],
            previewRows: [],
            stats: { totalAulas: 0, totalDatas: 0, totalTurmas: 0, totalProfessores: 0, modulosCount: 0 }
          });
        }

        // 1. Extrai recessos e feriados da aba CALENDÁRIO se presente no mesmo arquivo
        const recessMap: Record<string, string> = {};
        if (workbook.Sheets['CALENDÁRIO']) {
          const calData: any[][] = XLSX.utils.sheet_to_json(workbook.Sheets['CALENDÁRIO'], {
            header: 1,
            defval: ''
          });
          for (let r = 20; r < Math.min(calData.length, 50); r++) {
            const row = calData[r];
            for (let c = 0; c < row.length; c++) {
              const cell = String(row[c]).toUpperCase();
              if (cell.includes('RECESSO') || cell.includes('CARNAVAL') || cell.includes('SÃO JOÃO')) {
                const dateText = String(row[c - 1] || row[c - 2] || '');
                if (dateText.includes('03 JANEIRO')) recessMap['2026-01-03'] = 'SEM AULA - RECESSO';
                if (dateText.includes('10 JANEIRO')) recessMap['2026-01-10'] = 'SEM AULA - RECESSO';
                if (dateText.includes('13 FEVEREIRO') || dateText.includes('14 FEVEREIRO')) recessMap['2026-02-14'] = 'SEM AULA - CARNAVAL';
                if (dateText.includes('20 JUNHO')) recessMap['2026-06-20'] = 'SEM AULA - SÃO JOÃO';
                if (dateText.includes('19 DEZEMBRO')) recessMap['2026-12-19'] = 'SEM AULA - RECESSO';
                if (dateText.includes('26 DEZEMBRO')) recessMap['2026-12-26'] = 'SEM AULA - RECESSO';
              }
            }
          }
        }

        // 2. Extrai Início de Módulo se presente na aba (ex: linhas 19-26 da aba CRONOGRAMA e EQUIPE)
        const moduloStartsMap: Record<string, Set<string>> = {}; // turmaNome -> Set de isoDates
        let inicioModuloRowIdx = -1;
        for (let r = 0; r < rows.length; r++) {
          const c0 = String(rows[r][0] || '').trim().toUpperCase();
          if (c0.includes('INÍCIO DE MÓDULO') || c0.includes('INICIO DE MODULO')) {
            inicioModuloRowIdx = r;
            break;
          }
        }

        if (inicioModuloRowIdx !== -1) {
          for (let r = inicioModuloRowIdx + 1; r < Math.min(rows.length, inicioModuloRowIdx + 12); r++) {
            const row = rows[r];
            const tLabel = String(row[0] || '').trim();
            if (!tLabel) continue;
            const { nivel, turno } = parseNivelETurno(tLabel);
            const standardTurmaName = `${nivel} ${turno}`;

            if (!moduloStartsMap[standardTurmaName]) {
              moduloStartsMap[standardTurmaName] = new Set();
            }

            for (let c = 1; c < row.length; c++) {
              const val = row[c];
              if (val) {
                const norm = normalizeDate(val);
                if (norm) {
                  moduloStartsMap[standardTurmaName].add(norm.isoDate);
                }
              }
            }
          }
        }

        // 3. DETECÇÃO DE LAYOUT:
        // Verifica se é o FORMATO F4A (Matriz Horizontal com datas nas colunas)
        let horizontalDateRowIndex = -1;
        let horizontalDateCols: Array<{ col: number; isoDate: string; label: string }> = [];

        for (let r = 0; r < Math.min(rows.length, 25); r++) {
          const row = rows[r];
          const candidates: Array<{ col: number; isoDate: string; label: string }> = [];
          for (let c = 1; c < row.length; c++) {
            const parsed = normalizeDate(row[c]);
            if (parsed) {
              candidates.push({ col: c, ...parsed });
            }
          }
          if (candidates.length >= 6) {
            horizontalDateRowIndex = r;
            horizontalDateCols = candidates;
            break;
          }
        }

        // Se encontrou linha horizontal com 6 ou mais datas: FORMATO MATRIZ F4A
        if (horizontalDateRowIndex !== -1 && horizontalDateCols.length > 0) {
          const turmasFound: Array<{
            rowIdx: number;
            label: string;
            nome: string;
            nivel: NivelForro;
            turno: 'Manhã' | 'Tarde' | 'Noite';
          }> = [];

          for (let r = 0; r < rows.length; r++) {
            const label = String(rows[r][0] || '').trim();
            if (!label) continue;
            if (label.toUpperCase().includes('INÍCIO DE MÓDULO') || label.toUpperCase().includes('EQUIPE')) continue;

            const isClass =
              label.toLowerCase().includes('básico') ||
              label.toLowerCase().includes('basico') ||
              label.toLowerCase().includes('inter') ||
              label.match(/^(B1|B2|I1|I2)\s*(Manhã|Tarde|Noite)?/i);

            if (isClass) {
              const { nivel, turno } = parseNivelETurno(label);
              turmasFound.push({
                rowIdx: r,
                label,
                nome: `${nivel} ${turno}`,
                nivel,
                turno
              });
            }
          }

          if (turmasFound.length > 0) {
            // Processa a matriz horizontal oficial F4A
            const entries: ParsedCronogramaEntry[] = [];
            const datasSet = new Set<string>();
            const teachersSet = new Set<string>();
            let modulosCount = 0;

            const previewMap: Record<
              string,
              {
                dataLabel: string;
                isoDate: string;
                temas: Record<string, string>;
                professores: Record<string, string>;
                isModulo: Record<string, boolean>;
              }
            > = {};

            horizontalDateCols.forEach((d) => {
              datasSet.add(d.isoDate);
              previewMap[d.isoDate] = {
                dataLabel: d.label,
                isoDate: d.isoDate,
                temas: {},
                professores: {},
                isModulo: {}
              };
            });

            turmasFound.forEach((turma, idx) => {
              const nextRowIdx = idx + 1 < turmasFound.length ? turmasFound[idx + 1].rowIdx : rows.length;
              const hasPairedRow = nextRowIdx - turma.rowIdx >= 2;

              const rowProfOrStart = rows[turma.rowIdx];
              const rowTema = hasPairedRow ? rows[turma.rowIdx + 1] : null;

              horizontalDateCols.forEach((d) => {
                const cellVal1 = String(rowProfOrStart[d.col] || '').trim();
                const cellVal2 = rowTema ? String(rowTema[d.col] || '').trim() : '';

                let professor = '';
                let tema = '';

                // Se houver recesso do calendário nesta data
                if (recessMap[d.isoDate]) {
                  tema = recessMap[d.isoDate];
                } else if (hasPairedRow) {
                  if (cellVal1 && cellVal2) {
                    professor = cellVal1;
                    tema = cellVal2;
                  } else if (cellVal2 && !cellVal1) {
                    tema = cellVal2;
                  } else if (cellVal1 && !cellVal2) {
                    // Pode ser apenas professor ou apenas tema
                    if (cellVal1.length <= 15 && cellVal1 === cellVal1.toUpperCase()) {
                      professor = cellVal1;
                      tema = `Aula com ${cellVal1}`;
                    } else {
                      tema = cellVal1;
                    }
                  }
                } else {
                  tema = cellVal1;
                }

                if (professor) {
                  teachersSet.add(professor);
                }

                const isModulo =
                  tema.toLowerCase().includes('início') ||
                  tema.toLowerCase().includes('inicio') ||
                  Boolean(moduloStartsMap[turma.nome]?.has(d.isoDate));

                if (isModulo) {
                  modulosCount++;
                  if (!tema.toLowerCase().includes('início') && !tema.toLowerCase().includes('inicio')) {
                    tema = tema ? `Início Módulo - ${tema}` : 'Início de Módulo';
                  }
                }

                if (tema || professor) {
                  const finalTema = tema || (professor ? `Aula com ${professor}` : 'Planejamento Regular');
                  entries.push({
                    turma_nome: turma.nome,
                    nivel: turma.nivel,
                    turno: turma.turno,
                    data_aula: d.isoDate,
                    formatted_label: d.label,
                    tema_aula: finalTema,
                    professor: professor || undefined,
                    is_inicio_modulo: isModulo,
                    is_sem_aula: finalTema.includes('SEM AULA'),
                    observacoes: professor ? `Prof: ${professor}` : undefined
                  });

                  previewMap[d.isoDate].temas[turma.nome] = finalTema;
                  if (professor) previewMap[d.isoDate].professores[turma.nome] = professor;
                  if (isModulo) previewMap[d.isoDate].isModulo[turma.nome] = true;
                } else {
                  previewMap[d.isoDate].temas[turma.nome] = '—';
                }
              });
            });

            const uniqueDatas = Array.from(datasSet).sort();
            const previewRows = uniqueDatas.map((iso) => previewMap[iso]);

            return resolve({
              success: true,
              sheetName,
              availableSheets,
              formatDetected: 'matriz_f4a_horizontal',
              turmas: turmasFound.map((t) => ({
                rowIndex: t.rowIdx,
                nome: t.nome,
                nivel: t.nivel,
                turno: t.turno
              })),
              datas: uniqueDatas,
              entries,
              previewRows,
              stats: {
                totalAulas: entries.length,
                totalDatas: uniqueDatas.length,
                totalTurmas: turmasFound.length,
                totalProfessores: teachersSet.size,
                modulosCount
              }
            });
          }
        }

        // 4. FORMATO ALTERNATIVO: TABELA VERTICAL (Datas nas linhas, turmas nas colunas)
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

        if (headerRowIndex === -1) {
          headerRowIndex = 0;
          dateColIndex = 0;
        }

        const headerRow = rows[headerRowIndex];
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
            error: 'Não foi possível reconhecer o formato da grade na aba selecionada.',
            sheetName,
            availableSheets,
            formatDetected: 'desconhecido',
            turmas: [],
            datas: [],
            entries: [],
            previewRows: [],
            stats: { totalAulas: 0, totalDatas: 0, totalTurmas: 0, totalProfessores: 0, modulosCount: 0 }
          });
        }

        const entries: ParsedCronogramaEntry[] = [];
        const datasSet = new Set<string>();
        const previewRows: any[] = [];

        for (let r = headerRowIndex + 1; r < rows.length; r++) {
          const row = rows[r];
          if (!row || row.length === 0) continue;

          const dateCell = row[dateColIndex];
          const parsedDate = normalizeDate(dateCell, 2026);
          if (!parsedDate) continue;

          datasSet.add(parsedDate.isoDate);
          const rowTemas: Record<string, string> = {};

          turmas.forEach((turma) => {
            const rawTheme = row[turma.colIndex!];
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

        const uniqueDatas = Array.from(datasSet).sort();

        resolve({
          success: true,
          sheetName,
          availableSheets,
          formatDetected: 'tabela_vertical',
          turmas,
          datas: uniqueDatas,
          entries,
          previewRows,
          stats: {
            totalAulas: entries.length,
            totalDatas: uniqueDatas.length,
            totalTurmas: turmas.length,
            totalProfessores: 0,
            modulosCount: 0
          }
        });
      } catch (err: any) {
        resolve({
          success: false,
          error: `Erro ao processar o arquivo Excel: ${err?.message || 'Arquivo corrompido ou formato não suportado'}`,
          sheetName: '',
          availableSheets: [],
          formatDetected: 'desconhecido',
          turmas: [],
          datas: [],
          entries: [],
          previewRows: [],
          stats: { totalAulas: 0, totalDatas: 0, totalTurmas: 0, totalProfessores: 0, modulosCount: 0 }
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        error: 'Falha ao ler o arquivo no navegador.',
        sheetName: '',
        availableSheets: [],
        formatDetected: 'desconhecido',
        turmas: [],
        datas: [],
        entries: [],
        previewRows: [],
        stats: { totalAulas: 0, totalDatas: 0, totalTurmas: 0, totalProfessores: 0, modulosCount: 0 }
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
    'B1 Tarde',
    'I2 Tarde'
  ]
) {
  const headers = ['Data', ...turmas];

  const sampleData = [
    headers,
    [
      'sábado, 03/01',
      'SEM AULA - RECESSO',
      'SEM AULA - RECESSO',
      'SEM AULA - RECESSO',
      'SEM AULA - RECESSO',
      'SEM AULA - RECESSO',
      'SEM AULA - RECESSO',
      'SEM AULA - RECESSO',
      'SEM AULA - RECESSO'
    ],
    [
      'sábado, 17/01',
      'Turma junta (Prof: Davidson)',
      'Avião com Contratempo (Prof: Gão)',
      'Passo Básico (Prof: Bia)',
      'Início Módulo - Musicalidade (Prof: Tony)',
      'Passo de Cintura (Prof: Taz)',
      'Sacada/Meia-lua (Prof: Davidson)',
      'Passo Básico (Prof: Messias)',
      'Trocadilho'
    ],
    [
      'sábado, 24/01',
      'Passo de perna',
      'Avião (+Variações)',
      'Giro Simples',
      'Especial',
      'Esmeril junto',
      'Sequência de caracol',
      'Meio Giro Trás/Frente',
      'Trocadilho inverso'
    ],
    [
      'sábado, 14/02',
      'SEM AULA - CARNAVAL',
      'SEM AULA - CARNAVAL',
      'SEM AULA - CARNAVAL',
      'SEM AULA - CARNAVAL',
      'SEM AULA - CARNAVAL',
      'SEM AULA - CARNAVAL',
      'SEM AULA - CARNAVAL',
      'SEM AULA - CARNAVAL'
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet(sampleData);
  ws['!cols'] = [
    { wch: 18 }, // Data
    { wch: 24 },
    { wch: 24 },
    { wch: 24 },
    { wch: 26 },
    { wch: 24 },
    { wch: 24 },
    { wch: 24 },
    { wch: 24 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'CRONOGRAMA e EQUIPE');

  XLSX.writeFile(wb, 'modelo_planejamento_4andar_oficial.xlsx');
}

// Exporta o cronograma completo atual do sistema para Excel (.xlsx)
export function exportCurrentScheduleToExcel(
  aulas: Aula[],
  cronogramas: { aula_id: string; data_aula: string; tema_aula: string; observacoes?: string }[],
  filename: string = 'planejamento_4andar_exportado.xlsx'
) {
  const sortedAulas = [...aulas].sort((a, b) => a.nome.localeCompare(b.nome));
  const headers = ['Data', ...sortedAulas.map((a) => a.nome)];

  const allDates = Array.from(new Set(cronogramas.map((c) => c.data_aula))).sort();
  const rows: any[][] = [headers];

  allDates.forEach((isoDate) => {
    const parts = isoDate.split('-');
    const label = parts.length === 3 ? `sábado, ${parts[2]}/${parts[1]}` : isoDate;
    const row = [label];

    sortedAulas.forEach((aula) => {
      const crono = cronogramas.find(
        (c) => c.aula_id === aula.id && c.data_aula === isoDate
      );
      let cellText = crono?.tema_aula || '';
      if (crono?.observacoes && !cellText.includes(crono.observacoes)) {
        cellText += ` (${crono.observacoes})`;
      }
      row.push(cellText);
    });

    rows.push(row);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'CRONOGRAMA e EQUIPE');

  XLSX.writeFile(wb, filename);
}
