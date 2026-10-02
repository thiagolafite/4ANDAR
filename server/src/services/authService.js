import crypto from 'crypto';

/**
 * Gera hash seguro de senha utilizando scrypt nativo do Node.js
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Valida a senha informada contra o hash armazenado
 */
export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, key] = stored.split(':');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return hash === key;
}

/**
 * Permissões padrão para cada perfil
 */
export function getDefaultPermissions(role) {
  if (role === 'master' || role === 'admin_master') {
    return {
      all: true,
      dashboard: { view: true },
      alunos: { view: true, create: true, edit: true, delete: true },
      cronograma: { view: true, edit: true, import_excel: true },
      presenca: { view: true, manage: true, checkin: true },
      pagamentos: { view: true, manage: true, export: true },
      nivelamento: { view: true, evaluate: true, schedule: true },
      aulas: { view: true, manage: true },
      eventos: { view: true, manage: true },
      avisos: { view: true, manage: true },
      equipe: { view: true, manage: true },
      usuarios: { view: true, manage: true, approve: true }
    };
  }

  if (role === 'secretaria') {
    return {
      all: false,
      dashboard: { view: true },
      alunos: { view: true, create: true, edit: true, delete: false },
      cronograma: { view: true, edit: false, import_excel: false },
      presenca: { view: true, manage: true, checkin: true },
      pagamentos: { view: true, manage: true, export: true },
      nivelamento: { view: true, evaluate: false, schedule: true },
      aulas: { view: true, manage: true },
      eventos: { view: true, manage: true },
      avisos: { view: true, manage: true },
      equipe: { view: true, manage: false },
      usuarios: { view: false, manage: false, approve: false }
    };
  }

  if (role === 'admin') {
    return {
      all: false,
      dashboard: { view: true },
      alunos: { view: true, create: true, edit: true, delete: false },
      cronograma: { view: true, edit: true, import_excel: true },
      presenca: { view: true, manage: true, checkin: true },
      pagamentos: { view: true, manage: true, export: true },
      nivelamento: { view: true, evaluate: true, schedule: true },
      aulas: { view: true, manage: true },
      eventos: { view: true, manage: true },
      avisos: { view: true, manage: true },
      equipe: { view: true, manage: false },
      usuarios: { view: false, manage: false, approve: false }
    };
  }

  if (role === 'professor') {
    return {
      all: false,
      dashboard: { view: true },
      alunos: { view: true, create: true, edit: true, delete: false },
      cronograma: { view: true, edit: true, import_excel: false },
      presenca: { view: true, manage: true, checkin: true },
      pagamentos: { view: false, manage: false, export: false },
      nivelamento: { view: true, evaluate: true, schedule: true },
      aulas: { view: true, manage: true },
      eventos: { view: true, manage: false },
      avisos: { view: true, manage: true },
      equipe: { view: true, manage: false },
      usuarios: { view: false, manage: false, approve: false }
    };
  }

  // Aluno: Acesso estritamente restrito:
  // - os eventos que ele for convidado (eventos: view)
  // - as aulas dele (aulas: view_own)
  // - o nivelamento dele (nivelamento: schedule, view_own)
  // - marcar presença na aula dele (presenca: checkin)
  // Qualquer outro acesso é restrito para Master e Professor
  return {
    all: false,
    dashboard: { view: true },
    alunos: { view: false, create: false, edit: false, delete: false },
    cronograma: { view: false, edit: false, import_excel: false },
    presenca: { view: false, manage: false, checkin: true },
    pagamentos: { view: false, manage: false, export: false },
    nivelamento: { view: false, evaluate: false, schedule: true, view_own: true },
    aulas: { view: false, manage: false, view_own: true },
    eventos: { view: true, manage: false },
    avisos: { view: false, manage: false },
    equipe: { view: false, manage: false },
    usuarios: { view: false, manage: false, approve: false }
  };
}

/**
 * Cria token de autenticação seguro em formato de payload codificado
 */
export function createSessionToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    is_master: user.is_master,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 30 // 30 dias de validade
  };
  const str = JSON.stringify(payload);
  const secret = process.env.AUTH_SECRET || '4andar-super-secret-key-2026';
  const sig = crypto.createHmac('sha256', secret).update(str).digest('hex');
  return Buffer.from(str).toString('base64') + '.' + sig;
}

/**
 * Valida o token de sessão
 */
export function verifySessionToken(token) {
  try {
    if (!token || !token.includes('.')) return null;
    const [b64, sig] = token.split('.');
    const str = Buffer.from(b64, 'base64').toString('utf8');
    const secret = process.env.AUTH_SECRET || '4andar-super-secret-key-2026';
    const expectedSig = crypto.createHmac('sha256', secret).update(str).digest('hex');
    if (sig !== expectedSig) return null;

    const payload = JSON.parse(str);
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
