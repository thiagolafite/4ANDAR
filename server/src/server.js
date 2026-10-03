import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import dotenv from 'dotenv';
import { turso, initTursoDatabase } from './db/turso.js';
import { enviarLembreteMensalidade } from './services/emailService.js';
import { sincronizarAulasCalendar } from './services/googleCalendarService.js';
import {
  hashPassword,
  verifyPassword,
  getDefaultPermissions,
  createSessionToken,
  verifySessionToken
} from './services/authService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// Se o ambiente Vercel Serverless já tiver parseado o body JSON, sinaliza para evitar travamento da stream
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    req._body = true;
  }
  next();
});

app.use(express.json());

let isTursoReady = false;
let tursoInitPromise = null;

const ensureTursoReady = async () => {
  if (!isTursoReady) {
    if (!tursoInitPromise) {
      tursoInitPromise = initTursoDatabase()
        .then(() => {
          isTursoReady = true;
        })
        .catch((e) => {
          console.warn('Falha na inicialização do Turso:', e.message);
        });
    }
    await tursoInitPromise;
  }
};

// Compatibilidade de roteamento para Vercel Serverless (garante que /api/ rotas batam perfeitamente)
app.use(async (req, res, next) => {
  if (req.originalUrl && req.originalUrl.startsWith('/api') && req.url !== req.originalUrl) {
    req.url = req.originalUrl;
  } else if (req.query && req.query.route) {
    const routeParts = Array.isArray(req.query.route) ? req.query.route.join('/') : req.query.route;
    req.url = '/api/' + routeParts;
  } else if (req.url === '/api' && req.originalUrl && req.originalUrl !== '/api') {
    req.url = req.originalUrl;
  }

  if (!req.url.startsWith('/api') && req.url !== '/' && !req.url.startsWith('/index.html')) {
    req.url = '/api' + req.url;
  }

  if (req.url.startsWith('/api')) {
    await ensureTursoReady();
  }
  next();
});

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: '4ANDAR API Server',
    database: 'Turso (libSQL)',
    time: new Date().toISOString()
  });
});

app.get('/api', (req, res) => {
  res.json({
    status: 'ok',
    service: '4ANDAR API Server',
    database: 'Turso (libSQL)',
    time: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: '4ANDAR API Server',
    database: 'Turso (libSQL)',
    time: new Date().toISOString()
  });
});

// ==========================================
// 0. AUTENTICAÇÃO E CONTROLE DE ACESSO (MASTER ADMIN)
// ==========================================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });
  const payload = verifySessionToken(token);
  if (!payload) return res.status(403).json({ error: 'Sessão inválida ou expirada' });
  req.user = payload;
  next();
};

// 0.1 Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { login, senha } = req.body;
    if (!login || !senha) {
      return res.status(400).json({ error: 'Informe usuário/e-mail e senha' });
    }

    const cleanLogin = login.trim().toLowerCase();
    
    // Busca usuário pelo e-mail, username ou se for master permite 'thiagolafite' ou 'admin@4andar.com.br'
    let query;
    let args;
    if (cleanLogin === 'thiagolafite' || cleanLogin === 'admin@4andar.com.br' || cleanLogin === 'thiago.lafite@4andar.com.br') {
      query = `SELECT * FROM usuarios 
               WHERE id = 'usr_master_thiago' 
                  OR LOWER(email) = 'thiago.lafite@4andar.com.br' 
                  OR LOWER(username) = 'thiagolafite'
                  OR is_master = 1 
               ORDER BY CASE WHEN id = 'usr_master_thiago' THEN 1 WHEN LOWER(email) = 'thiago.lafite@4andar.com.br' THEN 2 ELSE 3 END 
               LIMIT 1`;
      args = [];
    } else {
      query = `SELECT * FROM usuarios 
               WHERE (LOWER(TRIM(username)) = ? OR LOWER(TRIM(email)) = ? OR LOWER(TRIM(nome)) = ? OR LOWER(nome) LIKE ?) 
                 AND id != 'usr_master_thiago' 
               ORDER BY CASE WHEN LOWER(TRIM(username)) = ? THEN 1 WHEN LOWER(TRIM(email)) = ? THEN 2 WHEN LOWER(TRIM(nome)) = ? THEN 3 ELSE 4 END 
               LIMIT 1`;
      args = [cleanLogin, cleanLogin, cleanLogin, `%${cleanLogin}%`, cleanLogin, cleanLogin, cleanLogin];
    }

    const result = await turso.execute({ sql: query, args });
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'E-mail/usuário ou senha incorretos' });
    }

    const user = result.rows[0];
    const isMaster = user.id === 'usr_master_thiago' || (user.email && user.email.toLowerCase() === 'thiago.lafite@4andar.com.br') || (Number(user.is_master) === 1 && (user.role === 'master' || cleanLogin === 'thiagolafite'));

    // Validação da senha (permite hash gravado, admin123 ou adm123 para o master)
    const isPasswordValid =
      verifyPassword(senha, user.senha_hash) ||
      (isMaster && (senha === 'admin123' || senha === 'adm123' || !senha));
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'E-mail/usuário ou senha incorretos' });
    }

    // Validação do status de aprovação (não se aplica ao master)
    if (!isMaster && user.status === 'pendente') {
      return res.status(403).json({
        error: 'Seu cadastro está aguardando aprovação do Administrador Master (Thiago Lafite).',
        status: 'pendente'
      });
    }

    if (!isMaster && user.status === 'rejeitado') {
      return res.status(403).json({
        error: `Seu cadastro não foi aprovado pela administração.${user.motivo_recusa ? ' Motivo: ' + user.motivo_recusa : ''}`,
        status: 'rejeitado'
      });
    }

    if (!isMaster && user.status === 'bloqueado') {
      return res.status(403).json({
        error: 'Seu acesso foi temporariamente suspenso pela administração.',
        status: 'bloqueado'
      });
    }

    // Atualiza último acesso
    const now = new Date().toISOString();
    await turso.execute({
      sql: 'UPDATE usuarios SET ultimo_acesso = ? WHERE id = ?',
      args: [now, user.id]
    });

    const token = createSessionToken(user);
    let permissoesObj = {};
    try {
      permissoesObj = JSON.parse(user.permissoes);
    } catch {
      permissoesObj = getDefaultPermissions(user.role);
    }

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        username: user.username,
        telefone: user.telefone,
        cargo_pretendido: user.cargo_pretendido,
        role: user.role,
        tipo_usuario: isMaster ? 'AdminMaster' : (user.role === 'professor' || user.role === 'admin' || user.role === 'secretaria' ? 'Equipe' : 'Aluno'),
        is_master: isMaster,
        status: user.status,
        permissoes: permissoesObj,
        avatar_url: user.avatar_url,
        ultimo_acesso: now
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 0.2 Cadastro de Novo Usuário (Entra como 'pendente' para aprovação e atribuição do Master)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nome, email, username, senha, telefone, cargo_pretendido } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Preencha nome, e-mail e senha' });
    }

    if (senha.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = (username || cleanEmail.split('@')[0])
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '');

    if (cleanUsername.length < 3) {
      return res.status(400).json({ error: 'O nome de usuário deve ter no mínimo 3 caracteres (letras, números, ponto ou traço)' });
    }

    // Verifica se já existe por e-mail ou username
    const exists = await turso.execute({
      sql: 'SELECT id, email, username FROM usuarios WHERE LOWER(email) = ? OR (username IS NOT NULL AND LOWER(username) = ?)',
      args: [cleanEmail, cleanUsername]
    });

    if (exists.rows.length > 0) {
      const isEmailDupe = exists.rows.some(r => r.email && r.email.toLowerCase() === cleanEmail);
      if (isEmailDupe) {
        return res.status(409).json({ error: 'Este e-mail já está cadastrado no sistema.' });
      }
      return res.status(409).json({ error: 'Este nome de usuário já está em uso. Por favor, escolha outro.' });
    }

    const id = `usr_${Date.now()}`;
    const senhaHash = hashPassword(senha);
    const role = 'pendente';
    const cargo = cargo_pretendido || 'Pendente (Aguardando Classificação do Master)';
    const initialPerms = JSON.stringify(getDefaultPermissions('aluno'));
    const dataCadastro = new Date().toISOString().substring(0, 10);

    await turso.execute({
      sql: `INSERT INTO usuarios (id, nome, email, username, senha_hash, telefone, cargo_pretendido, role, status, is_master, permissoes, data_cadastro, avatar_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        nome.trim(),
        cleanEmail,
        cleanUsername,
        senhaHash,
        telefone || null,
        cargo,
        role,
        'pendente', // Sempre entra como pendente para aprovação do Master Thiago Lafite
        0,
        initialPerms,
        dataCadastro,
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      ]
    });

    res.status(201).json({
      message: 'Cadastro recebido com sucesso! Aguarde a aprovação do Administrador Master (Thiago Lafite) para classificar sua conta e liberar o acesso.',
      status: 'pendente',
      user: {
        id,
        nome,
        email: cleanEmail,
        username: cleanUsername,
        cargo_pretendido: cargo,
        status: 'pendente'
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 0.3 Obter usuário logado atual (/me)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await turso.execute({
      sql: 'SELECT id, nome, email, username, telefone, cargo_pretendido, role, status, is_master, permissoes, avatar_url, data_cadastro, data_aprovacao, ultimo_acesso, aluno_id, equipe_id FROM usuarios WHERE id = ?',
      args: [req.user.userId]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = result.rows[0];
    let permissoesObj = {};
    try {
      permissoesObj = JSON.parse(user.permissoes);
    } catch {
      permissoesObj = getDefaultPermissions(user.role);
    }

    res.json({
      user: {
        ...user,
        tipo_usuario: Boolean(user.is_master) ? 'AdminMaster' : (user.role === 'professor' || user.role === 'admin' || user.role === 'secretaria' ? 'Equipe' : 'Aluno'),
        is_master: Boolean(user.is_master),
        permissoes: permissoesObj
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 0.4 Listar todos os usuários (Para painel do Master Admin)
app.get('/api/usuarios', async (req, res) => {
  try {
    const { status, role } = req.query;
    let sql = 'SELECT id, nome, email, username, telefone, cargo_pretendido, role, status, is_master, permissoes, motivo_recusa, aprovado_por, data_cadastro, data_aprovacao, ultimo_acesso, avatar_url, aluno_id, equipe_id FROM usuarios WHERE 1=1';
    const args = [];

    if (status) {
      sql += ' AND status = ?';
      args.push(status);
    }
    if (role) {
      sql += ' AND role = ?';
      args.push(role);
    }

    // Ordenação: Pendentes primeiro, depois Master, depois os mais recentes
    sql += ' ORDER BY CASE status WHEN \'pendente\' THEN 1 ELSE 2 END, is_master DESC, data_cadastro DESC';

    const result = await turso.execute({ sql, args });
    const formatted = result.rows.map((u) => {
      let permissoesObj = {};
      try {
        permissoesObj = JSON.parse(u.permissoes);
      } catch {
        permissoesObj = getDefaultPermissions(u.role);
      }
      const isMasterStrict =
        (Number(u.is_master) === 1 || u.role === 'master') &&
        (u.id === 'usr_master_thiago' || (u.email && u.email.toLowerCase() === 'thiago.lafite@4andar.com.br'));
      return {
        ...u,
        is_master: isMasterStrict,
        permissoes: permissoesObj
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// Helpers de Sincronização Automática Usuário -> Aluno / Equipe
// ----------------------------------------------------
async function syncAlunosFromUsuarios() {
  try {
    const usersResult = await turso.execute(`
      SELECT id, nome, email, telefone, data_cadastro, role, cargo_pretendido, status, aluno_id
      FROM usuarios
      WHERE (role = 'aluno' OR cargo_pretendido LIKE '%alun%')
        AND status != 'rejeitado'
        AND status != 'bloqueado'
    `);

    const alunosResult = await turso.execute('SELECT id, user_id, email FROM alunos');
    const existingAlunos = alunosResult.rows;

    for (const u of usersResult.rows) {
      const match = existingAlunos.find(
        (a) => (a.user_id && a.user_id === u.id) ||
               (a.email && a.email.toLowerCase() === u.email.toLowerCase()) ||
               (u.aluno_id && a.id === u.aluno_id)
      );

      if (match) {
        if (!match.user_id) {
          await turso.execute({
            sql: 'UPDATE alunos SET user_id = ? WHERE id = ?',
            args: [u.id, match.id]
          });
        }
        if (!u.aluno_id || u.aluno_id !== match.id) {
          await turso.execute({
            sql: 'UPDATE usuarios SET aluno_id = ? WHERE id = ?',
            args: [match.id, u.id]
          });
        }
      } else {
        const newId = `al_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const dataHoje = new Date().toISOString().substring(0, 10);
        await turso.execute({
          sql: `INSERT INTO alunos (id, user_id, nome, telefone, email, nivel_atual, papel, mensalidade_valor, dia_vencimento, data_matricula, data_inicio_nivel, status)
                VALUES (?, ?, ?, ?, ?, 'B1', 'Condutor', 190.0, 5, ?, ?, 'ativo')`,
          args: [
            newId,
            u.id,
            u.nome,
            u.telefone || '',
            u.email,
            u.data_cadastro ? u.data_cadastro.substring(0, 10) : dataHoje,
            u.data_cadastro ? u.data_cadastro.substring(0, 10) : dataHoje
          ]
        });
        await turso.execute({
          sql: 'UPDATE usuarios SET aluno_id = ? WHERE id = ?',
          args: [newId, u.id]
        });
        existingAlunos.push({ id: newId, user_id: u.id, email: u.email });
      }
    }
  } catch (err) {
    console.error('Erro em syncAlunosFromUsuarios:', err);
  }
}

async function syncEquipeFromUsuarios() {
  try {
    const usersResult = await turso.execute(`
      SELECT id, nome, email, telefone, role, cargo_pretendido, status, equipe_id
      FROM usuarios
      WHERE (role = 'professor' OR cargo_pretendido LIKE '%prof%')
        AND status != 'rejeitado'
        AND status != 'bloqueado'
    `);

    const equipeResult = await turso.execute('SELECT id, user_id, email FROM equipe');
    const existingEquipe = equipeResult.rows;

    for (const u of usersResult.rows) {
      const match = existingEquipe.find(
        (e) => (e.user_id && e.user_id === u.id) ||
               (e.email && e.email.toLowerCase() === u.email.toLowerCase()) ||
               (u.equipe_id && e.id === u.equipe_id)
      );

      if (match) {
        if (!match.user_id) {
          await turso.execute({
            sql: 'UPDATE equipe SET user_id = ? WHERE id = ?',
            args: [u.id, match.id]
          });
        }
        if (!u.equipe_id || u.equipe_id !== match.id) {
          await turso.execute({
            sql: 'UPDATE usuarios SET equipe_id = ? WHERE id = ?',
            args: [match.id, u.id]
          });
        }
      } else {
        const newId = `eq_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        await turso.execute({
          sql: `INSERT INTO equipe (id, user_id, nome, email, telefone, papel_equipe, especialidades, status)
                VALUES (?, ?, ?, ?, ?, ?, '["Forró Tradicional", "Universitário"]', 'ativo')`,
          args: [
            newId,
            u.id,
            u.nome,
            u.email,
            u.telefone || '',
            u.cargo_pretendido || 'Professor'
          ]
        });
        await turso.execute({
          sql: 'UPDATE usuarios SET equipe_id = ? WHERE id = ?',
          args: [newId, u.id]
        });
        existingEquipe.push({ id: newId, user_id: u.id, email: u.email });
      }
    }
  } catch (err) {
    console.error('Erro em syncEquipeFromUsuarios:', err);
  }
}

// 0.5 Aprovar, Rejeitar ou Alterar Status do Usuário
app.put('/api/usuarios/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, role, permissoes, motivo_recusa, aprovado_por, cargo_pretendido } = req.body;

    if (!['aprovado', 'rejeitado', 'bloqueado', 'pendente'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const targetCheck = await turso.execute({
      sql: 'SELECT is_master, role, cargo_pretendido, email, nome FROM usuarios WHERE id = ?',
      args: [id]
    });

    if (targetCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (targetCheck.rows[0].is_master === 1 && status !== 'aprovado') {
      return res.status(400).json({ error: 'O Administrador Master não pode ter o status alterado para bloqueado ou rejeitado.' });
    }

    const updates = ['status = ?'];
    const args = [status];

    if (status === 'aprovado') {
      updates.push('data_aprovacao = ?');
      args.push(new Date().toISOString().substring(0, 10));
      updates.push('aprovado_por = ?');
      args.push(aprovado_por || 'Thiago Lafite (Master)');
    }

    if (motivo_recusa !== undefined) {
      updates.push('motivo_recusa = ?');
      args.push(motivo_recusa || null);
    }

    if (role) {
      updates.push('role = ?');
      args.push(role);
    }

    if (cargo_pretendido) {
      updates.push('cargo_pretendido = ?');
      args.push(cargo_pretendido);
    }

    if (permissoes) {
      updates.push('permissoes = ?');
      args.push(typeof permissoes === 'string' ? permissoes : JSON.stringify(permissoes));
    } else if (status === 'aprovado' && role) {
      updates.push('permissoes = ?');
      args.push(JSON.stringify(getDefaultPermissions(role)));
    }

    args.push(id);
    await turso.execute({
      sql: `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`,
      args
    });

    // Se aprovado, dispara sincronização automática para Alunos e Professores
    let alunoId = null;
    let equipeId = null;
    if (status === 'aprovado') {
      const finalRole = role || targetCheck.rows[0].role;
      const finalCargo = cargo_pretendido || targetCheck.rows[0].cargo_pretendido || '';
      if (finalRole === 'aluno' || (/alun/i.test(finalCargo) && finalRole !== 'secretaria')) {
        await syncAlunosFromUsuarios();
        const aRes = await turso.execute({
          sql: 'SELECT id FROM alunos WHERE user_id = ? OR email = ? LIMIT 1',
          args: [id, targetCheck.rows[0].email]
        });
        if (aRes.rows.length > 0) alunoId = aRes.rows[0].id;
      } else if (finalRole === 'professor' || (/prof/i.test(finalCargo) && finalRole !== 'secretaria')) {
        await syncEquipeFromUsuarios();
        const eRes = await turso.execute({
          sql: 'SELECT id FROM equipe WHERE user_id = ? OR email = ? LIMIT 1',
          args: [id, targetCheck.rows[0].email]
        });
        if (eRes.rows.length > 0) equipeId = eRes.rows[0].id;
      }
    }

    res.json({
      success: true,
      message: `Status do usuário atualizado para "${status}" com sucesso!`,
      id,
      status,
      role: role || targetCheck.rows[0].role,
      aluno_id: alunoId,
      equipe_id: equipeId
    });
  } catch (err) {
    console.error('Erro em PUT /api/usuarios/:id/status:', err);
    res.status(500).json({ error: err.message || 'Erro ao atualizar status' });
  }
});

// 0.6 Atualizar Permissões Granulares do Usuário
app.put('/api/usuarios/:id/permissoes', async (req, res) => {
  try {
    const { id } = req.params;
    const { permissoes, role, cargo_pretendido } = req.body;

    const targetCheck = await turso.execute({
      sql: 'SELECT is_master FROM usuarios WHERE id = ?',
      args: [id]
    });

    if (targetCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const updates = ['permissoes = ?'];
    const args = [typeof permissoes === 'string' ? permissoes : JSON.stringify(permissoes)];

    if (role && targetCheck.rows[0].is_master !== 1) {
      updates.push('role = ?');
      args.push(role);
    }

    if (cargo_pretendido) {
      updates.push('cargo_pretendido = ?');
      args.push(cargo_pretendido);
    }

    if (req.body.aluno_id) {
      updates.push('aluno_id = ?');
      args.push(req.body.aluno_id);
    }

    if (req.body.equipe_id) {
      updates.push('equipe_id = ?');
      args.push(req.body.equipe_id);
    }

    args.push(id);
    await turso.execute({
      sql: `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`,
      args
    });

    // Sincroniza se o papel for aluno ou professor
    let alunoId = null;
    let equipeId = null;
    if (role === 'aluno' || (/alun/i.test(cargo_pretendido) && role !== 'secretaria')) {
      await syncAlunosFromUsuarios();
      const aRes = await turso.execute({
        sql: 'SELECT id FROM alunos WHERE user_id = ? OR email = (SELECT email FROM usuarios WHERE id = ?) LIMIT 1',
        args: [id, id]
      });
      if (aRes.rows.length > 0) alunoId = aRes.rows[0].id;
    } else if (role === 'professor' || (/prof/i.test(cargo_pretendido) && role !== 'secretaria')) {
      await syncEquipeFromUsuarios();
      const eRes = await turso.execute({
        sql: 'SELECT id FROM equipe WHERE user_id = ? OR email = (SELECT email FROM usuarios WHERE id = ?) LIMIT 1',
        args: [id, id]
      });
      if (eRes.rows.length > 0) equipeId = eRes.rows[0].id;
    }

    res.json({
      success: true,
      message: 'Permissões atualizadas com sucesso!',
      id,
      role,
      aluno_id: alunoId,
      equipe_id: equipeId
    });
  } catch (err) {
    console.error('Erro em PUT /api/usuarios/:id/permissoes:', err);
    res.status(500).json({ error: err.message || 'Erro ao atualizar permissões' });
  }
});

// 0.6.1 Criar / Vincular Aluno explicitamente
app.post('/api/usuarios/:id/vincular-aluno', async (req, res) => {
  try {
    const { id } = req.params;
    const userResult = await turso.execute({
      sql: 'SELECT id, nome, email, telefone, data_cadastro, aluno_id FROM usuarios WHERE id = ?',
      args: [id]
    });
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    const user = userResult.rows[0];

    // Procura aluno existente por aluno_id ou email
    let aluno = null;
    if (user.aluno_id) {
      const aRes = await turso.execute({ sql: 'SELECT * FROM alunos WHERE id = ?', args: [user.aluno_id] });
      if (aRes.rows.length > 0) aluno = aRes.rows[0];
    }
    if (!aluno) {
      const byEmail = await turso.execute({ sql: 'SELECT * FROM alunos WHERE LOWER(email) = LOWER(?)', args: [user.email] });
      if (byEmail.rows.length > 0) aluno = byEmail.rows[0];
    }

    if (aluno) {
      await turso.execute({ sql: 'UPDATE alunos SET user_id = ? WHERE id = ?', args: [user.id, aluno.id] });
      await turso.execute({ sql: 'UPDATE usuarios SET aluno_id = ? WHERE id = ?', args: [aluno.id, user.id] });
      return res.json({ message: 'Aluno já existente vinculado à conta!', aluno });
    }

    const newId = `al_${Date.now()}`;
    const dataHoje = new Date().toISOString().substring(0, 10);
    await turso.execute({
      sql: `INSERT INTO alunos (id, user_id, nome, telefone, email, nivel_atual, papel, mensalidade_valor, dia_vencimento, data_matricula, data_inicio_nivel, status)
            VALUES (?, ?, ?, ?, ?, 'B1', 'Condutor', 190.0, 5, ?, ?, 'ativo')`,
      args: [newId, user.id, user.nome, user.telefone || '', user.email, user.data_cadastro ? user.data_cadastro.substring(0, 10) : dataHoje, dataHoje]
    });
    await turso.execute({ sql: 'UPDATE usuarios SET aluno_id = ? WHERE id = ?', args: [newId, user.id] });

    const created = await turso.execute({ sql: 'SELECT * FROM alunos WHERE id = ?', args: [newId] });
    res.status(201).json({ message: 'Ficha de aluno criada e vinculada com sucesso!', aluno: created.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 0.65 Atualizar Perfil e Foto do Usuário
app.put('/api/usuarios/:id/perfil', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone, avatar_url } = req.body;

    const updates = [];
    const args = [];
    if (nome !== undefined) { updates.push('nome = ?'); args.push(nome); }
    if (telefone !== undefined) { updates.push('telefone = ?'); args.push(telefone); }
    if (avatar_url !== undefined) { updates.push('avatar_url = ?'); args.push(avatar_url); }

    if (updates.length > 0) {
      args.push(id);
      await turso.execute({ sql: `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`, args });
    }

    if (avatar_url !== undefined) {
      await turso.execute({
        sql: 'UPDATE alunos SET foto_url = ? WHERE user_id = ? OR id = ?',
        args: [avatar_url || '', id, id]
      });
      await turso.execute({
        sql: 'UPDATE equipe SET foto_url = ? WHERE user_id = ? OR id = ?',
        args: [avatar_url || '', id, id]
      });
    }

    const updated = await turso.execute({ sql: 'SELECT * FROM usuarios WHERE id = ?', args: [id] });
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 0.7 Excluir Usuário
app.delete('/api/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const targetCheck = await turso.execute({
      sql: 'SELECT is_master FROM usuarios WHERE id = ?',
      args: [id]
    });

    if (targetCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (targetCheck.rows[0].is_master === 1) {
      return res.status(400).json({ error: 'O Administrador Master não pode ser excluído.' });
    }

    await turso.execute({
      sql: 'DELETE FROM usuarios WHERE id = ?',
      args: [id]
    });

    res.json({ message: 'Usuário removido com sucesso!', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 0.7.1 Excluir Usuário por E-mail (Purga segura)
app.delete('/api/usuarios/by-email/:email', async (req, res) => {
  try {
    const email = (req.params.email || '').toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ error: 'E-mail não informado' });
    }

    if (email === 'thiago.lafite@4andar.com.br') {
      return res.status(400).json({ error: 'O Administrador Master não pode ser excluído.' });
    }

    await turso.execute({
      sql: 'DELETE FROM usuarios WHERE LOWER(email) = ?',
      args: [email]
    });
    await turso.execute({
      sql: 'DELETE FROM alunos WHERE LOWER(email) = ?',
      args: [email]
    });
    await turso.execute({
      sql: 'DELETE FROM equipe WHERE LOWER(email) = ?',
      args: [email]
    });

    res.json({ message: 'Registros associados ao e-mail removidos com sucesso!', email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 1. HEALTH & METADATA
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: '4ANDAR — Gestão Escolar de Dança',
    database: 'Turso (libSQL)',
    turso_url: process.env.TURSO_DATABASE_URL ? 'Turso Cloud Conectado' : 'Arquivo Local libSQL',
    time: new Date().toISOString()
  });
});

// ==========================================
// 2. ALUNOS (TURSO)
// ==========================================
app.get('/api/alunos', async (req, res) => {
  try {
    await syncAlunosFromUsuarios();
    const result = await turso.execute('SELECT id, user_id, nome, telefone, email, nivel_atual, papel, mensalidade_valor, dia_vencimento, data_matricula, data_inicio_nivel, status, foto_url, observacoes, tipo_frequencia, data_pagamento_atual, data_vencimento_atual FROM alunos ORDER BY nome ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/alunos', async (req, res) => {
  try {
    const {
      id: customId,
      user_id, nome, telefone, email, nivel_atual, papel,
      mensalidade_valor, dia_vencimento, data_matricula,
      data_inicio_nivel, status, foto_url, observacoes,
      tipo_frequencia, data_pagamento_atual, data_vencimento_atual
    } = req.body;

    const id = customId || `al_${Date.now()}`;

    // Procura se já existe um aluno com esse user_id ou email
    let existingCheck = null;
    if (user_id) {
      existingCheck = await turso.execute({
        sql: 'SELECT id FROM alunos WHERE user_id = ?',
        args: [user_id]
      });
    }
    if ((!existingCheck || existingCheck.rows.length === 0) && email) {
      existingCheck = await turso.execute({
        sql: 'SELECT id FROM alunos WHERE LOWER(email) = LOWER(?)',
        args: [email]
      });
    }

    if (existingCheck && existingCheck.rows.length > 0) {
      const existingId = existingCheck.rows[0].id;
      await turso.execute({
        sql: `UPDATE alunos SET
              user_id = COALESCE(?, user_id),
              nome = COALESCE(?, nome),
              telefone = COALESCE(?, telefone),
              email = COALESCE(?, email),
              nivel_atual = COALESCE(?, nivel_atual),
              papel = COALESCE(?, papel),
              mensalidade_valor = COALESCE(?, mensalidade_valor),
              dia_vencimento = COALESCE(?, dia_vencimento),
              status = COALESCE(?, status),
              observacoes = COALESCE(?, observacoes)
              WHERE id = ?`,
        args: [user_id || null, nome, telefone, email, nivel_atual, papel, mensalidade_valor, dia_vencimento, status, observacoes, existingId]
      });
      if (user_id) {
        await turso.execute({
          sql: 'UPDATE usuarios SET aluno_id = ? WHERE id = ?',
          args: [existingId, user_id]
        });
      }
      const updated = await turso.execute({ sql: 'SELECT * FROM alunos WHERE id = ?', args: [existingId] });
      return res.status(200).json(updated.rows[0]);
    }

    await turso.execute({
      sql: `INSERT INTO alunos (id, user_id, nome, telefone, email, nivel_atual, papel, mensalidade_valor, dia_vencimento, data_matricula, data_inicio_nivel, status, foto_url, observacoes, tipo_frequencia, data_pagamento_atual, data_vencimento_atual)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, user_id || null, nome, telefone, email, nivel_atual || 'B1', papel || 'Condutor',
        mensalidade_valor || 190.0, dia_vencimento || 5,
        data_matricula || new Date().toISOString().substring(0, 10),
        data_inicio_nivel || new Date().toISOString().substring(0, 10),
        status || 'ativo', foto_url || null, observacoes || null,
        tipo_frequencia || 'mensalista', data_pagamento_atual || null, data_vencimento_atual || null
      ]
    });

    if (user_id) {
      await turso.execute({
        sql: 'UPDATE usuarios SET aluno_id = ? WHERE id = ?',
        args: [id, user_id]
      });
    }

    const aluno = await turso.execute({ sql: 'SELECT * FROM alunos WHERE id = ?', args: [id] });
    res.status(201).json(aluno.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/alunos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      user_id, nome, telefone, email, nivel_atual, papel,
      mensalidade_valor, dia_vencimento, status, observacoes, foto_url,
      tipo_frequencia, data_pagamento_atual, data_vencimento_atual
    } = req.body;

    await turso.execute({
      sql: `UPDATE alunos SET 
            user_id = COALESCE(?, user_id),
            nome = COALESCE(?, nome),
            telefone = COALESCE(?, telefone),
            email = COALESCE(?, email),
            nivel_atual = COALESCE(?, nivel_atual),
            papel = COALESCE(?, papel),
            mensalidade_valor = COALESCE(?, mensalidade_valor),
            dia_vencimento = COALESCE(?, dia_vencimento),
            status = COALESCE(?, status),
            foto_url = COALESCE(?, foto_url),
            observacoes = COALESCE(?, observacoes),
            tipo_frequencia = COALESCE(?, tipo_frequencia),
            data_pagamento_atual = COALESCE(?, data_pagamento_atual),
            data_vencimento_atual = COALESCE(?, data_vencimento_atual)
            WHERE id = ?`,
      args: [
        user_id || null, nome, telefone, email, nivel_atual, papel,
        mensalidade_valor, dia_vencimento, status,
        foto_url !== undefined ? foto_url : null, observacoes,
        tipo_frequencia || null, data_pagamento_atual || null, data_vencimento_atual || null,
        id
      ]
    });

    if (user_id) {
      await turso.execute({
        sql: 'UPDATE usuarios SET aluno_id = ? WHERE id = ?',
        args: [id, user_id]
      });
    }

    const updated = await turso.execute({ sql: 'SELECT * FROM alunos WHERE id = ?', args: [id] });
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/alunos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await turso.execute({ sql: 'UPDATE usuarios SET aluno_id = NULL WHERE aluno_id = ?', args: [id] });
    await turso.execute({ sql: 'DELETE FROM alunos WHERE id = ?', args: [id] });
    res.json({ success: true, message: 'Aluno removido com sucesso do Turso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. EQUIPE (TURSO)
// ==========================================
app.get('/api/equipe', async (req, res) => {
  try {
    await syncEquipeFromUsuarios();
    const result = await turso.execute('SELECT * FROM equipe ORDER BY nome ASC');
    const rows = result.rows.map((row) => ({
      ...row,
      especialidades: typeof row.especialidades === 'string' ? JSON.parse(row.especialidades || '[]') : row.especialidades
    }));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/equipe', async (req, res) => {
  try {
    const { user_id, nome, email, telefone, papel_equipe, especialidades, foto_url } = req.body;
    const id = `eq_${Date.now()}`;
    await turso.execute({
      sql: `INSERT INTO equipe (id, user_id, nome, email, telefone, papel_equipe, especialidades, foto_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, user_id || null, nome, email, telefone || null, papel_equipe || 'Professor', JSON.stringify(especialidades || []), foto_url || null]
    });
    res.status(201).json({ id, user_id: user_id || null, nome, email, papel_equipe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/equipe/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone, papel_equipe, especialidades, foto_url, user_id, ativo } = req.body;
    const updates = [];
    const args = [];
    if (nome !== undefined) { updates.push('nome = ?'); args.push(nome); }
    if (email !== undefined) { updates.push('email = ?'); args.push(email); }
    if (telefone !== undefined) { updates.push('telefone = ?'); args.push(telefone); }
    if (papel_equipe !== undefined) { updates.push('papel_equipe = ?'); args.push(papel_equipe); }
    if (especialidades !== undefined) { updates.push('especialidades = ?'); args.push(JSON.stringify(especialidades)); }
    if (foto_url !== undefined) { updates.push('foto_url = ?'); args.push(foto_url); }
    if (user_id !== undefined) { updates.push('user_id = ?'); args.push(user_id); }
    if (ativo !== undefined) { updates.push('ativo = ?'); args.push(ativo ? 1 : 0); }
    if (updates.length > 0) {
      args.push(id);
      await turso.execute({ sql: `UPDATE equipe SET ${updates.join(', ')} WHERE id = ?`, args });
    }
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/equipe/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await turso.execute({ sql: 'DELETE FROM equipe WHERE id = ?', args: [id] });
    res.json({ success: true, message: 'Membro removido da equipe' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. AULAS & CRONOGRAMA (TURSO)
// ==========================================
app.get('/api/aulas', async (req, res) => {
  try {
    const result = await turso.execute('SELECT * FROM aulas ORDER BY nome ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/aulas', async (req, res) => {
  try {
    const { nome, nivel, turno, dia_semana, horario_inicio, horario_fim, sala, equipe_id, user_id, professor_nome, capacidade_maxima } = req.body;
    const id = `aul_${Date.now()}`;
    await turso.execute({
      sql: `INSERT INTO aulas (id, nome, nivel, turno, dia_semana, horario_inicio, horario_fim, sala, equipe_id, user_id, professor_nome, capacidade_maxima)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, nome, nivel, turno, dia_semana, horario_inicio, horario_fim, sala, equipe_id || null, user_id || null, professor_nome || null, capacidade_maxima || 24]
    });
    res.status(201).json({ id, nome, nivel, equipe_id, user_id, professor_nome });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/aulas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, nivel, turno, dia_semana, horario_inicio, horario_fim, sala, equipe_id, user_id, professor_nome, capacidade_maxima } = req.body;
    const updates = [];
    const args = [];
    if (nome !== undefined) { updates.push('nome = ?'); args.push(nome); }
    if (nivel !== undefined) { updates.push('nivel = ?'); args.push(nivel); }
    if (turno !== undefined) { updates.push('turno = ?'); args.push(turno); }
    if (dia_semana !== undefined) { updates.push('dia_semana = ?'); args.push(dia_semana); }
    if (horario_inicio !== undefined) { updates.push('horario_inicio = ?'); args.push(horario_inicio); }
    if (horario_fim !== undefined) { updates.push('horario_fim = ?'); args.push(horario_fim); }
    if (sala !== undefined) { updates.push('sala = ?'); args.push(sala); }
    if (equipe_id !== undefined) { updates.push('equipe_id = ?'); args.push(equipe_id || null); }
    if (user_id !== undefined) { updates.push('user_id = ?'); args.push(user_id || null); }
    if (professor_nome !== undefined) { updates.push('professor_nome = ?'); args.push(professor_nome || null); }
    if (capacidade_maxima !== undefined) { updates.push('capacidade_maxima = ?'); args.push(capacidade_maxima); }

    if (updates.length > 0) {
      args.push(id);
      await turso.execute({ sql: `UPDATE aulas SET ${updates.join(', ')} WHERE id = ?`, args });
    }
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cronograma', async (req, res) => {
  try {
    const result = await turso.execute('SELECT * FROM cronogramas ORDER BY data_aula ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cronograma', async (req, res) => {
  try {
    const { aula_id, data_aula, tema_aula, observacoes, professor_id, professor_user_id, professor_nome } = req.body;
    const existing = await turso.execute({
      sql: 'SELECT * FROM cronogramas WHERE aula_id = ? AND data_aula = ?',
      args: [aula_id, data_aula]
    });

    if (existing.rows.length > 0) {
      await turso.execute({
        sql: `UPDATE cronogramas SET tema_aula = ?, observacoes = ?, professor_id = COALESCE(?, professor_id), professor_user_id = COALESCE(?, professor_user_id), professor_nome = COALESCE(?, professor_nome) WHERE id = ?`,
        args: [tema_aula, observacoes || null, professor_id || null, professor_user_id || null, professor_nome || null, existing.rows[0].id]
      });
      return res.json({ ...existing.rows[0], tema_aula, observacoes, professor_id, professor_user_id, professor_nome });
    }

    const id = `crono_${Date.now()}`;
    await turso.execute({
      sql: 'INSERT INTO cronogramas (id, aula_id, data_aula, tema_aula, observacoes, professor_id, professor_user_id, professor_nome) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      args: [id, aula_id, data_aula, tema_aula, observacoes || null, professor_id || null, professor_user_id || null, professor_nome || null]
    });
    res.status(201).json({ id, aula_id, data_aula, tema_aula, observacoes, professor_id, professor_user_id, professor_nome });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Importação em massa de cronograma via Excel (otimizado com batch atômico de alta performance)
app.post('/api/cronograma/bulk', async (req, res) => {
  try {
    const { items, turmasNovas } = req.body;

    // Garante que o índice único existe para upserts instantâneos ON CONFLICT
    await turso.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_cronogramas_aula_data ON cronogramas(aula_id, data_aula)').catch(() => {});

    // 1. Se houver turmas novas que foram criadas no Excel e não existiam no banco
    if (turmasNovas && Array.isArray(turmasNovas) && turmasNovas.length > 0) {
      const turmaStmts = turmasNovas.map((t) => ({
        sql: `INSERT INTO aulas (id, nome, nivel, turno, dia_semana, horario_inicio, horario_fim, sala, equipe_id, capacidade_maxima)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                nome = excluded.nome,
                nivel = excluded.nivel,
                turno = excluded.turno`,
        args: [
          t.id,
          t.nome,
          t.nivel || 'B1',
          t.turno || 'Manhã',
          t.dia_semana || 'Sábado',
          t.horario_inicio || '10:00',
          t.horario_fim || '11:30',
          t.sala || 'Salão Principal',
          t.equipe_id || 'eq_1',
          t.capacidade_maxima || 24
        ]
      }));
      await turso.batch(turmaStmts).catch((e) => console.warn('Erro ao inserir turmas novas em lote:', e.message));
    }

    // 2. Processa os itens do cronograma em lotes atômicos com turso.batch (100 por chamada)
    let upsertedCount = 0;
    if (items && Array.isArray(items) && items.length > 0) {
      const CHUNK_SIZE = 100;
      for (let i = 0; i < items.length; i += CHUNK_SIZE) {
        const chunk = items.slice(i, i + CHUNK_SIZE);
        const stmts = chunk.map((item) => ({
          sql: `INSERT INTO cronogramas (id, aula_id, data_aula, tema_aula, observacoes)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(aula_id, data_aula) DO UPDATE SET
                  tema_aula = excluded.tema_aula,
                  observacoes = COALESCE(excluded.observacoes, cronogramas.observacoes)`,
          args: [
            item.id || `crono_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            item.aula_id,
            item.data_aula,
            item.tema_aula,
            item.observacoes || null
          ]
        }));

        await turso.batch(stmts);
        upsertedCount += chunk.length;
      }
    }

    res.json({ success: true, count: upsertedCount });
  } catch (err) {
    console.error('Erro ao importar cronogramas em lote no Turso:', err);
    res.status(500).json({ error: err.message });
  }
});

// Excluir célula de cronograma por aula_id e data_aula
app.delete('/api/cronograma/cell', async (req, res) => {
  try {
    const { aula_id, data_aula } = req.query;
    if (!aula_id || !data_aula) {
      return res.status(400).json({ error: 'aula_id e data_aula são obrigatórios' });
    }
    await turso.execute({
      sql: 'DELETE FROM cronogramas WHERE aula_id = ? AND data_aula = ?',
      args: [aula_id, data_aula]
    });
    res.json({ success: true, deleted: { aula_id, data_aula } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Excluir todas as aulas de uma data específica
app.delete('/api/cronograma/data/:data_aula', async (req, res) => {
  try {
    const { data_aula } = req.params;
    await turso.execute({
      sql: 'DELETE FROM cronogramas WHERE data_aula = ?',
      args: [data_aula]
    });
    res.json({ success: true, data_aula });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Excluir cronograma por ID
app.delete('/api/cronograma/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await turso.execute({
      sql: 'DELETE FROM cronogramas WHERE id = ?',
      args: [id]
    });
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Excluir turma inteira
app.delete('/api/aulas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await turso.execute({
      sql: 'DELETE FROM cronogramas WHERE aula_id = ?',
      args: [id]
    });
    await turso.execute({
      sql: 'DELETE FROM presencas WHERE aula_id = ?',
      args: [id]
    });
    await turso.execute({
      sql: 'DELETE FROM aulas WHERE id = ?',
      args: [id]
    });
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. PRESENÇAS & CHAMADAS (TURSO)
// ==========================================
app.get('/api/presencas', async (req, res) => {
  try {
    const result = await turso.execute('SELECT * FROM presencas ORDER BY data_presenca DESC');
    const rows = result.rows.map((r) => ({
      ...r,
      data_aula: r.data_presenca || r.data_aula
    }));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/presencas/solicitar', async (req, res) => {
  try {
    const { id: reqId, aluno_id, aula_id, data_presenca, data_aula, data_solicitacao } = req.body;
    const id = reqId || `pre_${Date.now()}`;
    const dtPresenca = data_presenca || data_aula;
    const dataSol = data_solicitacao || new Date().toISOString();

    await turso.execute({
      sql: `INSERT INTO presencas (id, aluno_id, aula_id, data_presenca, status, data_solicitacao)
            VALUES (?, ?, ?, ?, 'pendente', ?)`,
      args: [id, aluno_id, aula_id, dtPresenca, dataSol]
    });
    res.status(201).json({ id, aluno_id, aula_id, data_aula: dtPresenca, data_presenca: dtPresenca, status: 'pendente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/presencas', async (req, res) => {
  try {
    const { id: reqId, aluno_id, aula_id, data_presenca, data_aula, status, data_solicitacao, confirmado_por } = req.body;
    const id = reqId || `pre_${Date.now()}`;
    const dtPresenca = data_presenca || data_aula;
    await turso.execute({
      sql: `INSERT INTO presencas (id, aluno_id, aula_id, data_presenca, status, data_solicitacao, confirmado_por)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [id, aluno_id, aula_id, dtPresenca, status || 'confirmada', data_solicitacao || new Date().toISOString(), confirmado_por || null]
    });
    res.status(201).json({ id, aluno_id, aula_id, data_aula: dtPresenca, status: status || 'confirmada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/presencas/:id/confirmar', async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmado_por } = req.body;
    await turso.execute({
      sql: "UPDATE presencas SET status = 'confirmada', confirmado_por = ? WHERE id = ?",
      args: [confirmado_por || 'Equipe 4ANDAR', id]
    });
    res.json({ id, status: 'confirmada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/presencas/:id/ausente', async (req, res) => {
  try {
    const { id } = req.params;
    await turso.execute({
      sql: "UPDATE presencas SET status = 'ausente' WHERE id = ?",
      args: [id]
    });
    res.json({ id, status: 'ausente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/presencas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await turso.execute({ sql: 'DELETE FROM presencas WHERE id = ?', args: [id] });
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. PAGAMENTOS (TURSO)
// ==========================================
app.get('/api/pagamentos', async (req, res) => {
  try {
    const result = await turso.execute('SELECT * FROM pagamentos ORDER BY data_vencimento DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pagamentos', async (req, res) => {
  try {
    const { id: reqId, aluno_id, valor, data_vencimento, data_pagamento, metodo, tipo, status, referencia_mes, comprovante_url } = req.body;
    const id = reqId || `pag_${Date.now()}`;
    await turso.execute({
      sql: `INSERT INTO pagamentos (id, aluno_id, valor, data_pagamento, data_vencimento, metodo, tipo, status, referencia_mes, comprovante_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        aluno_id,
        Number(valor) || 0,
        data_pagamento || null,
        data_vencimento,
        metodo || 'PIX',
        tipo || 'Mensalidade',
        status || 'Pendente',
        referencia_mes || '',
        comprovante_url || null
      ]
    });
    res.status(201).json({ id, aluno_id, valor, status: status || 'Pendente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/pagamentos/:id/baixar', async (req, res) => {
  try {
    const { id } = req.params;
    const { metodo } = req.body;
    const dataHoje = new Date().toISOString().substring(0, 10);

    await turso.execute({
      sql: "UPDATE pagamentos SET status = 'Pago', metodo = ?, data_pagamento = ? WHERE id = ?",
      args: [metodo || 'PIX', dataHoje, id]
    });

    // Busca o pagamento para saber o tipo e o aluno
    const pagResult = await turso.execute({ sql: 'SELECT * FROM pagamentos WHERE id = ?', args: [id] });
    const pag = pagResult.rows[0];

    // Se for Mensalidade, gera próximo ciclo e atualiza o aluno
    if (pag && pag.tipo === 'Mensalidade') {
      // Calcula próximo vencimento: mesmo dia do mês seguinte
      function proximoVencimento(dataPagamento) {
        const d = new Date(dataPagamento + 'T12:00:00');
        const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, d.getDate());
        return nextMonth.toISOString().substring(0, 10);
      }

      const dataVenc = proximoVencimento(dataHoje);

      // Referência do mês seguinte (ex: Novembro/2026)
      const mesesPT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
      const dateVencObj = new Date(dataVenc + 'T12:00:00');
      const refMes = `${mesesPT[dateVencObj.getMonth()]}/${dateVencObj.getFullYear()}`;

      // Atualiza o aluno com data de pagamento e vencimento atuais
      await turso.execute({
        sql: 'UPDATE alunos SET data_pagamento_atual = ?, data_vencimento_atual = ? WHERE id = ?',
        args: [dataHoje, dataVenc, pag.aluno_id]
      });

      // Gera a próxima cobrança de mensalidade automaticamente
      const novoId = `pag_${Date.now()}`;
      const alunoResult = await turso.execute({ sql: 'SELECT * FROM alunos WHERE id = ?', args: [pag.aluno_id] });
      const aluno = alunoResult.rows[0];
      const valor = aluno ? (Number(aluno.mensalidade_valor) || Number(pag.valor)) : Number(pag.valor);

      await turso.execute({
        sql: `INSERT OR IGNORE INTO pagamentos (id, aluno_id, valor, data_pagamento, data_vencimento, metodo, tipo, status, referencia_mes)
              VALUES (?, ?, ?, NULL, ?, 'PIX', 'Mensalidade', 'Pendente', ?)`,
        args: [novoId, pag.aluno_id, valor, dataVenc, refMes]
      });

      return res.json({
        id,
        status: 'Pago',
        data_pagamento: dataHoje,
        proximo_vencimento: dataVenc,
        proximo_pagamento_id: novoId,
        referencia_mes: refMes
      });
    }

    res.json({ id, status: 'Pago', data_pagamento: dataHoje });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/pagamentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { valor, data_pagamento, data_vencimento, metodo, tipo, status, referencia_mes } = req.body;
    const updates = [];
    const args = [];
    if (valor !== undefined) { updates.push('valor = ?'); args.push(Number(valor)); }
    if (data_pagamento !== undefined) { updates.push('data_pagamento = ?'); args.push(data_pagamento); }
    if (data_vencimento !== undefined) { updates.push('data_vencimento = ?'); args.push(data_vencimento); }
    if (metodo !== undefined) { updates.push('metodo = ?'); args.push(metodo); }
    if (tipo !== undefined) { updates.push('tipo = ?'); args.push(tipo); }
    if (status !== undefined) { updates.push('status = ?'); args.push(status); }
    if (referencia_mes !== undefined) { updates.push('referencia_mes = ?'); args.push(referencia_mes); }

    if (updates.length > 0) {
      args.push(id);
      await turso.execute({ sql: `UPDATE pagamentos SET ${updates.join(', ')} WHERE id = ?`, args });
    }
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/pagamentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await turso.execute({ sql: 'DELETE FROM pagamentos WHERE id = ?', args: [id] });
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. WORKFLOW: LEMBRETES AUTOMÁTICOS DE MENSALIDADE
// ==========================================
export const processarLembretesMensalidade = async () => {
  const hoje = new Date();
  const limiteTresDias = new Date(hoje);
  limiteTresDias.setDate(hoje.getDate() + 3);

  const pagamentosResult = await turso.execute("SELECT * FROM pagamentos WHERE status != 'Pago'");
  const pagamentos = pagamentosResult.rows;

  const elegiveis = pagamentos.filter((p) => {
    const v = new Date(p.data_vencimento);
    return v <= limiteTresDias || p.status === 'Atrasado';
  });

  const envios = [];

  for (const pag of elegiveis) {
    const alunoResult = await turso.execute({ sql: 'SELECT * FROM alunos WHERE id = ?', args: [pag.aluno_id] });
    const aluno = alunoResult.rows[0];
    if (!aluno || !aluno.email) continue;

    try {
      await enviarLembreteMensalidade({
        alunoNome: aluno.nome,
        email: aluno.email,
        valor: pag.valor,
        dataVencimento: pag.data_vencimento,
        referenciaMes: pag.referencia_mes,
        status: pag.status
      });

      envios.push({
        aluno_id: aluno.id,
        nome: aluno.nome,
        email: aluno.email,
        valor: pag.valor,
        vencimento: pag.data_vencimento,
        status_envio: 'sucesso'
      });
    } catch (err) {
      console.error(`Erro ao enviar lembrete para ${aluno.email}:`, err.message);
      envios.push({
        aluno_id: aluno.id,
        nome: aluno.nome,
        email: aluno.email,
        status_envio: 'falha',
        erro: err.message
      });
    }
  }

  return envios;
};

app.post('/api/workflows/enviar-lembretes-mensalidade', async (req, res) => {
  try {
    const envios = await processarLembretesMensalidade();
    res.json({
      success: true,
      message: 'Workflow de cobrança executado via Turso.',
      total_enviados: envios.filter((e) => e.status_envio === 'sucesso').length,
      detalhes: envios
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cron nativo (Executa todo dia às 08:00 AM)
cron.schedule('0 8 * * *', async () => {
  console.log('⏰ [CRON TURSO] Verificando faturas no Turso para envio de lembretes...');
  try {
    await processarLembretesMensalidade();
  } catch (err) {
    console.error('Erro no cron de lembretes:', err);
  }
});

// ==========================================
// 8. INTEGRAÇÃO: GOOGLE CALENDAR
// ==========================================
app.post('/api/integracoes/sincronizar-aulas-calendar', async (req, res) => {
  try {
    const { professor_id, professor_email, access_token } = req.body;

    const aulasResult = await turso.execute({
      sql: 'SELECT * FROM aulas WHERE equipe_id = ? OR ? IS NULL',
      args: [professor_id || null, professor_id || null]
    });
    const aulas = aulasResult.rows;

    const cronogramasResult = await turso.execute('SELECT * FROM cronogramas');
    const cronogramas = cronogramasResult.rows;

    const aulasComCronograma = aulas.map((aula) => {
      const crono = cronogramas.find((c) => c.aula_id === aula.id);
      return {
        aula_id: aula.id,
        turma_nome: aula.nome,
        nivel: aula.nivel,
        data_aula: crono?.data_aula || '2026-09-30',
        tema_aula: crono?.tema_aula || 'Tema a definir',
        horario_inicio: aula.horario_inicio,
        horario_fim: aula.horario_fim,
        sala: aula.sala
      };
    });

    const resultado = await sincronizarAulasCalendar({
      professorId: professor_id || 'eq_1',
      professorEmail: professor_email || 'mariana.sol@4andar.com.br',
      aulasComCronograma,
      accessToken: access_token
    });

    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9. NIVELAMENTO TÉCNICO (TURSO)
// ==========================================
app.get('/api/nivelamentos', async (req, res) => {
  try {
    const result = await turso.execute('SELECT * FROM nivelamento_sessoes ORDER BY data_agendada DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/nivelamentos/agendar', async (req, res) => {
  try {
    const {
      id: reqId,
      aluno_id,
      aluno_nome: reqNome,
      aluno_email: reqEmail,
      data_agendada,
      nivel_atual,
      nivel_alvo,
      papel,
      avaliador_aulao,
      avaliador_danca,
      avaliador_observa,
      feedback_geral
    } = req.body;
    const id = reqId || `niv_${Date.now()}`;

    let alunoNome = reqNome || '';
    let alunoEmail = reqEmail || '';

    if (!alunoNome || !alunoEmail) {
      try {
        const uRes = await turso.execute({
          sql: 'SELECT nome, email FROM usuarios WHERE id = ? OR aluno_id = ? LIMIT 1',
          args: [aluno_id, aluno_id]
        });
        if (uRes.rows.length > 0) {
          alunoNome = alunoNome || String(uRes.rows[0].nome || '');
          alunoEmail = alunoEmail || String(uRes.rows[0].email || '');
        } else {
          const aRes = await turso.execute({
            sql: 'SELECT nome, email FROM alunos WHERE id = ? OR user_id = ? LIMIT 1',
            args: [aluno_id, aluno_id]
          });
          if (aRes.rows.length > 0) {
            alunoNome = alunoNome || String(aRes.rows[0].nome || '');
            alunoEmail = alunoEmail || String(aRes.rows[0].email || '');
          }
        }
      } catch {}
    }

    await turso.execute({
      sql: `INSERT INTO nivelamento_sessoes (id, aluno_id, aluno_nome, aluno_email, data_agendada, nivel_atual, nivel_alvo, papel, status, avaliador_aulao, avaliador_danca, avaliador_observa, feedback_geral)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Agendado', ?, ?, ?, ?)`,
      args: [
        id,
        aluno_id,
        alunoNome,
        alunoEmail,
        data_agendada,
        nivel_atual,
        nivel_alvo,
        papel,
        avaliador_aulao || 'Mestre Gonzaga Silva',
        avaliador_danca || 'Mariana Sol',
        avaliador_observa || 'Tiago Baião',
        feedback_geral || 'Sessão agendada para avaliação técnica.'
      ]
    });
    res.status(201).json({ id, aluno_id, aluno_nome: alunoNome, aluno_email: alunoEmail, nivel_alvo, status: 'Agendado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/nivelamentos/:id/avaliar', async (req, res) => {
  try {
    const { id } = req.params;
    const { resultado, feedback_geral, feedback_aulao, feedback_danca, notas } = req.body;

    await turso.execute({
      sql: `UPDATE nivelamento_sessoes SET 
            status = 'Concluído',
            resultado = ?,
            feedback_geral = ?,
            feedback_aulao = ?,
            feedback_danca = ?,
            notas = ?
            WHERE id = ?`,
      args: [resultado, feedback_geral || null, feedback_aulao || null, feedback_danca || null, JSON.stringify(notas || {}), id]
    });

    if (resultado === 'Aprovado') {
      const sessaoResult = await turso.execute({ sql: 'SELECT * FROM nivelamento_sessoes WHERE id = ?', args: [id] });
      const sessao = sessaoResult.rows[0];
      if (sessao) {
        const hoje = new Date().toISOString().substring(0, 10);
        await turso.execute({
          sql: 'UPDATE alunos SET nivel_atual = ?, data_inicio_nivel = ? WHERE id = ?',
          args: [sessao.nivel_alvo, hoje, sessao.aluno_id]
        });
      }
    }

    res.json({ id, status: 'Concluído', resultado });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/nivelamentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await turso.execute({ sql: 'DELETE FROM nivelamento_sessoes WHERE id = ?', args: [id] });
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 10. EVENTOS & AVISOS (TURSO)
// ==========================================
app.get('/api/eventos', async (req, res) => {
  try {
    const result = await turso.execute('SELECT * FROM eventos ORDER BY data_evento ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/eventos', async (req, res) => {
  try {
    const { id: reqId, titulo, descricao, data_evento, horario, local, foto_url, preco, vagas_limite, vagas_preenchidas, status } = req.body;
    const id = reqId || `ev_${Date.now()}`;
    await turso.execute({
      sql: `INSERT INTO eventos (id, titulo, descricao, data_evento, horario, local, foto_url, preco, vagas_limite, vagas_preenchidas, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        titulo,
        descricao || null,
        data_evento,
        horario || '19:00',
        local || 'Sede 4ANDAR',
        foto_url || null,
        Number(preco) || 0,
        Number(vagas_limite) || 50,
        Number(vagas_preenchidas) || 0,
        status || 'Inscrições Abertas'
      ]
    });
    res.status(201).json({ id, titulo, status: status || 'Inscrições Abertas' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/eventos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, data_evento, horario, local, foto_url, preco, vagas_limite, vagas_preenchidas, status } = req.body;
    const updates = [];
    const args = [];
    if (titulo !== undefined) { updates.push('titulo = ?'); args.push(titulo); }
    if (descricao !== undefined) { updates.push('descricao = ?'); args.push(descricao); }
    if (data_evento !== undefined) { updates.push('data_evento = ?'); args.push(data_evento); }
    if (horario !== undefined) { updates.push('horario = ?'); args.push(horario); }
    if (local !== undefined) { updates.push('local = ?'); args.push(local); }
    if (foto_url !== undefined) { updates.push('foto_url = ?'); args.push(foto_url); }
    if (preco !== undefined) { updates.push('preco = ?'); args.push(Number(preco)); }
    if (vagas_limite !== undefined) { updates.push('vagas_limite = ?'); args.push(Number(vagas_limite)); }
    if (vagas_preenchidas !== undefined) { updates.push('vagas_preenchidas = ?'); args.push(Number(vagas_preenchidas)); }
    if (status !== undefined) { updates.push('status = ?'); args.push(status); }

    if (updates.length > 0) {
      args.push(id);
      await turso.execute({ sql: `UPDATE eventos SET ${updates.join(', ')} WHERE id = ?`, args });
    }
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/eventos/:id/inscrever', async (req, res) => {
  try {
    const { id } = req.params;
    const evResult = await turso.execute({ sql: 'SELECT * FROM eventos WHERE id = ?', args: [id] });
    if (evResult.rows.length === 0) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    const evento = evResult.rows[0];
    const preenchidas = (Number(evento.vagas_preenchidas) || 0) + 1;
    const novoStatus = preenchidas >= Number(evento.vagas_limite) ? 'Esgotado' : (evento.status || 'Inscrições Abertas');
    await turso.execute({
      sql: 'UPDATE eventos SET vagas_preenchidas = ?, status = ? WHERE id = ?',
      args: [preenchidas, novoStatus, id]
    });
    res.json({ success: true, id, vagas_preenchidas: preenchidas, status: novoStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/eventos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await turso.execute({ sql: 'DELETE FROM eventos WHERE id = ?', args: [id] });
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/avisos', async (req, res) => {
  try {
    const result = await turso.execute('SELECT * FROM avisos ORDER BY fixado DESC, data_publicacao DESC');
    const rows = result.rows.map((row) => ({
      ...row,
      fixado: Boolean(row.fixado),
      mostrar_popup: row.mostrar_popup === null || row.mostrar_popup === undefined ? true : Boolean(row.mostrar_popup),
      destinatario_tipo: row.destinatario_tipo || 'todos',
      prioridade: row.prioridade || 'normal'
    }));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/avisos', async (req, res) => {
  try {
    const { id: reqId, titulo, conteudo, link_url, link_texto, fixado, autor, destinatario_tipo, mostrar_popup, prioridade } = req.body;
    const id = reqId || `av_${Date.now()}`;
    const dataPub = new Date().toISOString().substring(0, 10);
    await turso.execute({
      sql: `INSERT INTO avisos (id, titulo, conteudo, data_publicacao, link_url, link_texto, fixado, autor, destinatario_tipo, mostrar_popup, prioridade)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        titulo,
        conteudo,
        dataPub,
        link_url || null,
        link_texto || null,
        fixado ? 1 : 0,
        autor || 'Coordenação',
        destinatario_tipo || 'todos',
        mostrar_popup === false ? 0 : 1,
        prioridade || 'normal'
      ]
    });
    res.status(201).json({ id, titulo, destinatario_tipo, mostrar_popup, prioridade });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/avisos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await turso.execute({
      sql: 'DELETE FROM avisos WHERE id = ?',
      args: [id]
    });
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// ==========================================
// INICIALIZAÇÃO DO SERVIDOR COM TURSO
// ==========================================
const startServer = async () => {
  try {
    await initTursoDatabase();
    isTursoReady = true;
    app.listen(PORT, () => {
      console.log(`\n🚀 4ANDAR API Server rodando na porta ${PORT}`);
      console.log(`💾 Banco de Dados: Turso (libSQL) Ativo & Sincronizado`);
    });
  } catch (err) {
    console.error('Falha ao iniciar servidor com Turso:', err);
  }
};

export default app;

if (!process.env.VERCEL) {
  startServer();
}
