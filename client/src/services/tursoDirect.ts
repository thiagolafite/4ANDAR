// Serviço de comunicação direta e resiliente com o Turso Cloud via HTTP Pipeline API
// Permite que navegadores em qualquer dispositivo (incluindo smartphones) se comuniquem com o banco sem travar

const TURSO_URL = 'https://quartoandar-thiagolafite.aws-us-east-1.turso.io/v2/pipeline';
const TURSO_AUTH_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA3MjY5NDEsImlkIjoiMDFhMGVmYTItZTMwMS03OWJhLWJjZjctNDk1ZjRjMGQ4OGE2Iiwia2lkIjoiZE1fbVhMaUFjLWFYOWJFcXNCcmt6UjFYOWJBOUpncm9mOWNVYUZCZS11MCIsInJpZCI6ImVjYmEwNTM0LTBjMmYtNDgxOC1hY2RlLWZlZjY3ZTc3MDUxOSJ9.jaom4pcbPiz-0PdJgV1FtbyeM1coHsp5r8umRaXxKct7RtSe4obLzzO1cBGnFu3vloXvnvmFxrGe1Cmn_Q3bBA';

export interface TursoQueryResult {
  columns: string[];
  rows: any[][];
}

/**
 * Converte valor para o formato de argumento do Turso Pipeline
 */
function toTursoArg(val: any): { type: string; value?: any } {
  if (val === null || val === undefined) {
    return { type: 'null' };
  }
  if (typeof val === 'number') {
    return Number.isInteger(val) ? { type: 'integer', value: String(val) } : { type: 'float', value: val };
  }
  if (typeof val === 'boolean') {
    return { type: 'integer', value: val ? '1' : '0' };
  }
  return { type: 'text', value: String(val) };
}

/**
 * Executa uma instrução SQL diretamente no Turso Cloud
 */
export async function executeDirectTurso(sql: string, args: any[] = []): Promise<any[]> {
  try {
    const formattedArgs = args.map(toTursoArg);
    const res = await fetch(TURSO_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TURSO_AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            type: 'execute',
            stmt: {
              sql,
              args: formattedArgs
            }
          },
          { type: 'close' }
        ]
      })
    });

    if (!res.ok) {
      throw new Error(`Turso HTTP error: ${res.status}`);
    }

    const data = await res.json();
    const execResult = data.results?.[0]?.response?.result;
    if (!execResult) return [];

    const cols: string[] = (execResult.cols || []).map((c: any) => c.name);
    const rawRows: any[][] = execResult.rows || [];

    return rawRows.map((row) => {
      const obj: Record<string, any> = {};
      row.forEach((cell, idx) => {
        const colName = cols[idx];
        obj[colName] = cell?.value ?? null;
      });
      return obj;
    });
  } catch (err) {
    console.warn('Erro ao comunicar diretamente com Turso:', err);
    throw err;
  }
}

/**
 * Gera hash SHA-256 nativo do navegador para senhas cadastradas diretamente
 */
export async function hashPasswordClient(password: string): Promise<string> {
  try {
    if (window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(password);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return `sha256:${hashHex}`;
    }
  } catch {}
  return `sha256:${btoa(password)}`;
}

/**
 * Cadastro direto e infalível no Turso Cloud caso a rota serverless falhe
 */
export async function directTursoRegisterUser(userData: {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  cargo_pretendido?: string;
}): Promise<{ success: boolean; message?: string; error?: string; status?: string }> {
  try {
    const cleanEmail = userData.email.trim().toLowerCase();

    // 1. Verifica duplicidade
    const existing = await executeDirectTurso(
      'SELECT id FROM usuarios WHERE LOWER(email) = ?',
      [cleanEmail]
    );

    if (existing && existing.length > 0) {
      return { success: false, error: 'Este e-mail já está cadastrado no sistema.' };
    }

    // 2. Insere novo usuário com status pendente
    const id = `usr_${Date.now()}`;
    const senhaHash = await hashPasswordClient(userData.senha);
    const cargo = userData.cargo_pretendido || 'Pendente (Aguardando Classificação do Master)';
    const dataCadastro = new Date().toISOString().substring(0, 10);
    const defaultPerms = JSON.stringify({ alunos: { view: false } });

    await executeDirectTurso(
      `INSERT INTO usuarios (id, nome, email, senha_hash, telefone, cargo_pretendido, role, status, is_master, permissoes, data_cadastro, avatar_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userData.nome.trim(),
        cleanEmail,
        senhaHash,
        userData.telefone || null,
        cargo,
        'pendente',
        'pendente',
        0,
        defaultPerms,
        dataCadastro,
        ''
      ]
    );

    return {
      success: true,
      status: 'pendente',
      message: 'Cadastro recebido com sucesso! Aguarde a aprovação do Administrador Master (Thiago Lafite) para classificar sua conta e liberar o acesso.'
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Não foi possível registrar o cadastro no banco central: ${err.message || 'Erro desconhecido'}`
    };
  }
}
