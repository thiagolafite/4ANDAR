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

      // Cria um usuário pendente de demonstração para o Thiago poder aprovar e testar na interface
      const demoSenha = hashPassword('123456');
      const demoPerms = JSON.stringify(getDefaultPermissions('aluno'));
      await turso.execute({
        sql: `INSERT INTO usuarios (id, nome, email, senha_hash, telefone, cargo_pretendido, role, status, is_master, permissoes, data_cadastro, avatar_url)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          'usr_demo_pendente',
          'Juliana Mendes Ramos',
          'juliana.mendes@email.com',
          demoSenha,
          '(11) 98711-2233',
          'Aluno',
          'aluno',
          'pendente',
          0,
          demoPerms,
          new Date().toISOString().substring(0, 10),
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
        ]
      });
      console.log('✅ Administrador Master Thiago Lafite configurado no Turso!');
    }

    // Se a tabela de alunos estiver vazia, popula dados de demonstração
    const countCheck = await turso.execute('SELECT COUNT(*) as total FROM alunos');
    const total = Number(countCheck.rows[0].total);

    if (total === 0) {
      console.log('🌱 Populando dados iniciais no Turso Database...');

      // Seed Alunos
      await turso.execute({
        sql: `INSERT INTO alunos (id, nome, telefone, email, nivel_atual, papel, mensalidade_valor, dia_vencimento, data_matricula, data_inicio_nivel, status, foto_url, observacoes)
              VALUES 
              (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
              (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
              (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          'al_1', 'Carlos Eduardo Oliveira', '(11) 99123-4567', 'carlos.oliveira@email.com', 'B1', 'Condutor', 190.0, 5, '2026-06-10', '2026-06-10', 'ativo', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Foco no tempo 1 do Xote',
          'al_2', 'Camila Santos Rocha', '(11) 98234-5678', 'camila.rocha@email.com', 'B2', 'Conduzido', 190.0, 10, '2026-02-15', '2026-05-20', 'ativo', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'Aluna dedicada',
          'al_3', 'Rodrigo Alencar Lima', '(11) 97345-6789', 'rodrigo.alencar@email.com', 'I1', 'Condutor', 220.0, 15, '2025-08-01', '2026-03-12', 'ativo', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'Participa de workshops'
        ]
      });

      // Seed Equipe
      await turso.execute({
        sql: `INSERT INTO equipe (id, nome, email, telefone, papel_equipe, especialidades, google_calendar_conectado, ativo, foto_url)
              VALUES 
              (?, ?, ?, ?, ?, ?, ?, ?, ?),
              (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          'eq_1', 'Mariana Sol', 'mariana.sol@4andar.com.br', '(11) 98765-4321', 'Professor', JSON.stringify(['Forró Universitário', 'Conexão & Abraço']), 1, 1, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          'eq_2', 'Mestre Gonzaga Silva', 'gonzaga.silva@4andar.com.br', '(11) 97654-3210', 'Professor', JSON.stringify(['Pé de Serra', 'Baião & Arrasta-pé']), 1, 1, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
        ]
      });

      // Seed Aulas
      await turso.execute({
        sql: `INSERT INTO aulas (id, nome, nivel, turno, dia_semana, horario_inicio, horario_fim, sala, equipe_id, capacidade_maxima)
              VALUES 
              (?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
              (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          'aul_b1_noite', 'Básico 1 — Terça & Quinta (Noite)', 'B1', 'Noite', 'Terça', '19:30', '20:45', 'Salão Principal (Gonzagão)', 'eq_2', 24,
          'aul_b2_noite', 'Básico 2 — Segunda & Quarta (Noite)', 'B2', 'Noite', 'Quarta', '20:00', '21:15', 'Salão Principal (Gonzagão)', 'eq_1', 22
        ]
      });

      // Seed Cronogramas
      await turso.execute({
        sql: `INSERT INTO cronogramas (id, aula_id, data_aula, tema_aula, observacoes)
              VALUES 
              (?, ?, ?, ?, ?),
              (?, ?, ?, ?, ?)`,
        args: [
          'crono_1', 'aul_b1_noite', '2026-09-29', 'Giro simples e caminhadas no tempo 1 do Xote', 'Trazer foco no abraço e relaxamento dos ombros.',
          'crono_2', 'aul_b2_noite', '2026-09-30', 'Giro invertido com saída em travessia', 'Trabalho de tônus de braço na condução.'
        ]
      });

      // Seed Presenças
      await turso.execute({
        sql: `INSERT INTO presencas (id, aluno_id, aula_id, data_presenca, status, data_solicitacao, confirmado_por)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: ['pre_1', 'al_1', 'aul_b1_noite', '2026-09-29', 'confirmada', '2026-09-28 14:20', 'Mariana Sol']
      });

      // Seed Pagamentos
      await turso.execute({
        sql: `INSERT INTO pagamentos (id, aluno_id, valor, data_pagamento, data_vencimento, metodo, tipo, status, referencia_mes)
              VALUES 
              (?, ?, ?, ?, ?, ?, ?, ?, ?),
              (?, ?, ?, ?, ?, ?, ?, ?, ?),
              (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          'pag_1', 'al_1', 190.0, '2026-09-04', '2026-09-05', 'PIX', 'Mensalidade', 'Pago', 'Setembro/2026',
          'pag_2', 'al_1', 190.0, null, '2026-10-05', 'PIX', 'Mensalidade', 'Pendente', 'Outubro/2026',
          'pag_3', 'al_2', 190.0, null, '2026-09-10', 'PIX', 'Mensalidade', 'Atrasado', 'Setembro/2026'
        ]
      });

      // Seed Eventos
      await turso.execute({
        sql: `INSERT INTO eventos (id, titulo, descricao, data_evento, horario, local, foto_url, preco, vagas_limite, vagas_preenchidas, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: ['ev_1', 'Grande Forró do 4ANDAR com Trio Pé de Serra', 'Uma noite inesquecível de forró autêntico e xote com o Trio Zabumba Dourada.', '2026-10-17', '21:00 às 03:00', 'Salão Nobre do 4ANDAR', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600', 35.0, 150, 98, 'Inscrições Abertas']
      });

      // Seed Avisos
      await turso.execute({
        sql: `INSERT INTO avisos (id, titulo, conteudo, data_publicacao, link_url, link_texto, fixado, autor)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: ['av_1', '📢 Grupo Oficial de Alunos no WhatsApp', 'Entre no canal oficial de comunicação para materiais de estudo e playlists.', '2026-09-25', 'https://chat.whatsapp.com/exemplo-4andar', 'Entrar no Grupo', 1, 'Mariana Sol']
      });

      console.log('✅ Banco Turso inicializado e semeado com sucesso!');
    } else {
      console.log(`✅ Banco Turso conectado com ${total} alunos registrados.`);
    }
  } catch (err) {
    console.error('❌ Erro ao inicializar tabelas no Turso:', err);
  }
};
