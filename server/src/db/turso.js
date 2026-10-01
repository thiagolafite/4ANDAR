import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { hashPassword, getDefaultPermissions } from '../services/authService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Turso Connection Options:
// - Se TURSO_DATABASE_URL for informado (ex.: libsql://meu-banco.turso.io) com TURSO_AUTH_TOKEN, conecta à nuvem do Turso.
// - Se não informado, utiliza arquivo local libSQL compatível (data/turso_local.db)
const dbUrl = process.env.TURSO_DATABASE_URL || `file:${path.join(__dirname, '../../data/turso_local.db')}`;
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

console.log(`🔌 Conectando ao Turso Database: ${dbUrl.startsWith('file:') ? 'Arquivo Local libSQL' : dbUrl}`);

export const turso = createClient({
  url: dbUrl,
  authToken: authToken
});

/**
 * Inicializa as tabelas do Turso e popula dados iniciais caso estejam vazias
 */
export const initTursoDatabase = async () => {
  try {
    // 1. Alunos
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS alunos (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        nome TEXT NOT NULL,
        telefone TEXT NOT NULL,
        email TEXT NOT NULL,
        nivel_atual TEXT NOT NULL,
        papel TEXT NOT NULL,
        mensalidade_valor REAL NOT NULL DEFAULT 190.0,
        dia_vencimento INTEGER NOT NULL DEFAULT 5,
        data_matricula TEXT NOT NULL,
        data_inicio_nivel TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'ativo',
        foto_url TEXT,
        observacoes TEXT
      );
    `);

    // 2. Equipe
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS equipe (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL,
        telefone TEXT,
        papel_equipe TEXT NOT NULL,
        especialidades TEXT,
        google_calendar_conectado INTEGER DEFAULT 0,
        ativo INTEGER DEFAULT 1,
        foto_url TEXT
      );
    `);

    // 3. Aulas
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS aulas (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        nivel TEXT NOT NULL,
        turno TEXT NOT NULL,
        dia_semana TEXT NOT NULL,
        horario_inicio TEXT NOT NULL,
        horario_fim TEXT NOT NULL,
        sala TEXT NOT NULL,
        equipe_id TEXT,
        capacidade_maxima INTEGER DEFAULT 24
      );
    `);

    // 4. Cronogramas
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS cronogramas (
        id TEXT PRIMARY KEY,
        aula_id TEXT NOT NULL,
        data_aula TEXT NOT NULL,
        tema_aula TEXT NOT NULL,
        observacoes TEXT
      );
    `);

    // 5. Presenças
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS presencas (
        id TEXT PRIMARY KEY,
        aluno_id TEXT NOT NULL,
        aula_id TEXT NOT NULL,
        data_presenca TEXT NOT NULL,
        status TEXT NOT NULL,
        data_solicitacao TEXT NOT NULL,
        confirmado_por TEXT
      );
    `);

    // 6. Pagamentos
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS pagamentos (
        id TEXT PRIMARY KEY,
        aluno_id TEXT NOT NULL,
        valor REAL NOT NULL,
        data_pagamento TEXT,
        data_vencimento TEXT NOT NULL,
        metodo TEXT NOT NULL,
        tipo TEXT NOT NULL DEFAULT 'Mensalidade',
        status TEXT NOT NULL,
        referencia_mes TEXT NOT NULL,
        comprovante_url TEXT
      );
    `);

    // 7. Nivelamentos
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS nivelamento_sessoes (
        id TEXT PRIMARY KEY,
        aluno_id TEXT NOT NULL,
        data_agendada TEXT NOT NULL,
        nivel_atual TEXT NOT NULL,
        nivel_alvo TEXT NOT NULL,
        papel TEXT NOT NULL,
        avaliador_aulao TEXT,
        avaliador_danca TEXT,
        avaliador_observa TEXT,
        status TEXT NOT NULL,
        resultado TEXT,
        feedback_aulao TEXT,
        feedback_danca TEXT,
        feedback_geral TEXT,
        notas TEXT
      );
    `);

    // 8. Eventos
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS eventos (
        id TEXT PRIMARY KEY,
        titulo TEXT NOT NULL,
        descricao TEXT,
        data_evento TEXT NOT NULL,
        horario TEXT NOT NULL,
        local TEXT NOT NULL,
        foto_url TEXT,
        preco REAL NOT NULL,
        vagas_limite INTEGER NOT NULL,
        vagas_preenchidas INTEGER DEFAULT 0,
        status TEXT DEFAULT 'Inscrições Abertas'
      );
    `);

    // 9. Avisos
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS avisos (
        id TEXT PRIMARY KEY,
        titulo TEXT NOT NULL,
        conteudo TEXT NOT NULL,
        data_publicacao TEXT NOT NULL,
        link_url TEXT,
        link_texto TEXT,
        fixado INTEGER DEFAULT 0,
        autor TEXT
      );
    `);

    // 10. Usuários e Controle de Acesso
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha_hash TEXT NOT NULL,
        telefone TEXT,
        cargo_pretendido TEXT DEFAULT 'Aluno',
        role TEXT NOT NULL DEFAULT 'aluno',
        status TEXT NOT NULL DEFAULT 'pendente',
        is_master INTEGER DEFAULT 0,
        permissoes TEXT NOT NULL,
        motivo_recusa TEXT,
        aprovado_por TEXT,
        data_cadastro TEXT NOT NULL,
        data_aprovacao TEXT,
        ultimo_acesso TEXT,
        avatar_url TEXT
      );
    `);

    // Migrações graduais seguras
    try {
      await turso.execute('ALTER TABLE usuarios ADD COLUMN aluno_id TEXT;');
    } catch {}
    try {
      await turso.execute('ALTER TABLE usuarios ADD COLUMN equipe_id TEXT;');
    } catch {}
    try {
      await turso.execute('ALTER TABLE alunos ADD COLUMN user_id TEXT;');
    } catch {}
    try {
      await turso.execute('ALTER TABLE equipe ADD COLUMN user_id TEXT;');
    } catch {}

    // Verifica se o Administrador Master existe
    const masterCheck = await turso.execute({
      sql: 'SELECT id FROM usuarios WHERE is_master = 1 OR email = ?',
      args: ['thiago.lafite@4andar.com.br']
    });

    if (masterCheck.rows.length === 0) {
      console.log('👑 Criando conta do Administrador Master (Thiago Lafite)...');
      const masterSenha = hashPassword('admin123');
      const masterPerms = JSON.stringify(getDefaultPermissions('master'));
      await turso.execute({
        sql: `INSERT INTO usuarios (id, nome, email, senha_hash, telefone, cargo_pretendido, role, status, is_master, permissoes, data_cadastro, data_aprovacao, avatar_url)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          'usr_master_thiago',
          'Thiago Lafite',
          'thiago.lafite@4andar.com.br',
          masterSenha,
          '(11) 99999-4444',
          'Administrador Master',
          'master',
          'aprovado',
          1,
          masterPerms,
          new Date().toISOString().substring(0, 10),
          new Date().toISOString().substring(0, 10),
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
        ]
      });
      console.log('✅ Administrador Master Thiago Lafite configurado no Turso!');
    }

    console.log('✅ Banco de dados pronto para operação.');
  } catch (err) {
    console.error('❌ Erro ao inicializar tabelas no Turso:', err);
  }
};
