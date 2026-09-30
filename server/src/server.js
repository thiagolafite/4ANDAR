import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import dotenv from 'dotenv';
import { turso, initTursoDatabase } from './db/turso.js';
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
    const result = await turso.execute('SELECT * FROM alunos ORDER BY nome ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/alunos', async (req, res) => {
  try {
    const {
      nome, telefone, email, nivel_atual, papel,
      mensalidade_valor, dia_vencimento, data_matricula,
      data_inicio_nivel, status, foto_url, observacoes
    } = req.body;

    const id = `al_${Date.now()}`;

    await turso.execute({
      sql: `INSERT INTO alunos (id, nome, telefone, email, nivel_atual, papel, mensalidade_valor, dia_vencimento, data_matricula, data_inicio_nivel, status, foto_url, observacoes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, nome, telefone, email, nivel_atual || 'B1', papel || 'Condutor',
        mensalidade_valor || 190.0, dia_vencimento || 5,
        data_matricula || new Date().toISOString().substring(0, 10),
        data_inicio_nivel || new Date().toISOString().substring(0, 10),
        status || 'ativo', foto_url || null, observacoes || null
      ]
    });

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
      nome, telefone, email, nivel_atual, papel,
      mensalidade_valor, dia_vencimento, status, observacoes
    } = req.body;

    await turso.execute({
      sql: `UPDATE alunos SET 
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
      args: [nome, telefone, email, nivel_atual, papel, mensalidade_valor, dia_vencimento, status, observacoes, id]
    });

    const updated = await turso.execute({ sql: 'SELECT * FROM alunos WHERE id = ?', args: [id] });
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/alunos/:id', async (req, res) => {
  try {
    const { id } = req.params;
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
    const { nome, email, telefone, papel_equipe, especialidades, foto_url } = req.body;
    const id = `eq_${Date.now()}`;
    await turso.execute({
      sql: `INSERT INTO equipe (id, nome, email, telefone, papel_equipe, especialidades, foto_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [id, nome, email, telefone || null, papel_equipe || 'Professor', JSON.stringify(especialidades || []), foto_url || null]
    });
    res.status(201).json({ id, nome, email, papel_equipe });
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
    const { nome, nivel, turno, dia_semana, horario_inicio, horario_fim, sala, equipe_id, capacidade_maxima } = req.body;
    const id = `aul_${Date.now()}`;
    await turso.execute({
      sql: `INSERT INTO aulas (id, nome, nivel, turno, dia_semana, horario_inicio, horario_fim, sala, equipe_id, capacidade_maxima)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, nome, nivel, turno, dia_semana, horario_inicio, horario_fim, sala, equipe_id, capacidade_maxima || 24]
    });
    res.status(201).json({ id, nome, nivel });
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
    const { aula_id, data_aula, tema_aula, observacoes } = req.body;
    const existing = await turso.execute({
      sql: 'SELECT * FROM cronogramas WHERE aula_id = ? AND data_aula = ?',
      args: [aula_id, data_aula]
    });

    if (existing.rows.length > 0) {
      await turso.execute({
        sql: 'UPDATE cronogramas SET tema_aula = ?, observacoes = ? WHERE id = ?',
        args: [tema_aula, observacoes || null, existing.rows[0].id]
      });
      return res.json({ ...existing.rows[0], tema_aula, observacoes });
    }

    const id = `crono_${Date.now()}`;
    await turso.execute({
      sql: 'INSERT INTO cronogramas (id, aula_id, data_aula, tema_aula, observacoes) VALUES (?, ?, ?, ?, ?)',
      args: [id, aula_id, data_aula, tema_aula, observacoes || null]
    });
    res.status(201).json({ id, aula_id, data_aula, tema_aula, observacoes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Importação em massa de cronograma via Excel
app.post('/api/cronograma/bulk', async (req, res) => {
  try {
    const { items, turmasNovas } = req.body;

    // Se houver turmas novas que foram criadas no Excel e não existiam no banco
    if (turmasNovas && Array.isArray(turmasNovas)) {
      for (const t of turmasNovas) {
        const check = await turso.execute({
          sql: 'SELECT id FROM aulas WHERE id = ?',
          args: [t.id]
        });
        if (check.rows.length === 0) {
          await turso.execute({
            sql: `INSERT INTO aulas (id, nome, nivel, turno, dia_semana, horario_inicio, horario_fim, sala, equipe_id, capacidade_maxima)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          });
        }
      }
    }

    // Processa os itens do cronograma
    let upsertedCount = 0;
    if (items && Array.isArray(items)) {
      for (const item of items) {
        const existing = await turso.execute({
          sql: 'SELECT id FROM cronogramas WHERE aula_id = ? AND data_aula = ?',
          args: [item.aula_id, item.data_aula]
        });

        if (existing.rows.length > 0) {
          await turso.execute({
            sql: 'UPDATE cronogramas SET tema_aula = ?, observacoes = ? WHERE id = ?',
            args: [item.tema_aula, item.observacoes || null, existing.rows[0].id]
          });
        } else {
          const id = item.id || `crono_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
          await turso.execute({
            sql: 'INSERT INTO cronogramas (id, aula_id, data_aula, tema_aula, observacoes) VALUES (?, ?, ?, ?, ?)',
            args: [id, item.aula_id, item.data_aula, item.tema_aula, item.observacoes || null]
          });
        }
        upsertedCount++;
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
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/presencas/solicitar', async (req, res) => {
  try {
    const { aluno_id, aula_id, data_presenca } = req.body;
    const id = `pre_${Date.now()}`;
    const dataSolicitacao = new Date().toISOString();

    await turso.execute({
      sql: `INSERT INTO presencas (id, aluno_id, aula_id, data_presenca, status, data_solicitacao)
            VALUES (?, ?, ?, ?, 'pendente', ?)`,
      args: [id, aluno_id, aula_id, data_presenca, dataSolicitacao]
    });
    res.status(201).json({ id, aluno_id, aula_id, data_presenca, status: 'pendente' });
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
    const { aluno_id, valor, data_vencimento, metodo, tipo, status, referencia_mes } = req.body;
    const id = `pag_${Date.now()}`;
    await turso.execute({
      sql: `INSERT INTO pagamentos (id, aluno_id, valor, data_vencimento, metodo, tipo, status, referencia_mes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, aluno_id, valor, data_vencimento, metodo || 'PIX', tipo || 'Mensalidade', status || 'Pendente', referencia_mes]
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
    res.json({ id, status: 'Pago', data_pagamento: dataHoje });
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
    const { aluno_id, data_agendada, nivel_atual, nivel_alvo, papel } = req.body;
    const id = `niv_${Date.now()}`;
    await turso.execute({
      sql: `INSERT INTO nivelamento_sessoes (id, aluno_id, data_agendada, nivel_atual, nivel_alvo, papel, status, avaliador_aulao, avaliador_danca)
            VALUES (?, ?, ?, ?, ?, ?, 'Agendado', 'Mestre Gonzaga Silva', 'Mariana Sol')`,
      args: [id, aluno_id, data_agendada, nivel_atual, nivel_alvo, papel]
    });
    res.status(201).json({ id, aluno_id, nivel_alvo, status: 'Agendado' });
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

app.get('/api/avisos', async (req, res) => {
  try {
    const result = await turso.execute('SELECT * FROM avisos ORDER BY fixado DESC, data_publicacao DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/avisos', async (req, res) => {
  try {
    const { titulo, conteudo, link_url, link_texto, fixado, autor } = req.body;
    const id = `av_${Date.now()}`;
    const dataPub = new Date().toISOString().substring(0, 10);
    await turso.execute({
      sql: 'INSERT INTO avisos (id, titulo, conteudo, data_publicacao, link_url, link_texto, fixado, autor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      args: [id, titulo, conteudo, dataPub, link_url || null, link_texto || null, fixado ? 1 : 0, autor || 'Coordenação']
    });
    res.status(201).json({ id, titulo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

let isTursoReady = false;
app.use(async (req, res, next) => {
  if (!isTursoReady) {
    try {
      await initTursoDatabase();
      isTursoReady = true;
    } catch (e) {
      console.warn('Turso init check:', e.message);
    }
  }
  next();
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
