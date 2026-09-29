-- ========================================================
-- 4ANDAR — Schema SQL para Turso (libSQL / SQLite)
-- ========================================================

-- 1. Alunos
CREATE TABLE IF NOT EXISTS alunos (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL,
  nivel_atual TEXT NOT NULL CHECK(nivel_atual IN ('B1', 'B2', 'I1', 'I2')),
  papel TEXT NOT NULL CHECK(papel IN ('Condutor', 'Conduzido', 'Ambos')),
  mensalidade_valor REAL NOT NULL DEFAULT 190.0,
  dia_vencimento INTEGER NOT NULL DEFAULT 5,
  data_matricula TEXT NOT NULL,
  data_inicio_nivel TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativo',
  foto_url TEXT,
  observacoes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Equipe (Professores e Administração)
CREATE TABLE IF NOT EXISTS equipe (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  papel_equipe TEXT NOT NULL,
  especialidades TEXT, -- JSON array de strings
  google_calendar_conectado INTEGER DEFAULT 0,
  ativo INTEGER DEFAULT 1,
  foto_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Turmas & Aulas
CREATE TABLE IF NOT EXISTS aulas (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  nivel TEXT NOT NULL CHECK(nivel IN ('B1', 'B2', 'I1', 'I2')),
  turno TEXT NOT NULL,
  dia_semana TEXT NOT NULL,
  horario_inicio TEXT NOT NULL,
  horario_fim TEXT NOT NULL,
  sala TEXT NOT NULL,
  equipe_id TEXT REFERENCES equipe(id),
  capacidade_maxima INTEGER DEFAULT 24,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Cronograma Semanal (Temas por Data/Turma)
CREATE TABLE IF NOT EXISTS cronogramas (
  id TEXT PRIMARY KEY,
  aula_id TEXT NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
  data_aula TEXT NOT NULL, -- YYYY-MM-DD
  tema_aula TEXT NOT NULL,
  observacoes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(aula_id, data_aula)
);

-- 5. Presenças & Chamadas
CREATE TABLE IF NOT EXISTS presencas (
  id TEXT PRIMARY KEY,
  aluno_id TEXT NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  aula_id TEXT NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
  data_presenca TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pendente', 'confirmada', 'ausente')),
  data_solicitacao TEXT NOT NULL,
  confirmado_por TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(aluno_id, aula_id, data_presenca)
);

-- 6. Pagamentos & Mensalidades
CREATE TABLE IF NOT EXISTS pagamentos (
  id TEXT PRIMARY KEY,
  aluno_id TEXT NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  valor REAL NOT NULL,
  data_pagamento TEXT,
  data_vencimento TEXT NOT NULL,
  metodo TEXT NOT NULL CHECK(metodo IN ('PIX', 'Cartão', 'Dinheiro')),
  tipo TEXT NOT NULL DEFAULT 'Mensalidade',
  status TEXT NOT NULL CHECK(status IN ('Pago', 'Pendente', 'Atrasado')),
  referencia_mes TEXT NOT NULL,
  comprovante_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Critérios de Nivelamento
CREATE TABLE IF NOT EXISTS criterios_nivelamento (
  id TEXT PRIMARY KEY,
  nivel TEXT NOT NULL CHECK(nivel IN ('B1', 'B2', 'I1', 'I2')),
  secao TEXT NOT NULL CHECK(secao IN ('Aulão', 'Dança a dois')),
  criterio TEXT NOT NULL,
  descricao TEXT,
  peso REAL DEFAULT 1
);

-- 8. Sessões de Nivelamento Técnico
CREATE TABLE IF NOT EXISTS nivelamento_sessoes (
  id TEXT PRIMARY KEY,
  aluno_id TEXT NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  data_agendada TEXT NOT NULL,
  nivel_atual TEXT NOT NULL,
  nivel_alvo TEXT NOT NULL,
  papel TEXT NOT NULL,
  avaliador_aulao TEXT,
  avaliador_danca TEXT,
  avaliador_observa TEXT,
  status TEXT NOT NULL CHECK(status IN ('Agendado', 'Concluído', 'Cancelado')),
  resultado TEXT CHECK(resultado IN ('Aprovado', 'Reprovado')),
  feedback_aulao TEXT,
  feedback_danca TEXT,
  feedback_geral TEXT,
  notas TEXT, -- JSON com notas por critério
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. Eventos, Bailes & Workshops
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
  status TEXT DEFAULT 'Inscrições Abertas',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. Mural de Avisos
CREATE TABLE IF NOT EXISTS avisos (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  data_publicacao TEXT NOT NULL,
  link_url TEXT,
  link_texto TEXT,
  fixado INTEGER DEFAULT 0,
  autor TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
