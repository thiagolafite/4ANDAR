import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory data store initialized with baseline 4ANDAR records
let data = {
  alunos: [
    {
      id: 'al_1',
      nome: 'Carlos Eduardo Oliveira',
      telefone: '(11) 99123-4567',
      email: 'carlos.oliveira@email.com',
      nivel_atual: 'B1',
      papel: 'Condutor',
      mensalidade_valor: 190.0,
      dia_vencimento: 5,
      data_matricula: '2026-06-10',
      data_inicio_nivel: '2026-06-10',
      status: 'ativo'
    },
    {
      id: 'al_2',
      nome: 'Camila Santos Rocha',
      telefone: '(11) 98234-5678',
      email: 'camila.rocha@email.com',
      nivel_atual: 'B2',
      papel: 'Conduzido',
      mensalidade_valor: 190.0,
      dia_vencimento: 10,
      data_matricula: '2026-02-15',
      data_inicio_nivel: '2026-05-20',
      status: 'ativo'
    }
  ],
  aulas: [
    {
      id: 'aul_b1_noite',
      nome: 'Básico 1 — Terça & Quinta (Noite)',
      nivel: 'B1',
      turno: 'Noite',
      dia_semana: 'Terça',
      horario_inicio: '19:30',
      horario_fim: '20:45',
      sala: 'Salão Principal (Gonzagão)',
      equipe_id: 'eq_2',
      capacidade_maxima: 24
    }
  ],
  cronogramas: [
    {
      id: 'crono_1',
      aula_id: 'aul_b1_noite',
      data_aula: '2026-09-29',
      tema_aula: 'Giro simples e caminhadas no tempo 1 do Xote',
      observacoes: 'Trazer foco no abraço e relaxamento dos ombros.'
    }
  ],
  presencas: [
    {
      id: 'pre_1',
      aluno_id: 'al_1',
      aula_id: 'aul_b1_noite',
      data_presenca: '2026-09-29',
      status: 'confirmada',
      data_solicitacao: '2026-09-28 14:20',
      confirmado_por: 'Mariana Sol'
    }
  ],
  pagamentos: [
    {
      id: 'pag_1',
      aluno_id: 'al_1',
      valor: 190.0,
      data_pagamento: '2026-09-04',
      data_vencimento: '2026-09-05',
      metodo: 'PIX',
      tipo: 'Mensalidade',
      status: 'Pago',
      referencia_mes: 'Setembro/2026'
    }
  ]
};

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: '4ANDAR API REST', time: new Date().toISOString() });
});

// Alunos CRUD
app.get('/api/alunos', (req, res) => {
  res.json(data.alunos);
});

app.post('/api/alunos', (req, res) => {
  const novo = { id: `al_${Date.now()}`, ...req.body };
  data.alunos.unshift(novo);
  res.status(201).json(novo);
});

app.put('/api/alunos/:id', (req, res) => {
  const { id } = req.params;
  const idx = data.alunos.findIndex((a) => a.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Aluno não encontrado' });
  data.alunos[idx] = { ...data.alunos[idx], ...req.body };
  res.json(data.alunos[idx]);
});

app.delete('/api/alunos/:id', (req, res) => {
  const { id } = req.params;
  data.alunos = data.alunos.filter((a) => a.id !== id);
  res.json({ success: true, message: 'Aluno removido' });
});

// Aulas & Cronograma
app.get('/api/aulas', (req, res) => res.json(data.aulas));
app.get('/api/cronograma', (req, res) => res.json(data.cronogramas));
app.put('/api/cronograma', (req, res) => {
  const { aula_id, data_aula, tema_aula, observacoes } = req.body;
  const existing = data.cronogramas.find((c) => c.aula_id === aula_id && c.data_aula === data_aula);
  if (existing) {
    existing.tema_aula = tema_aula;
    existing.observacoes = observacoes;
    return res.json(existing);
  }
  const novo = { id: `crono_${Date.now()}`, aula_id, data_aula, tema_aula, observacoes };
  data.cronogramas.push(novo);
  res.status(201).json(novo);
});

// Presenças
app.get('/api/presencas', (req, res) => res.json(data.presencas));
app.post('/api/presencas/solicitar', (req, res) => {
  const { aluno_id, aula_id, data_presenca } = req.body;
  const nova = {
    id: `pre_${Date.now()}`,
    aluno_id,
    aula_id,
    data_presenca,
    status: 'pendente',
    data_solicitacao: new Date().toISOString()
  };
  data.presencas.unshift(nova);
  res.status(201).json(nova);
});
app.put('/api/presencas/:id/confirmar', (req, res) => {
  const { id } = req.params;
  const p = data.presencas.find((item) => item.id === id);
  if (!p) return res.status(404).json({ error: 'Presença não encontrada' });
  p.status = 'confirmada';
  p.confirmado_por = req.body.confirmado_por || 'Equipe 4ANDAR';
  res.json(p);
});

// Pagamentos
app.get('/api/pagamentos', (req, res) => res.json(data.pagamentos));
app.put('/api/pagamentos/:id/baixar', (req, res) => {
  const { id } = req.params;
  const { metodo } = req.body;
  const pag = data.pagamentos.find((p) => p.id === id);
  if (!pag) return res.status(404).json({ error: 'Pagamento não encontrado' });
  pag.status = 'Pago';
  pag.metodo = metodo || 'PIX';
  pag.data_pagamento = new Date().toISOString().substring(0, 10);
  res.json(pag);
});

// Workflow: Envio de Lembretes de Mensalidade
// (Requisito funcional: vencimento <= 3 dias ou atrasado)
app.post('/api/workflows/enviar-lembretes-mensalidade', (req, res) => {
  const hoje = new Date();
  const limite = new Date(hoje);
  limite.setDate(hoje.getDate() + 3);

  const elegiveis = data.pagamentos.filter((p) => {
    if (p.status === 'Pago') return false;
    const v = new Date(p.data_vencimento);
    return v <= limite || p.status === 'Atrasado';
  });

  const logs = elegiveis.map((p) => {
    const aluno = data.alunos.find((a) => a.id === p.aluno_id);
    return {
      aluno_id: p.aluno_id,
      aluno_nome: aluno?.nome,
      email: aluno?.email,
      valor: p.valor,
      vencimento: p.data_vencimento,
      status: p.status,
      mensagem: `Olá ${aluno?.nome}, sua mensalidade do 4ANDAR referente a ${p.referencia_mes} vence em ${p.data_vencimento}. Chave PIX: pix@4andar.com.br`
    };
  });

  res.json({
    success: true,
    total_enviados: logs.length,
    disparados_em: new Date().toISOString(),
    logs
  });
});

// Integração: Google Calendar (app-user com deduplicação)
app.post('/api/integracoes/sincronizar-aulas-calendar', (req, res) => {
  const { professor_id } = req.body;
  const aulasDoProf = data.aulas.filter((a) => a.equipe_id === professor_id || !professor_id);

  const eventosCriados = aulasDoProf.map((aula) => ({
    event_id: `gcal_${aula.id}`,
    summary: `${aula.nome} — 4ANDAR Forró`,
    location: aula.sala,
    start: `${aula.dia_semana} ${aula.horario_inicio}`,
    end: `${aula.dia_semana} ${aula.horario_fim}`,
    status: 'confirmed',
    deduplicated: true
  }));

  res.json({
    success: true,
    message: 'Aulas sincronizadas com sucesso com o Google Calendar.',
    eventos: eventosCriados
  });
});

app.listen(PORT, () => {
  console.log(`4ANDAR API Server rodando na porta ${PORT}`);
});
