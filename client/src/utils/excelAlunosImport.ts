import * as XLSX from 'xlsx';
import { Aluno, NivelForro, PapelDanca } from '../types';

export interface ParsedAlunoItem extends Omit<Aluno, 'id'> {
  id?: string;
  linha_planilha?: number;
  aba_origem?: string;
  aviso_validacao?: string;
}

export interface ExcelAlunosParseResult {
  success: boolean;
  error?: string;
  sheetNames: string[];
  selectedSheet: string;
  alunos: ParsedAlunoItem[];
  stats: {
    total: number;
    mensalistas: number;
    avulsos: number;
    experimentais: number;
    porNivel: Record<string, number>;
  };
}

// Normaliza texto para comparação sem acentos e minúsculo
function normalize(str: any): string {
  if (typeof str !== 'string') return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

// Converte número de telefone para formato legível (71) 98888-8888
function formatTelefone(val: any): string {
  if (!val) return '';
  const digits = String(val).replace(/\D/g, '');
  if (!digits) return '';

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 9) {
    return `(71) ${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  if (digits.length === 8) {
    return `(71) 9${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  return String(val).trim();
}

// Mapeia texto para nível do forró
function parseNivel(val: any, fallback: NivelForro = 'B1'): NivelForro {
  const norm = normalize(val);
  if (norm.includes('i2') || norm.includes('inter 2') || norm.includes('intermediario 2')) return 'I2';
  if (norm.includes('i1') || norm.includes('inter 1') || norm.includes('intermediario 1')) return 'I1';
  if (norm.includes('b2') || norm.includes('basico 2')) return 'B2';
  if (norm.includes('b1') || norm.includes('basico 1') || norm.includes('iniciante')) return 'B1';
  return fallback;
}

// Mapeia texto para papel da dança
function parsePapel(val: any): PapelDanca {
  const norm = normalize(val);
  if (norm.includes('conduzid')) return 'Conduzido';
  if (norm.includes('ambos') || norm.includes('ambas') || norm.includes('dois')) return 'Ambos';
  return 'Condutor';
}

// Mapeia texto para tipo de frequência
function parseTipoFrequencia(val: any, defaultType: 'mensalista' | 'avulso' | 'experimental' = 'mensalista'): 'mensalista' | 'avulso' | 'experimental' {
  const norm = normalize(val);
  if (norm.includes('inaugural') || norm.includes('experimental') || norm.includes('gratuita') || norm.includes('teste')) return 'experimental';
  if (norm.includes('avulso') || norm.includes('avulsa')) return 'avulso';
  return defaultType;
}

// Gera e-mail fictício padronizado caso a planilha não tenha
function generateFallbackEmail(nome: string): string {
  const clean = nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .toLowerCase()
    .split(/\s+/);
  
  if (clean.length === 1) {
    return `${clean[0]}@aluno.4andar.com.br`;
  }
  const first = clean[0];
  const last = clean[clean.length - 1];
  return `${first}.${last}@aluno.4andar.com.br`;
}

/**
 * Analisa planilha Excel de alunos com suporte tanto ao formato oficial da escola F4A
 * (abas MANHÃ, TARDE, INAUGURAL E AVULSO) quanto a planilhas tabulares padrão.
 */
export function parseAlunosExcel(
  buffer: ArrayBuffer,
  targetSheetName?: string
): ExcelAlunosParseResult {
  try {
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetNames = workbook.SheetNames;

    if (!sheetNames || sheetNames.length === 0) {
      return {
        success: false,
        error: 'O arquivo Excel não contém nenhuma planilha legível.',
        sheetNames: [],
        selectedSheet: '',
        alunos: [],
        stats: { total: 0, mensalistas: 0, avulsos: 0, experimentais: 0, porNivel: {} }
      };
    }

    // Se o usuário selecionou uma aba específica ou 'TODAS'
    const sheetsToProcess: string[] = [];
    if (targetSheetName && targetSheetName !== 'TODAS') {
      if (workbook.Sheets[targetSheetName]) {
        sheetsToProcess.push(targetSheetName);
      }
    } else {
      // Prioriza abas típicas de alunos caso existam
      const abasConhecidas = sheetNames.filter((s) => {
        const n = normalize(s);
        return (
          n.includes('manha') ||
          n.includes('tarde') ||
          n.includes('inaugural') ||
          n.includes('aluno') ||
          n.includes('turma') ||
          n.includes('geral')
        );
      });

      if (abasConhecidas.length > 0) {
        sheetsToProcess.push(...abasConhecidas);
      } else {
        // Se não encontrar nomes conhecidos, processa a primeira aba
        sheetsToProcess.push(sheetNames[0]);
      }
    }

    const alunosParsed: ParsedAlunoItem[] = [];
    const nomesVistos = new Set<string>();

    for (const sName of sheetsToProcess) {
      const ws = workbook.Sheets[sName];
      if (!ws) continue;

      const rawRows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
      if (!rawRows || rawRows.length === 0) continue;

      // 1. Encontra a linha de cabeçalho
      let headerRowIdx = -1;
      let colIndices = {
        nome: -1,
        turma: -1,
        telefone: -1,
        email: -1,
        papel: -1,
        tipo: -1,
        mensalidade: -1,
        vencimento: -1
      };

      for (let rIdx = 0; rIdx < Math.min(10, rawRows.length); rIdx++) {
        const row = rawRows[rIdx];
        if (!row || !Array.isArray(row)) continue;

        row.forEach((cell, cIdx) => {
          const norm = normalize(cell);
          if (colIndices.nome === -1 && (norm === 'nome' || norm.includes('nome do aluno') || norm === 'aluno')) {
            colIndices.nome = cIdx;
          }
          if (colIndices.turma === -1 && (norm.includes('turma') || norm.includes('nivel') || norm === 'sala')) {
            colIndices.turma = cIdx;
          }
          if (colIndices.telefone === -1 && (norm.includes('celular') || norm.includes('telefone') || norm.includes('whatsapp') || norm.includes('contato'))) {
            colIndices.telefone = cIdx;
          }
          if (colIndices.email === -1 && (norm.includes('email') || norm.includes('e-mail'))) {
            colIndices.email = cIdx;
          }
          if (colIndices.papel === -1 && (norm.includes('papel') || norm.includes('funcao') || norm.includes('condu'))) {
            colIndices.papel = cIdx;
          }
          if (colIndices.tipo === -1 && (norm.includes('tipo de aula') || norm.includes('frequencia') || norm === 'tipo')) {
            colIndices.tipo = cIdx;
          }
          if (colIndices.mensalidade === -1 && (norm.includes('mensalidade') || norm.includes('valor') || norm.includes('preco'))) {
            colIndices.mensalidade = cIdx;
          }
          if (colIndices.vencimento === -1 && (norm.includes('vencimento') || norm.includes('dia'))) {
            colIndices.vencimento = cIdx;
          }
        });

        if (colIndices.nome !== -1) {
          headerRowIdx = rIdx;
          break;
        }
      }

      // Se não encontrou coluna explícita de nome, tenta assumir coluna 0 se tiver texto
      if (colIndices.nome === -1) {
        colIndices.nome = 0;
        headerRowIdx = 0;
      }

      // Define default type da aba
      const sNorm = normalize(sName);
      let defaultTipoAba: 'mensalista' | 'avulso' | 'experimental' = 'mensalista';
      if (sNorm.includes('inaugural')) {
        defaultTipoAba = 'experimental';
      } else if (sNorm.includes('avulso')) {
        defaultTipoAba = 'avulso';
      }

      // 2. Itera sobre as linhas de alunos
      for (let rIdx = headerRowIdx + 1; rIdx < rawRows.length; rIdx++) {
        const row = rawRows[rIdx];
        if (!row || !Array.isArray(row)) continue;

        const nomeRaw = row[colIndices.nome];
        if (!nomeRaw || typeof nomeRaw !== 'string') continue;

        const nomeClean = nomeRaw.trim();
        // Ignora totalizadores, cabeçalhos repetidos ou legendas
        if (
          nomeClean.length < 2 ||
          /^(total|observ|legenda|turma|subtotal|professor|status|obs)/i.test(nomeClean)
        ) {
          continue;
        }

        const nomeKey = normalize(nomeClean);
        if (nomesVistos.has(nomeKey)) {
          // Aluno já adicionado de outra aba
          continue;
        }
        nomesVistos.add(nomeKey);

        // Extrai telefone
        const rawTelefone = colIndices.telefone !== -1 ? row[colIndices.telefone] : '';
        const telefone = formatTelefone(rawTelefone);

        // Extrai turma / nível
        const rawTurma = colIndices.turma !== -1 ? row[colIndices.turma] : '';
        const nivel = parseNivel(rawTurma, 'B1');

        // Extrai papel
        const rawPapel = colIndices.papel !== -1 ? row[colIndices.papel] : '';
        const papel = parsePapel(rawPapel);

        // Extrai tipo de frequência
        const rawTipo = colIndices.tipo !== -1 ? row[colIndices.tipo] : '';
        const tipo_frequencia = parseTipoFrequencia(rawTipo, defaultTipoAba);

        // Extrai e-mail
        const rawEmail = colIndices.email !== -1 && typeof row[colIndices.email] === 'string' ? row[colIndices.email].trim() : '';
        const email = rawEmail && rawEmail.includes('@') ? rawEmail : generateFallbackEmail(nomeClean);

        // Mensalidade
        let mensalidade_valor = 190.0;
        if (tipo_frequencia === 'experimental') {
          mensalidade_valor = 0.0;
        } else if (tipo_frequencia === 'avulso') {
          mensalidade_valor = 50.0;
        } else if (colIndices.mensalidade !== -1 && typeof row[colIndices.mensalidade] === 'number') {
          mensalidade_valor = row[colIndices.mensalidade];
        }

        // Vencimento
        let dia_vencimento = 5;
        if (colIndices.vencimento !== -1 && typeof row[colIndices.vencimento] === 'number') {
          dia_vencimento = Math.min(31, Math.max(1, Math.round(row[colIndices.vencimento])));
        }

        const hojeIso = new Date().toISOString().substring(0, 10);

        alunosParsed.push({
          nome: nomeClean,
          telefone,
          email,
          nivel_atual: nivel,
          papel,
          mensalidade_valor,
          dia_vencimento,
          data_matricula: hojeIso,
          data_inicio_nivel: hojeIso,
          status: 'ativo',
          tipo_frequencia,
          linha_planilha: rIdx + 1,
          aba_origem: sName
        });
      }
    }

    // Métricas estatísticas
    const stats = {
      total: alunosParsed.length,
      mensalistas: alunosParsed.filter((a) => a.tipo_frequencia === 'mensalista').length,
      avulsos: alunosParsed.filter((a) => a.tipo_frequencia === 'avulso').length,
      experimentais: alunosParsed.filter((a) => a.tipo_frequencia === 'experimental').length,
      porNivel: {
        B1: alunosParsed.filter((a) => a.nivel_atual === 'B1').length,
        B2: alunosParsed.filter((a) => a.nivel_atual === 'B2').length,
        I1: alunosParsed.filter((a) => a.nivel_atual === 'I1').length,
        I2: alunosParsed.filter((a) => a.nivel_atual === 'I2').length
      }
    };

    return {
      success: true,
      sheetNames,
      selectedSheet: targetSheetName || (sheetsToProcess.length > 1 ? 'Todas as Abas' : sheetsToProcess[0]),
      alunos: alunosParsed,
      stats
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Falha ao processar arquivo Excel.',
      sheetNames: [],
      selectedSheet: '',
      alunos: [],
      stats: { total: 0, mensalistas: 0, avulsos: 0, experimentais: 0, porNivel: {} }
    };
  }
}

/**
 * Cria e baixa uma planilha modelo padrão em Excel (.xlsx) com colunas e linhas de exemplo.
 */
export function downloadModeloAlunosExcel(): void {
  const dadosModelo = [
    [
      'NOME COMPLETO',
      'TELEFONE / WHATSAPP',
      'EMAIL',
      'NÍVEL',
      'PAPEL NA DANÇA',
      'TIPO DE FREQUÊNCIA',
      'VALOR MENSALIDADE',
      'DIA VENCIMENTO'
    ],
    [
      'Mariana Silva Rocha',
      '(71) 98765-4321',
      'mariana.rocha@exemplo.com',
      'B1',
      'Conduzido',
      'Mensalista',
      190.0,
      10
    ],
    [
      'Carlos Eduardo Ferreira',
      '(71) 99123-4567',
      'carlos.edu@exemplo.com',
      'B2',
      'Condutor',
      'Mensalista',
      190.0,
      5
    ],
    [
      'Juliana Santos Lima',
      '(71) 98877-6655',
      'juliana.santos@exemplo.com',
      'B1',
      'Ambos',
      'Experimental',
      0.0,
      5
    ],
    [
      'Lucas Almeida Costa',
      '(71) 99234-5678',
      'lucas.almeida@exemplo.com',
      'I1',
      'Condutor',
      'Avulso',
      50.0,
      5
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet(dadosModelo);

  // Define largura das colunas
  ws['!cols'] = [
    { wch: 30 }, // Nome
    { wch: 22 }, // Telefone
    { wch: 30 }, // Email
    { wch: 10 }, // Nível
    { wch: 18 }, // Papel
    { wch: 20 }, // Tipo
    { wch: 18 }, // Valor
    { wch: 16 }  // Vencimento
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'MODELO ALUNOS');
  XLSX.writeFile(wb, 'modelo_importacao_alunos_4andar.xlsx');
}
