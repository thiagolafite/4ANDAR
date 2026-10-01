import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });
if (!process.env.TURSO_DATABASE_URL) {
  dotenv.config({ path: path.join(__dirname, '../../../.env') });
}

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

const schedulesPath = 'C:/Users/LafiteLima/.gemini/antigravity/brain/34bf1afd-5e84-4c1f-90b5-6100c7e5f69f/scratch/generated_schedules.json';
const schedulesData = JSON.parse(fs.readFileSync(schedulesPath, 'utf8'));

async function seedDatabase() {
  console.log('Connecting to Turso...');

  // 1. Create or sync Aulas
  const aulasToInsert = [
    { id: 'aul_b1_m', nome: 'B1 Manhã', nivel: 'B1', turno: 'Manhã', dia_semana: 'Sábado', horario_inicio: '10:00', horario_fim: '11:30', sala: 'Salão 2 (Dominguinhos)', equipe_id: 'eq_bia', capacidade_maxima: 24 },
    { id: 'aul_i2_m', nome: 'I2 Manhã', nivel: 'I2', turno: 'Manhã', dia_semana: 'Sábado', horario_inicio: '10:00', horario_fim: '11:30', sala: 'Salão Principal (Gonzagão)', equipe_id: 'eq_davidson', capacidade_maxima: 20 },
    { id: 'aul_b2_m', nome: 'B2 Manhã', nivel: 'B2', turno: 'Manhã', dia_semana: 'Sábado', horario_inicio: '11:30', horario_fim: '13:00', sala: 'Salão Principal (Gonzagão)', equipe_id: 'eq_tony', capacidade_maxima: 22 },
    { id: 'aul_i1_m', nome: 'I1 Manhã', nivel: 'I1', turno: 'Manhã', dia_semana: 'Sábado', horario_inicio: '11:30', horario_fim: '13:00', sala: 'Salão 2 (Dominguinhos)', equipe_id: 'eq_gao', capacidade_maxima: 20 },
    { id: 'aul_b1_t', nome: 'B1 Tarde', nivel: 'B1', turno: 'Tarde', dia_semana: 'Sábado', horario_inicio: '14:00', horario_fim: '15:30', sala: 'Salão Principal (Gonzagão)', equipe_id: 'eq_messias', capacidade_maxima: 24 },
    { id: 'aul_i1_t', nome: 'I1 Tarde', nivel: 'I1', turno: 'Tarde', dia_semana: 'Sábado', horario_inicio: '14:00', horario_fim: '15:30', sala: 'Salão 2 (Dominguinhos)', equipe_id: 'eq_gao', capacidade_maxima: 22 },
    { id: 'aul_b2_t', nome: 'B2 Tarde', nivel: 'B2', turno: 'Tarde', dia_semana: 'Sábado', horario_inicio: '15:30', horario_fim: '17:00', sala: 'Salão Principal (Gonzagão)', equipe_id: 'eq_taz', capacidade_maxima: 22 },
    { id: 'aul_i2_t', nome: 'I2 Tarde', nivel: 'I2', turno: 'Tarde', dia_semana: 'Sábado', horario_inicio: '15:30', horario_fim: '17:00', sala: 'Salão 2 (Dominguinhos)', equipe_id: 'eq_davidson', capacidade_maxima: 20 },
  ];

  const aulaStatements = aulasToInsert.map(a => ({
    sql: `INSERT OR REPLACE INTO aulas (id, nome, nivel, turno, dia_semana, horario_inicio, horario_fim, sala, equipe_id, capacidade_maxima)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [a.id, a.nome, a.nivel, a.turno, a.dia_semana, a.horario_inicio, a.horario_fim, a.sala, a.equipe_id, a.capacidade_maxima]
  }));
  await db.batch(aulaStatements);
  console.log(`Inserted/updated ${aulasToInsert.length} official Turmas via batch.`);

  // 2. Insert Teachers (Equipe)
  const teachers = [
    { id: 'eq_bia', nome: 'Bia Barreto', email: 'bia@4andar.com.br', telefone: '(71) 99100-0001', papel: 'Professor', especialidades: ['Básico 1', 'Básico 2', 'Musicalidade'] },
    { id: 'eq_tony', nome: 'Tony (Antônio)', email: 'tony@4andar.com.br', telefone: '(71) 99100-0002', papel: 'Professor', especialidades: ['Básico 2', 'Passos de Cintura', 'Banana'] },
    { id: 'eq_davidson', nome: 'Davidson', email: 'davidson@4andar.com.br', telefone: '(71) 99100-0003', papel: 'Professor', especialidades: ['Intermediário 1', 'Intermediário 2', 'Sacadas'] },
    { id: 'eq_gao', nome: 'Gão', email: 'gao@4andar.com.br', telefone: '(71) 99100-0004', papel: 'Professor', especialidades: ['Intermediário 1', 'Avião com Contratempo', 'Paulista'] },
    { id: 'eq_july', nome: 'July', email: 'july@4andar.com.br', telefone: '(71) 99100-0005', papel: 'Professor', especialidades: ['Básico 1', 'Básico 2', 'Postura e Giros'] },
    { id: 'eq_messias', nome: 'Messias', email: 'messias@4andar.com.br', telefone: '(71) 99100-0006', papel: 'Professor', especialidades: ['Básico 1', 'Soltinho', 'Meio Giro'] },
    { id: 'eq_taz', nome: 'Taz', email: 'taz@4andar.com.br', telefone: '(71) 99100-0007', papel: 'Professor', especialidades: ['Básico 2', 'Esmeril', 'Contratempos'] },
  ];

  const teacherStatements = teachers.map(t => ({
    sql: `INSERT OR REPLACE INTO equipe (id, nome, email, telefone, papel_equipe, especialidades, google_calendar_conectado, ativo, foto_url)
          VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?)`,
    args: [t.id, t.nome, t.email, t.telefone, t.papel, JSON.stringify(t.especialidades), `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`]
  }));
  await db.batch(teacherStatements);
  console.log(`Inserted/updated ${teachers.length} teachers via batch.`);

  // Map turma name to ID
  const turmaIdMap = {
    'B1 Manhã': 'aul_b1_m',
    'I2 Manhã': 'aul_i2_m',
    'B2 Manhã': 'aul_b2_m',
    'I1 Manhã': 'aul_i1_m',
    'B1 Tarde': 'aul_b1_t',
    'I1 Tarde': 'aul_i1_t',
    'B2 Tarde': 'aul_b2_t',
    'I2 Tarde': 'aul_i2_t',
  };

  // 3. Clear existing cronogramas to have clean official planning
  await db.execute('DELETE FROM cronogramas');
  console.log('Cleared existing cronogramas table for clean import.');

  // 4. Build batch of statements for cronogramas
  const cronoStatements = [];

  // 2026
  for (const w of schedulesData.weeks2026) {
    for (const [tName, info] of Object.entries(w.turmas)) {
      const aulaId = turmaIdMap[tName];
      if (!aulaId) continue;
      const cId = `crono_2026_${w.isoDate}_${aulaId}`;
      const obs = info.prof ? `Prof: ${info.prof}` : null;
      cronoStatements.push({
        sql: `INSERT INTO cronogramas (id, aula_id, data_aula, tema_aula, observacoes)
              VALUES (?, ?, ?, ?, ?)`,
        args: [cId, aulaId, w.isoDate, info.tema, obs]
      });
    }
  }

  // 2023
  for (const w of schedulesData.weeks2023) {
    for (const [tName, info] of Object.entries(w.turmas)) {
      const aulaId = turmaIdMap[tName];
      if (!aulaId) continue;
      if (!info.tema && !info.prof) continue;
      const cId = `crono_2023_${w.isoDate}_${aulaId}`;
      const tema = info.tema || (info.prof ? `Aula com ${info.prof}` : 'Planejamento Regular');
      const obs = info.prof ? `Prof: ${info.prof}` : null;
      cronoStatements.push({
        sql: `INSERT INTO cronogramas (id, aula_id, data_aula, tema_aula, observacoes)
              VALUES (?, ?, ?, ?, ?)`,
        args: [cId, aulaId, w.isoDate, tema, obs]
      });
    }
  }

  console.log(`Total cronograma statements to batch execute: ${cronoStatements.length}`);

  // Execute in chunks of 50
  const chunkSize = 50;
  for (let i = 0; i < cronoStatements.length; i += chunkSize) {
    const chunk = cronoStatements.slice(i, i + chunkSize);
    await db.batch(chunk);
    console.log(`Batch inserted ${i + chunk.length} / ${cronoStatements.length}...`);
  }

  console.log('All cronogramas seeded into Turso successfully!');
}

seedDatabase().catch(e => {
  console.error('Seed error:', e);
});
