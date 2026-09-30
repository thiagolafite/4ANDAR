import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega as 52 semanas oficiais do cronograma
const dataFilePath = path.join(__dirname, '../../../client/src/data/annualScheduleData.ts');
const fileContent = fs.readFileSync(dataFilePath, 'utf8');

const sqlStatements = [];

sqlStatements.push(`-- =================================================================
-- 4ANDAR — SCRIPT DE CRIAÇÃO E CARGA COMPLETA NO TURSO (libSQL)
-- Escola de Dança de Salão & Forró Pé de Serra
-- =================================================================

-- 1. TABELA DE ALUNOS
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

-- 2. TABELA DE EQUIPE / PROFESSORES
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

-- 3. TABELA DE AULAS / TURMAS
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

-- 4. TABELA DE CRONOGRAMAS (PLANEJAMENTO SEMANAL / ANUAL)
CREATE TABLE IF NOT EXISTS cronogramas (
  id TEXT PRIMARY KEY,
  aula_id TEXT NOT NULL,
  data_aula TEXT NOT NULL,
  tema_aula TEXT NOT NULL,
  observacoes TEXT
);

-- 5. TABELA DE PRESENÇAS / CHAMADA
CREATE TABLE IF NOT EXISTS presencas (
  id TEXT PRIMARY KEY,
  aluno_id TEXT NOT NULL,
  aula_id TEXT NOT NULL,
  data_presenca TEXT NOT NULL,
  status TEXT NOT NULL,
  data_solicitacao TEXT NOT NULL,
  confirmado_por TEXT
);

-- 6. TABELA DE PAGAMENTOS
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

-- 7. TABELA DE NIVELAMENTOS TÉCNICOS
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

-- 8. TABELA DE EVENTOS & BAILES
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

-- 9. TABELA DE AVISOS DO MURAL
CREATE TABLE IF NOT EXISTS avisos (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  data_publicacao TEXT NOT NULL,
  link_url TEXT,
  link_texto TEXT,
  fixado INTEGER DEFAULT 0,
  autor TEXT NOT NULL
);
`);

// Seed Alunos
sqlStatements.push(`
-- CARGA DE ALUNOS
INSERT OR REPLACE INTO alunos (id, user_id, nome, telefone, email, nivel_atual, papel, mensalidade_valor, dia_vencimento, data_matricula, data_inicio_nivel, status, foto_url, observacoes) VALUES
('al_1', 'usr_aluno_1', 'Carlos Eduardo Oliveira', '(11) 99123-4567', 'carlos.oliveira@email.com', 'B1', 'Condutor', 190.0, 5, '2026-06-10', '2026-06-10', 'ativo', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Foco no tempo 1 do Xote'),
('al_2', 'usr_aluno_2', 'Camila Santos Rocha', '(11) 98234-5678', 'camila.rocha@email.com', 'B2', 'Conduzido', 190.0, 10, '2026-02-15', '2026-05-20', 'ativo', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'Aluna dedicada'),
('al_3', 'usr_aluno_3', 'Rodrigo Alencar Lima', '(11) 97345-6789', 'rodrigo.alencar@email.com', 'I1', 'Condutor', 220.0, 15, '2025-08-01', '2026-03-12', 'ativo', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'Participa de workshops'),
('al_4', 'usr_aluno_4', 'Juliana Mendes Ferraz', '(11) 96456-7890', 'juliana.ferraz@email.com', 'I2', 'Ambos', 220.0, 5, '2025-01-10', '2026-01-20', 'ativo', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'Bailarina experiente'),
('al_5', 'usr_aluno_5', 'Felipe Santana Barbosa', '(11) 95567-8901', 'felipe.santana@email.com', 'B1', 'Condutor', 190.0, 5, '2026-08-01', '2026-08-01', 'ativo', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'Atenção ao tempo básico do xote'),
('al_6', 'usr_aluno_6', 'Beatriz Martins Nunes', '(11) 94678-9012', 'beatriz.nunes@email.com', 'B2', 'Conduzido', 190.0, 10, '2026-03-05', '2026-06-15', 'ativo', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', 'Excelente ritmo no baião');
`);

// Seed Equipe
sqlStatements.push(`
-- CARGA DE EQUIPE / PROFESSORES
INSERT OR REPLACE INTO equipe (id, user_id, nome, email, telefone, papel_equipe, especialidades, google_calendar_conectado, ativo, foto_url) VALUES
('eq_1', 'usr_admin', 'Mariana Sol', 'mariana.sol@4andar.com.br', '(11) 98765-4321', 'Professor', '["Forró Universitário","Conexão & Abraço"]', 1, 1, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
('eq_2', 'usr_prof_2', 'Mestre Gonzaga Silva', 'gonzaga.silva@4andar.com.br', '(11) 97654-3210', 'Professor', '["Pé de Serra","Baião & Arrasta-pé"]', 1, 1, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
('eq_3', 'usr_prof_3', 'Clarice Falcão Guimarães', 'clarice.guimaraes@4andar.com.br', '(11) 96543-2109', 'Instrutor', '["Musicalidade","Xaxado & Xote"]', 0, 1, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150');
`);

// Seed Aulas
sqlStatements.push(`
-- CARGA DAS TURMAS OFICIAIS DO 4ANDAR (SÁBADOS & SEMANAIS)
INSERT OR REPLACE INTO aulas (id, nome, nivel, turno, dia_semana, horario_inicio, horario_fim, sala, equipe_id, capacidade_maxima) VALUES
('aul_i2_manha', 'I2 Manhã', 'I2', 'Manhã', 'Sábado', '10:00', '11:30', 'Salão Principal (Gonzagão)', 'eq_2', 20),
('aul_i1_tarde', 'I1 Tarde', 'I1', 'Tarde', 'Sábado', '14:00', '15:30', 'Salão 2 (Dominguinhos)', 'eq_1', 22),
('aul_b1_manha', 'B1 Manhã', 'B1', 'Manhã', 'Sábado', '10:00', '11:30', 'Salão 2 (Dominguinhos)', 'eq_2', 24),
('aul_b2_manha', 'B2 Manhã', 'B2', 'Manhã', 'Sábado', '11:30', '13:00', 'Salão Principal (Gonzagão)', 'eq_1', 22),
('aul_b2_tarde', 'B2 Tarde', 'B2', 'Tarde', 'Sábado', '15:30', '17:00', 'Salão Principal (Gonzagão)', 'eq_1', 22),
('aul_i1_manha', 'I1 Manhã', 'I1', 'Manhã', 'Sábado', '11:30', '13:00', 'Salão 2 (Dominguinhos)', 'eq_2', 20),
('aul_b1_tarde', 'B1 Tarde', 'B1', 'Tarde', 'Sábado', '14:00', '15:30', 'Salão Principal (Gonzagão)', 'eq_2', 24),
('aul_b1_noite', 'Básico 1 — Terça & Quinta (Noite)', 'B1', 'Noite', 'Terça', '19:30', '20:45', 'Salão Principal (Gonzagão)', 'eq_2', 24),
('aul_b2_noite', 'Básico 2 — Segunda & Quarta (Noite)', 'B2', 'Noite', 'Quarta', '20:00', '21:15', 'Salão Principal (Gonzagão)', 'eq_1', 22),
('aul_i1_noite', 'Intermediário 1 — Terça & Quinta (Noite)', 'I1', 'Noite', 'Quinta', '20:45', '22:00', 'Salão Principal (Gonzagão)', 'eq_1', 20);
`);

// Parse 52 weeks from annualScheduleData.ts
const turmasMap = {
  'I2 Manhã': 'aul_i2_manha',
  'I1 Tarde': 'aul_i1_tarde',
  'B1 Manhã': 'aul_b1_manha',
  'B2 Manhã': 'aul_b2_manha',
  'B2 Tarde': 'aul_b2_tarde',
  'I1 Manhã': 'aul_i1_manha',
  'B1 Tarde': 'aul_b1_tarde'
};

const cronoInserts = [];
const rowRegex = /data:\s*'([^']+)',\s*label:\s*'([^']+)',\s*temas:\s*\{([^}]+)\}/gs;
let match;
let rowIndex = 0;

while ((match = rowRegex.exec(fileContent)) !== null) {
  const dateIso = match[1];
  const temasBlock = match[3];

  Object.entries(turmasMap).forEach(([turmaNome, aulaId]) => {
    const r = new RegExp("'" + turmaNome + "':\\s*'([^']+)'");
    const m = temasBlock.match(r);
    if (m && m[1]) {
      const tema = m[1].replace(/'/g, "''");
      const id = `crono_${rowIndex}_${aulaId}`;
      cronoInserts.push(`('${id}', '${aulaId}', '${dateIso}', '${tema}', NULL)`);
    }
  });
  rowIndex++;
}

sqlStatements.push(`
-- CARGA DAS 364 AULAS DO CRONOGRAMA ANUAL (52 SÁBADOS DE 2026)
INSERT OR REPLACE INTO cronogramas (id, aula_id, data_aula, tema_aula, observacoes) VALUES
${cronoInserts.join(',\n')};
`);

// Seed Pagamentos, Presenças, Eventos, Avisos
sqlStatements.push(`
-- CARGA DE PRESENÇAS
INSERT OR REPLACE INTO presencas (id, aluno_id, aula_id, data_presenca, status, data_solicitacao, confirmado_por) VALUES
('pre_1', 'al_1', 'aul_b1_manha', '2026-01-11', 'confirmada', '2026-01-10 14:20', 'Mariana Sol'),
('pre_2', 'al_2', 'aul_b2_manha', '2026-01-11', 'confirmada', '2026-01-10 15:30', 'Mariana Sol');

-- CARGA DE PAGAMENTOS
INSERT OR REPLACE INTO pagamentos (id, aluno_id, valor, data_pagamento, data_vencimento, metodo, tipo, status, referencia_mes) VALUES
('pag_1', 'al_1', 190.0, '2026-09-04', '2026-09-05', 'PIX', 'Mensalidade', 'Pago', 'Setembro/2026'),
('pag_2', 'al_1', 190.0, NULL, '2026-10-05', 'PIX', 'Mensalidade', 'Pendente', 'Outubro/2026'),
('pag_3', 'al_2', 190.0, NULL, '2026-09-10', 'PIX', 'Mensalidade', 'Atrasado', 'Setembro/2026');

-- CARGA DE EVENTOS
INSERT OR REPLACE INTO eventos (id, titulo, descricao, data_evento, horario, local, foto_url, preco, vagas_limite, vagas_preenchidas, status) VALUES
('ev_1', 'Grande Forró do 4ANDAR com Trio Pé de Serra', 'Uma noite inesquecível de forró autêntico e xote com o Trio Zabumba Dourada.', '2026-10-17', '21:00 às 03:00', 'Salão Nobre do 4ANDAR', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600', 35.0, 150, 98, 'Inscrições Abertas');

-- CARGA DE AVISOS
INSERT OR REPLACE INTO avisos (id, titulo, conteudo, data_publicacao, link_url, link_texto, fixado, autor) VALUES
('av_1', 'Inscrições abertas para a Banca de Nivelamento Técnico', 'Estão abertas as inscrições para as sessões de nivelamento para os níveis B2, I1 e I2.', '2026-09-25', '/agendamento-nivelamento', 'Agendar meu nivelamento', 1, 'Mariana Sol (Coordenação)');
`);

const finalSql = sqlStatements.join('\n');
const outputPath = path.join(__dirname, '../../../schema_turso_4andar.sql');
fs.writeFileSync(outputPath, finalSql, 'utf8');

console.log(`✅ Arquivo SQL gerado com sucesso: ${outputPath}`);
console.log(`📊 Total de tabelas criadas: 9`);
console.log(`📅 Total de aulas do cronograma inseridas no SQL: ${cronoInserts.length}`);
