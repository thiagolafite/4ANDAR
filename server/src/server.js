import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import dotenv from 'dotenv';
import { readDB, writeDB } from './db/database.js';
import { enviarLembreteMensalidade } from './services/emailService.js';
import { sincronizarAulasCalendar } from './services/googleCalendarService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ==========================================
// 1. HEALTH & METADATA
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: '4ANDAR — Gestão Escolar de Dança',
    architecture: '100% Autônomo & Independente (Sem dependência de Base44)',
    time: new Date().toISOString()
  });
});

// ==========================================
// 2. ALUNOS CRUD
// ==========================================
app.get('/api/alunos', (req, res) => {
  const db = readDB();
  res.json(db.alunos || []);
});

app.post('/api/alunos', (req, res) => {
  const db = readDB();
  const novo = { id: `al_${Date.now()}`, ...req.body };
  db.alunos.unshift(novo);
  writeDB(db);
  res.status(201).json(novo);
});

app.put('/api/alunos/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const idx = db.alunos.findIndex((a) => a.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Aluno não encontrado' });

  db.alunos[idx] = { ...db.alunos[idx], ...req.body };
  writeDB(db);
  res.json(db.alunos[idx]);
});

app.delete('/api/alunos/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.alunos = db.alunos.filter((a) => a.id !== id);
  writeDB(db);
  res.json({ success: true, message: 'Aluno removido com sucesso' });
});

// ==========================================
// 3. EQUIPE & PROFESSORES
// ==========================================
app.get('/api/equipe', (req, res) => {
  const db = readDB();
  res.json(db.equipe || []);
});

app.post('/api/equipe', (req, res) => {
  const db = readDB();
  const novo = { id: `eq_${Date.now()}`, ...req.body };
  db.equipe.push(novo);
  writeDB(db);
  res.status(201).json(novo);
});

// ==========================================
// 4. AULAS & CRONOGRAMA SEMANAL
// ==========================================
app.get('/api/aulas', (req, res) => {
  const db = readDB();
  res.json(db.aulas || []);
});

app.post('/api/aulas', (req, res) => {
  const db = readDB();
  const nova = { id: `aul_${Date.now()}`, ...req.body };
  db.aulas.push(nova);
  writeDB(db);
  res.status(201).json(nova);
});

app.get('/api/cronograma', (req, res) => {
  const db = readDB();
  res.json(db.cronogramas || []);
});

app.put('/api/cronograma', (req, res) => {
  const { aula_id, data_aula, tema_aula, observacoes } = req.body;
  const db = readDB();
  const existing = db.cronogramas.find((c) => c.aula_id === aula_id && c.data_aula === data_aula);

  if (existing) {
    existing.tema_aula = tema_aula;
    existing.observacoes = observacoes;
    writeDB(db);
    return res.json(existing);
  }

  const novo = { id: `crono_${Date.now()}`, aula_id, data_aula, tema_aula, observacoes };
  db.cronogramas.push(novo);
  writeDB(db);
  res.status(201).json(novo);
});

// ==========================================
// 5. PRESENÇA & CHAMADA
// ==========================================
app.get('/api/presencas', (req, res) => {
  const db = readDB();
  res.json(db.presencas || []);
});

app.post('/api/presencas/solicitar', (req, res) => {
  const { aluno_id, aula_id, data_presenca } = req.body;
  const db = readDB();
  const nova = {
    id: `pre_${Date.now()}`,
    aluno_id,
    aula_id,
    data_presenca,
    status: 'pendente',
    data_solicitacao: new Date().toISOString()
  };
  db.presencas.unshift(nova);
  writeDB(db);
  res.status(201).json(nova);
});

app.put('/api/presencas/:id/confirmar', (req, res) => {
  const { id } = req.params;
  const { confirmado_por } = req.body;
  const db = readDB();
  const p = db.presencas.find((item) => item.id === id);
  if (!p) return res.status(404).json({ error: 'Presença não encontrada' });

  p.status = 'confirmada';
  p.confirmado_por = confirmado_por || 'Equipe 4ANDAR';
  writeDB(db);
  res.json(p);
});

app.put('/api/presencas/:id/ausente', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const p = db.presencas.find((item) => item.id === id);
  if (!p) return res.status(404).json({ error: 'Presença não encontrada' });

  p.status = 'ausente';
  writeDB(db);
  res.json(p);
});

// ==========================================
// 6. PAGAMENTOS & FINANCEIRO
// ==========================================
app.get('/api/pagamentos', (req, res) => {
  const db = readDB();
  res.json(db.pagamentos || []);
});

app.post('/api/pagamentos', (req, res) => {
  const db = readDB();
  const novo = { id: `pag_${Date.now()}`, ...req.body };
  db.pagamentos.unshift(novo);
  writeDB(db);
  res.status(201).json(novo);
});

app.put('/api/pagamentos/:id/baixar', (req, res) => {
  const { id } = req.params;
  const { metodo } = req.body;
  const db = readDB();
  const pag = db.pagamentos.find((p) => p.id === id);
  if (!pag) return res.status(404).json({ error: 'Pagamento não encontrado' });

  pag.status = 'Pago';
  pag.metodo = metodo || 'PIX';
  pag.data_pagamento = new Date().toISOString().substring(0, 10);
  writeDB(db);
  res.json(pag);
});

// ==========================================
// 7. WORKFLOW: LEMBRETES DE MENSALIDADE
// (Totalmente próprio - Sem backend do Base44)
// ==========================================
export const processarLembretesMensalidade = async () => {
  const db = readDB();
  const hoje = new Date();
  const limiteTresDias = new Date(hoje);
  limiteTresDias.setDate(hoje.getDate() + 3);

  const pagamentosElegiveis = db.pagamentos.filter((p) => {
    if (p.status === 'Pago') return false;
    const v = new Date(p.data_vencimento);
    return v <= limiteTresDias || p.status === 'Atrasado';
  });

  const envios = [];

  for (const pag of pagamentosElegiveis) {
    const aluno = db.alunos.find((a) => a.id === pag.aluno_id);
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
      console.error(`Erro ao enviar para ${aluno.email}:`, err.message);
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

// Endpoint sob demanda para disparar lembretes
app.post('/api/workflows/enviar-lembretes-mensalidade', async (req, res) => {
  try {
    const envios = await processarLembretesMensalidade();
    res.json({
      success: true,
      message: 'Workflow de régua de cobrança executado com sucesso.',
      total_enviados: envios.filter((e) => e.status_envio === 'sucesso').length,
      detalhes: envios
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Agendador diário nativo em Node.js (Executa todo dia às 08:00 AM automaticamente)
cron.schedule('0 8 * * *', async () => {
  console.log('⏰ [CRON NATIVO] Disparando régua diária de cobrança automática...');
  try {
    await processarLembretesMensalidade();
  } catch (err) {
    console.error('Erro no cron de lembretes:', err);
  }
});

// ==========================================
// 8. INTEGRAÇÃO: GOOGLE CALENDAR (Deduplicada)
// (Totalmente própria - Sem backend do Base44)
// ==========================================
app.post('/api/integracoes/sincronizar-aulas-calendar', async (req, res) => {
  try {
    const { professor_id, professor_email, access_token } = req.body;
    const db = readDB();

    const aulasDoProf = db.aulas.filter(
      (a) => a.equipe_id === professor_id || !professor_id
    );

    const aulasComCronograma = aulasDoProf.map((aula) => {
      const crono = db.cronogramas.find((c) => c.aula_id === aula.id);
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
// 9. NIVELAMENTO TÉCNICO & BANCA
// ==========================================
app.get('/api/nivelamentos', (req, res) => {
  const db = readDB();
  res.json(db.nivelamentoSessoes || []);
});

app.post('/api/nivelamentos/agendar', (req, res) => {
  const db = readDB();
  const nova = { id: `niv_${Date.now()}`, status: 'Agendado', ...req.body };
  db.nivelamentoSessoes.push(nova);
  writeDB(db);
  res.status(201).json(nova);
});

app.put('/api/nivelamentos/:id/avaliar', (req, res) => {
  const { id } = req.params;
  const { resultado, feedback_geral, feedback_aulao, feedback_danca, notas } = req.body;
  const db = readDB();

  const sessao = db.nivelamentoSessoes.find((s) => s.id === id);
  if (!sessao) return res.status(404).json({ error: 'Sessão de nivelamento não encontrada' });

  sessao.status = 'Concluído';
  sessao.resultado = resultado;
  sessao.feedback_geral = feedback_geral;
  sessao.feedback_aulao = feedback_aulao;
  sessao.feedback_danca = feedback_danca;
  sessao.notas = notas;

  // Requisito: ao aprovar, promove automaticamente o nível do aluno
  if (resultado === 'Aprovado') {
    const aluno = db.alunos.find((a) => a.id === sessao.aluno_id);
    if (aluno) {
      aluno.nivel_atual = sessao.nivel_alvo;
      aluno.data_inicio_nivel = new Date().toISOString().substring(0, 10);
    }
  }

  writeDB(db);
  res.json(sessao);
});

// ==========================================
// 10. EVENTOS & AVISOS
// ==========================================
app.get('/api/eventos', (req, res) => {
  const db = readDB();
  res.json(db.eventos || []);
});

app.get('/api/avisos', (req, res) => {
  const db = readDB();
  res.json(db.avisos || []);
});

app.post('/api/avisos', (req, res) => {
  const db = readDB();
  const novo = { id: `av_${Date.now()}`, ...req.body };
  db.avisos.unshift(novo);
  writeDB(db);
  res.status(201).json(novo);
});

app.listen(PORT, () => {
  console.log(`\n🚀 4ANDAR API Server rodando na porta ${PORT}`);
  console.log(`📡 Sistema 100% Autônomo e Independente de Plataformas Externas.`);
});
